import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard', path: '/hes' },
  {
    id: 'meter-data', label: 'Meter Data', icon: 'ti-bolt', path: '/hes/meter-data',
    children: [
      { id: 'md-instant', label: 'Instantaneous', path: '/hes/meter-data/instant' },
      { id: 'md-lp', label: 'Load Profile (LP)', path: '/hes/meter-data/load-profile' },
      { id: 'md-dlp', label: 'Daily LP', path: '/hes/meter-data/daily-lp' },
      { id: 'md-billing', label: 'Billing History', path: '/hes/meter-data/billing' },
      { id: 'md-currbill', label: 'Current Billing', path: '/hes/meter-data/current-billing' },
    ]
  },
  {
    id: 'logs', label: 'Logs', icon: 'ti-list-details', path: '/hes/logs',
    children: [
      { id: 'lg-profile', label: 'Profile Read', path: '/hes/logs/profile-read' },
      { id: 'lg-config-r', label: 'Config Read', path: '/hes/logs/config-read' },
      { id: 'lg-config-w', label: 'Config Write', path: '/hes/logs/config-write' },
      { id: 'lg-fota', label: 'FOTA Logs', path: '/hes/logs/fota' },
    ]
  },
  {
    id: 'hierarchy', label: 'Hierarchy', icon: 'ti-sitemap', path: '/hes/hierarchy',
    children: [
      { id: 'hi-zone', label: 'Zone', path: '/hes/hierarchy/zone' },
      { id: 'hi-circle', label: 'Circle', path: '/hes/hierarchy/circle' },
      { id: 'hi-division', label: 'Division', path: '/hes/hierarchy/division' },
      { id: 'hi-feeder', label: 'Feeder', path: '/hes/hierarchy/feeder' },
      { id: 'hi-dt', label: 'Distribution Transformer', path: '/hes/hierarchy/dt' },
    ]
  },
  { id: 'devices', label: 'Device Management', icon: 'ti-devices', path: '/hes/devices' },
  { id: 'ondemand', label: 'On-Demand (ODR)', icon: 'ti-send', path: '/hes/ondemand' },
  { id: 'device-search', label: 'Device Search', icon: 'ti-search', path: '/hes/device-search' },
  { id: 'alerts', label: 'Alerts', icon: 'ti-bell-ringing', path: '/hes/alerts' },
  { id: 'reports', label: 'Reports', icon: 'ti-report-analytics', path: '/hes/reports' },
  { id: 'settings', label: 'Settings', icon: 'ti-settings', path: '/hes/settings' },
];

export default function HesSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({ 'meter-data': true, 'logs': false, 'hierarchy': false });

  const isActive = (path) => location.pathname === path || (path !== '/hes' && location.pathname.startsWith(path));

  const toggleMenu = (id) => setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon"><i className="ti ti-antenna" style={{ fontSize: 18 }}></i></div>
        <div className="logo-text">
          HES
          <small>Head End System</small>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(item => (
          <div key={item.id}>
            <button
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => {
                if (item.children) toggleMenu(item.id);
                else navigate(item.path);
              }}
            >
              <i className={`ti ${item.icon}`}></i>
              {item.label}
              {item.children && (
                <i className={`ti ti-chevron-down nav-chevron ${openMenus[item.id] ? 'open' : ''}`}></i>
              )}
            </button>

            {item.children && openMenus[item.id] && (
              <div className="sub-nav">
                {item.children.map(child => (
                  <button
                    key={child.id}
                    className={`sub-nav-item ${location.pathname === child.path ? 'active' : ''}`}
                    onClick={() => navigate(child.path)}
                  >
                    <i className="ti ti-circle" style={{ fontSize: 6 }}></i>
                    {child.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sys-status">
          <div className="sys-title">System Status</div>
          <div className="sys-row"><span><span className="sys-dot"></span>DLMS Server</span><span style={{ color: '#22c55e' }}>OK</span></div>
          <div className="sys-row"><span><span className="sys-dot"></span>RF Network</span><span style={{ color: '#22c55e' }}>OK</span></div>
          <div className="sys-row"><span><span className="sys-dot off"></span>GPRS Fallback</span><span style={{ color: '#ef4444' }}>Down</span></div>
          <div className="sys-row"><span><span className="sys-dot"></span>Database</span><span style={{ color: '#22c55e' }}>OK</span></div>
        </div>
      </div>
    </div>
  );
}
