import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, buildAllowedNavIds, MDM_FEATURE_MAP } from '../../../auth/AuthContext';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard', path: '/mdm', featureId: null },
  {
    id: 'meter-data', label: 'Meter Data', icon: 'ti-bolt', path: '/mdm/meter-data', featureId: 'METER_DATA',
    children: [
      {
        id: 'md-instant',
        label: 'Instant Data',
        path: '/mdm/meter-data/instant'
      },
      {
        id: 'md-instant-push',
        label: 'Instant Push Data',
        path: '/mdm/meter-data/instant-push'
      },
      {
        id: 'md-nameplate',
        label: 'Name Plate Data',
        path: '/mdm/meter-data/nameplate'
      },
      {
        id: 'md-lp',
        label: 'Load Profile',
        path: '/mdm/meter-data/load-profile'
      },
      {
        id: 'md-dlp',
        label: 'Daily Load Profile',
        path: '/mdm/meter-data/daily-lp'
      },
      {
        id: 'md-current-billing',
        label: 'Current Billing Data',
        path: '/mdm/meter-data/current-billing'
      },
      {
        id: 'md-billing',
        label: 'Billing History',
        path: '/mdm/meter-data/billing'
      },
      {
        id: 'md-event',
        label: 'Event Data',
        path: '/mdm/meter-data/event'
      },
      {
        id: 'md-alarm',
        label: 'Alarm Data',
        path: '/mdm/meter-data/alarm'
      }
    ],
  },
  {
    id: 'vee', label: 'VEE Mgmt', icon: 'ti-sitemap', path: '/mdm/vee/dashboard', featureId: 'VEE_MANAGEMENT',
    children: [{ id: 'vee-dashboard', label: 'VEE Mgmt Dashboard', path: '/mdm/vee/dashboard' }],
  },
  {
    id: 'energy-audit', label: 'Energy Audit', icon: 'ti-file-analytics', path: '/mdm/energy-audit/dashboard', featureId: 'AGGREGATION',
    children: [{ id: 'ea-dashboard', label: 'Energy Audit Dashboard', path: '/mdm/energy-audit/dashboard' }],
  },
  {
    id: 'demand-service', label: 'Demand Service', icon: 'ti-activity', path: '/mdm/demand-service/dashboard', featureId: 'AGGREGATION',
    children: [{ id: 'ds-dashboard', label: 'Demand Service Dashboard', path: '/mdm/demand-service/dashboard' }],
  },
  {
    id: 'communication', label: 'Communication', icon: 'ti-antenna', path: '/mdm/communication/dashboard', featureId: 'LOAD_PROFILE',
    children: [{ id: 'comm-dashboard', label: 'Communication Dashboard', path: '/mdm/communication/dashboard' }],
  },
  {
    id: 'exceptions', label: 'Exceptions', icon: 'ti-alert-triangle', path: '/mdm/exceptions/dashboard', featureId: 'EVENT_STORAGE',
    children: [{ id: 'exc-dashboard', label: 'Exceptions Dashboard', path: '/mdm/exceptions/dashboard' }],
  },
  {
    id: 'revenue', label: 'Revenue', icon: 'ti-currency-rupee', path: '/mdm/revenue/dashboard', featureId: 'BILLING_DATA',
    children: [{ id: 'rev-dashboard', label: 'Revenue Dashboard', path: '/mdm/revenue/dashboard' }],
  },
  {
    id: 'reports', label: 'Reports', icon: 'ti-report-analytics', path: '/mdm/reports/dashboard', featureId: 'DATA_VALIDATION',
    children: [{ id: 'rep-dashboard', label: 'Reports Dashboard', path: '/mdm/reports/dashboard' }],
  },
  {
    id: 'analytics', label: 'Analytics', icon: 'ti-chart-bar', path: '/mdm/analytics/dashboard', featureId: 'AGGREGATION',
    children: [{ id: 'ana-dashboard', label: 'Analytics Dashboard', path: '/mdm/analytics/dashboard' }],
  },
  { id: 'settings', label: 'Settings', icon: 'ti-settings', path: '/mdm/settings', featureId: null },
];

const buildInitialOpen = () => NAV.reduce((acc, i) => { if (i.children) acc[i.id] = false; return acc; }, {});

export default function MdmSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [openMenus, setOpenMenus] = useState(buildInitialOpen);

  const allowedIds = buildAllowedNavIds(user?.moduleAccess || [], 'MDM', MDM_FEATURE_MAP);
  const isVisible = (item) => item.featureId === null || allowedIds.has(item.id);

  const isActive = (path) =>
    path === '/mdm'
      ? location.pathname === '/mdm'
      : location.pathname === path || location.pathname.startsWith(path + '/');

  const isParentActive = (item) =>
    isActive(item.path) || (item.children?.some(c => isActive(c.path)) ?? false);

  const toggleMenu = (id) => setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon"><i className="ti ti-bolt" style={{ fontSize: 18 }}></i></div>
        <div className="logo-text">MDM<small>Meter Data Management</small></div>
      </div>

      <nav className="sidebar-nav">
        {NAV.filter(isVisible).map(item => {
          const parentActive = isParentActive(item);
          const isOpen = openMenus[item.id] || parentActive;
          return (
            <div key={item.id}>
              <button
                className={`nav-item ${parentActive ? 'active' : ''}`}
                onClick={() => item.children ? toggleMenu(item.id) : navigate(item.path)}
                aria-expanded={item.children ? isOpen : undefined}
              >
                <i className={`ti ${item.icon}`} />
                <span className="nav-label">{item.label}</span>
                {item.children && <i className={`ti ti-chevron-down nav-chevron ${isOpen ? 'open' : ''}`} />}
              </button>
              {item.children && isOpen && (
                <div className="sub-nav">
                  {item.children.map(child => (
                    <button
                      key={child.id}
                      className={`sub-nav-item ${isActive(child.path) ? 'active' : ''}`}
                      onClick={() => navigate(child.path)}
                    >
                      <i className="ti ti-circle" style={{ fontSize: 6 }} />
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
          <div className="sys-row"><span><span className="sys-dot on" />DLMS Server</span><span style={{ color: '#22c55e' }}>OK</span></div>
          <div className="sys-row"><span><span className="sys-dot on" />RF Network</span><span style={{ color: '#22c55e' }}>OK</span></div>
          <div className="sys-row"><span><span className="sys-dot off" />GPRS Fallback</span><span style={{ color: '#ef4444' }}>Down</span></div>
          <div className="sys-row"><span><span className="sys-dot on" />Database</span><span style={{ color: '#22c55e' }}>OK</span></div>
        </div>
      </div>
    </div>
  );
}
