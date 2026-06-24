import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Topbar from '../../shared/components/Topbar';
import Footer from '../../shared/components/Footer';
import { useAuth } from '../../auth/AuthContext';

// WFM featureCode → nav label + icon
const WFM_FEATURES = [
  { featureCode:'COMPLAINT_MANAGEMENT',  icon:'ti-message-circle',   label:'Complaint Management',  desc:'Log and track field complaints' },
  { featureCode:'TICKET_MANAGEMENT',     icon:'ti-clipboard-list',    label:'Work Order Management', desc:'Create, assign and track field work orders' },
  { featureCode:'ASSIGNMENT_MANAGEMENT', icon:'ti-calendar',          label:'Smart Scheduling',      desc:'AI-optimized scheduling for field visits' },
  { featureCode:'TECHNICIAN_MANAGEMENT', icon:'ti-users',             label:'Field Agents',          desc:'Manage technicians and field engineers' },
  { featureCode:'SLA_TRACKING',          icon:'ti-chart-bar',         label:'SLA Monitoring',        desc:'KPIs and SLA performance dashboards' },
];

const WFM_NAV_ALL = ['Dashboard','Work Orders','Scheduling','Field Agents','Dispatch','Tracking','Reports','Settings'];
const WFM_NAV_ICONS = ['ti-layout-dashboard','ti-clipboard-list','ti-calendar','ti-users','ti-map-pin','ti-map','ti-report-analytics','ti-settings'];

function WfmSidebar({ allowedFeatures }) {
  // Map features to nav visibility: always show Dashboard (0) and Settings (7)
  const featureToNavIdx = { TICKET_MANAGEMENT:[1], ASSIGNMENT_MANAGEMENT:[2], TECHNICIAN_MANAGEMENT:[3], COMPLAINT_MANAGEMENT:[4,5], SLA_TRACKING:[6] };
  const visibleIdx = new Set([0, 7]); // dashboard + settings always
  allowedFeatures.forEach(fc => { (featureToNavIdx[fc] || []).forEach(i => visibleIdx.add(i)); });

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon" style={{ background:'#0d9488' }}><i className="ti ti-users" style={{ fontSize:18 }}></i></div>
        <div className="logo-text">WFM<small>Workforce Mgmt</small></div>
      </div>
      <nav className="sidebar-nav">
        {WFM_NAV_ALL.map((n, i) => !visibleIdx.has(i) ? null : (
          <div key={i} className={`nav-item ${i === 0 ? 'active' : ''}`} style={{ cursor:'default', opacity: i === 0 ? 1 : 0.5 }}>
            <i className={`ti ${WFM_NAV_ICONS[i]}`}></i>{n}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sys-status">
          <div className="sys-title">Module Status</div>
          <div style={{ fontSize:11, color:'#64748b', textAlign:'center', padding:'.5rem 0' }}>Coming Soon</div>
        </div>
      </div>
    </div>
  );
}

export default function WfmApp() {
  const { user } = useAuth();
  const wfmMod = user?.moduleAccess?.find(m => m.moduleCode === 'WFM');
  const allowedFeatures = (wfmMod?.features || []).filter(f => f.canRead).map(f => f.featureCode);
  const visibleFeatures = WFM_FEATURES.filter(f => allowedFeatures.includes(f.featureCode));

  return (
    <div className="layout">
      <WfmSidebar allowedFeatures={allowedFeatures} />
      <div className="main-wrap">
        <Topbar title="WFM — Workforce Management" />
        <div className="content">
          <Routes>
            <Route path="*" element={
              <div>
                <div className="coming-soon-page">
                  <div className="coming-soon-icon" style={{ background:'#f0fdfa', color:'#0d9488' }}>
                    <i className="ti ti-users"></i>
                  </div>
                  <h2>WFM — Workforce Management</h2>
                  <p>Field workforce scheduling, dispatch, and tracking module is under development.</p>
                  <span className="pill pill-amber">Coming Soon</span>
                </div>
                {visibleFeatures.length > 0 && (
                  <div style={{ maxWidth:800, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12, padding:'0 1rem' }}>
                    {visibleFeatures.map(f => (
                      <div key={f.featureCode} className="card" style={{ opacity:.7 }}>
                        <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                          <div style={{ width:34, height:34, borderRadius:8, background:'#f0fdfa', color:'#0d9488', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>
                            <i className={`ti ${f.icon}`}></i>
                          </div>
                          <div>
                            <div style={{ fontSize:12, fontWeight:700, marginBottom:3 }}>{f.label}</div>
                            <div style={{ fontSize:11, color:'var(--text3)' }}>{f.desc}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            } />
          </Routes>
        </div>
        <Footer />
      </div>
    </div>
  );
}
