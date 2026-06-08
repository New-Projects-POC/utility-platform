import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Topbar from '../../shared/components/Topbar';
import Footer from '../../shared/components/Footer';

// MDM Sidebar placeholder
function MdmSidebar() {
  const navItems = [
    { icon: 'ti-layout-dashboard', label: 'Dashboard' },
    { icon: 'ti-database', label: 'Data Repository' },
    { icon: 'ti-chart-bar', label: 'VEE Engine' },
    { icon: 'ti-calculator', label: 'Estimation' },
    { icon: 'ti-file-analytics', label: 'Analytics' },
    { icon: 'ti-send', label: 'Data Exchange' },
    { icon: 'ti-settings', label: 'Settings' },
  ];
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon" style={{ background: '#7c3aed' }}><i className="ti ti-database" style={{ fontSize: 18 }}></i></div>
        <div className="logo-text">MDM<small>Meter Data Mgmt</small></div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((n, i) => (
          <div key={i} className={`nav-item ${i === 0 ? 'active' : ''}`} style={{ cursor: 'default', opacity: i === 0 ? 1 : .5 }}>
            <i className={`ti ${n.icon}`}></i>{n.label}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sys-status">
          <div className="sys-title">Module Status</div>
          <div style={{ fontSize: 11, color: '#64748b', textAlign: 'center', padding: '.5rem 0' }}>Coming Soon</div>
        </div>
      </div>
    </div>
  );
}

function MdmComingSoon() {
  const features = [
    { icon: 'ti-database', label: 'Data Repository', desc: 'Central store for all meter reads with full audit trail' },
    { icon: 'ti-chart-bar', label: 'VEE Engine', desc: 'Validation, Estimation & Editing of meter data' },
    { icon: 'ti-calculator', label: 'Estimation Engine', desc: 'AI-powered gap filling and anomaly detection' },
    { icon: 'ti-file-analytics', label: 'Analytics', desc: 'Deep dive reports, forecasting and load analysis' },
    { icon: 'ti-arrows-exchange', label: 'Data Exchange', desc: 'Integration with billing, ERP and SCADA systems' },
    { icon: 'ti-layers-subtract', label: 'Profile Management', desc: 'Meter and consumer profile lifecycle management' },
  ];
  return (
    <div>
      <div className="coming-soon-page">
        <div className="coming-soon-icon" style={{ background: '#faf5ff', color: '#7c3aed' }}>
          <i className="ti ti-database"></i>
        </div>
        <h2>MDM — Meter Data Management</h2>
        <p>The MDM module is under active development. It will provide comprehensive meter data validation, estimation, and analytics capabilities.</p>
        <span className="pill pill-amber">Coming Soon</span>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: '1rem', textAlign: 'center' }}>Planned Features</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {features.map(f => (
            <div key={f.label} className="card" style={{ opacity: .7 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#faf5ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
                  <i className={`ti ${f.icon}`}></i>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{f.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{f.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MdmApp() {
  return (
    <div className="layout">
      <MdmSidebar />
      <div className="main-wrap">
        <Topbar title="MDM — Meter Data Management" />
        <div className="content">
          <Routes>
            <Route path="*" element={<MdmComingSoon />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </div>
  );
}
