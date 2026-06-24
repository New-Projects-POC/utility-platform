import React, { useState } from 'react';
import { useAuth, SERVICE_META } from '../../../auth/AuthContext';
import { authApi } from '../../../shared/utils/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [tab, setTab]         = useState('info');
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState('');
  const [err, setErr]         = useState('');
  const [pw, setPw]           = useState({ current:'', newPass:'', confirm:'' });

  const services = (user?.services || []).map(k => SERVICE_META[k]).filter(Boolean);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pw.newPass !== pw.confirm) { setErr('Passwords do not match'); return; }
    setSaving(true); setErr(''); setMsg('');
    try {
      await authApi.changePassword(pw.current, pw.newPass, pw.confirm);
      setMsg('Password changed successfully. Please login again.');
      setPw({ current:'', newPass:'', confirm:'' });
    } catch (ex) { setErr(ex.message || 'Failed to change password'); }
    setSaving(false);
  };

  const inp = { width:'100%', padding:'8px 10px', border:'1px solid var(--border)', borderRadius:6, fontSize:12, background:'#fff', fontFamily:'Inter,sans-serif' };

  return (
    <div style={{ maxWidth:700 }}>
      <div className="page-header"><h2>My Profile</h2><p>Manage your account information and security</p></div>

      {/* Profile header */}
      <div className="card" style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:'#1a6bff', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:700, flexShrink:0 }}>
          {user?.avatar}
        </div>
        <div>
          <div style={{ fontSize:18, fontWeight:700 }}>{user?.name}</div>
          <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>{user?.email}</div>
          <div style={{ display:'flex', gap:6, marginTop:6, flexWrap:'wrap' }}>
            {(user?.roles || []).map(r => (
              <span key={r} style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:'#eff6ff', color:'#1a6bff', border:'1px solid #dbeafe', fontWeight:600 }}>
                {r.replace(/_/g,' ')}
              </span>
            ))}
            <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0', fontWeight:600 }}>
              {user?.tenantCode}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[['info','Info'],['services','Services & Permissions'],['security','Security']].map(([k,l]) => (
          <button key={k} className={`tab ${tab===k?'active':''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="card">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              ['Full Name',    user?.name],
              ['Username',     user?.username],
              ['Email',        user?.email],
              ['Tenant',       user?.tenantName],
              ['Tenant Code',  user?.tenantCode],
              ['Role',         user?.roles?.[0]?.replace(/_/g,' ')],
            ].map(([l,v]) => (
              <div key={l}>
                <div style={{ fontSize:10, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:4 }}>{l}</div>
                <div style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>{v || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'services' && (
        <div>
          {services.length === 0
            ? <div className="card" style={{ textAlign:'center', color:'var(--text3)' }}>No services assigned to your account.</div>
            : services.map(s => {
                const modAccess = (user?.moduleAccess || []).find(m => {
                  const map = { HES:'hes',MDM:'mdm',BILLING:'billing',WFM:'wfm',CONSUMER_PORTAL:'consumer' };
                  return map[m.moduleCode] === s.key;
                });
                return (
                  <div key={s.key} className="card" style={{ marginBottom:10 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                      <div style={{ width:36, height:36, borderRadius:8, background:s.bg, color:s.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                        <i className={`ti ${s.icon}`}></i>
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700 }}>{s.label}</div>
                        <div style={{ fontSize:10, color:'var(--text3)' }}>{modAccess?.features?.length || 0} features</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                      {(modAccess?.features || []).map(f => (
                        <span key={f.featureCode} style={{ fontSize:10, padding:'3px 8px', borderRadius:20, background:s.bg, color:s.color, border:`1px solid ${s.color}30`, fontWeight:500 }}>
                          {f.featureName}
                          <span style={{ marginLeft:4, opacity:.5, fontSize:9 }}>
                            {f.canRead?'R':''}{f.canWrite?'W':''}{f.canDelete?'D':''}{f.canExecute?'E':''}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
          }
        </div>
      )}

      {tab === 'security' && (
        <div className="card">
          <div style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>Change Password</div>
          {msg && <div style={{ padding:'8px 10px', background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0', borderRadius:6, fontSize:12, marginBottom:10 }}>{msg}</div>}
          {err && <div style={{ padding:'8px 10px', background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:6, fontSize:12, marginBottom:10 }}>{err}</div>}
          <form onSubmit={handleChangePassword}>
            {[['Current Password','current'],['New Password','newPass'],['Confirm Password','confirm']].map(([l,k]) => (
              <div key={k} style={{ marginBottom:10 }}>
                <label style={{ fontSize:11, color:'var(--text2)', fontWeight:600, display:'block', marginBottom:4 }}>{l}</label>
                <input type="password" style={inp} value={pw[k]} onChange={e => setPw(p => ({ ...p, [k]:e.target.value }))} required minLength={k==='current'?1:8} />
              </div>
            ))}
            <button type="submit" className="btn-sm btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
