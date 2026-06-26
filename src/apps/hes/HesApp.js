import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import HesSidebar from './components/HesSidebar';
import Topbar from '../../shared/components/Topbar';
import Footer from '../../shared/components/Footer';
import HesDashboard from './pages/HesDashboard';
import {
  MeterDataInstant, MeterDataLoadProfile, MeterDataDailyLP,
  MeterDataBilling, MeterDataCurrentBilling
} from './pages/MeterDataPages';
import { HesLogsPage } from './pages/LogsPages';
import HierarchyPage from './pages/HierarchyPage';
import DevicesPage from './pages/DevicesPage';
import OnDemandPage from './pages/OnDemandPage';
import DeviceSearchPage from './pages/DeviceSearchPage';
import AlertsPage from './pages/AlertsPage';
import { ReportsPage, SettingsPage } from './pages/ReportsSettings';

// ── Breadcrumb route map ───────────────────────────────────────────────────────
const BREADCRUMBS = {
  '/hes': [
    { label: 'HES', path: '/hes' },
    { label: 'Dashboard', path: null },
  ],
  '/hes/meter-data': [
    { label: 'HES', path: '/hes' },
    { label: 'Meter Data', path: null },
    { label: 'Instantaneous', path: null },
  ],
  '/hes/meter-data/instant': [
    { label: 'HES', path: '/hes' },
    { label: 'Meter Data', path: null },
    { label: 'Instantaneous', path: null },
  ],
  '/hes/meter-data/load-profile': [
    { label: 'HES', path: '/hes' },
    { label: 'Meter Data', path: null },
    { label: 'Load Profile', path: null },
  ],
  '/hes/meter-data/daily-lp': [
    { label: 'HES', path: '/hes' },
    { label: 'Meter Data', path: null },
    { label: 'Daily Load Profile', path: null },
  ],
  '/hes/meter-data/billing': [
    { label: 'HES', path: '/hes' },
    { label: 'Meter Data', path: null },
    { label: 'Billing History', path: null },
  ],
  '/hes/meter-data/current-billing': [
    { label: 'HES', path: '/hes' },
    { label: 'Meter Data', path: null },
    { label: 'Current Billing', path: null },
  ],
  '/hes/logs': [
    { label: 'HES', path: '/hes' },
    { label: 'Logs', path: null },
  ],
  '/hes/logs/profile-read': [
    { label: 'HES', path: '/hes' },
    { label: 'Logs', path: '/hes/logs' },
    { label: 'Profile Read', path: null },
  ],
  '/hes/logs/config-read': [
    { label: 'HES', path: '/hes' },
    { label: 'Logs', path: '/hes/logs' },
    { label: 'Config Read', path: null },
  ],
  '/hes/logs/config-write': [
    { label: 'HES', path: '/hes' },
    { label: 'Logs', path: '/hes/logs' },
    { label: 'Config Write', path: null },
  ],
  '/hes/logs/fota': [
    { label: 'HES', path: '/hes' },
    { label: 'Logs', path: '/hes/logs' },
    { label: 'FOTA', path: null },
  ],
  '/hes/hierarchy': [
    { label: 'HES', path: '/hes' },
    { label: 'Hierarchy', path: null },
  ],
  '/hes/devices': [
    { label: 'HES', path: '/hes' },
    { label: 'Devices', path: null },
  ],
  '/hes/ondemand': [
    { label: 'HES', path: '/hes' },
    { label: 'On-Demand Commands', path: null },
  ],
  '/hes/device-search': [
    { label: 'HES', path: '/hes' },
    { label: 'Device Search', path: null },
  ],
  '/hes/alerts': [
    { label: 'HES', path: '/hes' },
    { label: 'Alerts', path: null },
  ],
  '/hes/reports': [
    { label: 'HES', path: '/hes' },
    { label: 'Reports', path: null },
  ],
  '/hes/settings': [
    { label: 'HES', path: '/hes' },
    { label: 'Settings', path: null },
  ],
};

// ── Breadcrumb component ───────────────────────────────────────────────────────
function Breadcrumb() {
  const location = useLocation();
  const navigate  = useNavigate();

  // Handle dynamic routes like /hes/hierarchy/:level
  const pathname = location.pathname;
  const crumbs = BREADCRUMBS[pathname] || (() => {
    // Dynamic hierarchy level — /hes/hierarchy/feeder etc.
    if (pathname.startsWith('/hes/hierarchy/')) {
      const level = pathname.split('/').pop();
      const label = level.charAt(0).toUpperCase() + level.slice(1);
      return [
        { label: 'HES',       path: '/hes' },
        { label: 'Hierarchy', path: '/hes/hierarchy' },
        { label: label,       path: null },
      ];
    }
    return [
      { label: 'HES', path: '/hes' },
      { label: 'Head End System', path: null },
    ];
  })();

  return (
    <nav aria-label="breadcrumb" style={{
      display: 'flex', alignItems: 'center',
      gap: 4, fontSize: 12, flexWrap: 'wrap',
    }}>
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <i className="ti ti-chevron-right" style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}/>
            )}
            {crumb.path && !isLast ? (
              <button
                onClick={() => navigate(crumb.path)}
                style={{
                  background: 'none', border: 'none', padding: '2px 4px',
                  borderRadius: 4, cursor: 'pointer', fontSize: 12,
                  fontFamily: 'inherit', color: 'var(--text2)', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 4,
                  transition: 'color .15s, background .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent)14'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.background = 'none'; }}
              >
                {i === 0 && <i className="ti ti-layout-dashboard" style={{ fontSize: 11 }}/>}
                {crumb.label}
              </button>
            ) : (
              <span style={{
                padding: '2px 4px', fontSize: 12,
                fontWeight: isLast ? 700 : 500,
                color: isLast ? 'var(--text)' : 'var(--text2)',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                {i === 0 && <i className="ti ti-layout-dashboard" style={{ fontSize: 11 }}/>}
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function HesApp() {
  return (
    <div className="layout">
      <HesSidebar />
      <div className="main-wrap">
        <Topbar title={<Breadcrumb />} />
        <div className="content">
          <Routes>
            <Route index element={<HesDashboard />} />
            <Route path="meter-data"                 element={<MeterDataInstant />} />
            <Route path="meter-data/instant"          element={<MeterDataInstant />} />
            <Route path="meter-data/load-profile"     element={<MeterDataLoadProfile />} />
            <Route path="meter-data/daily-lp"         element={<MeterDataDailyLP />} />
            <Route path="meter-data/billing"          element={<MeterDataBilling />} />
            <Route path="meter-data/current-billing"  element={<MeterDataCurrentBilling />} />
            <Route path="logs"                        element={<HesLogsPage />} />
            <Route path="logs/profile-read"           element={<HesLogsPage />} />
            <Route path="logs/config-read"            element={<HesLogsPage />} />
            <Route path="logs/config-write"           element={<HesLogsPage />} />
            <Route path="logs/fota"                   element={<HesLogsPage />} />
            <Route path="hierarchy"                   element={<HierarchyPage />} />
            <Route path="hierarchy/:level"            element={<HierarchyPage />} />
            <Route path="devices"                     element={<DevicesPage />} />
            <Route path="ondemand"                    element={<OnDemandPage />} />
            <Route path="device-search"               element={<DeviceSearchPage />} />
            <Route path="alerts"                      element={<AlertsPage />} />
            <Route path="reports"                     element={<ReportsPage />} />
            <Route path="settings"                    element={<SettingsPage />} />
            <Route path="*"                           element={<Navigate to="/hes" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </div>
  );
}