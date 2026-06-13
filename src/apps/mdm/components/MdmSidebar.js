import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'ti-layout-dashboard',
    path: '/mdm',
  },
  {
    id: 'consumer',
    label: 'Consumer',
    icon: 'ti-users',
    path: '/mdm/consumer/dashboard',
    children: [
      { id: 'consumer-dashboard', label: 'Consumer Dashboard', path: '/mdm/consumer/dashboard' },
    ],
  },
  {
    id: 'assets',
    label: 'Assets Mgmt',
    icon: 'ti-building-warehouse',
    path: '/mdm/assets-mgmt/dashboard',
    children: [
      { id: 'assets-dashboard', label: 'Assets Management Dashboard', path: '/mdm/assets-mgmt/dashboard' },
    ],
  },
  {
    id: 'meter-data',
    label: 'Meter Data',
    icon: 'ti-bolt',
    path: '/mdm/meter-data',
    children: [
      { id: 'md-instant',     label: 'Instantaneous',   path: '/mdm/meter-data/instant' },
      { id: 'md-lp',          label: 'Load Profile (LP)',path: '/mdm/meter-data/load-profile' },
      { id: 'md-dlp',         label: 'Daily LP',         path: '/mdm/meter-data/daily-lp' },
      { id: 'md-billing',     label: 'Billing History',  path: '/mdm/meter-data/billing' },
      { id: 'md-currbill',    label: 'Current Billing',  path: '/mdm/meter-data/current-billing' },
    ],
  },
  {
    id: 'vee',
    label: 'VEE Mgmt',
    icon: 'ti-sitemap',
    path: '/mdm/vee/dashboard',
    children: [
      { id: 'vee-dashboard', label: 'VEE Mgmt Dashboard', path: '/mdm/vee/dashboard' },
    ],
  },
  {
    id: 'energy-audit',
    label: 'Energy Audit',
    icon: 'ti-file-analytics',
    path: '/mdm/energy-audit/dashboard',
    children: [
      { id: 'ea-dashboard', label: 'Energy Audit Dashboard', path: '/mdm/energy-audit/dashboard' },
    ],
  },
  {
    id: 'demand-service',
    label: 'Demand Service',
    icon: 'ti-activity',
    path: '/mdm/demand-service/dashboard',
    children: [
      { id: 'ds-dashboard', label: 'Demand Service Dashboard', path: '/mdm/demand-service/dashboard' },
    ],
  },
  {
    id: 'communication',
    label: 'Communication',
    icon: 'ti-antenna',
    path: '/mdm/communication/dashboard',
    children: [
      { id: 'comm-dashboard', label: 'Communication Dashboard', path: '/mdm/communication/dashboard' },
    ],
  },
  {
    id: 'exceptions',
    label: 'Exceptions',
    icon: 'ti-alert-triangle',
    path: '/mdm/exceptions/dashboard',
    children: [
      { id: 'exc-dashboard', label: 'Exceptions Dashboard', path: '/mdm/exceptions/dashboard' },
    ],
  },
  {
    id: 'revenue',
    label: 'Revenue',
    icon: 'ti-currency-rupee',
    path: '/mdm/revenue/dashboard',
    children: [
      { id: 'rev-dashboard', label: 'Revenue Dashboard', path: '/mdm/revenue/dashboard' },
    ],
  },
  {
    id: 'customer-service',
    label: 'Customer Service',
    icon: 'ti-headset',
    path: '/mdm/customer-service/dashboard',
    children: [
      { id: 'cs-dashboard', label: 'Customer Service Dashboard', path: '/mdm/customer-service/dashboard' },
    ],
  },
  {
    id: 'prepaid',
    label: 'Prepaid',
    icon: 'ti-credit-card',
    path: '/mdm/prepaid/dashboard',
    children: [
      { id: 'prepaid-dashboard', label: 'Prepaid Dashboard', path: '/mdm/prepaid/dashboard' },
    ],
  },
  {
    id: 'manage-users',
    label: 'Manage Users',
    icon: 'ti-user-cog',
    path: '/mdm/manage-users',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'ti-report-analytics',
    path: '/mdm/reports/dashboard',
    children: [
      { id: 'rep-dashboard', label: 'Reports Dashboard', path: '/mdm/reports/dashboard' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: 'ti-chart-bar',
    path: '/mdm/analytics/dashboard',
    children: [
      { id: 'ana-dashboard', label: 'Analytics Dashboard', path: '/mdm/analytics/dashboard' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'ti-settings',
    path: '/mdm/settings',
  },
];

// Build the initial open-state map from NAV — all collapsed by default
const buildInitialOpenState = () =>
  NAV.reduce((acc, item) => {
    if (item.children) acc[item.id] = false;
    return acc;
  }, {});

export default function MdmSidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [openMenus, setOpenMenus] = useState(buildInitialOpenState);

  // Mark a nav item active if the current path matches or starts with its path
  // Special-case root '/mdm' to only match exactly, avoiding false positives
  const isActive = (path) =>
    path === '/mdm'
      ? location.pathname === '/mdm'
      : location.pathname === path || location.pathname.startsWith(path + '/');

  // A parent is "open" if manually toggled OR if any child is currently active
  const isParentActive = (item) =>
    isActive(item.path) ||
    (item.children?.some((c) => isActive(c.path)) ?? false);

  const toggleMenu = (id) =>
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleNavClick = (item) => {
    if (item.children) {
      toggleMenu(item.id);
    } else {
      navigate(item.path);
    }
  };

  return (
    <div className="sidebar">
      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <i className="ti ti-bolt" style={{ fontSize: 18 }} />
        </div>
        <div className="logo-text">
          MDM
          <small>Metert Meter MDM</small>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="sidebar-nav">
        {NAV.map((item) => {
          const parentActive  = isParentActive(item);
          const isOpen        = openMenus[item.id] || parentActive;

          return (
            <div key={item.id}>
              <button
                className={`nav-item ${parentActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item)}
                aria-expanded={item.children ? isOpen : undefined}
              >
                <i className={`ti ${item.icon}`} />
                <span className="nav-label">{item.label}</span>
                {item.children && (
                  <i
                    className={`ti ti-chevron-down nav-chevron ${isOpen ? 'open' : ''}`}
                  />
                )}
              </button>

              {item.children && isOpen && (
                <div className="sub-nav">
                  {item.children.map((child) => (
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

      {/* ── System Status Footer ── */}
      <div className="sidebar-bottom">
        <div className="sys-status">
          <div className="sys-title">System Status</div>
          <div className="sys-row">
            <span><span className="sys-dot on"  />DLMS Server</span>
            <span style={{ color: '#22c55e' }}>OK</span>
          </div>
          <div className="sys-row">
            <span><span className="sys-dot on"  />RF Network</span>
            <span style={{ color: '#22c55e' }}>OK</span>
          </div>
          <div className="sys-row">
            <span><span className="sys-dot off" />GPRS Fallback</span>
            <span style={{ color: '#ef4444' }}>Down</span>
          </div>
          <div className="sys-row">
            <span><span className="sys-dot on"  />Database</span>
            <span style={{ color: '#22c55e' }}>OK</span>
          </div>
        </div>
      </div>
    </div>
  );
}