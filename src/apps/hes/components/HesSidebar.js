import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, buildAllowedNavIds, HES_FEATURE_MAP } from '../../../auth/AuthContext';

// Full NAV definition — each item has a featureId that gates it
// featureId: null = always visible (dashboard, settings)
const NAV = [
  { id:'dashboard',     label:'Dashboard',          icon:'ti-layout-dashboard', path:'/hes',              featureId: null },
  {
    id:'meter-data',    label:'Meter Data',          icon:'ti-bolt',             path:'/hes/meter-data',   featureId:'METER_DATA',
    children:[
      { id:'md-instant',   label:'Instantaneous',     path:'/hes/meter-data/instant'        },
      { id:'md-lp',        label:'Load Profile (LP)', path:'/hes/meter-data/load-profile'   },
      { id:'md-dlp',       label:'Daily LP',           path:'/hes/meter-data/daily-lp'       },
      { id:'md-billing',   label:'Billing History',   path:'/hes/meter-data/billing'        },
      { id:'md-currbill',  label:'Current Billing',   path:'/hes/meter-data/current-billing'},
    ],
  },
  {
    id:'logs',          label:'Logs',                icon:'ti-list-details',     path:'/hes/logs',         featureId:'LOGS',
    children:[
      { id:'lg-profile',   label:'Profile Read',      path:'/hes/logs/profile-read' },
      { id:'lg-config-r',  label:'Config Read',       path:'/hes/logs/config-read'  },
      { id:'lg-config-w',  label:'Config Write',      path:'/hes/logs/config-write' },
      { id:'lg-fota',      label:'FOTA Logs',          path:'/hes/logs/fota'         },
    ],
  },
  {
    id:'hierarchy',     label:'Hierarchy',           icon:'ti-sitemap',          path:'/hes/hierarchy',    featureId:'HIERARCHY',
    children:[
      { id:'hi-zone',      label:'Zone',                    path:'/hes/hierarchy/zone'     },
      { id:'hi-circle',    label:'Circle',                  path:'/hes/hierarchy/circle'   },
      { id:'hi-division',  label:'Division',                path:'/hes/hierarchy/division' },
      { id:'hi-feeder',    label:'Feeder',                  path:'/hes/hierarchy/feeder'   },
      { id:'hi-dt',        label:'Distribution Transformer',path:'/hes/hierarchy/dt'       },
    ],
  },
  { id:'devices',       label:'Device Management',   icon:'ti-devices',          path:'/hes/devices',      featureId:'DEVICE_MANAGEMENT' },
  { id:'ondemand',      label:'On-Demand (ODR)',      icon:'ti-send',             path:'/hes/ondemand',     featureId:'ON_DEMAND_COMMANDS' },
  { id:'device-search', label:'Device Search',        icon:'ti-search',           path:'/hes/device-search',featureId:'DEVICE_MANAGEMENT' },
  { id:'alerts',        label:'Alerts',               icon:'ti-bell-ringing',     path:'/hes/alerts',       featureId:'EVENT_MANAGEMENT' },
  { id:'reports',       label:'Reports',              icon:'ti-report-analytics', path:'/hes/reports',      featureId:'REPORTS' },
  { id:'settings',      label:'Settings',             icon:'ti-settings',         path:'/hes/settings',     featureId: null },
];

export default function HesSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [openMenus, setOpenMenus] = useState({ 'meter-data': true });

  // Build the set of nav IDs this user can see
  const allowedIds = buildAllowedNavIds(user?.moduleAccess || [], 'HES', HES_FEATURE_MAP);

  // A nav item is visible if featureId is null (always) OR its id is in allowedIds
  const isVisible = (item) => item.featureId === null || allowedIds.has(item.id);

  const isActive = (path) =>
    path === '/hes'
      ? location.pathname === '/hes'
      : location.pathname === path || location.pathname.startsWith(path + '/');

  const toggleMenu = (id) => setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));

  const visibleNav = NAV.filter(isVisible);

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon"><i className="ti ti-antenna" style={{ fontSize:18 }}></i></div>
        <div className="logo-text">HES<small>Head End System</small></div>
      </div>

      <nav className="sidebar-nav">
        {visibleNav.map(item => {
          const parentActive = isActive(item.path) || (item.children?.some(c => isActive(c.path)) ?? false);
          const isOpen = openMenus[item.id] || parentActive;

          return (
            <div key={item.id}>
              <button
                className={`nav-item ${parentActive ? 'active' : ''}`}
                onClick={() => { if (item.children) toggleMenu(item.id); else navigate(item.path); }}
              >
                <i className={`ti ${item.icon}`}></i>
                {item.label}
                {item.children && (
                  <i className={`ti ti-chevron-down nav-chevron ${isOpen ? 'open' : ''}`}></i>
                )}
              </button>

              {item.children && isOpen && (
                <div className="sub-nav">
                  {item.children.map(child => (
                    <button
                      key={child.id}
                      className={`sub-nav-item ${location.pathname === child.path ? 'active' : ''}`}
                      onClick={() => navigate(child.path)}
                    >
                      <i className="ti ti-circle" style={{ fontSize:6 }}></i>
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sys-status">
          <div className="sys-title">System Status</div>
          <div className="sys-row"><span><span className="sys-dot"></span>DLMS Server</span><span style={{ color:'#22c55e' }}>OK</span></div>
          <div className="sys-row"><span><span className="sys-dot"></span>RF Network</span><span style={{ color:'#22c55e' }}>OK</span></div>
          <div className="sys-row"><span><span className="sys-dot off"></span>GPRS Fallback</span><span style={{ color:'#ef4444' }}>Down</span></div>
          <div className="sys-row"><span><span className="sys-dot"></span>Database</span><span style={{ color:'#22c55e' }}>OK</span></div>
        </div>
      </div>
    </div>
  );
}
