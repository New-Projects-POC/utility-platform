import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, SERVICE_META } from '../../auth/AuthContext';

export default function Topbar({ title }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const currentService = Object.values(SERVICE_META).find(s => location.pathname.startsWith(s.path));

  return (
    <div className="topbar">
      {currentService && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: currentService.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: currentService.color }}>
            <i className={`ti ${currentService.icon}`}></i>
          </div>
          <span className="topbar-title">{title || currentService.label}</span>
        </div>
      )}
      {!currentService && <span className="topbar-title">{title}</span>}

      <div className="topbar-right">
        <div className="topbar-date">
          <i className="ti ti-calendar" style={{ fontSize: 13 }}></i>
          {dateStr} &nbsp; {timeStr}
        </div>
        <button className="notif-btn">
          <i className="ti ti-bell"></i>
          <span className="badge-dot"></span>
        </button>

        {/* User chip with dropdown */}
        <div ref={ref} style={{ position: 'relative' }}>
          <div className="user-chip" onClick={() => setOpen(!open)}>
            <div className="user-avatar">{user?.avatar}</div>
            <div>
              <div className="uname">{user?.name}</div>
              <div className="urole">{user?.role}</div>
            </div>
            <i className="ti ti-chevron-down" style={{ fontSize: 12, color: 'var(--text3)' }}></i>
          </div>

          {open && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <div className="dh-name">{user?.name}</div>
                <div className="dh-email">{user?.email}</div>
              </div>

              <div className="dropdown-section-title">My Services</div>
              {user?.services.map(sKey => {
                const s = SERVICE_META[sKey];
                if (!s) return null;
                const isCurrent = location.pathname.startsWith(s.path);
                return (
                  <div
                    key={sKey}
                    className={`dropdown-service-item ${isCurrent ? 'active' : ''}`}
                    onClick={() => { navigate(s.path); setOpen(false); }}
                  >
                    <div className="ds-icon" style={{ background: s.bg, color: s.color }}>
                      <i className={`ti ${s.icon}`}></i>
                    </div>
                    <div className="ds-info">
                      <div className="ds-label">{s.short} — {s.label.split(' ').slice(-1)[0]}</div>
                      <div className="ds-desc">{s.description.substring(0, 30)}…</div>
                    </div>
                    <span className={`ds-status ${s.status === 'active' ? 'active' : 'soon'}`}>
                      {s.status === 'active' ? 'Live' : 'Soon'}
                    </span>
                  </div>
                );
              })}

              <div className="dropdown-divider"></div>
              <button className="dropdown-item">
                <i className="ti ti-user" style={{ fontSize: 14 }}></i> My Profile
              </button>
              <button className="dropdown-item">
                <i className="ti ti-settings" style={{ fontSize: 14 }}></i> Settings
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item danger" onClick={() => { logout(); navigate('/login'); }}>
                <i className="ti ti-logout" style={{ fontSize: 14 }}></i> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
