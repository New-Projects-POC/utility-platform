import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, MOCK_USERS, SERVICE_META } from '../../auth/AuthContext';

// ─── Smart Meter SVG Animation Canvas ────────────────────────────────────────
function SmartMeterBg() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;

    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resize);

    // Nodes (smart meters)
    const nodes = Array.from({ length: 28 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 3 + 2,
      pulse: Math.random() * Math.PI * 2,
      type: Math.floor(Math.random() * 3), // 0=meter, 1=substation, 2=transformer
    }));

    // Floating data labels
    const labels = ['kWh', 'V: 230', 'I: 5A', 'PF: 0.98', 'kW: 1.2', 'MDM', 'HES', 'AMI', 'DLMS', 'P1', 'P2', 'Tamper', 'Load', 'DR', '3Ph'];
    const floats = labels.map(l => ({
      text: l, x: Math.random() * W, y: Math.random() * H,
      vy: -0.18 - Math.random() * 0.12,
      opacity: Math.random() * 0.4 + 0.15,
      size: 9 + Math.floor(Math.random() * 5),
    }));

    // Node glow colors as rgba strings (avoids hex conversion issues)
    const nodeGlowColors = ['rgba(26,107,255,', 'rgba(0,200,150,', 'rgba(245,158,11,'];

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#050d1a');
      grad.addColorStop(0.5, '#071428');
      grad.addColorStop(1, '#030d1e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Grid lines (hex-inspired)
      ctx.strokeStyle = 'rgba(30,100,255,0.04)';
      ctx.lineWidth = 1;
      const gsize = 60;
      for (let gx = 0; gx < W; gx += gsize) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (let gy = 0; gy < H; gy += gsize) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }

      // Sine wave (power signal)
      for (let w = 0; w < 3; w++) {
        const amp = 18 + w * 8;
        const freq = 0.012 - w * 0.002;
        const yBase = H * (0.3 + w * 0.2);
        const colors = ['rgba(26,107,255,0.12)', 'rgba(0,220,160,0.08)', 'rgba(255,180,30,0.06)'];
        ctx.beginPath();
        ctx.strokeStyle = colors[w];
        ctx.lineWidth = 1.5 - w * 0.3;
        for (let px = 0; px < W; px += 2) {
          const py = yBase + Math.sin(px * freq + t * 0.02 + w) * amp;
          px === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.2;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(26,107,255,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();

            // Animated data packet along connection
            if (Math.random() < 0.004) {
              const prog = (t % 60) / 60;
              const px = nodes[i].x + (nodes[j].x - nodes[i].x) * prog;
              const py = nodes[i].y + (nodes[j].y - nodes[i].y) * prog;
              ctx.beginPath();
              ctx.arc(px, py, 2, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(0,220,160,0.6)';
              ctx.fill();
            }
          }
        }
      }

      // Draw nodes
      nodes.forEach((n) => {
        n.pulse += 0.04;
        const glow = (Math.sin(n.pulse) + 1) / 2;
        const rgba = nodeGlowColors[n.type];
        const solidColors = ['#1a6bff', '#00c896', '#f59e0b'];

        // Outer soft glow
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 3 + glow * 4, 0, Math.PI * 2);
        ctx.fillStyle = `${rgba}${(0.04 + glow * 0.08).toFixed(2)})`;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = solidColors[n.type];
        ctx.globalAlpha = 0.7 + glow * 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Move
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });

      // Floating labels
      floats.forEach(f => {
        f.y += f.vy;
        if (f.y < -20) { f.y = H + 10; f.x = Math.random() * W; }
        ctx.font = `600 ${f.size}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = `rgba(26,107,255,${f.opacity})`;
        ctx.fillText(f.text, f.x, f.y);
      });

      t++;
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block'
    }} />
  );
}

// ─── Service Slide Data ───────────────────────────────────────────────────────
const SLIDES = [
  {
    key: 'hes',
    label: 'Head End System',
    short: 'HES',
    color: '#1a6bff',
    accent: '#60a5fa',
    icon: 'ti-antenna',
    tagline: 'Real-time meter communication & data acquisition',
    features: ['Live meter polling', 'On-demand reads', 'Firmware OTA updates', 'Device health monitoring'],
    stat: '12,480',
    statLabel: 'Active Meters',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  },
  {
    key: 'mdm',
    label: 'Meter Data Management',
    short: 'MDM',
    color: '#7c3aed',
    accent: '#a78bfa',
    icon: 'ti-database',
    tagline: 'Validate, estimate and aggregate meter data at scale',
    features: ['VEE Engine', 'Data quality rules', 'Gap filling', 'Interval aggregation'],
    stat: '2.4B',
    statLabel: 'Records Processed',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
  },
  {
    key: 'wfm',
    label: 'Workforce Management',
    short: 'WFM',
    color: '#0d9488',
    accent: '#34d399',
    icon: 'ti-users',
    tagline: 'Schedule, dispatch and track field engineers',
    features: ['Smart scheduling', 'GPS tracking', 'Job assignment', 'SLA monitoring'],
    stat: '340',
    statLabel: 'Field Engineers',
    img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80',
  },
  {
    key: 'billing',
    label: 'Billing System',
    short: 'BILL',
    color: '#d97706',
    accent: '#fbbf24',
    icon: 'ti-file-invoice',
    tagline: 'Automated billing cycles with revenue assurance',
    features: ['Tariff engine', 'Bill generation', 'Payment gateway', 'Dispute management'],
    stat: '₹84Cr',
    statLabel: 'Monthly Revenue',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80',
  },
  {
    key: 'consumer',
    label: 'Consumer Portal',
    short: 'CP',
    color: '#16a34a',
    accent: '#4ade80',
    icon: 'ti-user-circle',
    tagline: 'Self-service portal for consumers & utilities',
    features: ['Usage dashboard', 'Bill payments', 'Complaint tracking', 'Demand response'],
    stat: '98K',
    statLabel: 'Active Consumers',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
  },
];

// ─── Left Panel Slider ────────────────────────────────────────────────────────
function ServiceSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setActive(a => (a + 1) % SLIDES.length);
    }, 3500);
    return () => clearInterval(timerRef.current);
  }, [paused]);

  const s = SLIDES[active];

  return (
    <div
      style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Service tabs */}
      <div style={{ display: 'flex', gap: 6, padding: '0 0 1.5rem 0', flexWrap: 'wrap' }}>
        {SLIDES.map((sl, i) => (
          <button
            key={sl.key}
            onClick={() => setActive(i)}
            style={{
              padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11,
              fontWeight: 700, fontFamily: "'Sora', sans-serif", letterSpacing: '.5px',
              background: active === i ? sl.color : 'rgba(255,255,255,0.07)',
              color: active === i ? '#fff' : 'rgba(255,255,255,0.45)',
              transition: 'all .25s', boxShadow: active === i ? `0 0 16px ${sl.color}55` : 'none',
            }}
          >
            {sl.short}
          </button>
        ))}
        {paused && (
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', alignSelf: 'center', marginLeft: 4 }}>
            ⏸ paused
          </span>
        )}
      </div>

      {/* Slide card */}
      <div
        key={active}
        style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          animation: 'slideIn .4s cubic-bezier(.22,1,.36,1)',
        }}
      >
        {/* Dashboard screenshot */}
        <div style={{
          borderRadius: 14, overflow: 'hidden', border: `1px solid ${s.color}44`,
          boxShadow: `0 8px 32px ${s.color}22, 0 0 0 1px ${s.color}22`,
          marginBottom: '1.25rem', position: 'relative', background: '#0a1628',
          height: 190, flexShrink: 0,
        }}>
          <img
            src={s.img}
            alt={s.label}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65, display: 'block' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
          {/* Overlay badge */}
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: `${s.color}dd`, backdropFilter: 'blur(8px)',
            borderRadius: 8, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <i className={`ti ${s.icon}`} style={{ fontSize: 14, color: '#fff' }}></i>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: "'Sora', sans-serif" }}>{s.short}</span>
          </div>
          {/* Stat pill */}
          <div style={{
            position: 'absolute', bottom: 12, right: 12,
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
            borderRadius: 8, padding: '6px 12px', textAlign: 'right',
            border: `1px solid ${s.color}44`,
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.accent, fontFamily: "'Sora', sans-serif", lineHeight: 1 }}>{s.stat}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{s.statLabel}</div>
          </div>
        </div>

        {/* Text content */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${s.color}22`, border: `1px solid ${s.color}44`, flexShrink: 0,
            }}>
              <i className={`ti ${s.icon}`} style={{ fontSize: 18, color: s.color }}></i>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', fontFamily: "'Sora', sans-serif", lineHeight: 1.2 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: s.accent, marginTop: 2 }}>{s.tagline}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', marginTop: 12 }}>
            {s.features.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.accent, flexShrink: 0 }}></span>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
          <div style={{ height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2, background: s.color,
              width: paused ? `${(active + 1) * 20}%` : '100%',
              transition: paused ? 'none' : `width ${3.5}s linear`,
              animation: paused ? 'none' : 'progressBar 3.5s linear',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            {SLIDES.map((sl, i) => (
              <div key={sl.key} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: i === active ? sl.color : 'rgba(255,255,255,0.2)',
                transition: 'all .3s', cursor: 'pointer',
                boxShadow: i === active ? `0 0 8px ${sl.color}` : 'none',
              }} onClick={() => setActive(i)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Login Page ──────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const ok = login(username, password);
      setLoading(false);
      if (ok) {
        const user = MOCK_USERS.find(u => u.username === username);
        const firstService = user?.services[0];
        if (firstService && SERVICE_META[firstService]) {
          navigate(SERVICE_META[firstService].path);
        } else {
          navigate('/');
        }
      }
    }, 700);
  };

  const fillDemo = (u) => { setUsername(u.username); setPassword(u.password); };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', position: 'relative',
      fontFamily: "'Inter', sans-serif", overflow: 'hidden', background: '#050d1a',
    }}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes progressBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: .6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .login-input {
          width: 100%; padding: 10px 14px; font-size: 13px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; color: #fff; outline: none; font-family: 'Inter', sans-serif;
          transition: all .2s;
        }
        .login-input:focus { border-color: #1a6bff; background: rgba(26,107,255,0.08); box-shadow: 0 0 0 3px rgba(26,107,255,0.15); }
        .login-input::placeholder { color: rgba(255,255,255,0.25); }
        .demo-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 7px 10px; border-radius: 7px; cursor: pointer;
          border: 1px solid rgba(255,255,255,0.07); transition: all .15s;
          background: rgba(255,255,255,0.03);
        }
        .demo-row:hover { background: rgba(26,107,255,0.15); border-color: rgba(26,107,255,0.4); }
      `}</style>

      {/* Smart Meter Background */}
      <SmartMeterBg />

      {/* Left Panel */}
      <div style={{
        width: '52%', display: 'flex', flexDirection: 'column', padding: '2.5rem 3rem',
        position: 'relative', zIndex: 2,
      }}>
        {/* Site title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2.5rem' }}>
          <div style={{
            position: 'relative', width: 44, height: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%', background: '#1a6bff',
              animation: 'pulse-ring 2s ease-out infinite',
            }} />
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#1a6bff,#0a3db0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
              boxShadow: '0 4px 16px rgba(26,107,255,0.4)',
            }}>
              <i className="ti ti-bolt" style={{ fontSize: 22, color: '#fff' }}></i>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', fontFamily: "'Sora', sans-serif", letterSpacing: '-.3px' }}>
              Utility Management Platform
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1, letterSpacing: '.3px' }}>
              Advanced Smart Grid Operations Suite
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg,rgba(26,107,255,0.4),transparent)', marginBottom: '2rem' }} />

        {/* Service Slider */}
        <ServiceSlider />

        {/* Bottom badges */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {[['ti-shield-check', 'ISO 27001'], ['ti-certificate', 'DLMS/COSEM'], ['ti-cloud', '99.9% SLA']].map(([ic, lb]) => (
            <div key={lb} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <i className={`ti ${ic}`} style={{ fontSize: 12, color: '#1a6bff' }}></i>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{lb}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div style={{
        width: '48%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', position: 'relative', zIndex: 2,
      }}>
        {/* Frosted glass card */}
        <div style={{
          width: '100%', maxWidth: 400,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          backdropFilter: 'blur(20px)',
          padding: '2.25rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
          animation: 'fadeUp .5s cubic-bezier(.22,1,.36,1)',
        }}>
          {/* Form header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: "'Sora', sans-serif", letterSpacing: '-.4px' }}>
              Welcome back
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
              Sign in to your workspace
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase' }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <i className="ti ti-user" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}></i>
                <input
                  className="login-input"
                  style={{ paddingLeft: 36 }}
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <i className="ti ti-lock" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}></i>
                <input
                  className="login-input"
                  style={{ paddingLeft: 36, paddingRight: 36 }}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <i
                  className={`ti ${showPass ? 'ti-eye-off' : 'ti-eye'}`}
                  onClick={() => setShowPass(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: 14, cursor: 'pointer' }}
                />
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)',
                color: '#fca5a5', fontSize: 12, padding: '9px 12px', borderRadius: 7,
                marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 7,
              }}>
                <i className="ti ti-alert-circle" style={{ fontSize: 14, flexShrink: 0 }}></i> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '11px', border: 'none', borderRadius: 8, cursor: 'pointer',
                fontSize: 13, fontWeight: 700, fontFamily: "'Sora', sans-serif", letterSpacing: '.3px',
                background: loading ? 'rgba(26,107,255,0.5)' : 'linear-gradient(135deg,#1a6bff,#1250cc)',
                color: '#fff', marginTop: '.25rem',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(26,107,255,0.45)',
                transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Authenticating…
                </>
              ) : (
                <>Sign In <i className="ti ti-arrow-right" style={{ fontSize: 14 }}></i></>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.8px', whiteSpace: 'nowrap' }}>
                Demo Accounts
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {MOCK_USERS.map(u => {
                const serviceColors = { hes: '#1a6bff', mdm: '#7c3aed', wfm: '#0d9488', billing: '#d97706', consumer: '#16a34a' };
                return (
                  <div key={u.id} className="demo-row" onClick={() => fillDemo(u)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 7, background: 'rgba(26,107,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: '#60a5fa', flexShrink: 0,
                        fontFamily: "'Sora', sans-serif",
                      }}>
                        {u.avatar}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{u.name}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{u.role}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                      {u.services.map(s => (
                        <span key={s} style={{
                          fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 4,
                          background: `${serviceColors[s]}22`, color: serviceColors[s],
                          border: `1px solid ${serviceColors[s]}44`, fontFamily: "'Sora', sans-serif",
                        }}>
                          {s.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
            © 2026 Utility Management Platform · v1.0.0
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
