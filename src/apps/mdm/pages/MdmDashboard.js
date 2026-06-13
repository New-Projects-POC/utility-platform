import React, { useState, useEffect } from 'react';

// ─── KPI Card (matches HES theme) ─────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, subClass, colorClass }) {
  return (
    <div className="kpi">
      <div className={`kpi-icon ${colorClass}`}><i className={`ti ${icon}`}></i></div>
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-val">{value}</div>
        {sub && <div className={`kpi-sub ${subClass || ''}`}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── SVG Donut ─────────────────────────────────────────────────────────────────
function DonutChart({ data, centerLabel, centerValue }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = 40, cx = 50, cy = 50, circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
      <svg viewBox="0 0 100 100" width="100" height="100">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="11" />
        {data.map((d, i) => {
          const pct = total ? d.value / total : 0;
          const dash = pct * circ;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color}
              strokeWidth="11"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset * circ}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px' }}
            />
          );
          offset += pct;
          return el;
        })}
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{centerValue}</div>
        <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>{centerLabel}</div>
      </div>
    </div>
  );
}

// ─── SVG Line Chart ────────────────────────────────────────────────────────────
function LineChart({ datasets, labels, height = 100 }) {
  const width = 400;
  const allVals = datasets.flatMap(d => d.values);
  const minV = 0;
  const maxV = Math.max(...allVals) * 1.1 || 1;
  const padL = 36, padR = 8, padT = 8, padB = 20;
  const W = width - padL - padR;
  const H = height - padT - padB;
  const xStep = W / (labels.length - 1);
  const toX = i => padL + i * xStep;
  const toY = v => padT + H - ((v - minV) / (maxV - minV)) * H;

  const makePath = (values) =>
    values.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');

  const makeArea = (values) =>
    `${makePath(values)} L${toX(values.length - 1).toFixed(1)},${(padT + H).toFixed(1)} L${padL},${(padT + H).toFixed(1)} Z`;

  // y-axis ticks
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(p => minV + p * (maxV - minV));
  const fmtTick = v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : Math.round(v);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      {/* grid lines */}
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={toY(t)} x2={width - padR} y2={toY(t)} stroke="#f0f2f5" strokeWidth="1" />
          <text x={padL - 3} y={toY(t) + 3} textAnchor="end" fontSize="8" fill="#9aa0b8">{fmtTick(t)}</text>
        </g>
      ))}
      {/* x-axis labels */}
      {labels.map((l, i) => (
        <text key={i} x={toX(i)} y={height - 4} textAnchor="middle" fontSize="8" fill="#9aa0b8">{l}</text>
      ))}
      {/* area fills */}
      {datasets.map((ds, di) => ds.fill && (
        <path key={`a${di}`} d={makeArea(ds.values)} fill={ds.color} opacity={0.1} />
      ))}
      {/* lines */}
      {datasets.map((ds, di) => (
        <path key={`l${di}`} d={makePath(ds.values)} fill="none" stroke={ds.color} strokeWidth="1.8" strokeLinejoin="round" />
      ))}
      {/* dots */}
      {datasets.map((ds, di) => ds.dots !== false && ds.values.map((v, i) => (
        <circle key={`d${di}-${i}`} cx={toX(i)} cy={toY(v)} r="3" fill="#fff" stroke={ds.color} strokeWidth="1.8" />
      )))}
    </svg>
  );
}

// ─── SVG Bar Chart ─────────────────────────────────────────────────────────────
function BarChart({ data, labels, color = 'var(--accent)', height = 100 }) {
  const width = 400;
  const maxV = Math.max(...data) * 1.1 || 1;
  const padL = 36, padR = 8, padT = 8, padB = 20;
  const W = width - padL - padR;
  const H = height - padT - padB;
  const barW = (W / data.length) * 0.55;
  const gap = W / data.length;
  const toY = v => padT + H - (v / maxV) * H;
  const ticks = [0, 0.5, 1].map(p => p * maxV);
  const fmtTick = v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : Math.round(v);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={toY(t)} x2={width - padR} y2={toY(t)} stroke="#f0f2f5" strokeWidth="1" />
          <text x={padL - 3} y={toY(t) + 3} textAnchor="end" fontSize="8" fill="#9aa0b8">{fmtTick(t)}</text>
        </g>
      ))}
      {data.map((v, i) => {
        const x = padL + i * gap + gap / 2 - barW / 2;
        const barH = (v / maxV) * H;
        return (
          <g key={i}>
            <rect x={x} y={toY(v)} width={barW} height={barH} rx="3" fill={color} opacity="0.85" />
            <text x={x + barW / 2} y={height - 4} textAnchor="middle" fontSize="8" fill="#9aa0b8">{labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Heatmap ───────────────────────────────────────────────────────────────────
function Heatmap() {
  const hours = ['00','02','04','06','08','10','12','14','16','18','20','22'];
  const rows = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const getColor = (val) => {
    if (val < 0.2) return '#e8f4fd';
    if (val < 0.4) return '#93c5fd';
    if (val < 0.6) return '#fbbf24';
    if (val < 0.8) return '#f97316';
    return '#dc2626';
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '28px repeat(12, 1fr)', gap: 2, fontSize: 8 }}>
        <div></div>
        {hours.map(h => <div key={h} style={{ textAlign: 'center', color: 'var(--text3)', paddingBottom: 2 }}>{h}</div>)}
        {rows.map(row => (
          <React.Fragment key={row}>
            <div style={{ color: 'var(--text3)', textAlign: 'right', paddingRight: 4, lineHeight: '14px' }}>{row}</div>
            {hours.map((h, hi) => {
              const val = Math.random();
              return <div key={hi} style={{ height: 14, borderRadius: 2, background: getColor(val) }}></div>;
            })}
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 9, color: 'var(--text3)', justifyContent: 'flex-end' }}>
        <span>Low</span>
        <div style={{ width: 72, height: 7, borderRadius: 2, background: 'linear-gradient(to right, #e8f4fd, #93c5fd, #fbbf24, #f97316, #dc2626)' }}></div>
        <span>High</span>
      </div>
    </div>
  );
}

// ─── Live Clock ────────────────────────────────────────────────────────────────
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const pad = n => String(n).padStart(2, '0');
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return (
    <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center' }}>
      <div style={{ fontWeight: 700, color: '#cbd5e1', fontSize: 12, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>
        {pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}
      </div>
      <div style={{ marginTop: 2 }}>{days[now.getDay()]} {now.getDate()} {months[now.getMonth()]} {now.getFullYear()}</div>
    </div>
  );
}

// ─── MDM Sidebar ───────────────────────────────────────────────────────────────
export function MdmSidebar() {
  const navItems = [
    { icon: 'ti-layout-dashboard', label: 'Dashboard', active: true },
    { icon: 'ti-users', label: 'Consumer', sub: true },
    { icon: 'ti-device-desktop-analytics', label: 'Assets', sub: true },
    { icon: 'ti-database', label: 'Meter Data', sub: true },
    { icon: 'ti-activity', label: 'VEE Mgmt', sub: true },
    { icon: 'ti-clipboard-check', label: 'Energy Audit', sub: true },
    { icon: 'ti-sun', label: 'Demand Svc', sub: true },
    { icon: 'ti-phone', label: 'Communication', sub: true },
    { icon: 'ti-alert-triangle', label: 'Exceptions', sub: true },
    { icon: 'ti-currency-rupee', label: 'Revenue', sub: true },
    { icon: 'ti-headset', label: 'Customer Svc', sub: true },
    { icon: 'ti-credit-card', label: 'Prepaid', sub: true },
    { icon: 'ti-user-plus', label: 'Manage Users', sub: true },
    { icon: 'ti-file-description', label: 'Reports' },
    { icon: 'ti-chart-bar', label: 'Analytics' },
    { icon: 'ti-settings', label: 'Settings' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon" style={{ background: '#7c3aed' }}>
          <i className="ti ti-database" style={{ fontSize: 18 }}></i>
        </div>
        <div className="logo-text">MDM<small>Meter Data Mgmt</small></div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((n, i) => (
          <div key={i} className={`nav-item${n.active ? ' active' : ''}`} style={{ cursor: n.active ? 'default' : 'pointer', opacity: n.active ? 1 : 0.55 }}>
            <i className={`ti ${n.icon}`}></i>
            {n.label}
            {n.sub && <i className="ti ti-chevron-right" style={{ marginLeft: 'auto', fontSize: 11 }}></i>}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sys-status">
          <div className="sys-title" style={{ fontSize: 10, color: '#64748b', fontWeight: 600, marginBottom: 6, textAlign: 'center' }}>System Time</div>
          <LiveClock />
          <div style={{ marginTop: 8, fontSize: 9, color: '#475569', textAlign: 'center' }}>© 2024 MDM System v2.0</div>
        </div>
      </div>
    </div>
  );
}

// ─── Legend Row ────────────────────────────────────────────────────────────────
function LegendRow({ color, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
      <div style={{ width: 9, height: 9, borderRadius: '50%', background: color, flexShrink: 0 }}></div>
      <span style={{ fontSize: 11, color: 'var(--text2)', flex: 1 }}>{label}</span>
      <span style={{ fontSize: 11, color: 'var(--text3)' }}>{value}</span>
    </div>
  );
}

// ─── Card wrapper ──────────────────────────────────────────────────────────────
function Card({ title, action, children, style }) {
  return (
    <div className="card" style={style}>
      {title && (
        <div className="card-head">
          <h3>{title}</h3>
          {action && <span className="view-all">{action}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── MDM Dashboard ─────────────────────────────────────────────────────────────
export default function MdmDashboard() {
  const dayLabels = ['09 May','10 May','11 May','12 May','13 May','14 May','15 May'];
  const energyLabels = ['16 Apr','21 Apr','26 Apr','01 May','06 May','11 May','15 May'];

  return (
    <>
      {/* Page header */}
      {/* <div className="page-header">
        <h2>MDM Dashboard</h2>
        <p>Meter Data Management — Real-time overview of meter reads, energy, revenue &amp; exceptions</p>
      </div> */}

      {/* ── KPI Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, marginBottom: '1rem' }}>
        <KpiCard icon="ti-users" label="Total Consumers" value="1,25,486" sub="↑ 2.35% vs yesterday" subClass="green" colorClass="ic-blue" />
        <KpiCard icon="ti-device-desktop-analytics" label="Active Meters" value="1,18,562" sub="↑ 1.85% vs yesterday" subClass="green" colorClass="ic-green" />
        <KpiCard icon="ti-device-desktop-off" label="Offline Meters" value="6,924" sub="↓ 1.15% vs yesterday" subClass="red" colorClass="ic-red" />
        <KpiCard icon="ti-file-text" label="Today's Reads" value="1,12,245" sub="↑ 2.10% vs yesterday" subClass="green" colorClass="ic-teal" />
        <KpiCard icon="ti-circle-check" label="Read Success %" value="96.25%" sub="↑ 1.45% vs yesterday" subClass="green" colorClass="ic-green" />
        <KpiCard icon="ti-currency-rupee" label="Revenue Today" value="₹ 2.84 Cr" sub="↑ 3.25% vs yesterday" subClass="green" colorClass="ic-orange" />
        <KpiCard icon="ti-bell" label="Alarms Generated" value="245" sub="↑ 12.30% vs yesterday" subClass="red" colorClass="ic-yellow" />
        <KpiCard icon="ti-alert-triangle" label="Pending Exceptions" value="112" sub="↓ 5.60% vs yesterday" subClass="green" colorClass="ic-red" />
      </div>

      {/* ── Row 2: Comm Health + Daily Reads + Energy ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1.4fr', gap: 10, marginBottom: 10 }}>

        {/* Meter Communication Health */}
        <Card title="Meter Communication Health">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <DonutChart
              centerValue="82%"
              centerLabel="Success"
              data={[
                { value: 82, color: '#16a34a' },
                { value: 10, color: '#dc2626' },
                { value: 8,  color: '#d97706' },
              ]}
            />
            <div style={{ flex: 1 }}>
              <LegendRow color="#16a34a" label="Success" value="82% (97,245)" />
              <LegendRow color="#dc2626" label="Failed"  value="10% (11,856)" />
              <LegendRow color="#d97706" label="Pending" value="8% (9,461)" />
            </div>
          </div>
        </Card>

        {/* Daily Read Collection */}
        <Card title="Daily Read Collection Trend">
          <div style={{ display: 'flex', gap: 10, marginBottom: 6, fontSize: 10, color: 'var(--text3)' }}>
            <span style={{ color: '#16a34a' }}>● Success</span>
            <span style={{ color: '#dc2626' }}>● Failed</span>
          </div>
          <LineChart
            height={110}
            labels={dayLabels}
            datasets={[
              { values: [105000,130000,145000,140000,145000,148000,155000], color: '#16a34a' },
              { values: [22000,18000,14000,16000,15000,14000,13000],        color: '#dc2626' },
            ]}
          />
        </Card>

        {/* Energy Trend */}
        <Card title="Energy Consumption Trend (kWh)">
          <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>Last 30 Days</div>
          <LineChart
            height={110}
            labels={energyLabels}
            datasets={[
              { values: [180000,220000,280000,260000,320000,380000,460000], color: '#1a6bff', fill: true, dots: false },
            ]}
          />
        </Card>
      </div>

      {/* ── Row 3: Consumer Cat + Revenue + Heatmap ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1.4fr', gap: 10, marginBottom: 10 }}>

        {/* Consumer Category Distribution */}
        <Card title="Consumer Category Distribution">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <DonutChart
              centerValue=""
              centerLabel=""
              data={[
                { value: 48, color: '#1a6bff' },
                { value: 26, color: '#16a34a' },
                { value: 15, color: '#d97706' },
                { value: 11, color: '#7c3aed' },
              ]}
            />
            <div style={{ flex: 1 }}>
              <LegendRow color="#1a6bff" label="Domestic"    value="48% (60,233)" />
              <LegendRow color="#16a34a" label="Commercial"  value="26% (32,654)" />
              <LegendRow color="#d97706" label="Industrial"  value="15% (18,846)" />
              <LegendRow color="#7c3aed" label="Agriculture" value="11% (13,753)" />
            </div>
          </div>
        </Card>

        {/* Revenue Trend */}
        <Card title="Revenue Trend">
          <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>₹ (In Lakhs) — This Week</div>
          <BarChart
            height={110}
            data={[120,150,135,180,200,210,230]}
            labels={['09M','10M','11M','12M','13M','14M','15M']}
            color="var(--accent)"
          />
        </Card>

        {/* Load Profile Heatmap */}
        <Card title="Load Profile Heat Map (Today)">
          <Heatmap />
        </Card>
      </div>

      {/* ── Bottom Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>

        {/* Top Alarms */}
        <Card title="Top Alarms" action="View All">
          <table className="data-table">
            <thead>
              <tr>
                <th>Alarm Type</th>
                <th style={{ textAlign: 'right' }}>Count</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Power Failure',      count: 102, ic: 'ic-red',    icon: 'ti-bolt-off' },
                { label: 'Meter Tamper',        count: 56,  ic: 'ic-orange', icon: 'ti-alert-triangle' },
                { label: 'Voltage High',        count: 23,  ic: 'ic-yellow', icon: 'ti-plug' },
                { label: 'Reverse Energy',      count: 18,  ic: 'ic-purple', icon: 'ti-arrows-exchange' },
                { label: 'Communication Fail',  count: 16,  ic: 'ic-red',    icon: 'ti-wifi-off' },
              ].map((a, i) => (
                <tr key={i}>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span className={`alert-icon-wrap ${a.ic}`} style={{ width: 20, height: 20, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className={`ti ${a.icon}`} style={{ fontSize: 11 }}></i>
                      </span>
                      {a.label}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{a.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Recent Activities */}
        <Card title="Recent Activities" action="View All">
          {[
            { ic: 'ic-green', icon: 'ti-check', text: 'Meter Read Success',   time: '15 May 2024, 10:29 AM' },
            { ic: 'ic-blue',  icon: 'ti-plus',  text: 'New Consumer Added',   time: '15 May 2024, 10:21 AM' },
            { ic: 'ic-red',   icon: 'ti-alert-triangle', text: 'Tamper Alert',time: '15 May 2024, 10:15 AM' },
            { ic: 'ic-orange',icon: 'ti-plug-off', text: 'Remote Disconnect', time: '15 May 2024, 10:10 AM' },
            { ic: 'ic-teal',  icon: 'ti-currency-rupee', text: 'Payment Received', time: '15 May 2024, 10:05 AM' },
          ].map((a, i) => (
            <div key={i} className="log-entry">
              <div className={`alert-icon-wrap ${a.ic}`} style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`ti ${a.icon}`} style={{ fontSize: 12 }}></i>
              </div>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text)' }}>{a.text}</div>
                <div className="log-time">{a.time}</div>
              </div>
            </div>
          ))}
        </Card>

        {/* Meter Status Overview */}
        <Card title="Meter Status Overview">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <DonutChart
              centerValue="1,25,486"
              centerLabel="Total"
              data={[
                { value: 118562, color: '#16a34a' },
                { value: 4231,   color: '#94a3b8' },
                { value: 2105,   color: '#d97706' },
                { value: 588,    color: '#dc2626' },
              ]}
            />
            <div style={{ flex: 1 }}>
              <LegendRow color="#16a34a" label="Active"        value="1,18,562 (94.5%)" />
              <LegendRow color="#94a3b8" label="Inactive"      value="4,231 (3.4%)" />
              <LegendRow color="#d97706" label="Maintenance"   value="2,105 (1.7%)" />
              <LegendRow color="#dc2626" label="Faulty"        value="588 (0.5%)" />
            </div>
          </div>
        </Card>

        {/* Map Overview */}
        <Card title="Map Overview">
          <div style={{ background: '#e8f0f7', borderRadius: 6, height: 138, overflow: 'hidden', marginBottom: 8 }}>
            <svg viewBox="0 0 300 140" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
              <rect width="300" height="140" fill="#d4e8f0"/>
              <path d="M0,70 Q75,50 150,70 Q225,90 300,70" stroke="#b0c8d8" strokeWidth="2" fill="none"/>
              <path d="M0,40 Q100,60 200,30 L300,45" stroke="#b0c8d8" strokeWidth="1.5" fill="none"/>
              <path d="M80,0 Q90,70 100,140" stroke="#b0c8d8" strokeWidth="1.5" fill="none"/>
              <path d="M200,0 Q190,70 210,140" stroke="#b0c8d8" strokeWidth="1.5" fill="none"/>
              <path d="M0,100 Q150,110 300,95" stroke="#b0c8d8" strokeWidth="1" fill="none"/>
              {[
                [55,30,'21','#16a34a'],[210,20,'35','#16a34a'],[265,18,'56','#16a34a'],
                [140,40,'18','#dc2626'],[108,60,'27','#16a34a'],[175,55,'26','#16a34a'],
                [28,80,'38','#16a34a'],[78,90,'28','#d97706'],[148,95,'72','#16a34a'],
                [215,90,'35','#16a34a'],[272,85,'25','#16a34a'],
              ].map(([cx,cy,label,color], i) => (
                <g key={i}>
                  <circle cx={cx} cy={cy} r="11" fill={color} opacity="0.85"/>
                  <text x={cx} y={cy+4} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700">{label}</text>
                </g>
              ))}
            </svg>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[['#16a34a','Online'],['#dc2626','Offline'],['#d97706','Comm Fail'],['#94a3b8','Not Config']].map(([c,l]) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text2)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block' }}></span>{l}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}