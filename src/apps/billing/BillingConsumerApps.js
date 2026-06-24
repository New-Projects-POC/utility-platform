import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Topbar from '../../shared/components/Topbar';
import Footer from '../../shared/components/Footer';
import { useAuth } from '../../auth/AuthContext';

// ── Billing ─────────────────────────────────────────────────────────────────
const BILLING_FEATURES = [
  { featureCode:'BILL_GENERATION',     icon:'ti-file-invoice',       label:'Bill Generation',       desc:'Automated billing cycle generation' },
  { featureCode:'TARIFF_MANAGEMENT',   icon:'ti-adjustments',        label:'Tariff Configuration',  desc:'Rate plans and tariff slab config' },
  { featureCode:'INVOICE_MANAGEMENT',  icon:'ti-receipt',            label:'Invoice Management',    desc:'View and reprint invoices' },
  { featureCode:'PAYMENT_TRACKING',    icon:'ti-credit-card',        label:'Payment Tracking',      desc:'Track and reconcile payments' },
  { featureCode:'COLLECTION_REPORTS',  icon:'ti-report-analytics',   label:'Collection Reports',    desc:'Daily and monthly collection summaries' },
  { featureCode:'OUTSTANDING_REPORTS', icon:'ti-alert-circle',       label:'Outstanding Reports',   desc:'Overdue bills and ageing analysis' },
];

const BILLING_NAV     = ['Dashboard','Billing Cycles','Payments','Rate Config','Adjustments','Reports','Settings'];
const BILLING_ICONS   = ['ti-layout-dashboard','ti-calendar','ti-credit-card','ti-adjustments','ti-edit','ti-report-analytics','ti-settings'];
const BILLING_FC_MAP  = { BILL_GENERATION:[1], PAYMENT_TRACKING:[2], TARIFF_MANAGEMENT:[3], INVOICE_MANAGEMENT:[4], COLLECTION_REPORTS:[5], OUTSTANDING_REPORTS:[5] };

function BillingSidebar({ allowedFeatures }) {
  const visible = new Set([0, 6]);
  allowedFeatures.forEach(fc => (BILLING_FC_MAP[fc] || []).forEach(i => visible.add(i)));
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon" style={{ background:'#d97706' }}><i className="ti ti-file-invoice" style={{ fontSize:18 }}></i></div>
        <div className="logo-text">BILLING<small>Billing System</small></div>
      </div>
      <nav className="sidebar-nav">
        {BILLING_NAV.map((n, i) => !visible.has(i) ? null : (
          <div key={i} className={`nav-item ${i===0?'active':''}`} style={{ cursor:'default', opacity:i===0?1:0.5 }}>
            <i className={`ti ${BILLING_ICONS[i]}`}></i>{n}
          </div>
        ))}
      </nav>
    </div>
  );
}

export function BillingApp() {
  const { user } = useAuth();
  const mod = user?.moduleAccess?.find(m => m.moduleCode === 'BILLING');
  const allowedFeatures = (mod?.features || []).filter(f => f.canRead).map(f => f.featureCode);
  const visibleCards    = BILLING_FEATURES.filter(f => allowedFeatures.includes(f.featureCode));

  return (
    <div className="layout">
      <BillingSidebar allowedFeatures={allowedFeatures} />
      <div className="main-wrap">
        <Topbar title="Billing System" />
        <div className="content">
          <Routes>
            <Route path="*" element={
              <div>
                <div className="coming-soon-page">
                  <div className="coming-soon-icon" style={{ background:'#fffbeb', color:'#d97706' }}>
                    <i className="ti ti-file-invoice"></i>
                  </div>
                  <h2>Billing System</h2>
                  <p>Revenue management, billing cycle automation and consumer billing module is coming soon.</p>
                  <span className="pill pill-amber">Coming Soon</span>
                </div>
                {visibleCards.length > 0 && (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10, marginTop:'1rem', maxWidth:700, margin:'1rem auto 0', padding:'0 1rem' }}>
                    {visibleCards.map(f => (
                      <div key={f.featureCode} className="card" style={{ opacity:.7, textAlign:'center', padding:'.75rem' }}>
                        <i className={`ti ${f.icon}`} style={{ color:'#d97706', fontSize:20, marginBottom:6, display:'block' }}></i>
                        <div style={{ fontSize:11, fontWeight:600 }}>{f.label}</div>
                        <div style={{ fontSize:10, color:'var(--text3)', marginTop:3 }}>{f.desc}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            }/>
          </Routes>
        </div>
        <Footer />
      </div>
    </div>
  );
}

// ── Consumer Portal ──────────────────────────────────────────────────────────
const CONSUMER_FEATURES = [
  { featureCode:'BILL_VIEW',             icon:'ti-file-invoice',   label:'Bill View',              desc:'View and download electricity bills' },
  { featureCode:'PAYMENT_HISTORY',       icon:'ti-credit-card',    label:'Payment History',        desc:'Full payment transaction history' },
  { featureCode:'CONSUMPTION_ANALYTICS', icon:'ti-chart-line',     label:'Usage Analytics',        desc:'Consumption patterns and trends' },
  { featureCode:'COMPLAINT_REGISTRATION',icon:'ti-message-circle', label:'Complaint Management',   desc:'Lodge and track complaints' },
  { featureCode:'CONSUMER_REGISTRATION', icon:'ti-user-plus',      label:'Consumer Registration',  desc:'Register new consumer accounts' },
];

const CONSUMER_NAV   = ['My Dashboard','Usage History','Bills','Complaints','Self-Meter Read','Profile','Notifications'];
const CONSUMER_ICONS = ['ti-layout-dashboard','ti-chart-line','ti-file-invoice','ti-message-circle','ti-bolt','ti-user','ti-bell'];
const CONSUMER_FC_MAP = { CONSUMPTION_ANALYTICS:[1], BILL_VIEW:[2], PAYMENT_HISTORY:[2], COMPLAINT_REGISTRATION:[3], CONSUMER_REGISTRATION:[5] };

function ConsumerSidebar({ allowedFeatures }) {
  const visible = new Set([0, 6]);
  allowedFeatures.forEach(fc => (CONSUMER_FC_MAP[fc] || []).forEach(i => visible.add(i)));
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon" style={{ background:'#16a34a' }}><i className="ti ti-user-circle" style={{ fontSize:18 }}></i></div>
        <div className="logo-text">CONSUMER<small>Consumer Portal</small></div>
      </div>
      <nav className="sidebar-nav">
        {CONSUMER_NAV.map((n, i) => !visible.has(i) ? null : (
          <div key={i} className={`nav-item ${i===0?'active':''}`} style={{ cursor:'default', opacity:i===0?1:0.5 }}>
            <i className={`ti ${CONSUMER_ICONS[i]}`}></i>{n}
          </div>
        ))}
      </nav>
    </div>
  );
}

export function ConsumerApp() {
  const { user } = useAuth();
  const mod = user?.moduleAccess?.find(m => m.moduleCode === 'CONSUMER_PORTAL');
  const allowedFeatures = (mod?.features || []).filter(f => f.canRead).map(f => f.featureCode);
  const visibleCards    = CONSUMER_FEATURES.filter(f => allowedFeatures.includes(f.featureCode));

  return (
    <div className="layout">
      <ConsumerSidebar allowedFeatures={allowedFeatures} />
      <div className="main-wrap">
        <Topbar title="Consumer Portal" />
        <div className="content">
          <Routes>
            <Route path="*" element={
              <div>
                <div className="coming-soon-page">
                  <div className="coming-soon-icon" style={{ background:'#f0fdf4', color:'#16a34a' }}>
                    <i className="ti ti-user-circle"></i>
                  </div>
                  <h2>Consumer Portal</h2>
                  <p>Consumer self-service portal for bill viewing, complaint lodging, and usage monitoring is under development.</p>
                  <span className="pill pill-amber">Coming Soon</span>
                </div>
                {visibleCards.length > 0 && (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10, marginTop:'1rem', maxWidth:700, margin:'1rem auto 0', padding:'0 1rem' }}>
                    {visibleCards.map(f => (
                      <div key={f.featureCode} className="card" style={{ opacity:.7, textAlign:'center', padding:'.75rem' }}>
                        <i className={`ti ${f.icon}`} style={{ color:'#16a34a', fontSize:20, marginBottom:6, display:'block' }}></i>
                        <div style={{ fontSize:11, fontWeight:600 }}>{f.label}</div>
                        <div style={{ fontSize:10, color:'var(--text3)', marginTop:3 }}>{f.desc}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            }/>
          </Routes>
        </div>
        <Footer />
      </div>
    </div>
  );
}
