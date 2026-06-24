import React, { useState, useMemo } from 'react';

// ─── Reusable SVG Charts ───────────────────────────────────────────────────────

function SvgLineChart({ datasets, labels, height = 120, yMin, yMax, yFmt, xLimit }) {
  const w = 460, padL = 38, padR = 10, padT = 10, padB = 22;
  const W = w - padL - padR, H = height - padT - padB;
  const allVals = datasets.flatMap(d => d.values);
  const minV = yMin !== undefined ? yMin : 0;
  const maxV = yMax !== undefined ? yMax : Math.max(...allVals) * 1.1 || 1;
  const toX = i => padL + (i / (labels.length - 1)) * W;
  const toY = v => padT + H - ((v - minV) / (maxV - minV)) * H;
  const fmt = yFmt || (v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : Math.round(v));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(p => minV + p * (maxV - minV));
  const shownLabels = xLimit ? labels.filter((_, i) => i % Math.ceil(labels.length / xLimit) === 0 || i === labels.length - 1) : labels;

  const makePath = values =>
    values.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
  const makeArea = values =>
    `${makePath(values)} L${toX(values.length - 1).toFixed(1)},${(padT + H).toFixed(1)} L${padL},${(padT + H).toFixed(1)} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={toY(t)} x2={w - padR} y2={toY(t)} stroke="#f0f2f5" strokeWidth="1" />
          <text x={padL - 3} y={toY(t) + 3} textAnchor="end" fontSize="8" fill="#9aa0b8">{fmt(t)}</text>
        </g>
      ))}
      {labels.map((l, i) => {
        const shown = xLimit ? (i % Math.ceil(labels.length / xLimit) === 0 || i === labels.length - 1) : true;
        return shown ? <text key={i} x={toX(i)} y={height - 4} textAnchor="middle" fontSize="8" fill="#9aa0b8">{l}</text> : null;
      })}
      {datasets.map((ds, di) => ds.fill && (
        <path key={`a${di}`} d={makeArea(ds.values)} fill={ds.color} opacity={0.1} />
      ))}
      {datasets.map((ds, di) => ds.dashed
        ? <path key={`l${di}`} d={makePath(ds.values)} fill="none" stroke={ds.color} strokeWidth="1.5" strokeDasharray="5,4" />
        : <path key={`l${di}`} d={makePath(ds.values)} fill="none" stroke={ds.color} strokeWidth="2" strokeLinejoin="round" />
      )}
      {datasets.map((ds, di) => ds.dots !== false && !ds.dashed && ds.values.map((v, i) => (
        <circle key={`d${di}-${i}`} cx={toX(i)} cy={toY(v)} r="3" fill="#fff" stroke={ds.color} strokeWidth="1.8" />
      )))}
    </svg>
  );
}

function SvgBarChart({ data, labels, height = 120, colors, horizontal = false, yFmt, xFmt, yMin, yMax }) {
  const w = 460, padL = horizontal ? 56 : 36, padR = 10, padT = 8, padB = horizontal ? 20 : 22;
  const W = w - padL - padR, H = height - padT - padB;
  const maxV = yMax !== undefined ? yMax : Math.max(...data) * 1.1 || 1;
  const minV = yMin !== undefined ? yMin : 0;
  const barW = horizontal ? (H / data.length) * 0.6 : (W / data.length) * 0.55;
  const gap = horizontal ? H / data.length : W / data.length;
  const fmt = yFmt || (v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : Math.round(v));
  const xf = xFmt || fmt;
  const getColor = (v, i) => {
    if (Array.isArray(colors)) return colors[i] || 'var(--accent)';
    if (typeof colors === 'function') return colors(v);
    return colors || 'var(--accent)';
  };

  if (horizontal) {
    const toX = v => padL + ((v - minV) / (maxV - minV)) * W;
    const ticks = [0, 0.5, 1].map(p => minV + p * (maxV - minV));
    return (
      <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height }} preserveAspectRatio="none">
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={toX(t)} y1={padT} x2={toX(t)} y2={padT + H} stroke="#f0f2f5" strokeWidth="1" />
            <text x={toX(t)} y={height - 4} textAnchor="middle" fontSize="8" fill="#9aa0b8">{xf(t)}</text>
          </g>
        ))}
        {data.map((v, i) => {
          const y = padT + i * gap + gap / 2 - barW / 2;
          const barLen = ((v - minV) / (maxV - minV)) * W;
          return (
            <g key={i}>
              <text x={padL - 4} y={y + barW / 2 + 3} textAnchor="end" fontSize="8" fill="#9aa0b8">{labels[i]}</text>
              <rect x={padL} y={y} width={barLen} height={barW} rx="3" fill={getColor(v, i)} opacity="0.88" />
              <text x={padL + barLen + 3} y={y + barW / 2 + 3} fontSize="8" fill="#5a6080">{fmt(v)}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  const toY = v => padT + H - ((v - minV) / (maxV - minV)) * H;
  const ticks = [0, 0.5, 1].map(p => minV + p * (maxV - minV));
  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={toY(t)} x2={w - padR} y2={toY(t)} stroke="#f0f2f5" strokeWidth="1" />
          <text x={padL - 3} y={toY(t) + 3} textAnchor="end" fontSize="8" fill="#9aa0b8">{fmt(t)}</text>
        </g>
      ))}
      {data.map((v, i) => {
        const x = padL + i * gap + gap / 2 - barW / 2;
        const barH = ((v - minV) / (maxV - minV)) * H;
        return (
          <g key={i}>
            <rect x={x} y={toY(v)} width={barW} height={barH} rx="3" fill={getColor(v, i)} opacity="0.88" />
            <text x={x + barW / 2} y={height - 4} textAnchor="middle" fontSize="8" fill="#9aa0b8">{labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

function SvgStackedBar({ datasets, labels, height = 130 }) {
  const w = 420, padL = 40, padR = 10, padT = 8, padB = 20;
  const W = w - padL - padR, H = height - padT - padB;
  const totals = labels.map((_, i) => datasets.reduce((s, d) => s + d.values[i], 0));
  const maxV = Math.max(...totals) * 1.15;
  const barW = (W / labels.length) * 0.55;
  const gap = W / labels.length;
  const toY = v => padT + H - (v / maxV) * H;
  const ticks = [0, 0.5, 1].map(p => p * maxV);

  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={toY(t)} x2={w - padR} y2={toY(t)} stroke="#f0f2f5" strokeWidth="1" />
          <text x={padL - 3} y={toY(t) + 3} textAnchor="end" fontSize="8" fill="#9aa0b8">{Math.round(t)}</text>
        </g>
      ))}
      {labels.map((lbl, i) => {
        const x = padL + i * gap + gap / 2 - barW / 2;
        let cumY = padT + H;
        return (
          <g key={i}>
            {datasets.map((ds, di) => {
              const segH = (ds.values[i] / maxV) * H;
              const y = cumY - segH;
              cumY = y;
              return <rect key={di} x={x} y={y} width={barW} height={segH} fill={ds.color} opacity="0.88" rx={di === datasets.length - 1 ? 3 : 0} />;
            })}
            <text x={x + barW / 2} y={height - 4} textAnchor="middle" fontSize="8" fill="#9aa0b8">{lbl}</text>
          </g>
        );
      })}
    </svg>
  );
}

function SvgDonut({ data, centerValue, centerLabel, size = 100 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = size * 0.38, cx = size / 2, cy = size / 2, circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={size * 0.11} />
        {data.map((d, i) => {
          const pct = total ? d.value / total : 0;
          const dash = pct * circ;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color}
              strokeWidth={size * 0.11}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset * circ}
              style={{ transform: `rotate(-90deg)`, transformOrigin: `${cx}px ${cy}px` }}
            />
          );
          offset += pct;
          return el;
        })}
      </svg>
      {centerValue && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
          <div style={{ fontSize: size * 0.14, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{centerValue}</div>
          {centerLabel && <div style={{ fontSize: size * 0.09, color: 'var(--text3)', marginTop: 1 }}>{centerLabel}</div>}
        </div>
      )}
    </div>
  );
}

// Half-gauge for AT&C loss
function HalfGauge({ value, target, max = 20, size = 130 }) {
  const cx = size / 2, cy = size * 0.62, r = size * 0.42;
  const sweep = Math.PI; // 180°
  const toAngle = v => Math.PI + (v / max) * Math.PI;
  const polar = (angle, radius) => ({
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  });
  const arcPath = (startAngle, endAngle, radius, sw) => {
    const s = polar(startAngle, radius);
    const e = polar(endAngle, radius);
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
  };
  const targetAngle = toAngle(target);
  const valueAngle = toAngle(value);

  return (
    <div style={{ position: 'relative', width: size, height: size * 0.7, flexShrink: 0 }}>
      <svg viewBox={`0 0 ${size} ${size * 0.7}`} width={size} height={size * 0.7}>
        {/* Background arc */}
        <path d={arcPath(Math.PI, 2 * Math.PI, r, 10)} fill="none" stroke="#f0f2f5" strokeWidth={size * 0.09} strokeLinecap="round" />
        {/* Target zone (green) */}
        <path d={arcPath(Math.PI, targetAngle, r, 10)} fill="none" stroke="#16a34a" strokeWidth={size * 0.09} strokeLinecap="round" />
        {/* Actual value (red if above target) */}
        <path d={arcPath(targetAngle, valueAngle, r, 10)} fill="none" stroke="#dc2626" strokeWidth={size * 0.09} strokeLinecap="round" />
        {/* Needle */}
        <line x1={cx} y1={cy} x2={polar(valueAngle, r - 4).x} y2={polar(valueAngle, r - 4).y} stroke="#1a2236" strokeWidth="2" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={4} fill="#1a2236" />
        {/* Labels */}
        <text x={padSide(size, 'left')} y={size * 0.68} fontSize="8" fill="#9aa0b8" textAnchor="middle">0%</text>
        <text x={padSide(size, 'right')} y={size * 0.68} fontSize="8" fill="#9aa0b8" textAnchor="middle">{max}%</text>
      </svg>
      <div style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
        <div style={{ fontSize: size * 0.155, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{value}%</div>
        <div style={{ fontSize: size * 0.085, color: 'var(--text3)', marginTop: 2 }}>AT&C Loss</div>
      </div>
    </div>
  );
}
function padSide(size, side) { return side === 'left' ? size * 0.08 : size * 0.92; }

// ─── Scatter (SVG) ────────────────────────────────────────────────────────────
function SvgScatter({ datasets, height = 160 }) {
  const w = 420, padL = 44, padR = 14, padT = 10, padB = 28;
  const W = w - padL - padR, H = height - padT - padB;
  const allX = datasets.flatMap(d => d.points.map(p => p.x));
  const allY = datasets.flatMap(d => d.points.map(p => p.y));
  const maxX = Math.max(...allX) * 1.05, minX = 0;
  const maxY = Math.max(...allY) * 1.15, minY = 0;
  const toX = v => padL + ((v - minX) / (maxX - minX)) * W;
  const toY = v => padT + H - ((v - minY) / (maxY - minY)) * H;
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map(p => Math.round(minX + p * (maxX - minX)));
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(p => +(minY + p * (maxY - minY)).toFixed(0));

  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={toY(t)} x2={w - padR} y2={toY(t)} stroke="#f0f2f5" strokeWidth="1" />
          <text x={padL - 3} y={toY(t) + 3} textAnchor="end" fontSize="8" fill="#9aa0b8">{t}%</text>
        </g>
      ))}
      {xTicks.map((t, i) => (
        <text key={i} x={toX(t)} y={height - 4} textAnchor="middle" fontSize="8" fill="#9aa0b8">
          {t >= 1000 ? `${(t / 1000).toFixed(0)}K` : t}
        </text>
      ))}
      <text x={w / 2} y={height - 0} textAnchor="middle" fontSize="8" fill="#9aa0b8">Monthly Usage (kWh)</text>
      {datasets.map((ds, di) =>
        ds.points.map((p, pi) => (
          <circle key={`${di}-${pi}`} cx={toX(p.x)} cy={toY(p.y)} r="3.5" fill={ds.color} opacity="0.7" />
        ))
      )}
    </svg>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, unit, sub, subClass, colorClass, accent }) {
  return (
    <div className="card" style={{ borderBottom: `3px solid ${accent}`, padding: '10px 11px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
        <div className={`kpi-icon ${colorClass}`} style={{ width: 38, height: 38, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
          <i className={`ti ${icon}`}></i>
        </div>
        <div>
          <div className="kpi-label">{label}</div>
          <div className="kpi-val">{value} {unit && <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text3)' }}>{unit}</span>}</div>
          {sub && <div className={`kpi-sub ${subClass || ''}`}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function Card({ title, sub, action, badge, badgeClass, children, style }) {
  return (
    <div className="card" style={style}>
      <div className="card-head" style={{ marginBottom: '0.75rem' }}>
        <div>
          <h3>{title}</h3>
          {sub && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>{sub}</div>}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {badge && <span className={`pill ${badgeClass || 'pill-blue'}`}>{badge}</span>}
          {action && <span className="view-all">{action}</span>}
        </div>
      </div>
      {children}
    </div>
  );
}

function ProgressRow({ label, value, pct, color }) {
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text2)', marginBottom: 3 }}>
        <span>{label}</span><span style={{ fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ height: 7, background: '#eef0f5', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4 }}></div>
      </div>
    </div>
  );
}

function LegRow({ color, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }}></span>
      <span style={{ fontSize: 10.5, color: 'var(--text2)', flex: 1 }}>{label}</span>
      {value && <span style={{ fontSize: 10.5, color: 'var(--text3)' }}>{value}</span>}
    </div>
  );
}

// ─── Mock scatter data ─────────────────────────────────────────────────────────
function rndPts(n, xRange, yRange) {
  return Array.from({ length: n }, () => ({
    x: Math.round(Math.random() * (xRange[1] - xRange[0]) + xRange[0]),
    y: +(Math.random() * (yRange[1] - yRange[0]) + yRange[0]).toFixed(1),
  }));
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [period, setPeriod] = useState('This Month');
  const [feeder, setFeeder] = useState('All Feeders');
  const [zone, setZone] = useState('All Circles');

  const days15 = Array.from({ length: 15 }, (_, i) => `${i + 1} May`);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const hours24 = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const loadData = [18,14,12,11,13,18,32,48,55,58,60,62,65,63,60,58,62,68,72,65,55,42,30,22];
  const billedData = loadData.map(v => +(v * 0.92 + (Math.random() * 2 - 1)).toFixed(1));

  const scatterDatasets = useMemo(() => [
    { color: 'rgba(26,107,255,0.7)',  points: rndPts(30, [100,  800],  [0, 25]) },
    { color: 'rgba(22,163,74,0.7)',   points: rndPts(20, [500,  3000], [2, 18]) },
    { color: 'rgba(217,119,6,0.7)',   points: rndPts(15, [2000, 8000], [1, 12]) },
    { color: 'rgba(124,58,237,0.7)',  points: rndPts(12, [200,  1200], [5, 30]) },
  ], []);

  const feeders = [
    { id: 'FDR-C01', pur: '58,420', bil: '47,980', loss: '10,440', lossPct: 17.9, status: 'Critical', sc: 'pill-red' },
    { id: 'FDR-B03', pur: '43,100', bil: '36,200', loss: '6,900',  lossPct: 16.0, status: 'Critical', sc: 'pill-red' },
    { id: 'FDR-A07', pur: '36,500', bil: '31,000', loss: '5,500',  lossPct: 15.1, status: 'Critical', sc: 'pill-red' },
    { id: 'FDR-D02', pur: '52,000', bil: '45,500', loss: '6,500',  lossPct: 12.5, status: 'High',     sc: 'pill-amber' },
    { id: 'FDR-E05', pur: '29,800', bil: '26,200', loss: '3,600',  lossPct: 12.1, status: 'High',     sc: 'pill-amber' },
    { id: 'FDR-F01', pur: '67,000', bil: '63,800', loss: '3,200',  lossPct: 4.8,  status: 'Normal',   sc: 'pill-green' },
    { id: 'FDR-G04', pur: '44,200', bil: '42,100', loss: '2,100',  lossPct: 4.8,  status: 'Normal',   sc: 'pill-green' },
  ];

  const dotColor = s => s === 'Critical' ? '#dc2626' : s === 'High' ? '#d97706' : '#16a34a';

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <h2>Energy Audit</h2>
        <p>AT&amp;C loss tracking, feeder-wise analysis, anomaly detection &amp; collection efficiency</p>
      </div>

      {/* Filter bar */}
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginRight: 4 }}>Filters:</span>
        {[['All Feeders','Feeder A','Feeder B'], ['All Substations','Sub-1','Sub-2'], ['All Consumer Types','Domestic','Industrial']].map((opts, fi) => (
          <select key={fi} className="btn-sm" style={{ padding: '4px 8px', fontSize: 11, cursor: 'pointer', minWidth: 120 }}>
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
        <select className="btn-sm" style={{ padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}>
          {['This Month','Last Month','Custom'].map(o => <option key={o}>{o}</option>)}
        </select>
        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 2px' }}></div>
        <span className="pill pill-blue" style={{ fontSize: 10 }}>🔍 Live View</span>
        <span className="pill pill-green" style={{ fontSize: 10 }}>✓ Audit Active</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn-sm"><i className="ti ti-download"></i> Export</button>
          <button className="btn-sm btn-primary"><i className="ti ti-player-play"></i> Run Audit</button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px,1fr))', gap: 8, marginBottom: '1rem' }}>
        <KpiCard icon="ti-bolt" label="Total Energy Purchased" value="4,82,350" unit="kWh" sub="↑ 3.12% vs last period" subClass="green" colorClass="ic-blue" accent="var(--accent)" />
        <KpiCard icon="ti-circle-check" label="Energy Billed" value="4,41,820" unit="kWh" sub="↑ 2.45% vs last period" subClass="green" colorClass="ic-green" accent="#16a34a" />
        <KpiCard icon="ti-alert-circle" label="Aggregate T&D Loss" value="40,530" unit="kWh" sub="↑ 8.40% (High)" subClass="red" colorClass="ic-red" accent="#dc2626" />
        <KpiCard icon="ti-alert-triangle" label="AT&C Loss %" value="8.40" unit="%" sub="→ Target: 6.00%" subClass="" colorClass="ic-orange" accent="#d97706" />
        <KpiCard icon="ti-activity" label="Theft Detected" value="12,480" unit="kWh" sub="↓ 4.30% vs last period" subClass="green" colorClass="ic-teal" accent="#0d9488" />
        <KpiCard icon="ti-currency-rupee" label="Revenue Loss Est." value="₹18.6" unit="Lakh" sub="↑ 2.10% vs last period" subClass="red" colorClass="ic-purple" accent="#7c3aed" />
      </div>

      {/* Row 1: AT&C Gauge + T&D Loss Trend + Energy Balance Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.25fr 0.9fr', gap: 10, marginBottom: 10 }}>

        <Card title="AT&C Loss Gauge" sub="Current Period vs Target" badge="Above Target" badgeClass="pill-amber">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <HalfGauge value={8.4} target={6} max={20} size={126} />
            <div style={{ flex: 1 }}>
              <ProgressRow label="Technical Loss"   value="3.8%" pct={63} color="var(--accent)" />
              <ProgressRow label="Commercial Loss"  value="4.6%" pct={77} color="#dc2626" />
              <ProgressRow label="Collection Eff."  value="95.2%" pct={95} color="#16a34a" />
              <ProgressRow label="Billing Eff."     value="91.6%" pct={92} color="#0d9488" />
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
                Target AT&C: <b style={{ color: '#16a34a' }}>6.00%</b> &nbsp;|&nbsp; Gap: <b style={{ color: '#dc2626' }}>2.40%</b>
              </div>
            </div>
          </div>
        </Card>

        <Card title="T&D Loss Trend" sub="Daily % over last 15 days">
          <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>
            <span style={{ color: '#dc2626' }}>● AT&C Loss %</span>
            <span style={{ color: '#16a34a' }}>-- Target 6%</span>
          </div>
          <SvgLineChart
            height={128}
            labels={days15}
            xLimit={8}
            yMin={4} yMax={12}
            yFmt={v => `${v}%`}
            datasets={[
              { values: [9.2,8.8,9.5,10.1,9.7,9.0,8.6,8.9,9.3,8.7,8.4,8.5,8.2,8.4,8.4], color: '#dc2626', fill: true, dots: true },
              { values: Array(15).fill(6), color: '#16a34a', dashed: true, dots: false },
            ]}
          />
        </Card>

        <Card title="Energy Balance" sub="Purchased vs Billed vs Loss">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <SvgDonut
              size={108}
              centerValue="100%"
              centerLabel="Input"
              data={[
                { value: 91.6, color: '#16a34a' },
                { value: 3.8,  color: '#dc2626' },
                { value: 4.6,  color: '#d97706' },
              ]}
            />
            <div style={{ width: '100%' }}>
              <LegRow color="#16a34a" label="Billed" value="91.6%" />
              <LegRow color="#dc2626" label="Tech Loss" value="3.8%" />
              <LegRow color="#d97706" label="Comm Loss" value="4.6%" />
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: Monthly Purchased vs Billed + Feeder Loss Bar + Category Loss Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }}>

        <Card title="Monthly Energy: Purchased vs Billed" sub="kWh (In Thousands)">
          <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>
            <span style={{ color: 'var(--accent)' }}>■ Purchased</span>
            <span style={{ color: '#16a34a' }}>■ Billed</span>
          </div>
          {/* Grouped bar using two overlapping bars */}
          <SvgLineChart
            height={130}
            labels={months}
            yMin={350} yMax={510}
            yFmt={v => `${(v/1000).toFixed(0)}K`}
            datasets={[
              { values: [420,438,451,465,482], color: 'var(--accent)', fill: false },
              { values: [385,400,415,428,442], color: '#16a34a', fill: false },
            ]}
          />
        </Card>

        <Card title="Feeder-wise AT&C Loss %" sub="Top 8 feeders" badge="3 Critical" badgeClass="pill-red">
          <SvgBarChart
            height={148}
            horizontal
            data={[17.9,16.0,15.1,12.5,12.1,4.8,4.8,3.9]}
            labels={['FDR-C01','FDR-B03','FDR-A07','FDR-D02','FDR-E05','FDR-F01','FDR-G04','FDR-H02']}
            colors={v => v > 15 ? '#dc2626' : v > 10 ? '#d97706' : '#16a34a'}
            yMax={22}
            yFmt={v => `${v}%`}
            xFmt={v => `${v}%`}
          />
        </Card>

        <Card title="Loss by Consumer Category" sub="% contribution to total loss">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SvgDonut
              size={108}
              centerValue="40,530"
              centerLabel="kWh"
              data={[
                { value: 38, color: '#dc2626' },
                { value: 29, color: '#d97706' },
                { value: 20, color: 'var(--accent)' },
                { value: 13, color: '#7c3aed' },
              ]}
            />
            <div style={{ flex: 1 }}>
              <LegRow color="#dc2626"        label="Domestic"    value="38%" />
              <LegRow color="#d97706"        label="Commercial"  value="29%" />
              <LegRow color="var(--accent)"  label="Industrial"  value="20%" />
              <LegRow color="#7c3aed"        label="Agriculture" value="13%" />
            </div>
          </div>
        </Card>
      </div>

      {/* Row 3: Zone stacked bar + Hourly load + Anomaly feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.4fr 1fr', gap: 10, marginBottom: 10 }}>

        <Card title="Zone-wise Energy Distribution" sub="Purchased / Billed / Loss (MWh)">
          <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>
            <span style={{ color: '#16a34a' }}>■ Billed</span>
            <span style={{ color: 'var(--accent)' }}>■ Tech Loss</span>
            <span style={{ color: '#dc2626' }}>■ Comm Loss</span>
          </div>
          <SvgStackedBar
            height={142}
            labels={['North','South','East','West','Central']}
            datasets={[
              { values: [88,92,78,95,85], color: '#16a34a' },
              { values: [4,3,8,2,5],      color: 'var(--accent)' },
              { values: [8,5,14,3,10],    color: '#dc2626' },
            ]}
          />
        </Card>

        <Card title="Hourly Load vs Billing Profile" sub="15 May 2024 — kWh per hour">
          <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>
            <span style={{ color: 'var(--accent)' }}>● Input Load</span>
            <span style={{ color: '#16a34a' }}>-- Billed Units</span>
          </div>
          <SvgLineChart
            height={132}
            labels={hours24}
            xLimit={12}
            yMin={0}
            datasets={[
              { values: loadData,  color: 'var(--accent)', fill: true, dots: false },
              { values: billedData, color: '#16a34a', dashed: true, dots: false },
            ]}
          />
        </Card>

        <Card title="Anomaly Alerts" sub="Flagged this period" action="View All">
          {[
            { icon: 'ti-bolt',         ic: 'ic-red',    text: 'Bypass Detected',      meta: 'Meter #M-84231 · Feeder-C', val: '−480 kWh', sev: 'High',   vc: '#dc2626' },
            { icon: 'ti-alert-triangle', ic: 'ic-orange', text: 'Negative Consumption', meta: 'Meter #M-22014 · Zone-B',   val: '−210 kWh', sev: 'Medium', vc: '#d97706' },
            { icon: 'ti-trending-down', ic: 'ic-orange', text: 'Usage Drop >40%',       meta: 'Meter #M-51004 · Zone-A',   val: '−340 kWh', sev: 'Medium', vc: '#d97706' },
            { icon: 'ti-refresh',      ic: 'ic-blue',   text: 'Meter Tamper',           meta: 'Meter #M-61109 · Feeder-A', val: '−90 kWh',  sev: 'Low',    vc: 'var(--accent)' },
            { icon: 'ti-lock',         ic: 'ic-purple', text: 'Seal Broken',            meta: 'Meter #M-73340 · Zone-D',   val: '−55 kWh',  sev: 'Low',    vc: '#7c3aed' },
          ].map((a, i) => (
            <div key={i} className="log-entry">
              <div className={`alert-icon-wrap ${a.ic}`} style={{ width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`ti ${a.icon}`} style={{ fontSize: 13 }}></i>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text)' }}>{a.text}</div>
                <div className="log-time">{a.meta}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: a.vc }}>{a.val}</div>
                <div style={{ fontSize: 9, color: 'var(--text3)' }}>{a.sev}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Row 4: Feeder table + Scatter + Collection efficiency */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1.3fr 1fr', gap: 10 }}>

        <Card title="Feeder-wise Audit Summary" badge="15 Feeders" badgeClass="pill-blue">
          <table className="data-table">
            <thead>
              <tr>
                <th>Feeder</th><th>Purchased</th><th>Billed</th><th>Loss kWh</th><th>Loss %</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {feeders.map((f, i) => (
                <tr key={i}>
                  <td>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor(f.status), display: 'inline-block', marginRight: 6 }}></span>
                    {f.id}
                  </td>
                  <td>{f.pur}</td>
                  <td>{f.bil}</td>
                  <td>{f.loss}</td>
                  <td>
                    <span style={{ color: f.lossPct > 10 ? '#dc2626' : '#16a34a', fontSize: 11, fontWeight: 600 }}>
                      {f.lossPct > 10 ? '▲' : '▼'} {f.lossPct}%
                    </span>
                  </td>
                  <td><span className={`pill ${f.sc}`}>{f.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Usage vs Loss Scatter" sub="Per consumer — colour by category">
          <SvgScatter height={172} datasets={scatterDatasets} />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
            {[['rgba(26,107,255,0.8)','Domestic'],['rgba(22,163,74,0.8)','Commercial'],['rgba(217,119,6,0.8)','Industrial'],['rgba(124,58,237,0.8)','Agriculture']].map(([c, l]) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text2)' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: c, display: 'inline-block' }}></span>{l}
              </span>
            ))}
          </div>
        </Card>

        <Card title="Collection Efficiency" sub="by Zone (%)">
          <SvgBarChart
            height={188}
            horizontal
            data={[97.2, 95.8, 91.4, 98.1, 93.6]}
            labels={['North', 'South', 'East', 'West', 'Central']}
            colors={v => v >= 96 ? '#16a34a' : v >= 94 ? 'var(--accent)' : '#d97706'}
            yMin={85} yMax={100}
            yFmt={v => `${v}%`}
            xFmt={v => `${v}%`}
          />
        </Card>
      </div>

      <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text3)', padding: '10px 0 2px' }}>
        All times in IST (UTC+05:30) &nbsp;|&nbsp; Data auto-refreshed every 5 minutes &nbsp;|&nbsp; Energy Audit Module v2.0.0
      </div>
    </>
  );
}