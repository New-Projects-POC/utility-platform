import React, { useState, useEffect, useCallback } from 'react';
import { authApi } from '../../../shared/utils/api';
import { useAuth } from '../../../auth/AuthContext';

const MODULE_COLORS = { HES:'#1a6bff', MDM:'#7c3aed', BILLING:'#d97706', WFM:'#0d9488', CONSUMER_PORTAL:'#16a34a' };
const FLAG_LABELS   = ['canRead','canWrite','canDelete','canExecute'];
const FLAG_SHORT    = ['R','W','D','E'];

export default function RoleManagement() {
  const { user }                    = useAuth();
  const [roles,    setRoles]        = useState([]);
  const [modules,  setModules]      = useState([]);
  const [loading,  setLoading]      = useState(true);
  const [tab,      setTab]          = useState('list');
  const [selRole,  setSelRole]      = useState(null);
  const [form,     setForm]         = useState({ roleName:'', roleCode:'', description:'' });
  const [perms,    setPerms]        = useState({});
  const [saving,   setSaving]       = useState(false);
  const [err,      setErr]          = useState('');
  const [msg,      setMsg]          = useState('');

  // Codes this tenant actually purchased — from login response moduleAccess
  const tenantModuleCodes = (user?.moduleAccess || []).map(m => m.moduleCode);

  const load = useCallback(async () => {
    setLoading(true);
    const [r, m] = await Promise.all([
      authApi.getRoles().catch(() => null),
      authApi.getModules().catch(() => null),
    ]);
    setRoles(Array.isArray(r?.data) ? r.data : []);

    // BUG FIX: only keep modules this tenant has subscribed to
    const allModules = Array.isArray(m?.data) ? m.data : [];
    const filtered   = allModules.filter(mod =>
      tenantModuleCodes.includes(mod.moduleCode)
    );
    setModules(filtered);
    setLoading(false);
  }, [tenantModuleCodes.join(',')]); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const openPermissions = async (role) => {
    setSelRole(role);
    setErr(''); setMsg('');
    const detail = await authApi.getRoleById(role.id).catch(() => null);
    const permMap = {};
    (detail?.data?.permissions || []).forEach(p => {
      // Only load permissions for modules this tenant has — skip others
      if (!tenantModuleCodes.some(code => {
        // match by moduleId via the modules list we already filtered
        return modules.some(mod => mod.id === p.moduleId && tenantModuleCodes.includes(mod.moduleCode));
      })) return;
      permMap[p.featureId] = {
        moduleId:   p.moduleId,
        featureId:  p.featureId,
        canRead:    p.canRead    || false,
        canWrite:   p.canWrite   || false,
        canDelete:  p.canDelete  || false,
        canExecute: p.canExecute || false,
      };
    });
    setPerms(permMap);
    setTab('permissions');
  };

  const togglePerm = (featureId, moduleId, flag) => {
    setPerms(prev => {
      const cur     = prev[featureId] || { moduleId, featureId, canRead:false, canWrite:false, canDelete:false, canExecute:false };
      const updated = { ...cur, [flag]: !cur[flag] };
      if (!FLAG_LABELS.some(f => updated[f])) {
        const next = { ...prev }; delete next[featureId]; return next;
      }
      return { ...prev, [featureId]: updated };
    });
  };

  const setAllForFeature = (featureId, moduleId, val) => {
    if (!val) {
      setPerms(p => { const n = { ...p }; delete n[featureId]; return n; });
      return;
    }
    setPerms(p => ({
      ...p,
      [featureId]: { moduleId, featureId, canRead:true, canWrite:true, canDelete:true, canExecute:true },
    }));
  };

  const handleSavePerms = async () => {
    setSaving(true); setErr(''); setMsg('');
    try {
      await authApi.assignPermissions(selRole.id, Object.values(perms));
      setMsg('Permissions saved successfully.');
      load();
    } catch (ex) { setErr(ex.message || 'Failed to save permissions'); }
    setSaving(false);
  };

  const handleCreateRole = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      await authApi.createRole(form);
      setForm({ roleName:'', roleCode:'', description:'' });
      setMsg('Role created. Now assign permissions.');
      setTab('list'); load();
    } catch (ex) { setErr(ex.message || 'Failed to create role'); }
    setSaving(false);
  };

  const handleDelete = async (role) => {
    if (role.isSystemRole) { alert('System roles cannot be deleted.'); return; }
    if (!window.confirm(`Delete role "${role.roleName}"?`)) return;
    await authApi.deleteRole(role.id).catch(() => null);
    load();
  };

  const inp = {
    width:'100%', padding:'7px 10px', border:'1px solid var(--border)',
    borderRadius:6, fontSize:12, background:'#fff', fontFamily:'Inter,sans-serif',
  };

  return (
    <div>
      <div className="page-header">
        <h2>Roles &amp; Permissions</h2>
        <p>
          Define roles and assign feature-level access.
          {tenantModuleCodes.length > 0 && (
            <span style={{ marginLeft:6, fontSize:11, color:'var(--text3)' }}>
              Available modules: {tenantModuleCodes.join(', ')}
            </span>
          )}
        </p>
      </div>

      <div className="tabs" style={{ marginBottom:12 }}>
        <button className={`tab ${tab==='list'?'active':''}`} onClick={() => setTab('list')}>
          <i className="ti ti-list"></i> All Roles
        </button>
        <button className={`tab ${tab==='create'?'active':''}`}
          onClick={() => { setTab('create'); setErr(''); setMsg(''); }}>
          <i className="ti ti-plus"></i> Create Role
        </button>
        {tab === 'permissions' && selRole && (
          <button className="tab active">
            <i className="ti ti-shield"></i> Permissions — {selRole.roleName}
          </button>
        )}
      </div>

      {msg && <div style={{ padding:'7px 10px', background:'#f0fdf4', color:'#16a34a', borderRadius:6, fontSize:12, marginBottom:10 }}>{msg}</div>}
      {err && <div style={{ padding:'7px 10px', background:'#fef2f2', color:'#dc2626', borderRadius:6, fontSize:12, marginBottom:10 }}>{err}</div>}

      {/* ── Role List ─────────────────────────────────────────────────────── */}
      {tab === 'list' && (
        <div className="section-card">
          {loading ? (
            <div style={{ padding:'2rem', textAlign:'center', color:'var(--text3)' }}>Loading…</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Role</th><th>Code</th><th>Type</th><th>Description</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {roles.map(r => (
                  <tr key={r.id} className="data-row">
                    <td><span style={{ fontWeight:600, fontSize:12 }}>{r.roleName}</span></td>
                    <td>
                      <code style={{ fontSize:10, background:'#f1f5f9', padding:'2px 6px', borderRadius:4 }}>
                        {r.roleCode}
                      </code>
                    </td>
                    <td>
                      <span style={{
                        fontSize:10, padding:'2px 8px', borderRadius:20, fontWeight:600,
                        background: r.isSystemRole ? '#fef3c7' : '#f1f5f9',
                        color:      r.isSystemRole ? '#b45309'  : '#64748b',
                      }}>
                        {r.isSystemRole ? 'System' : 'Custom'}
                      </span>
                    </td>
                    <td style={{ fontSize:11, color:'var(--text3)', maxWidth:200 }}>{r.description}</td>
                    <td>
                      <div style={{ display:'flex', gap:4 }}>
                        {!r.isSystemRole && (
                          <button className="btn-sm" style={{ fontSize:11 }}
                            onClick={() => openPermissions(r)}>
                            <i className="ti ti-shield"></i> Permissions
                          </button>
                        )}
                        {r.isSystemRole && (
                          <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:'#fef3c7', color:'#b45309', border:'1px solid #fde68a', fontWeight:600 }}>
                            <i className="ti ti-lock" style={{ fontSize:10, marginRight:3 }}></i>Auto-managed
                          </span>
                        )}
                        {!r.isSystemRole && (
                          <button className="btn-sm btn-danger" style={{ padding:'4px 8px' }}
                            onClick={() => handleDelete(r)}>
                            <i className="ti ti-trash"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Create Role ───────────────────────────────────────────────────── */}
      {tab === 'create' && (
        <div className="card" style={{ maxWidth:480 }}>
          <form onSubmit={handleCreateRole}>
            {[
              ['Role Name',    'roleName',    'e.g. HES Operator',                   true],
              ['Role Code',    'roleCode',    'e.g. HES_OPERATOR (UPPER_SNAKE_CASE)', true],
              ['Description',  'description', 'What this role can do',                false],
            ].map(([l, k, ph, req]) => (
              <div key={k} style={{ marginBottom:10 }}>
                <label style={{ fontSize:11, color:'var(--text2)', fontWeight:600, display:'block', marginBottom:3 }}>
                  {l}{req && <span style={{ color:'red' }}> *</span>}
                </label>
                {k === 'description' ? (
                  <textarea style={{ ...inp, height:60, resize:'vertical' }} placeholder={ph}
                    value={form[k]} onChange={e => setForm(f => ({ ...f, [k]:e.target.value }))} />
                ) : (
                  <input type="text" style={inp} placeholder={ph} value={form[k]} required={req}
                    onChange={e => setForm(f => ({
                      ...f,
                      [k]: k === 'roleCode'
                        ? e.target.value.toUpperCase().replace(/ /g, '_')
                        : e.target.value,
                    }))} />
                )}
              </div>
            ))}
            <div style={{ display:'flex', gap:8, marginTop:12 }}>
              <button type="button" className="btn-sm" onClick={() => setTab('list')}>Cancel</button>
              <button type="submit" className="btn-sm btn-primary" disabled={saving}>
                {saving ? 'Creating…' : 'Create Role'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Permission Matrix ─────────────────────────────────────────────── */}
      {tab === 'permissions' && selRole && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700 }}>{selRole.roleName}</div>
              <div style={{ fontSize:11, color:'var(--text3)' }}>
                Only your subscribed modules are shown. Click checkboxes to grant/revoke.
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn-sm" onClick={() => setTab('list')}>← Back</button>
              <button className="btn-sm btn-primary" onClick={handleSavePerms} disabled={saving}>
                {saving ? 'Saving…' : 'Save Permissions'}
              </button>
            </div>
          </div>

          {modules.length === 0 ? (
            <div className="card" style={{ textAlign:'center', color:'var(--text3)', padding:'2rem' }}>
              <i className="ti ti-apps" style={{ fontSize:28, display:'block', marginBottom:8, opacity:.4 }}></i>
              No modules available for your subscription.<br />
              <span style={{ fontSize:11 }}>Contact your platform administrator to add services.</span>
            </div>
          ) : (
            modules.map(mod => (
              <div key={mod.moduleCode} className="card" style={{ marginBottom:10 }}>
                {/* Module header */}
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                  <div style={{
                    width:10, height:10, borderRadius:'50%',
                    background: MODULE_COLORS[mod.moduleCode] || '#64748b',
                  }} />
                  <span style={{ fontSize:13, fontWeight:700, color: MODULE_COLORS[mod.moduleCode] || 'var(--text)' }}>
                    {mod.moduleName}
                  </span>
                  <span style={{ fontSize:10, color:'var(--text3)' }}>
                    {mod.features?.length || 0} features
                  </span>
                </div>

                {/* Feature matrix */}
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign:'left', padding:'5px 8px', background:'#f8fafc', border:'1px solid var(--border)', fontWeight:600, color:'var(--text2)', fontSize:10 }}>
                        Feature
                      </th>
                      {FLAG_SHORT.map((s, i) => (
                        <th key={s} style={{ textAlign:'center', padding:'5px 8px', background:'#f8fafc', border:'1px solid var(--border)', fontWeight:600, color:'var(--text2)', fontSize:10, width:60 }}>
                          {s}
                          <div style={{ fontSize:9, fontWeight:400 }}>{FLAG_LABELS[i].replace('can','')}</div>
                        </th>
                      ))}
                      <th style={{ textAlign:'center', padding:'5px 8px', background:'#f8fafc', border:'1px solid var(--border)', fontWeight:600, color:'var(--text2)', fontSize:10, width:70 }}>
                        All
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(mod.features || []).map(feat => {
                      const p     = perms[feat.id] || {};
                      const allOn = FLAG_LABELS.every(f => p[f]);
                      return (
                        <tr key={feat.id}>
                          <td style={{ padding:'6px 8px', border:'1px solid var(--border)', fontWeight:500 }}>
                            {feat.featureName}
                            <div style={{ fontSize:9, color:'var(--text3)' }}>{feat.featureCode}</div>
                          </td>
                          {FLAG_LABELS.map(flag => (
                            <td key={flag} style={{ textAlign:'center', border:'1px solid var(--border)', padding:'4px' }}>
                              <input type="checkbox" checked={!!p[flag]}
                                style={{ cursor:'pointer', width:14, height:14 }}
                                onChange={() => togglePerm(feat.id, mod.id, flag)} />
                            </td>
                          ))}
                          <td style={{ textAlign:'center', border:'1px solid var(--border)', padding:'4px' }}>
                            <input type="checkbox" checked={allOn}
                              style={{ cursor:'pointer', width:14, height:14, accentColor: MODULE_COLORS[mod.moduleCode] }}
                              onChange={() => setAllForFeature(feat.id, mod.id, !allOn)} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))
          )}

          {modules.length > 0 && (
            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:12 }}>
              <button className="btn-sm btn-primary" onClick={handleSavePerms} disabled={saving}>
                {saving ? 'Saving…' : 'Save Permissions'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}