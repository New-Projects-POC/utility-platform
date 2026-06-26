import React from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Topbar from '../../shared/components/Topbar';
import Footer from '../../shared/components/Footer';
import MdmDashboard from './pages/MdmDashboard';
import MdmSidebar from './components/MdmSidebar';
import EnergyAuditDashboardPage from './pages/energy-audit/Dashboard';
import VeeMgmtDashboardPage from './pages/vee-mgmt/VeeMgmtDashboard';
import SlaDashboardPage from './pages/sla/SlaDashboardPage';
import RevenueDashboard from './pages/revenue/RevenueDashboard';
import { LoadProfileData }    from './pages/meter-data/LoadProfileData';
import { DailyLoadData }      from './pages/meter-data/DailyLoadData';
import { InstantData }        from './pages/meter-data/InstantData';
import { NameplateData }      from './pages/meter-data/NameplateData';
import { AlarmData }          from './pages/meter-data/AlarmData';
import { BillingHistoryData } from './pages/meter-data/BillingHistoryData';
import { EventData }          from './pages/meter-data/EventData';
import { InstantPushData }    from './pages/meter-data/InstantPushData';
import { CurrentBillingData } from './pages/meter-data/CurrentBillingData';

// ── Breadcrumb route map ───────────────────────────────────────────────────────
// Each entry: path → [{ label, path }]  (array = breadcrumb chain)
const BREADCRUMBS = {
  '/mdm': [
    { label: 'MDM', path: '/mdm' },
    { label: 'Dashboard', path: '/mdm' },
  ],
  '/mdm/meter-data/load-profile': [
    { label: 'MDM', path: '/mdm' },
    { label: 'Meter Data', path: null },
    { label: 'Load Profile', path: null },
  ],
  '/mdm/meter-data/daily-lp': [
    { label: 'MDM', path: '/mdm' },
    { label: 'Meter Data', path: null },
    { label: 'Daily Load Profile', path: null },
  ],
  '/mdm/meter-data/instant': [
    { label: 'MDM', path: '/mdm' },
    { label: 'Meter Data', path: null },
    { label: 'Instant Data', path: null },
  ],
  '/mdm/meter-data/instant-push': [
    { label: 'MDM', path: '/mdm' },
    { label: 'Meter Data', path: null },
    { label: 'Instant Push Data', path: null },
  ],
  '/mdm/meter-data/nameplate': [
    { label: 'MDM', path: '/mdm' },
    { label: 'Meter Data', path: null },
    { label: 'Name Plate Data', path: null },
  ],
  '/mdm/meter-data/alarm': [
    { label: 'MDM', path: '/mdm' },
    { label: 'Meter Data', path: null },
    { label: 'Alarm Data', path: null },
  ],
  '/mdm/meter-data/billing': [
    { label: 'MDM', path: '/mdm' },
    { label: 'Meter Data', path: null },
    { label: 'Billing History', path: null },
  ],
  '/mdm/meter-data/current-billing': [
    { label: 'MDM', path: '/mdm' },
    { label: 'Meter Data', path: null },
    { label: 'Current Billing Data', path: null },
  ],
  '/mdm/meter-data/event': [
    { label: 'MDM', path: '/mdm' },
    { label: 'Meter Data', path: null },
    { label: 'Event Data', path: null },
  ],
  '/mdm/energy-audit/dashboard': [
    { label: 'MDM', path: '/mdm' },
    { label: 'Energy Audit', path: null },
    { label: 'Dashboard', path: null },
  ],
  '/mdm/vee/dashboard': [
    { label: 'MDM', path: '/mdm' },
    { label: 'VEE Management', path: null },
    { label: 'Dashboard', path: null },
  ],
  '/mdm/sla/dashboard': [
    { label: 'MDM', path: '/mdm' },
    { label: 'SLA Management', path: null },
    { label: 'Dashboard', path: null },
  ],
  '/mdm/revenue/dashboard': [
    { label: 'MDM', path: '/mdm' },
    { label: 'Revenue', path: null },
    { label: 'Dashboard', path: null },
  ],
};

// ── Breadcrumb component ───────────────────────────────────────────────────────
function Breadcrumb() {
  const location = useLocation();
  const navigate = useNavigate();

  const crumbs = BREADCRUMBS[location.pathname] || [
    { label: 'MDM', path: '/mdm' },
    { label: 'Meter Data Management', path: null },
  ];

  return (
    <nav aria-label="breadcrumb" style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 12,
      flexWrap: 'wrap',
    }}>
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <React.Fragment key={i}>
            {/* Separator — skip before first item */}
            {i > 0 && (
              <i className="ti ti-chevron-right" style={{
                fontSize: 11,
                color: 'var(--text3)',
                flexShrink: 0,
              }}/>
            )}
            {/* Clickable or plain label */}
            {crumb.path && !isLast ? (
              <button
                onClick={() => navigate(crumb.path)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '2px 4px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontFamily: 'inherit',
                  color: 'var(--text2)',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'color .15s, background .15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--accent)';
                  e.currentTarget.style.background = 'var(--accent)14';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text2)';
                  e.currentTarget.style.background = 'none';
                }}
              >
                {/* Home icon only on first item */}
                {i === 0 && <i className="ti ti-layout-dashboard" style={{ fontSize: 11 }}/>}
                {crumb.label}
              </button>
            ) : (
              <span style={{
                padding: '2px 4px',
                fontSize: 12,
                fontWeight: isLast ? 700 : 500,
                color: isLast ? 'var(--text)' : 'var(--text2)',
              }}>
                {i === 0 && <i className="ti ti-layout-dashboard" style={{ fontSize: 11, marginRight: 4 }}/>}
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
export default function MdmApp() {
  return (
    <div className="layout">
      <MdmSidebar />
      <div className="main-wrap">
        <Topbar title={<Breadcrumb />} />
        <div className="content">
          <Routes>
            <Route index element={<MdmDashboard />} />
            <Route path="meter-data/load-profile"   element={<LoadProfileData />} />
            <Route path="meter-data/daily-lp"        element={<DailyLoadData />} />
            <Route path="meter-data/instant"          element={<InstantData />} />
            <Route path="meter-data/instant-push"     element={<InstantPushData />} />
            <Route path="meter-data/alarm"            element={<AlarmData />} />
            <Route path="meter-data/billing"          element={<BillingHistoryData />} />
            <Route path="meter-data/current-billing"  element={<CurrentBillingData />} />
            <Route path="meter-data/nameplate"        element={<NameplateData />} />
            <Route path="meter-data/event"            element={<EventData />} />
            <Route path="energy-audit/dashboard"      element={<EnergyAuditDashboardPage />} />
            <Route path="vee/dashboard"               element={<VeeMgmtDashboardPage />} />
            <Route path="sla/dashboard"               element={<SlaDashboardPage />} />
            <Route path="revenue/dashboard"           element={<RevenueDashboard />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </div>
  );
}