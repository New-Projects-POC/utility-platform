import React from 'react';

// ─── SVG Line Chart ────────────────────────────────────────────────────────────
function SvgLine({ datasets, labels, height = 130, yFmt, xLimit, yMin }) {
  const w = 460, pL = 38, pR = 10, pT = 10, pB = 22;
  const W = w - pL - pR, H = height - pT - pB;
  const allV = datasets.flatMap(d => d.values);
  const minV = yMin !== undefined ? yMin : 0;
  const maxV = Math.max(...allV) * 1.08 || 1;
  const toX = i => pL + (i / (labels.length - 1)) * W;
  const toY = v => pT + H - ((v - minV) / (maxV - minV)) * H;
  const fmt = yFmt || (v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : Math.round(v));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(p => minV + p * (maxV - minV));
  const skip = xLimit ? Math.ceil(labels.length / xLimit) : 1;
  const path = vs => vs.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
  const area = vs => `${path(vs)} L${toX(vs.length - 1).toFixed(1)},${(pT + H).toFixed(1)} L${pL},${(pT + H).toFixed(1)} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pL} y1={toY(t)} x2={w - pR} y2={toY(t)} stroke="#f0f2f5" strokeWidth="1" />
          <text x={pL - 3} y={toY(t) + 3} textAnchor="end" fontSize="8" fill="#9aa0b8">{fmt(t)}</text>
        </g>
      ))}
      {labels.map((l, i) => (i % skip === 0 || i === labels.length - 1)
        ? <text key={i} x={toX(i)} y={height - 4} textAnchor="middle" fontSize="8" fill="#9aa0b8">{l}</text>
        : null)}
      {datasets.map((ds, di) => ds.fill && (
        <path key={`a${di}`} d={area(ds.values)} fill={ds.color} opacity={0.1} />
      ))}
      {datasets.map((ds, di) => (
        <path key={`l${di}`} d={path(ds.values)} fill="none" stroke={ds.color} strokeWidth="2" strokeLinejoin="round" />
      ))}
      {datasets.map((ds, di) => ds.dots !== false && ds.values.map((v, i) => (
        <circle key={`${di}-${i}`} cx={toX(i)} cy={toY(v)} r="2.5" fill="#fff" stroke={ds.color} strokeWidth="1.8" />
      )))}
    </svg>
  );
}

// ─── SVG Horizontal Bar ───────────────────────────────────────────────────────
function SvgHBar({ data, labels, colors, height = 140, xMax }) {
  const w = 400, pL = 88, pR = 32, pT = 6, pB = 14;
  const W = w - pL - pR, H = height - pT - pB;
  const maxV = xMax || Math.max(...data) * 1.1;
  const barH = (H / data.length) * 0.58;
  const gap = H / data.length;
  const toW = v => (v / maxV) * W;
  const getColor = (v, i) => (typeof colors === 'function' ? colors(v, i) : (Array.isArray(colors) ? colors[i] : colors)) || 'var(--accent)';

  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      {data.map((v, i) => {
        const y = pT + i * gap + gap / 2 - barH / 2;
        return (
          <g key={i}>
            <text x={pL - 5} y={y + barH / 2 + 3} textAnchor="end" fontSize="8.5" fill="#5a6080">{labels[i]}</text>
            <rect x={pL} y={y} width={toW(v)} height={barH} rx="3" fill={getColor(v, i)} opacity="0.88" />
            <text x={pL + toW(v) + 4} y={y + barH / 2 + 3} fontSize="8" fill="#5a6080">{v.toLocaleString()}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── SVG Stacked Bar ─────────────────────────────────────────────────────────
function SvgStackedBar({ datasets, labels, height = 140, yFmt }) {
  const w = 460, pL = 36, pR = 10, pT = 8, pB = 20;
  const W = w - pL - pR, H = height - pT - pB;
  const totals = labels.map((_, i) => datasets.reduce((s, d) => s + d.values[i], 0));
  const maxV = Math.max(...totals) * 1.1;
  const bW = (W / labels.length) * 0.55;
  const gap = W / labels.length;
  const toY = v => pT + H - (v / maxV) * H;
  const fmt = yFmt || (v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : Math.round(v));
  const ticks = [0, 0.5, 1].map(p => p * maxV);

  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pL} y1={toY(t)} x2={w - pR} y2={toY(t)} stroke="#f0f2f5" strokeWidth="1" />
          <text x={pL - 3} y={toY(t) + 3} textAnchor="end" fontSize="8" fill="#9aa0b8">{fmt(t)}</text>
        </g>
      ))}
      {labels.map((lbl, i) => {
        const x = pL + i * gap + gap / 2 - bW / 2;
        let cumY = pT + H;
        return (
          <g key={i}>
            {datasets.map((ds, di) => {
              const segH = (ds.values[i] / maxV) * H;
              const y = cumY - segH;
              cumY = y;
              return <rect key={di} x={x} y={y} width={bW} height={segH} fill={ds.color} opacity="0.88" rx={di === datasets.length - 1 ? 3 : 0} />;
            })}
            <text x={x + bW / 2} y={height - 4} textAnchor="middle" fontSize="8" fill="#9aa0b8">{lbl}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── SVG Donut ───────────────────────────────────────────────────────────────
function SvgDonut({ data, centerValue, centerLabel, centerColor, size = 108 }) {
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
      {centerValue !== undefined && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
          <div style={{ fontSize: size * 0.135, fontWeight: 800, color: centerColor || 'var(--text)', lineHeight: 1 }}>{centerValue}</div>
          {centerLabel && <div style={{ fontSize: size * 0.09, color: 'var(--text3)', marginTop: 1 }}>{centerLabel}</div>}
        </div>
      )}
    </div>
  );
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────
function VeeHeatmap() {
  const days7 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const base = [
    [1,1,1,1,1,2,3,5,7,8,9,9,9,8,7,6,7,8,9,7,5,3,2,1],
    [1,1,1,1,1,2,4,6,8,9,9,10,9,9,8,7,8,9,10,8,6,4,2,1],
    [1,1,1,1,2,3,5,7,8,9,10,10,10,9,8,7,8,9,10,8,6,4,3,1],
    [1,1,1,1,1,2,3,5,7,8,9,9,9,8,7,6,7,8,9,7,5,3,2,1],
    [1,1,1,1,2,3,5,7,9,10,10,10,10,9,8,7,8,9,10,8,6,4,2,1],
    [1,1,1,1,1,1,2,3,4,5,5,5,5,4,3,3,4,5,5,4,3,2,1,1],
    [1,1,1,1,1,1,2,3,3,4,4,4,4,3,3,2,3,4,4,3,2,1,1,1],
  ];
  const heatColor = v => {
    if (v <= 2) return '#e8f0fe';
    if (v <= 4) return '#93c5fd';
    if (v <= 6) return '#fbbf24';
    if (v <= 8) return '#f97316';
    return '#dc2626';
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '26px repeat(24, 1fr)', gap: 2 }}>
        <div></div>
        {hours.map(h => (
          <div key={h} style={{ fontSize: 7.5, color: 'var(--text3)', textAlign: 'center', paddingBottom: 2 }}>
            {h % 4 === 0 ? `${h}h` : ''}
          </div>
        ))}
        {days7.map((day, r) => (
          <React.Fragment key={day}>
            <div style={{ fontSize: 8.5, color: 'var(--text3)', textAlign: 'right', paddingRight: 3, lineHeight: '13px' }}>{day}</div>
            {hours.map((_, c) => (
              <div key={c} style={{ height: 13, borderRadius: 2, background: heatColor(base[r][c]), cursor: 'default' }}
                title={`${day} ${c}:00 — ${base[r][c] * 15} exceptions`} />
            ))}
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: 'var(--text3)', marginTop: 3, paddingLeft: 30 }}>
        {[0, 4, 8, 12, 16, 20, '23h'].map(h => <span key={h}>{h}</span>)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, justifyContent: 'flex-end', fontSize: 9, color: 'var(--text3)' }}>
        <span>Low</span>
        <div style={{ width: 72, height: 7, borderRadius: 2, background: 'linear-gradient(to right, #e8f0fe, #fbbf24, #dc2626)' }}></div>
        <span>High</span>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, unit, sub, subClass, colorClass, accent }) {
  return (
    <div className="card" style={{ borderBottom: `3px solid ${accent}`, padding: '10px 11px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div className={`kpi-icon ${colorClass}`} style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
          <i className={`ti ${icon}`}></i>
        </div>
        <div>
          <div className="kpi-label">{label}</div>
          <div className="kpi-val" style={{ fontSize: 15 }}>
            {value}{unit && <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text3)', marginLeft: 2 }}>{unit}</span>}
          </div>
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

function LegRow({ color, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }}></span>
      <span style={{ fontSize: 10.5, color: 'var(--text2)', flex: 1 }}>{label}</span>
      {value && <span style={{ fontSize: 10.5, color: 'var(--text3)' }}>{value}</span>}
    </div>
  );
}

function ProgressBar({ label, pct, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
      <span style={{ fontSize: 10.5, color: 'var(--text2)', width: 110, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      <div style={{ flex: 1, height: 8, background: '#eef0f5', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4 }}></div>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color, width: 32, textAlign: 'right', flexShrink: 0 }}>{pct}%</span>
    </div>
  );
}

// ─── Pipeline Stage ───────────────────────────────────────────────────────────
function PipeStage({ icon, label, count, sub, detail, borderColor, bgColor, labelColor, countColor }) {
  return (
    <div style={{
      flex: 1, background: bgColor, border: `1.5px solid ${borderColor}`,
      borderRadius: 8, padding: '10px 8px', textAlign: 'center',
    }}>
      <i className={`ti ${icon}`} style={{ fontSize: 20, color: countColor, display: 'block', marginBottom: 4 }}></i>
      <div style={{ fontSize: 10, fontWeight: 700, color: labelColor, letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: countColor, lineHeight: 1.2, margin: '3px 0' }}>{count}</div>
      <div style={{ fontSize: 9, color: 'var(--text3)' }}>{sub}</div>
      <div style={{ marginTop: 5, fontSize: 9, color: 'var(--text3)' }}>{detail}</div>
    </div>
  );
}

// ─── Timeline Item ────────────────────────────────────────────────────────────
function TlItem({ dotColor, dotLabel, title, meta, badge, badgeClass, isLast }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '6px 0', position: 'relative' }}>
      {!isLast && (
        <div style={{ position: 'absolute', left: 10, top: 28, bottom: 0, width: 1, background: 'var(--border)' }}></div>
      )}
      <div style={{
        width: 20, height: 20, borderRadius: '50%', background: dotColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0, marginTop: 2, zIndex: 1,
      }}>{dotLabel}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
          {title}
          {badge && <span className={`pill ${badgeClass}`} style={{ fontSize: 9 }}>{badge}</span>}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>{meta}</div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VeeMgmtDashboard() {
  const days15 = Array.from({ length: 15 }, (_, i) => `${i + 1} May`);
  const hours24 = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  const passedH  = [3200,2800,2500,2400,2600,3500,5800,8200,9100,9400,9600,9800,9900,9600,9400,9200,9500,9800,10200,9400,8100,6800,5200,4100];
  const failedH  = [120,100,90,85,110,180,320,480,410,390,420,460,430,400,380,360,410,440,500,380,320,260,190,140];
  const estH     = [40,35,30,30,40,60,110,160,140,130,140,155,145,135,130,120,140,148,170,130,110,90,65,48];

  const exceptionRows = [
    { id: 'M-84231', type: 'Missing Read',     rule: 'MR-001', interval: '09:00–10:00', priority: 'Critical', sc: 'pill-red',   action: 'Estimate', dc: '#dc2626' },
    { id: 'M-22014', type: 'Negative Delta',   rule: 'ND-003', interval: '07:30–08:30', priority: 'Critical', sc: 'pill-red',   action: 'Edit',     dc: '#dc2626' },
    { id: 'M-51004', type: 'Spike Outlier',    rule: 'SP-007', interval: '12:00–13:00', priority: 'High',     sc: 'pill-amber', action: 'Review',   dc: '#d97706' },
    { id: 'M-61109', type: 'Zero Consumption', rule: 'ZC-002', interval: '06:00–07:00', priority: 'High',     sc: 'pill-amber', action: 'Estimate', dc: '#d97706' },
    { id: 'M-73340', type: 'Tamper Flag',      rule: 'TF-009', interval: '11:00–12:00', priority: 'Medium',   sc: 'pill-blue',  action: 'Investigate', dc: 'var(--accent)' },
    { id: 'M-90012', type: 'Missing Read',     rule: 'MR-001', interval: '14:00–15:00', priority: 'Medium',   sc: 'pill-blue',  action: 'Estimate', dc: 'var(--accent)' },
    { id: 'M-44871', type: 'Consecutive Zero', rule: 'CZ-004', interval: '08:00–09:00', priority: 'Low',      sc: 'pill-gray',  action: 'Review',   dc: '#94a3b8' },
  ];

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <h2>VEE Management</h2>
        <p>Validation, Estimation &amp; Editing — real-time pipeline monitoring, rule health &amp; exception review</p>
      </div>

      {/* Filter bar */}
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginRight: 4 }}>Filters:</span>
        {[
          ['All Meter Types', 'Smart Meters', 'Analog'],
          ['All VEE Stages', 'Validation', 'Estimation', 'Editing'],
          ['All Rule Sets', 'Rule Set A', 'Rule Set B'],
          ['Priority: All', 'Critical', 'High', 'Normal'],
        ].map((opts, fi) => (
          <select key={fi} className="btn-sm" style={{ padding: '4px 8px', fontSize: 11, cursor: 'pointer', minWidth: 120 }}>
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 2px' }}></div>
        <span className="pill pill-blue" style={{ fontSize: 10 }}>🔄 Auto-processing ON</span>
        <span className="pill pill-green" style={{ fontSize: 10 }}>✓ Rules Engine Active</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn-sm"><i className="ti ti-search"></i> Audit Log</button>
          <button className="btn-sm btn-primary"><i className="ti ti-player-play"></i> Run VEE</button>
        </div>
        <div style={{ width: '100%', fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>
          Last VEE run: 15 May 2024 10:15 AM &nbsp;|&nbsp; Next: 10:45 AM
        </div>
      </div>

      {/* VEE Pipeline */}
      <Card title="VEE Processing Pipeline — Today" sub="Real-time flow across Validation → Estimation → Editing → Approved"
        badge="Engine Running" badgeClass="pill-green" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <span className="pill pill-blue" style={{ fontSize: 10 }}>1,12,245 Total Records</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <PipeStage icon="ti-zoom-check" label="VALIDATION"  count="98,420" sub="Passed • 87.7%"       detail={<>Failed: <b style={{ color: '#dc2626' }}>4,210</b> &nbsp;|&nbsp; Pending: <b style={{ color: '#d97706' }}>1,380</b></>} borderColor="#c5dcff" bgColor="#f0f6ff" labelColor="var(--accent)" countColor="var(--accent)" />
          <div style={{ fontSize: 18, color: '#c5cfe0', padding: '0 4px', flexShrink: 0 }}>→</div>
          <PipeStage icon="ti-math-function" label="ESTIMATION" count="4,210"  sub="Estimated • 100%"     detail={<>Method: <b>Regression</b> &nbsp;|&nbsp; Linear: 62%</>}                                                               borderColor="#fde8b0" bgColor="#fffbf0" labelColor="#d97706" countColor="#d97706" />
          <div style={{ fontSize: 18, color: '#c5cfe0', padding: '0 4px', flexShrink: 0 }}>→</div>
          <PipeStage icon="ti-edit" label="EDITING"     count="2,840"  sub="Edited & Corrected"   detail={<>Manual: <b>340</b> &nbsp;|&nbsp; Auto: <b>2,500</b></>}                                                                    borderColor="#b2e8c0" bgColor="#f0fbf3" labelColor="#16a34a" countColor="#16a34a" />
          <div style={{ fontSize: 18, color: '#c5cfe0', padding: '0 4px', flexShrink: 0 }}>→</div>
          <PipeStage icon="ti-circle-check" label="APPROVED"   count="1,05,260" sub="Ready for Billing"  detail={<>93.8% of total &nbsp;|&nbsp; <b style={{ color: '#7c3aed' }}>Billed</b></>}                                           borderColor="#cfc0f5" bgColor="#f5f0ff" labelColor="#7c3aed" countColor="#7c3aed" />
          <div style={{ fontSize: 18, color: '#c5cfe0', padding: '0 4px', flexShrink: 0 }}>→</div>
          <PipeStage icon="ti-alert-triangle" label="EXCEPTIONS" count="1,375"  sub="Needs Review"        detail={<>Critical: <b>218</b> &nbsp;|&nbsp; High: <b>540</b></>}                                                              borderColor="#ffb3b3" bgColor="#ffeaea" labelColor="#dc2626" countColor="#dc2626" />
        </div>
      </Card>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, marginBottom: '1rem' }}>
        <KpiCard icon="ti-file-text"    label="Total Records Today"   value="1,12,245"               sub="↑ 2.10% vs yesterday" subClass="green"  colorClass="ic-blue"   accent="var(--accent)" />
        <KpiCard icon="ti-circle-check" label="Validation Pass Rate"  value="96.25" unit="%"          sub="↑ 0.45% vs yesterday" subClass="green"  colorClass="ic-green"  accent="#16a34a" />
        <KpiCard icon="ti-chart-bar"    label="Estimated Records"     value="4,210"                  sub="→ 3.75% of total"     subClass=""        colorClass="ic-orange" accent="#d97706" />
        <KpiCard icon="ti-edit"         label="Edited Records"        value="2,840"                  sub="↓ 1.20% vs yesterday" subClass="green"  colorClass="ic-teal"   accent="#0d9488" />
        <KpiCard icon="ti-alert-circle" label="Exceptions Raised"     value="1,375"                  sub="↑ 5.60% vs yesterday" subClass="red"    colorClass="ic-red"    accent="#dc2626" />
        <KpiCard icon="ti-check"        label="Approved & Billed"     value="1,05,260"               sub="↑ 1.80% vs yesterday" subClass="green"  colorClass="ic-purple" accent="#7c3aed" />
        <KpiCard icon="ti-clock"        label="Avg Processing Time"   value="4.2" unit="min"          sub="↓ 0.3 min improved"   subClass="green"  colorClass="ic-blue"   accent="#3d5af1" />
      </div>

      {/* Row 1: Pass/Fail Trend + Rule Hit Bar + Estimation Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: 10, marginBottom: 10 }}>

        <Card title="Validation Pass vs Fail Trend" sub="Daily record counts — last 15 days">
          <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>
            <span style={{ color: '#16a34a' }}>● Passed</span>
            <span style={{ color: '#dc2626' }}>● Failed</span>
          </div>
          <SvgLine
            height={140}
            labels={days15}
            xLimit={8}
            datasets={[
              { values: [105000,107200,109800,110500,108900,111200,112000,109800,110200,111500,112000,110800,111200,112100,98420], color: '#16a34a', fill: true, dots: true },
              { values: [5200,4800,4600,4300,5100,4400,4200,4700,4500,4200,4100,4400,4300,4100,4210],                             color: '#dc2626', fill: true, dots: true },
            ]}
          />
        </Card>

        <Card title="Validation Rule Hits" sub="Top failing rules today" badge="12 Active Rules" badgeClass="pill-red">
          <SvgHBar
            height={152}
            data={[1240, 680, 520, 480, 390, 310, 210, 140]}
            labels={['Missing Read', 'Tamper Flag', 'Neg. Delta', 'Spike', 'Zero Cons.', 'Consec. Zero', 'Range Exceed', 'CT Ratio']}
            colors={(v) => v > 800 ? '#dc2626' : v > 400 ? '#d97706' : '#94a3b8'}
          />
        </Card>

        <Card title="Estimation Methods Used" sub="4,210 estimated records">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <SvgDonut
              size={108}
              centerValue="4,210"
              centerLabel="Records"
              data={[
                { value: 62, color: 'var(--accent)' },
                { value: 24, color: '#d97706' },
                { value: 10, color: '#16a34a' },
                { value: 4,  color: '#7c3aed' },
              ]}
            />
            <div style={{ width: '100%' }}>
              <LegRow color="var(--accent)" label="Linear Interpolation" value="62%" />
              <LegRow color="#d97706"       label="Regression"           value="24%" />
              <LegRow color="#16a34a"       label="Avg Profile"          value="10%" />
              <LegRow color="#7c3aed"       label="Manual"               value="4%" />
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: Hourly Volume + Exception Donut + Rule Health */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: 10, marginBottom: 10 }}>

        <Card title="Hourly VEE Processing Volume" sub="Records processed per hour — 15 May" badge="Today" badgeClass="pill-blue">
          <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>
            <span style={{ color: '#16a34a' }}>■ Passed</span>
            <span style={{ color: '#d97706' }}>■ Estimated</span>
            <span style={{ color: '#dc2626' }}>■ Failed</span>
          </div>
          <SvgStackedBar
            height={140}
            labels={hours24.filter((_, i) => i % 3 === 0)}
            datasets={[
              { values: passedH.filter((_, i) => i % 3 === 0),  color: '#16a34a' },
              { values: estH.filter((_, i) => i % 3 === 0),     color: '#d97706' },
              { values: failedH.filter((_, i) => i % 3 === 0),  color: '#dc2626' },
            ]}
          />
        </Card>

        <Card title="Exception Categories" sub="1,375 exceptions raised">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SvgDonut
              size={108}
              centerValue="1,375"
              centerLabel="Total"
              centerColor="#dc2626"
              data={[
                { value: 32, color: '#dc2626' },
                { value: 27, color: '#d97706' },
                { value: 21, color: 'var(--accent)' },
                { value: 12, color: '#7c3aed' },
                { value: 8,  color: '#0d9488' },
              ]}
            />
            <div style={{ flex: 1 }}>
              <LegRow color="#dc2626"       label="Missing Read"       value="32%" />
              <LegRow color="#d97706"       label="Spike / Outlier"    value="27%" />
              <LegRow color="var(--accent)" label="Zero Consumption"   value="21%" />
              <LegRow color="#7c3aed"       label="Negative Read"      value="12%" />
              <LegRow color="#0d9488"       label="Tamper Flag"        value="8%" />
            </div>
          </div>
        </Card>

        <Card title="Validation Rule Health" sub="Pass rate per active rule">
          {[
            { label: 'Meter Range Check', pct: 99, color: '#16a34a' },
            { label: 'Zero Read Check',   pct: 97, color: '#16a34a' },
            { label: 'Spike Detector',    pct: 94, color: 'var(--accent)' },
            { label: 'Consecutive Zero',  pct: 91, color: 'var(--accent)' },
            { label: 'Missing Interval',  pct: 85, color: '#d97706' },
            { label: 'Negative Delta',    pct: 78, color: '#d97706' },
            { label: 'Tamper Detect',     pct: 62, color: '#dc2626' },
          ].map((r, i) => <ProgressBar key={i} {...r} />)}
        </Card>
      </div>

      {/* Row 3: Exception Table + Heatmap + Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 1fr', gap: 10 }}>

        <Card title="Exception Records — Pending Review" badge="218 Critical" badgeClass="pill-red" action="View All">
          <table className="data-table">
            <thead>
              <tr>
                <th>Meter ID</th><th>Exception Type</th><th>Rule</th><th>Interval</th><th>Priority</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {exceptionRows.map((r, i) => (
                <tr key={i}>
                  <td>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: r.dc, display: 'inline-block', marginRight: 5 }}></span>
                    {r.id}
                  </td>
                  <td style={{ fontSize: 11 }}>{r.type}</td>
                  <td style={{ fontSize: 11, color: 'var(--text3)' }}>{r.rule}</td>
                  <td style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{r.interval}</td>
                  <td><span className={`pill ${r.sc}`} style={{ fontSize: 9 }}>{r.priority}</span></td>
                  <td>
                    <span style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{r.action}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Exception Heatmap" sub="Exceptions by hour × last 7 days" badge="Peak: 12–14h" badgeClass="pill-amber">
          <VeeHeatmap />
        </Card>

        <Card title="VEE Audit Timeline" sub="Recent processing events">
          <TlItem dotColor="#16a34a" dotLabel="✓" title="VEE Run Completed"        meta="1,12,245 records · 4.2 min · 10:15 AM"           badge="Success"      badgeClass="pill-green" />
          <TlItem dotColor="#dc2626" dotLabel="!" title="218 Critical Exceptions"  meta="Raised by Rule MR-001, ND-003 · 10:17 AM"         badge="Action Needed" badgeClass="pill-red" />
          <TlItem dotColor="#d97706" dotLabel="E" title="Auto-Estimation Applied"  meta="3,870 records estimated · Linear Interp · 10:18 AM" badge="Auto"        badgeClass="pill-amber" />
          <TlItem dotColor="#0d9488" dotLabel="✏" title="Auto-Edit Applied"        meta="2,500 records corrected · Rule SP-007 · 10:19 AM"  badge="Auto"        badgeClass="pill-green" />
          <TlItem dotColor="#7c3aed" dotLabel="✓" title="Records Approved"         meta="1,05,260 sent to billing · 10:21 AM"               badge="Billed"      badgeClass="pill-purple" />
          <TlItem dotColor="var(--accent)" dotLabel="⏰" title="Next VEE Run Scheduled" meta="All meters · 10:45 AM · Auto-trigger"         badge="Upcoming"    badgeClass="pill-blue" isLast />
        </Card>
      </div>

      <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text3)', padding: '10px 0 2px' }}>
        All times in IST (UTC+05:30) &nbsp;|&nbsp; VEE Engine auto-runs every 30 minutes &nbsp;|&nbsp; VEE Module v2.0.0
      </div>
    </>
  );
}