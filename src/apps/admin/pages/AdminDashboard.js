import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, SERVICE_META, isSuperAdmin, isAdmin } from '../../../auth/AuthContext';
import { authApi } from '../../../shared/utils/api';

function StatCard({ icon, label, value, sub, color, bg }) {
  return (
    <div className="card" style={{ display:'flex', alignItems:'center', gap:12 }}>
      <div style={{ width:44, height:44, borderRadius:10, background:bg, color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
        <i className={`ti ${icon}`}></i>
      </div>
      <div>
        <div style={{ fontSize:22, fontWeight:700, color:'var(--text)', lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:11, color:'var(--text3)', marginTop:3 }}>{label}</div>
        {sub && <div style={{ fontSize:10, color:'var(--text3)', marginTop:1 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const roles    = user?.roles || [];
  const isSuper  = isSuperAdmin(roles);
  const isAdm    = isAdmin(roles);
  const [stats, setStats] = useState({ users:0, roles:0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authApi.getUsers(0, 1).catch(() => null),
      authApi.getRoles().catch(() => null),
    ]).then(([u, r]) => {
      setStats({
        users: u?.data?.totalElements || 0,
        roles: Array.isArray(r?.data) ? r.data.length : 0,
      });
      setLoading(false);
    });
  }, []);

  const services = (user?.services || []).map(k => SERVICE_META[k]).filter(Boolean);
  const totalFeatures = (user?.moduleAccess || []).reduce((a, m) => a + (m.features?.length || 0), 0);

  return (
    <div>
      {/* Welcome */}
      <div className="card" style={{ marginBottom:'1rem', background:'linear-gradient(135deg,#1a6bff,#1250cc)', border:'none', color:'#fff' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ fontSize:20, fontWeight:700, marginBottom:4 }}>
              Welcome, {user?.name?.split(' ')[0]} 👋
            </div>
            <div style={{ fontSize:12, opacity:.8 }}>
              {user?.tenantName} &nbsp;·&nbsp; {roles[0]?.replace(/_/g,' ')}
              &nbsp;·&nbsp; {services.length} service{services.length !== 1 ? 's' : ''} active
            </div>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {(isSuper || isAdm) && (
              <button className="btn-sm" style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff' }}
                onClick={() => navigate('/admin/users')}>
                <i className="ti ti-users"></i> Manage Users
              </button>
            )}
            <button className="btn-sm" style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff' }}
              onClick={() => navigate('/admin/profile')}>
              <i className="ti ti-user-circle"></i> My Profile
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10, marginBottom:'1.25rem' }}>
        <StatCard icon="ti-apps"        label="Services Access"   value={services.length}  color="#1a6bff" bg="#eff6ff" />
        <StatCard icon="ti-list-check"  label="Features Access"   value={totalFeatures}    color="#7c3aed" bg="#faf5ff" />
        {(isSuper || isAdm) && <>
          <StatCard icon="ti-users"     label="Total Users"       value={loading ? '…' : stats.users} color="#0d9488" bg="#f0fdfa" />
          <StatCard icon="ti-shield"    label="Roles Defined"     value={loading ? '…' : stats.roles} color="#d97706" bg="#fffbeb" />
        </>}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:'1rem' }}>

        {/* My Services */}
        <div className="section-card">
          <div className="section-head">
            <h3>My Services</h3>
            {isSuper && <button className="view-all" onClick={() => navigate('/admin/services')}>Manage →</button>}
          </div>
          <div style={{ padding:'.75rem' }}>
            {services.length === 0
              ? <div style={{ color:'var(--text3)', fontSize:12, textAlign:'center', padding:'1rem' }}>No services assigned</div>
              : services.map(s => (
                  <div key={s.key} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 6px', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:s.bg, color:s.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
                      <i className={`ti ${s.icon}`}></i>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:600 }}>{s.label}</div>
                      <div style={{ fontSize:10, color:'var(--text3)' }}>{s.short}</div>
                    </div>
                    <button className="btn-sm" onClick={() => navigate(s.path)} style={{ fontSize:10, padding:'3px 10px' }}>Open</button>
                  </div>
                ))
            }
          </div>
        </div>

        {/* My Permissions */}
        <div className="section-card">
          <div className="section-head">
            <h3>My Permissions</h3>
          </div>
          <div style={{ padding:'.75rem', maxHeight:280, overflowY:'auto' }}>
            {(user?.moduleAccess || []).length === 0
              ? <div style={{ color:'var(--text3)', fontSize:12, textAlign:'center', padding:'1rem' }}>No permissions assigned</div>
              : (user?.moduleAccess || []).map(mod => (
                <div key={mod.moduleCode} style={{ marginBottom:10 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:5 }}>
                    {mod.moduleName}
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                    {(mod.features || []).map(f => (
                      <span key={f.featureCode} style={{ fontSize:9, padding:'2px 7px', borderRadius:20, background:'#eff6ff', color:'#1a6bff', border:'1px solid #dbeafe', fontWeight:600 }}>
                        {f.featureName}
                        <span style={{ marginLeft:4, opacity:.6 }}>
                          {f.canRead ? 'R' : ''}{f.canWrite ? 'W' : ''}{f.canDelete ? 'D' : ''}{f.canExecute ? 'E' : ''}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Quick actions */}
      {(isSuper || isAdm) && (
        <div className="card">
          <div style={{ fontSize:12, fontWeight:700, color:'var(--text2)', marginBottom:10, textTransform:'uppercase', letterSpacing:'.5px' }}>Quick Actions</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {[
              { icon:'ti-user-plus',    label:'Add User',    path:'/admin/users',    color:'#1a6bff' },
              { icon:'ti-shield-plus',  label:'Create Role', path:'/admin/roles',    color:'#7c3aed' },
              { icon:'ti-apps',         label:'Services',    path:'/admin/services', color:'#0d9488', superOnly:true },
              { icon:'ti-user-circle',  label:'My Profile',  path:'/admin/profile',  color:'#d97706' },
            ].filter(a => !a.superOnly || isSuper).map(a => (
              <button key={a.path} className="btn-sm" onClick={() => navigate(a.path)}
                style={{ border:`1px solid ${a.color}30`, color:a.color, background:`${a.color}10` }}>
                <i className={`ti ${a.icon}`}></i> {a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
