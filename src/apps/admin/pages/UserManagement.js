import React, { useState, useEffect, useCallback } from 'react';
import { authApi } from '../../../shared/utils/api';
import { useAuth } from '../../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const EMPTY_FORM = { username:'', fullName:'', email:'', phone:'', designation:'', department:'', password:'', roleIds:[], mustChangePassword:true };

function Badge({ status }) {
  const active = status === 'ACTIVE';
  return (
    <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, fontWeight:600,
      background:active?'#f0fdf4':'#fef2f2',
      color:active?'#16a34a':'#dc2626',
      border:`1px solid ${active?'#bbf7d0':'#fecaca'}` }}>
      {status}
    </span>
  );
}

export default function UserManagement() {
  const { user: currentUser }  = useAuth();
  const navigate               = useNavigate();   // logged-in user
  const [users,    setUsers]   = useState([]);
  const [roles,    setRoles]   = useState([]);
  const [total,    setTotal]   = useState(0);
  const [page,     setPage]    = useState(0);
  const [search,   setSearch]  = useState('');
  const [loading,  setLoading] = useState(true);
  const [modal,    setModal]   = useState(null);
  const [selected, setSelected]= useState(null);
  const [form,     setForm]    = useState(EMPTY_FORM);
  const [saving,   setSaving]  = useState(false);
  const [err,      setErr]     = useState('');

  // ── helpers ─────────────────────────────────────────────────────────────────
  // A user is "protected" if they are SUPER_ADMIN OR if they are the currently
  // logged-in user (you cannot deactivate / delete yourself).
  const isProtected = (u) =>
    (u.roles || []).some(r => (r.roleCode || r) === 'SUPER_ADMIN') ||
    u.id === currentUser?.id ||
    u.username === currentUser?.username;

  const load = useCallback(async () => {
    setLoading(true);
    const [u, r] = await Promise.all([
      authApi.getUsers(page, 15, search).catch(() => null),
      authApi.getRoles().catch(() => null),
    ]);
    setUsers(u?.data?.content || []);
    setTotal(u?.data?.totalElements || 0);
    setRoles(Array.isArray(r?.data) ? r.data : []);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY_FORM); setErr(''); setModal('create'); };

  const openEdit = (u) => {
    setSelected(u);
    setForm({
      username: u.username,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone || '',
      designation: u.designation || '',
      department: u.department || '',
      password: '',
      roleIds: (u.roles || []).map(r => r.id || r).filter(Boolean),
      mustChangePassword: false,
    });
    setErr('');
    setModal('edit');
  };

  const openView = (u) => { setSelected(u); setModal('view'); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');

    // Validate role selection for new users
    if (modal === 'create' && form.roleIds.length === 0) {
      setErr('Please assign at least one role to this user. Create a role first if none exist.');
      setSaving(false);
      return;
    }

    try {
      const payload = { ...form, roleIds: form.roleIds.map(Number) };

      if (modal === 'edit') {
        // For SUPER_ADMIN — only allow basic detail updates, never touch roleIds
        if (isProtected(selected)) {
          const safePayload = {
            fullName:    payload.fullName,
            email:       payload.email,
            phone:       payload.phone,
            designation: payload.designation,
            department:  payload.department,
          };
          await authApi.updateUser(selected.id, safePayload);
        } else {
          delete payload.password;
          await authApi.updateUser(selected.id, payload);
        }
      } else {
        await authApi.createUser(payload);
      }
      setModal(null); load();
    } catch (ex) { setErr(ex.message || 'Failed to save user'); }
    setSaving(false);
  };

  const handleToggle = async (u) => {
    if (isProtected(u)) return; // silently blocked — button is hidden anyway
    await authApi.toggleUserStatus(u.id).catch(() => null);
    load();
  };

  const handleDelete = async (u) => {
    if (isProtected(u)) return;
    if (!window.confirm(`Delete user ${u.username}? This cannot be undone.`)) return;
    await authApi.deleteUser(u.id).catch(() => null);
    load();
  };

  const inp = {
    width:'100%', padding:'7px 10px', border:'1px solid var(--border)',
    borderRadius:6, fontSize:12, background:'#fff', fontFamily:'Inter,sans-serif',
  };

  return (
    <div>
      <div className="page-header">
        <h2>User Management</h2>
        <p>Create and manage user accounts and their access</p>
      </div>

      {/* Toolbar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <input style={{ ...inp, width:220 }} placeholder="Search users…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }} />
          <span style={{ fontSize:11, color:'var(--text3)' }}>{total} users</span>
        </div>
        <button className="btn-sm btn-primary" onClick={openCreate}
          disabled={roles.filter(r => !r.isSystemRole).length === 0}
          title={roles.filter(r => !r.isSystemRole).length === 0 ? 'Create a role first before adding users' : ''}
          style={{ opacity: roles.filter(r => !r.isSystemRole).length === 0 ? 0.5 : 1 }}>
          <i className="ti ti-user-plus"></i> Add User
        </button>
      </div>

      {/* Table */}
      <div className="section-card">
        <table className="data-table">
          <thead>
            <tr>{['User','Email','Roles','Status','Actions'].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign:'center', padding:'2rem', color:'var(--text3)' }}>Loading…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign:'center', padding:'2rem', color:'var(--text3)' }}>No users found</td></tr>
            ) : users.map(u => {
              const protected_ = isProtected(u);
              const isSelf     = u.id === currentUser?.id || u.username === currentUser?.username;
              const isSuperAdm = (u.roles || []).some(r => (r.roleCode || r) === 'SUPER_ADMIN');

              return (
                <tr key={u.id} className="data-row">
                  {/* User cell */}
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:30, height:30, borderRadius:'50%',
                        background: isSuperAdm ? '#fef3c7' : '#eff6ff',
                        color:      isSuperAdm ? '#b45309' : '#1a6bff',
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 }}>
                        {(u.fullName || u.username || '?').substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight:600, fontSize:12 }}>
                          {u.fullName}
                          {isSelf && (
                            <span style={{ marginLeft:5, fontSize:9, padding:'1px 5px', borderRadius:20,
                              background:'#eff6ff', color:'#1a6bff', border:'1px solid #dbeafe', fontWeight:600 }}>
                              You
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize:10, color:'var(--text3)' }}>@{u.username}</div>
                      </div>
                    </div>
                  </td>

                  <td style={{ fontSize:12 }}>{u.email}</td>

                  {/* Roles */}
                  <td>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
                      {(u.roles || []).slice(0,2).map(r => (
                        <span key={r.id || r} style={{ fontSize:9, padding:'1px 6px', borderRadius:20,
                          background: isSuperAdm ? '#fef3c7' : '#faf5ff',
                          color:      isSuperAdm ? '#b45309' : '#7c3aed',
                          border:`1px solid ${isSuperAdm ? '#fde68a' : '#e9d5ff'}`, fontWeight:600 }}>
                          {(r.roleCode || r).replace(/_/g,' ')}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td><Badge status={u.status} /></td>

                  {/* Actions */}
                  <td>
                    <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                      {/* View — always allowed */}
                      <button className="btn-sm" onClick={() => openView(u)} title="View details" style={{ padding:'4px 8px' }}>
                        <i className="ti ti-eye"></i>
                      </button>

                      {/* Edit — allowed for all, but SUPER_ADMIN edit is limited to basic details */}
                      <button className="btn-sm" onClick={() => openEdit(u)} title={isSuperAdm ? 'Edit basic details only' : 'Edit user'} style={{ padding:'4px 8px' }}>
                        <i className="ti ti-pencil"></i>
                      </button>

                      {/* Toggle — hidden for SUPER_ADMIN and self */}
                      {!protected_ ? (
                        <button className="btn-sm" onClick={() => handleToggle(u)}
                          title={u.status === 'ACTIVE' ? 'Disable user' : 'Enable user'}
                          style={{ padding:'4px 8px', color: u.status === 'ACTIVE' ? '#d97706' : '#16a34a' }}>
                          <i className={`ti ${u.status === 'ACTIVE' ? 'ti-user-off' : 'ti-user-check'}`}></i>
                        </button>
                      ) : (
                        // Placeholder to keep column width consistent
                        <span style={{ width:30, display:'inline-block' }} />
                      )}

                      {/* Delete — hidden for SUPER_ADMIN and self */}
                      {!protected_ ? (
                        <button className="btn-sm btn-danger" onClick={() => handleDelete(u)} title="Delete user" style={{ padding:'4px 8px' }}>
                          <i className="ti ti-trash"></i>
                        </button>
                      ) : (
                        <span style={{ width:30, display:'inline-block' }} />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {total > 15 && (
          <div style={{ display:'flex', justifyContent:'center', gap:6, padding:'10px', borderTop:'1px solid var(--border)' }}>
            {Array.from({ length: Math.ceil(total/15) }, (_, i) => (
              <button key={i} className="btn-sm" onClick={() => setPage(i)}
                style={{ background:page===i?'var(--accent)':'', color:page===i?'#fff':'',
                  border:`1px solid ${page===i?'var(--accent)':'var(--border)'}`, padding:'4px 10px' }}>
                {i+1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', display:'flex',
          alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div className="card" style={{ width:520, maxHeight:'90vh', overflowY:'auto',
            boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={{ fontSize:15, fontWeight:700 }}>
                {modal === 'create' ? 'Add New User' : 'Edit User'}
                {modal === 'edit' && selected && isProtected(selected) && (
                  <span style={{ marginLeft:8, fontSize:11, padding:'2px 8px', borderRadius:20,
                    background:'#fef3c7', color:'#b45309', border:'1px solid #fde68a', fontWeight:600 }}>
                    Basic details only
                  </span>
                )}
              </div>
              <button onClick={() => setModal(null)}
                style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:'var(--text3)' }}>✕</button>
            </div>

            {/* Info banner for SUPER_ADMIN edit */}
            {modal === 'edit' && selected && isProtected(selected) && (
              <div style={{ padding:'8px 10px', background:'#fffbeb', border:'1px solid #fde68a',
                borderRadius:6, fontSize:11, color:'#b45309', marginBottom:10, display:'flex', gap:6 }}>
                <i className="ti ti-info-circle" style={{ fontSize:14, flexShrink:0 }}></i>
                <span>
                  {(selected.roles||[]).some(r=>(r.roleCode||r)==='SUPER_ADMIN')
                    ? 'This is a Super Admin account. Only basic contact details can be updated. Role and password changes are not allowed here.'
                    : 'You cannot change your own role or delete your own account.'}
                </span>
              </div>
            )}

            {err && (
              <div style={{ padding:'7px 10px', background:'#fef2f2', color:'#dc2626',
                borderRadius:6, fontSize:12, marginBottom:10 }}>{err}</div>
            )}

            <form onSubmit={handleSave}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  ['Full Name',   'fullName',    'text',  true],
                  ['Username',    'username',    'text',  modal==='create'],
                  ['Email',       'email',       'email', true],
                  ['Phone',       'phone',       'tel',   false],
                  ['Designation', 'designation', 'text',  false],
                  ['Department',  'department',  'text',  false],
                ].map(([l, k, t, req]) => (
                  <div key={k}>
                    <label style={{ fontSize:11, color:'var(--text2)', fontWeight:600, display:'block', marginBottom:3 }}>
                      {l}{req && <span style={{ color:'red' }}> *</span>}
                    </label>
                    <input type={t} style={inp} value={form[k]} required={req}
                      disabled={k === 'username' && modal === 'edit'}
                      onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                  </div>
                ))}
              </div>

              {/* Password — only on create, never for SUPER_ADMIN edit */}
              {modal === 'create' && (
                <div style={{ marginTop:10 }}>
                  <label style={{ fontSize:11, color:'var(--text2)', fontWeight:600, display:'block', marginBottom:3 }}>
                    Password <span style={{ color:'red' }}>*</span>
                  </label>
                  <input type="password" style={inp} value={form.password} required minLength={8}
                    placeholder="Min 8 characters"
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
              )}

              {/* Role assignment — hidden for SUPER_ADMIN and self */}
              {!(modal === 'edit' && selected && isProtected(selected)) && (
                <div style={{ marginTop:10 }}>
                  <label style={{ fontSize:11, color:'var(--text2)', fontWeight:600, display:'block', marginBottom:6 }}>
                    Assign Roles
                  </label>
                  {(() => {
                    const customRoles = roles.filter(r => !r.isSystemRole);
                    if (customRoles.length === 0) {
                      return (
                        <div style={{ padding:'12px 14px', background:'#fffbeb', border:'1px solid #fde68a',
                          borderRadius:8, marginTop:4 }}>
                          <div style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                            <i className="ti ti-alert-triangle" style={{ fontSize:16, color:'#d97706', flexShrink:0, marginTop:1 }}></i>
                            <div>
                              <div style={{ fontSize:12, fontWeight:600, color:'#b45309', marginBottom:4 }}>
                                No roles available yet
                              </div>
                              <div style={{ fontSize:11, color:'#b45309', marginBottom:10, lineHeight:1.5 }}>
                                You must create at least one role before adding users.
                                Go to <strong>Roles &amp; Permissions</strong> and create a role like
                                "HES Operator" or "MDM Analyst", then come back here.
                              </div>
                              <button
                                type="button"
                                className="btn-sm"
                                onClick={() => { setModal(null); navigate('/admin/roles'); }}
                                style={{ background:'#d97706', color:'#fff', border:'none', fontSize:11 }}>
                                <i className="ti ti-shield-plus"></i> Create a Role First
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                        {customRoles.map(r => {
                          const sel = form.roleIds.includes(r.id);
                          return (
                            <label key={r.id} style={{ display:'flex', alignItems:'center', gap:5,
                              fontSize:11, cursor:'pointer', padding:'4px 8px', borderRadius:6,
                              border:`1px solid ${sel ? '#1a6bff' : 'var(--border)'}`,
                              background:sel ? '#eff6ff' : '#fff',
                              color:sel ? '#1a6bff' : 'var(--text2)' }}>
                              <input type="checkbox" style={{ display:'none' }} checked={sel}
                                onChange={() => setForm(f => ({
                                  ...f,
                                  roleIds: sel ? f.roleIds.filter(x => x !== r.id) : [...f.roleIds, r.id],
                                }))} />
                              {r.roleName}
                            </label>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Must change password — only on create */}
              {modal === 'create' && (
                <div style={{ marginTop:10 }}>
                  <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, cursor:'pointer' }}>
                    <input type="checkbox" checked={form.mustChangePassword}
                      onChange={e => setForm(f => ({ ...f, mustChangePassword: e.target.checked }))} />
                    Must change password on first login
                  </label>
                </div>
              )}

              <div style={{ display:'flex', gap:8, marginTop:14, justifyContent:'flex-end' }}>
                <button type="button" className="btn-sm" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn-sm btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : modal === 'create' ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal === 'view' && selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', display:'flex',
          alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div className="card" style={{ width:460, maxHeight:'90vh', overflowY:'auto',
            boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={{ fontSize:15, fontWeight:700 }}>User Details</div>
              <button onClick={() => setModal(null)}
                style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:'var(--text3)' }}>✕</button>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14,
              padding:'10px', background:'var(--bg3)', borderRadius:8 }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'#1a6bff', color:'#fff',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700 }}>
                {(selected.fullName || selected.username || '?').substring(0,2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize:15, fontWeight:700 }}>{selected.fullName}</div>
                <div style={{ fontSize:11, color:'var(--text3)' }}>@{selected.username} · {selected.email}</div>
                <div style={{ marginTop:4, display:'flex', gap:4, flexWrap:'wrap' }}>
                  <Badge status={selected.status} />
                  {isProtected(selected) && (
                    <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, fontWeight:600,
                      background:'#fef3c7', color:'#b45309', border:'1px solid #fde68a' }}>
                      Protected
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
              {[['Phone',selected.phone],['Designation',selected.designation],['Department',selected.department]]
                .filter(([,v]) => v)
                .map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize:10, color:'var(--text3)', fontWeight:600, marginBottom:2 }}>{l}</div>
                    <div style={{ fontSize:12 }}>{v}</div>
                  </div>
                ))}
            </div>

            <div style={{ fontSize:11, fontWeight:600, color:'var(--text2)', marginBottom:6,
              textTransform:'uppercase', letterSpacing:'.5px' }}>Roles</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
              {(selected.roles || []).map(r => (
                <span key={r.id || r} style={{ fontSize:10, padding:'3px 8px', borderRadius:20,
                  background:'#faf5ff', color:'#7c3aed', border:'1px solid #e9d5ff', fontWeight:600 }}>
                  {(r.roleCode || r.roleName || r).replace(/_/g,' ')}
                </span>
              ))}
            </div>

            <div style={{ marginTop:14, display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button className="btn-sm" onClick={() => { setModal(null); openEdit(selected); }}>
                <i className="ti ti-pencil"></i>
                {isProtected(selected) ? 'Edit Details' : 'Edit'}
              </button>
              <button className="btn-sm" onClick={() => setModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}