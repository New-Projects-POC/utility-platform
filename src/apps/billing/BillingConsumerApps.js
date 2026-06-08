import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Topbar from '../../shared/components/Topbar';
import Footer from '../../shared/components/Footer';

function PlaceholderSidebar({ color, icon, short, full, nav, icons }) {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon" style={{ background: color }}><i className={`ti ${icon}`} style={{ fontSize: 18 }}></i></div>
        <div className="logo-text">{short}<small>{full}</small></div>
      </div>
      <nav className="sidebar-nav">
        {nav.map((n, i) => (
          <div key={i} className={`nav-item ${i === 0 ? 'active' : ''}`} style={{ cursor: 'default', opacity: i === 0 ? 1 : .5 }}>
            <i className={`ti ${icons[i]}`}></i>{n}
          </div>
        ))}
      </nav>
    </div>
  );
}

export function BillingApp() {
  return (
    <div className="layout">
      <PlaceholderSidebar color="#d97706" icon="ti-file-invoice" short="BILLING" full="Billing System"
        nav={['Dashboard','Billing Cycles','Payments','Rate Config','Adjustments','Reports','Settings']}
        icons={['ti-layout-dashboard','ti-calendar','ti-credit-card','ti-adjustments','ti-edit','ti-report-analytics','ti-settings']}
      />
      <div className="main-wrap">
        <Topbar title="Billing System" />
        <div className="content">
          <div className="coming-soon-page">
            <div className="coming-soon-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
              <i className="ti ti-file-invoice"></i>
            </div>
            <h2>Billing System</h2>
            <p>Revenue management, billing cycle automation, tariff configuration, payment processing, and consumer billing module is coming soon.</p>
            <span className="pill pill-amber">Coming Soon</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginTop: '1rem', maxWidth: 700 }}>
              {['Billing Cycle Management','Tariff Configuration','Payment Gateway','Revenue Reports','Adjustments & Waivers','Bill Generation'].map(f => (
                <div key={f} className="card" style={{ opacity: .7, textAlign: 'center', padding: '.75rem' }}>
                  <i className="ti ti-circle-check" style={{ color: '#d97706', fontSize: 20, marginBottom: 6, display: 'block' }}></i>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{f}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export function ConsumerApp() {
  return (
    <div className="layout">
      <PlaceholderSidebar color="#16a34a" icon="ti-user-circle" short="CONSUMER" full="Consumer Portal"
        nav={['My Dashboard','Usage History','Bills','Complaints','Self-Meter Read','Profile','Notifications']}
        icons={['ti-layout-dashboard','ti-chart-line','ti-file-invoice','ti-message-circle','ti-bolt','ti-user','ti-bell']}
      />
      <div className="main-wrap">
        <Topbar title="Consumer Portal" />
        <div className="content">
          <div className="coming-soon-page">
            <div className="coming-soon-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <i className="ti ti-user-circle"></i>
            </div>
            <h2>Consumer Portal</h2>
            <p>Consumer self-service portal for usage monitoring, bill viewing, complaint lodging, and self-meter reading is under development.</p>
            <span className="pill pill-amber">Coming Soon</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginTop: '1rem', maxWidth: 700 }}>
              {['Usage Monitoring','Online Bill Payment','Complaint Management','Self Meter Read','Outage Notifications','Energy Tips'].map(f => (
                <div key={f} className="card" style={{ opacity: .7, textAlign: 'center', padding: '.75rem' }}>
                  <i className="ti ti-circle-check" style={{ color: '#16a34a', fontSize: 20, marginBottom: 6, display: 'block' }}></i>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{f}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
