import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Topbar from '../../shared/components/Topbar';
import Footer from '../../shared/components/Footer';

function WfmSidebar() {
  const nav = ['Dashboard','Work Orders','Scheduling','Field Agents','Dispatch','Tracking','Reports','Settings'];
  const icons = ['ti-layout-dashboard','ti-clipboard-list','ti-calendar','ti-users','ti-map-pin','ti-map','ti-report-analytics','ti-settings'];
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon" style={{ background: '#0d9488' }}><i className="ti ti-users" style={{ fontSize: 18 }}></i></div>
        <div className="logo-text">WFM<small>Workforce Mgmt</small></div>
      </div>
      <nav className="sidebar-nav">
        {nav.map((n, i) => (
          <div key={i} className={`nav-item ${i === 0 ? 'active' : ''}`} style={{ cursor: 'default', opacity: i === 0 ? 1 : .5 }}>
            <i className={`ti ${icons[i]}`}></i>{n}
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

export default function WfmApp() {
  const features = [
    { icon: 'ti-clipboard-list', label: 'Work Order Management', desc: 'Create, assign and track field work orders' },
    { icon: 'ti-calendar', label: 'Smart Scheduling', desc: 'AI-optimized scheduling for field visits' },
    { icon: 'ti-map', label: 'Live Tracking', desc: 'Real-time GPS tracking of field agents' },
    { icon: 'ti-route', label: 'Route Optimization', desc: 'Optimal route planning to minimize travel time' },
    { icon: 'ti-device-mobile', label: 'Mobile App', desc: 'Dedicated mobile app for field engineers' },
    { icon: 'ti-chart-bar', label: 'Performance Analytics', desc: 'KPIs and performance dashboards for managers' },
  ];
  return (
    <div className="layout">
      <WfmSidebar />
      <div className="main-wrap">
        <Topbar title="WFM — Workforce Management" />
        <div className="content">
          <Routes>
            <Route path="*" element={
              <div>
                <div className="coming-soon-page">
                  <div className="coming-soon-icon" style={{ background: '#f0fdfa', color: '#0d9488' }}>
                    <i className="ti ti-users"></i>
                  </div>
                  <h2>WFM — Workforce Management</h2>
                  <p>Field workforce scheduling, dispatch, and tracking module is under development. Manage work orders, track agents, and optimize routes.</p>
                  <span className="pill pill-amber">Coming Soon</span>
                </div>
                <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, padding: '0 1rem' }}>
                  {features.map(f => (
                    <div key={f.label} className="card" style={{ opacity: .7 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f0fdfa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}><i className={`ti ${f.icon}`}></i></div>
                        <div><div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{f.label}</div><div style={{ fontSize: 11, color: 'var(--text3)' }}>{f.desc}</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            } />
          </Routes>
        </div>
        <Footer />
      </div>
    </div>
  );
}
