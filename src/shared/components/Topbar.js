import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, SERVICE_META, isSuperAdmin, isAdmin } from '../../auth/AuthContext';

export default function Topbar({ title }) {
  const { user, logout } = useAuth();
  const [open,    setOpen]    = useState(false);
  const [loggingOut, setLO]  = useState(false);
  const ref      = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const currentService = Object.values(SERVICE_META).find(s => location.pathname.startsWith(s.path));
  const userServices   = (user?.services || []).map(k => SERVICE_META[k]).filter(Boolean);
  const roles          = user?.roles || [];
  const canOpenAdmin   = isSuperAdmin(roles) || isAdmin(roles);

  const handleLogout = async () => {
    setLO(true); await logout(); navigate('/login');
  };

  const roleDisplay = roles.length > 0
    ? roles[0].replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'User';

  const now     = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday:'short', day:'2-digit', month:'short', year:'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });

  return (
    <div className="topbar">
      {currentService ? (
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:currentService.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:currentService.color }}>
            <i className={`ti ${currentService.icon}`}></i>
          </div>
          <span className="topbar-title">{title || currentService.label}</span>
        </div>
      ) : (
        <span className="topbar-title">{title || 'Dashboard'}</span>
      )}

      <div className="topbar-right">
        {user?.tenantCode && (
          <div style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:5, background:'rgba(26,107,255,0.1)', color:'#1a6bff', border:'1px solid rgba(26,107,255,0.2)', letterSpacing:'.5px' }}>
            {user.tenantCode}
          </div>
        )}
        <div className="topbar-date">
          <i className="ti ti-calendar" style={{ fontSize:13 }}></i>
          {dateStr}&nbsp;&nbsp;{timeStr}
        </div>
        <button className="notif-btn"><i className="ti ti-bell"></i><span className="badge-dot"></span></button>

        {/* User chip → dropdown */}
        <div ref={ref} style={{ position:'relative' }}>
          <div className="user-chip" onClick={() => setOpen(!open)} style={{ cursor:'pointer' }}>
            <div className="user-avatar">{user?.avatar || '??'}</div>
            <div>
              <div className="uname">{user?.name || user?.username}</div>
              <div className="urole">{roleDisplay}</div>
            </div>
            <i className="ti ti-chevron-down" style={{ fontSize:12, color:'var(--text3)' }}></i>
          </div>

          {open && (
            <div className="dropdown-menu">
              {/* Header */}
              <div className="dropdown-header">
                <div className="dh-name">{user?.name}</div>
                <div className="dh-email">{user?.email}</div>
                {user?.tenantName && (
                  <div style={{ fontSize:10, color:'var(--text3)', marginTop:2 }}>
                    <i className="ti ti-building" style={{ fontSize:10, marginRight:3 }}></i>{user.tenantName}
                  </div>
                )}
              </div>

              {/* Admin Panel shortcut */}
              {canOpenAdmin && (
                <>
                  <div className="dropdown-section-title">Management</div>
                  <div className="dropdown-service-item" onClick={() => { navigate('/admin'); setOpen(false); }}
                    style={{ background: location.pathname.startsWith('/admin') ? '#eff6ff' : '' }}>
                    <div className="ds-icon" style={{ background:'#eff6ff', color:'#1a6bff' }}>
                      <i className="ti ti-settings"></i>
                    </div>
                    <div className="ds-info">
                      <div className="ds-label">Admin Panel</div>
                      <div className="ds-desc">Users, Roles, Permissions…</div>
                    </div>
                    <i className="ti ti-chevron-right" style={{ fontSize:12, color:'var(--text3)' }}></i>
                  </div>
                </>
              )}

              {/* My Services */}
              {userServices.length > 0 && (
                <>
                  <div className="dropdown-section-title">My Services</div>
                  {userServices.map(s => {
                    const cur = location.pathname.startsWith(s.path);
                    return (
                      <div key={s.key} className={`dropdown-service-item ${cur?'active':''}`}
                        onClick={() => { navigate(s.path); setOpen(false); }}>
                        <div className="ds-icon" style={{ background:s.bg, color:s.color }}>
                          <i className={`ti ${s.icon}`}></i>
                        </div>
                        <div className="ds-info">
                          <div className="ds-label">{s.short} — {s.label.split(' ').slice(-1)[0]}</div>
                          <div className="ds-desc">{s.description.substring(0,32)}…</div>
                        </div>
                        <span className={`ds-status ${s.status==='active'?'active':'soon'}`}>
                          {s.status==='active'?'Live':'Soon'}
                        </span>
                      </div>
                    );
                  })}
                </>
              )}

              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={() => { navigate('/admin/profile'); setOpen(false); }}>
                <i className="ti ti-user" style={{ fontSize:14 }}></i> My Profile
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item danger" onClick={handleLogout} disabled={loggingOut}>
                <i className="ti ti-logout" style={{ fontSize:14 }}></i>
                {loggingOut ? 'Signing out…' : 'Sign Out'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
