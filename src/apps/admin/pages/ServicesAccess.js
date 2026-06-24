import React, { useState } from 'react';
import { useAuth } from '../../../auth/AuthContext';
import emailjs from '@emailjs/browser';

// ── EmailJS credentials (same as your Contact page) ──────────────────────────
const EMAILJS_SERVICE_ID  = 'service_2f0er';
const EMAILJS_TEMPLATE_ID = 'template_cerf';
const EMAILJS_PUBLIC_KEY  = 'BHUFOU6errrf';

const WA_NUMBER     = '919871767768';
const CONTACT_EMAIL = 'marketing@jnetech.in';

// ── All possible modules ──────────────────────────────────────────────────────
const ALL_MODULES = ['HES', 'MDM', 'BILLING', 'WFM', 'CONSUMER_PORTAL'];
const MODULE_META = {
  HES:             { label:'Head End System',       color:'#1a6bff', bg:'#eff6ff', icon:'ti-antenna',      desc:'Meter communication, data acquisition & device management' },
  MDM:             { label:'Meter Data Management', color:'#7c3aed', bg:'#faf5ff', icon:'ti-database',     desc:'Meter data validation, estimation & aggregation' },
  BILLING:         { label:'Billing System',        color:'#d97706', bg:'#fffbeb', icon:'ti-file-invoice', desc:'Revenue management, billing cycles & payments' },
  WFM:             { label:'Workforce Management',  color:'#0d9488', bg:'#f0fdfa', icon:'ti-users',        desc:'Field workforce scheduling, dispatch & tracking' },
  CONSUMER_PORTAL: { label:'Consumer Portal',       color:'#16a34a', bg:'#f0fdf4', icon:'ti-user-circle',  desc:'Consumer self-service, usage & complaints' },
};

const EMPTY_FORM = { name:'', email:'', phone:'', company:'', message:'' };

// ── Request Modal ─────────────────────────────────────────────────────────────
function RequestModal({ moduleCode, onClose }) {
  const { user }              = useAuth();
  const meta                  = MODULE_META[moduleCode];
  const [form, setForm]       = useState({
    ...EMPTY_FORM,
    name:    user?.name    || '',
    email:   user?.email   || '',
    company: user?.tenantName || '',
  });
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(null); // null | 'email' | 'whatsapp'
  const [err,     setErr]     = useState('');

  const subject = `Request for New Service: ${meta.label} (${moduleCode})`;

  const isValid = () => {
    if (!form.name.trim() || !form.email.trim()) {
      setErr('Name and Email are required.'); return false;
    }
    if (!form.message.trim()) {
      setErr('Please describe your requirements.'); return false;
    }
    return true;
  };

  const handleEmail = async () => {
    if (!isValid()) return;
    setLoading(true); setErr('');
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name:    form.name,
          email:   form.email,
          phone:   form.phone   || '—',
          company: form.company || user?.tenantCode || '—',
          product: subject,
          meters:  '—',
          message: form.message,
          time:    new Date().toLocaleString('en-IN', { timeZone:'Asia/Kolkata' }),
        },
        EMAILJS_PUBLIC_KEY
      );
      setSent('email');
    } catch (ex) {
      console.error(ex);
      setErr('Failed to send email. Please try WhatsApp or email us directly.');
    }
    setLoading(false);
  };

  const handleWhatsApp = () => {
    if (!isValid()) return;
    const text = [
      `Hi JNE Technologies! I'd like to request a new service.`,
      ``,
      `Subject: ${subject}`,
      ``,
      `Name:    ${form.name}`,
      `Company: ${form.company || user?.tenantCode || '—'}`,
      `Email:   ${form.email}`,
      form.phone ? `Phone:   ${form.phone}` : null,
      ``,
      `Requirements:`,
      form.message,
    ].filter(l => l !== null).join('\n');

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
    setSent('whatsapp');
  };

  const inp = {
    width:'100%', padding:'8px 10px', border:'1px solid var(--border)',
    borderRadius:6, fontSize:12, background:'#fff',
    fontFamily:'Inter,sans-serif', outline:'none', boxSizing:'border-box',
  };

  return (
    /* Backdrop */
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex',
        alignItems:'center', justifyContent:'center', zIndex:1000, padding:'1rem' }}
    >
      <div className="card" style={{ width:'100%', maxWidth:500, maxHeight:'90vh',
        overflowY:'auto', boxShadow:'0 24px 64px rgba(0,0,0,0.25)', position:'relative' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <div style={{ width:38, height:38, borderRadius:9, background:meta.bg, color:meta.color,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
            <i className={`ti ${meta.icon}`}></i>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:700 }}>Request New Service</div>
            <div style={{ fontSize:11, color:'var(--text3)' }}>{meta.label}</div>
          </div>
          <button onClick={onClose}
            style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'var(--text3)', lineHeight:1 }}>
            ✕
          </button>
        </div>

        {/* Subject pill (read-only) */}
        <div style={{ padding:'7px 10px', background:meta.bg, border:`1px solid ${meta.color}40`,
          borderRadius:6, fontSize:11, color:meta.color, fontWeight:600, marginBottom:14 }}>
          <i className="ti ti-mail" style={{ marginRight:5 }}></i>
          Subject: {subject}
        </div>

        {/* Sent state */}
        {sent ? (
          <div style={{ textAlign:'center', padding:'1.5rem 0' }}>
            <div style={{ fontSize:40, marginBottom:10 }}>{sent === 'whatsapp' ? '💬' : '✅'}</div>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:6 }}>
              {sent === 'whatsapp' ? 'Opening WhatsApp!' : 'Request Sent!'}
            </div>
            <div style={{ fontSize:12, color:'var(--text3)', lineHeight:1.6 }}>
              {sent === 'whatsapp'
                ? <>Your request details are pre-filled. Send to <strong style={{ color:'#25D366' }}>+91&nbsp;9871767768</strong> and our team will respond shortly.</>
                : <>Your request has been sent to <strong style={{ color:meta.color }}>{CONTACT_EMAIL}</strong>. Our team will get back to you within one business day.</>
              }
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:14 }}>
              <button className="btn-sm" onClick={() => setSent(null)}>Send Another</button>
              <button className="btn-sm btn-primary" onClick={onClose}>Close</button>
            </div>
          </div>
        ) : (
          <>
            {err && (
              <div style={{ padding:'7px 10px', background:'#fef2f2', color:'#dc2626',
                border:'1px solid #fecaca', borderRadius:6, fontSize:12, marginBottom:10 }}>
                {err}
              </div>
            )}

            {/* Form fields */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--text2)', display:'block', marginBottom:3 }}>
                  Full Name <span style={{ color:'red' }}>*</span>
                </label>
                <input style={inp} value={form.name} required
                  onChange={e => setForm(f => ({ ...f, name:e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--text2)', display:'block', marginBottom:3 }}>
                  Email <span style={{ color:'red' }}>*</span>
                </label>
                <input type="email" style={inp} value={form.email} required
                  onChange={e => setForm(f => ({ ...f, email:e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--text2)', display:'block', marginBottom:3 }}>Phone</label>
                <input type="tel" style={inp} value={form.phone} placeholder="+91 98765 43210"
                  onChange={e => setForm(f => ({ ...f, phone:e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--text2)', display:'block', marginBottom:3 }}>Company</label>
                <input style={inp} value={form.company}
                  onChange={e => setForm(f => ({ ...f, company:e.target.value }))} />
              </div>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:600, color:'var(--text2)', display:'block', marginBottom:3 }}>
                Your Requirements <span style={{ color:'red' }}>*</span>
              </label>
              <textarea rows={4} style={{ ...inp, resize:'vertical' }}
                placeholder={`Describe why you need ${meta.label} and how you plan to use it…`}
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message:e.target.value }))} />
            </div>

            {/* Action buttons */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <button className="btn-sm btn-primary" onClick={handleEmail} disabled={loading}
                style={{ justifyContent:'center', padding:'9px 0', fontSize:12 }}>
                <i className="ti ti-mail" style={{ fontSize:14 }}></i>
                {loading ? 'Sending…' : 'Send via Email'}
              </button>
              <button onClick={handleWhatsApp} disabled={loading}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                  padding:'9px 0', border:'none', borderRadius:6, cursor:'pointer',
                  background:'#25D366', color:'#fff', fontWeight:600, fontSize:12,
                  opacity: loading ? .6 : 1 }}>
                <i className="ti ti-brand-whatsapp" style={{ fontSize:15 }}></i>
                Send via WhatsApp
              </button>
            </div>

            <div style={{ marginTop:10, textAlign:'center', fontSize:10, color:'var(--text3)' }}>
              Our team usually responds within 1 business day
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ServicesAccess() {
  const { user }                = useAuth();
  const [modal, setModal]       = useState(null); // moduleCode or null

  const allowed = user?.moduleAccess?.map(m => m.moduleCode) || [];

  return (
    <div>
      <div className="page-header">
        <h2>Service Access</h2>
        <p>Modules your tenant has subscribed to. Request new services directly from this page.</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:12 }}>
        {ALL_MODULES.map(code => {
          const meta   = MODULE_META[code];
          const hasIt  = allowed.includes(code);
          const modAcc = user?.moduleAccess?.find(m => m.moduleCode === code);

          return (
            <div key={code} className="card"
              style={{ border:`1px solid ${hasIt ? meta.color + '40' : 'var(--border)'}`,
                opacity: hasIt ? 1 : 0.75 }}>

              {/* Card header */}
              <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:10 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:meta.bg, color:meta.color,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                  <i className={`ti ${meta.icon}`}></i>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:700 }}>{meta.label}</div>
                  <div style={{ fontSize:10, color:'var(--text3)' }}>{meta.desc}</div>
                </div>
              </div>

              {/* Status badge */}
              <div style={{ marginBottom:10 }}>
                <span style={{ fontSize:10, padding:'2px 9px', borderRadius:20, fontWeight:600,
                  background: hasIt ? '#f0fdf4' : '#f1f5f9',
                  color:      hasIt ? '#16a34a' : '#64748b',
                  border:`1px solid ${hasIt ? '#bbf7d0' : 'var(--border)'}` }}>
                  {hasIt ? '✓ Active' : '✕ Not subscribed'}
                </span>
              </div>

              {/* Active — show features */}
              {hasIt && modAcc && (
                <div>
                  <div style={{ fontSize:10, color:'var(--text3)', fontWeight:600, marginBottom:5,
                    textTransform:'uppercase', letterSpacing:'.5px' }}>
                    {modAcc.features?.length || 0} features accessible
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
                    {(modAcc.features || []).map(f => (
                      <span key={f.featureCode} style={{ fontSize:9, padding:'2px 6px', borderRadius:20,
                        background:meta.bg, color:meta.color, border:`1px solid ${meta.color}30`, fontWeight:500 }}>
                        {f.featureName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Not subscribed — description + Request button */}
              {!hasIt && (
                <div>
                  <div style={{ fontSize:11, color:'var(--text3)', marginBottom:10, lineHeight:1.5 }}>
                    {meta.label} is not included in your current subscription.
                  </div>
                  <button
                    className="btn-sm"
                    onClick={() => setModal(code)}
                    style={{ width:'100%', justifyContent:'center', padding:'7px 0',
                      border:`1px solid ${meta.color}60`, color:meta.color,
                      background:meta.bg, fontWeight:600, fontSize:11 }}>
                    <i className="ti ti-send" style={{ fontSize:13 }}></i>
                    Request {meta.label}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info footer */}
      <div className="card" style={{ marginTop:16, background:'#f8fafc', border:'1px solid #e2e8f0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <i className="ti ti-info-circle" style={{ fontSize:16, color:'#0284c7' }}></i>
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>
              Want to add more services?
            </div>
            <div style={{ fontSize:11, color:'var(--text3)' }}>
              Click <strong>Request</strong> on any unsubscribed module above to send us your requirements via Email or WhatsApp.
              Our team will review and activate the service for you.
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <RequestModal moduleCode={modal} onClose={() => setModal(null)} />
      )}
    </div>
  );
}