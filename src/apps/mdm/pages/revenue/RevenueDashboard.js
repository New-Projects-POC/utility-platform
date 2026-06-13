import React, { useState } from 'react';

// ─── SVG Line Chart ────────────────────────────────────────────────────────────
function SvgLine({ datasets, labels, height = 170, yFmt, xLimit, yMin }) {
  const w = 480, pL = 42, pR = 10, pT = 10, pB = 22;
  const W = w - pL - pR, H = height - pT - pB;
  const allV = datasets.flatMap(d => d.values);
  const minV = yMin !== undefined ? yMin : 0;
  const maxV = Math.max(...allV) * 1.1 || 1;
  const toX  = i => pL + (i / (labels.length - 1)) * W;
  const toY  = v => pT + H - ((v - minV) / (maxV - minV)) * H;
  const fmt  = yFmt || (v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : Math.round(v));
  const skip = xLimit ? Math.ceil(labels.length / xLimit) : 1;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(p => minV + p * (maxV - minV));
  const path = vs => vs.map((v,i) => `${i===0?'M':'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
  const area = vs => `${path(vs)} L${toX(vs.length-1).toFixed(1)},${(pT+H).toFixed(1)} L${pL},${(pT+H).toFixed(1)} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width:'100%', height }} preserveAspectRatio="none">
      {ticks.map((t,i) => (
        <g key={i}>
          <line x1={pL} y1={toY(t)} x2={w-pR} y2={toY(t)} stroke="#f0f2f7" strokeWidth="1"/>
          <text x={pL-4} y={toY(t)+3} textAnchor="end" fontSize="8" fill="#9aa0b8">{fmt(t)}</text>
        </g>
      ))}
      {labels.map((l,i) => (i%skip===0||i===labels.length-1)
        ? <text key={i} x={toX(i)} y={height-4} textAnchor="middle" fontSize="8" fill="#9aa0b8">{l}</text>
        : null)}
      {datasets.map((ds,di) => ds.fill && (
        <path key={`a${di}`} d={area(ds.values)} fill={ds.color} opacity={0.1}/>
      ))}
      {datasets.map((ds,di) => (
        <path key={`l${di}`} d={path(ds.values)} fill="none" stroke={ds.color} strokeWidth="2" strokeLinejoin="round"/>
      ))}
      {datasets.map((ds,di) => ds.dots!==false && ds.values.map((v,i) => (
        <circle key={`${di}-${i}`} cx={toX(i)} cy={toY(v)} r="3" fill="#fff" stroke={ds.color} strokeWidth="1.8"/>
      )))}
    </svg>
  );
}

// ─── SVG Bar Chart ─────────────────────────────────────────────────────────────
function SvgBar({ data, labels, color = 'var(--accent)', height = 170, yFmt }) {
  const w = 480, pL = 38, pR = 10, pT = 8, pB = 28;
  const W = w - pL - pR, H = height - pT - pB;
  const maxV = Math.max(...data) * 1.15;
  const bW = (W / data.length) * 0.55;
  const gap = W / data.length;
  const toY = v => pT + H - (v / maxV) * H;
  const fmt = yFmt || (v => Math.round(v));
  const ticks = [0, 0.5, 1].map(p => p * maxV);

  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width:'100%', height }} preserveAspectRatio="none">
      {ticks.map((t,i) => (
        <g key={i}>
          <line x1={pL} y1={toY(t)} x2={w-pR} y2={toY(t)} stroke="#f0f2f7" strokeWidth="1"/>
          <text x={pL-4} y={toY(t)+3} textAnchor="end" fontSize="8" fill="#9aa0b8">{fmt(t)}</text>
        </g>
      ))}
      {data.map((v,i) => {
        const x = pL + i*gap + gap/2 - bW/2;
        const barH = (v / maxV) * H;
        const c = typeof color === 'function' ? color(v,i) : color;
        return (
          <g key={i}>
            <rect x={x} y={toY(v)} width={bW} height={barH} rx="3" fill={c} opacity="0.88"/>
            <text x={x+bW/2} y={height-6} textAnchor="middle" fontSize="8" fill="#9aa0b8"
              transform={`rotate(-40, ${x+bW/2}, ${height-6})`}>{labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── SVG Donut ─────────────────────────────────────────────────────────────────
function SvgDonut({ data, centerValue, centerLabel, size = 120 }) {
  const total = data.reduce((s,d) => s+d.value, 0);
  const r = size*0.38, cx = size/2, cy = size/2, circ = 2*Math.PI*r;
  let offset = 0;
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={size*0.115}/>
        {data.map((d,i) => {
          const pct = total ? d.value/total : 0;
          const dash = pct*circ;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color}
              strokeWidth={size*0.115}
              strokeDasharray={`${dash} ${circ-dash}`}
              strokeDashoffset={-offset*circ}
              style={{ transform:'rotate(-90deg)', transformOrigin:`${cx}px ${cy}px` }}
            />
          );
          offset += pct;
          return el;
        })}
      </svg>
      {centerValue !== undefined && (
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center', pointerEvents:'none' }}>
          <div style={{ fontSize:size*0.135, fontWeight:800, color:'var(--text)', lineHeight:1 }}>{centerValue}</div>
          {centerLabel && <div style={{ fontSize:size*0.09, color:'var(--text3)', marginTop:1 }}>{centerLabel}</div>}
        </div>
      )}
    </div>
  );
}

// ─── Half Gauge ────────────────────────────────────────────────────────────────
function HalfGauge({ pct, size = 200 }) {
  const cx = size/2, cy = size*0.62, r = size*0.42;
  const toAngle = v => Math.PI + (v/100)*Math.PI;
  const polar = angle => ({ x: cx + r*Math.cos(angle), y: cy + r*Math.sin(angle) });
  const arcPath = (s, e) => {
    const sp = polar(s), ep = polar(e);
    const large = (e-s) > Math.PI ? 1 : 0;
    return `M ${sp.x.toFixed(2)} ${sp.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${ep.x.toFixed(2)} ${ep.y.toFixed(2)}`;
  };
  const valueAngle = toAngle(pct);
  const sw = size * 0.09;

  return (
    <div style={{ position:'relative', width:size, height:size*0.68, margin:'0 auto' }}>
      <svg viewBox={`0 0 ${size} ${size*0.68}`} width={size} height={size*0.68}>
        {/* Background */}
        <path d={arcPath(Math.PI, 2*Math.PI)} fill="none" stroke="#e2e8f0" strokeWidth={sw} strokeLinecap="round"/>
        {/* Value - gradient from green to orange based on pct */}
        <path d={arcPath(Math.PI, valueAngle)} fill="none"
          stroke={pct > 85 ? '#16a34a' : pct > 60 ? '#3b82f6' : '#f59e0b'}
          strokeWidth={sw} strokeLinecap="round"/>
        {/* Needle */}
        <line x1={cx} y1={cy}
          x2={(cx + (r-4)*Math.cos(valueAngle)).toFixed(2)}
          y2={(cy + (r-4)*Math.sin(valueAngle)).toFixed(2)}
          stroke="#1a2236" strokeWidth="2" strokeLinecap="round"/>
        <circle cx={cx} cy={cy} r={size*0.04} fill="#1a2236"/>
        {/* Labels */}
        <text x={size*0.08} y={size*0.67} fontSize="9" fill="#9aa0b8" textAnchor="middle">0%</text>
        <text x={size*0.92} y={size*0.67} fontSize="9" fill="#9aa0b8" textAnchor="middle">100%</text>
      </svg>
      <div style={{ position:'absolute', top:'46%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center' }}>
        <div style={{ fontSize:size*0.155, fontWeight:800, color:'var(--text)', lineHeight:1 }}>{pct}%</div>
        <div style={{ fontSize:size*0.07, color:'var(--text3)', marginTop:2 }}>Collection Efficiency</div>
      </div>
    </div>
  );
}

// ─── Invoice Stacked Progress Bar ─────────────────────────────────────────────
function InvoiceProgressBar() {
  const segs = [
    { pct: 2.8,  color: '#94a3b8', label: 'Draft (2.8%)' },
    { pct: 40.8, color: '#3b82f6', label: 'Sent (40.8%)' },
    { pct: 45.2, color: '#10b981', label: 'Paid (45.2%)' },
    { pct: 11.2, color: '#ef4444', label: 'Cancelled (11.2%)' },
  ];
  return (
    <div>
      <div style={{ display:'flex', height:14, borderRadius:6, overflow:'hidden', marginBottom:8 }}>
        {segs.map((s,i) => (
          <div key={i} style={{ width:`${s.pct}%`, background:s.color }}></div>
        ))}
      </div>
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
        {segs.map((s,i) => (
          <span key={i} style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'var(--text2)' }}>
            <span style={{ width:9, height:9, borderRadius:'50%', background:s.color, display:'inline-block' }}></span>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, subClass, colorClass, accent }) {
  return (
    <div className="card" style={{ borderBottom:`3px solid ${accent}`, padding:'12px 13px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
        <div className={`kpi-icon ${colorClass}`}
          style={{ width:42, height:42, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
          <i className={`ti ${icon}`}></i>
        </div>
        <div>
          <div className="kpi-label">{label}</div>
          <div className="kpi-val" style={{ fontSize:15 }}>{value}</div>
          {sub && <div className={`kpi-sub ${subClass||''}`}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function Card({ title, sub, action, badge, badgeClass, children, style, span }) {
  return (
    <div className="card" style={{ gridColumn: span ? `span ${span}` : undefined, ...style }}>
      <div className="card-head" style={{ marginBottom:'0.75rem' }}>
        <div>
          <h3>{title}</h3>
          {sub && <div style={{ fontSize:10, color:'var(--text3)', marginTop:1 }}>{sub}</div>}
        </div>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          {badge && <span className={`pill ${badgeClass||'pill-blue'}`}>{badge}</span>}
          {action && <span className="view-all">{action}</span>}
        </div>
      </div>
      {children}
    </div>
  );
}

function LegRow({ color, label, value, sub }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:7 }}>
      <span style={{ width:10, height:10, borderRadius:'50%', background:color, flexShrink:0, display:'inline-block' }}></span>
      <span style={{ fontSize:11, color:'var(--text2)', flex:1 }}>{label}</span>
      <span style={{ fontSize:11, fontWeight:700, color:'var(--text)' }}>{value}</span>
      {sub && <span style={{ fontSize:10, color:'var(--text3)', marginLeft:2 }}>{sub}</span>}
    </div>
  );
}

function AgingRow({ color, label, amount, pct }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 0', borderBottom:'1px solid #f7f8fc' }}>
      <span style={{ width:9, height:9, borderRadius:'50%', background:color, flexShrink:0, display:'inline-block' }}></span>
      <span style={{ fontSize:11, color:'var(--text2)', flex:1 }}>{label}</span>
      <span style={{ fontSize:11, fontWeight:700, color:'var(--text)' }}>{amount}</span>
      <span style={{ fontSize:10, color:'var(--text3)', minWidth:38, textAlign:'right' }}>{pct}</span>
    </div>
  );
}

function ActItem({ iconBg, icon, title, time, amount, amountColor }) {
  return (
    <div className="log-entry" style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
      <div style={{ width:30, height:30, borderRadius:8, background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <i className={`ti ${icon}`} style={{ fontSize:13, color: amountColor||'var(--accent)' }}></i>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:11.5, fontWeight:600, color:'var(--text)', lineHeight:1.4 }}>{title}</div>
        <div style={{ fontSize:10, color:'var(--text3)', marginTop:1 }}>{time}</div>
      </div>
      <div style={{ fontSize:12, fontWeight:700, color:amountColor||'var(--accent)', flexShrink:0 }}>{amount}</div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function RevenueDashboard() {
  const [period, setPeriod] = useState('Last 15 Days');
  const [revYear, setRevYear] = useState('This Year');

  const days15 = ['01 May','02 May','03 May','04 May','05 May','06 May','07 May','08 May',
                  '09 May','10 May','11 May','12 May','13 May','14 May','15 May'];
  const months14 = ["Apr'23","May'23","Jun'23","Jul'23","Aug'23","Sep'23","Oct'23",
                    "Nov'23","Dec'23","Jan'24","Feb'24","Mar'24","Apr'24","May'24"];
  const months12 = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <>
      {/* Page Header */}
      <div className="page-header" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <h2>Revenue Dashboard</h2>
          <p>Invoice & payment tracking, revenue overview, collection efficiency & cash flow analytics</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn-sm"><i className="ti ti-refresh"></i> Refresh</button>
          <button className="btn-sm btn-primary"><i className="ti ti-download"></i> Export</button>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:10, marginBottom:'1rem' }}>
        <KpiCard icon="ti-file-invoice"      label="Total Invoices"     value="12,845"       sub="↑ 15.8% vs last 30 days" subClass="green"  colorClass="ic-blue"   accent="var(--accent)" />
        <KpiCard icon="ti-currency-rupee"    label="Total Revenue"      value="₹ 56,78,250"  sub="↑ 18.3% vs last 30 days" subClass="green"  colorClass="ic-green"  accent="#16a34a" />
        <KpiCard icon="ti-circle-check"      label="Payments Received"  value="₹ 45,34,680"  sub="↑ 20.6% vs last 30 days" subClass="green"  colorClass="ic-teal"   accent="#059669" />
        <KpiCard icon="ti-clock"             label="Pending Amount"     value="₹ 11,43,570"  sub="↓ 8.7% vs last 30 days"  subClass="red"    colorClass="ic-orange" accent="#d97706" />
        <KpiCard icon="ti-users"             label="Total Customers"    value="8,645"         sub="↑ 9.4% vs last 30 days"  subClass="green"  colorClass="ic-purple" accent="#7c3aed" />
        <KpiCard icon="ti-alert-triangle"    label="Overdue Invoices"   value="2,153"         sub="↑ 12.5% vs last 30 days" subClass="red"    colorClass="ic-red"    accent="#e11d48" />
      </div>

      {/* Row 1: Invoice & Payment Trend + Revenue Overview + Sales by Status */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 1.3fr', gap:12, marginBottom:12 }}>

        <Card title="Invoice & Payment Trend" sub="Daily invoiced vs received amount">
          <div style={{ display:'flex', gap:12, fontSize:10, color:'var(--text3)', marginBottom:6 }}>
            <span style={{ color:'var(--accent)' }}>● Invoices</span>
            <span style={{ color:'#10b981' }}>● Payments</span>
            <select className="btn-sm" style={{ marginLeft:'auto', padding:'2px 6px', fontSize:10 }}
              value={period} onChange={e => setPeriod(e.target.value)}>
              <option>Last 15 Days</option><option>Last 30 Days</option>
            </select>
          </div>
          <SvgLine height={175}
            labels={days15} xLimit={8}
            datasets={[
              { values:[420000,480000,610000,560000,640000,700000,680000,750000,810000,780000,820000,860000,840000,890000,850000], color:'var(--accent)', fill:true, dots:true },
              { values:[180000,210000,280000,250000,310000,340000,320000,360000,380000,370000,390000,410000,400000,420000,410000], color:'#10b981', fill:true, dots:true },
            ]}
          />
        </Card>

        <Card title="Revenue Overview" sub="Monthly revenue (₹ in Lakhs)">
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:4 }}>
            <select className="btn-sm" style={{ padding:'2px 6px', fontSize:10 }}
              value={revYear} onChange={e => setRevYear(e.target.value)}>
              <option>This Year</option><option>Last Year</option>
            </select>
          </div>
          <SvgBar height={175}
            data={[22,26,24,28,32,30,35,38,42,40,44,46,48,52]}
            labels={months14}
            color="#7c3aed"
            yFmt={v => `${Math.round(v)}`}
          />
        </Card>

        <Card title="Sales by Invoice Status">
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <SvgDonut size={120}
              centerValue="12,845"
              centerLabel="Total"
              data={[
                { value:5808, color:'#10b981' },
                { value:2003, color:'var(--accent)' },
                { value:3688, color:'#f59e0b' },
                { value:1346, color:'#ef4444' },
              ]}
            />
            <div style={{ flex:1 }}>
              <LegRow color="#10b981"        label="Paid"     value="45.2%"  sub="(5,808)" />
              <LegRow color="var(--accent)"  label="Partial"  value="15.6%"  sub="(2,003)" />
              <LegRow color="#f59e0b"        label="Unpaid"   value="28.7%"  sub="(3,688)" />
              <LegRow color="#ef4444"        label="Overdue"  value="10.5%"  sub="(1,346)" />
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: Top Customers + Aging + Collection Gauge + Activities */}
      <div style={{ display:'grid', gridTemplateColumns:'1.1fr 1fr 1fr 1fr', gap:12, marginBottom:12 }}>

        <Card title="Top Customers" sub="By Revenue" action="View All">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th style={{ textAlign:'right' }}>Invoices</th>
                <th style={{ textAlign:'right' }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['ABC Enterprises',  245, '₹ 8,45,230'],
                ['XYZ Solutions',    148, '₹ 6,12,450'],
                ['Global Tech Ltd.', 126, '₹ 4,85,620'],
                ['PQR Industries',   102, '₹ 3,25,410'],
                ['Smart Retailers',   98, '₹ 2,95,300'],
              ].map(([name, inv, rev], i) => (
                <tr key={i}>
                  <td style={{ fontSize:11 }}>{name}</td>
                  <td style={{ textAlign:'right', fontSize:11 }}>{inv}</td>
                  <td style={{ textAlign:'right', fontWeight:600, color:'#16a34a', fontSize:11 }}>{rev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Outstanding Aging" sub="₹ 11,43,570 total outstanding">
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <SvgDonut size={100}
              centerValue="₹11.4L"
              centerLabel="Total"
              data={[
                { value:325410, color:'#10b981' },
                { value:245320, color:'var(--accent)' },
                { value:215600, color:'#f59e0b' },
                { value:145230, color:'#f97316' },
                { value:211010, color:'#ef4444' },
              ]}
            />
            <div style={{ flex:1 }}>
              <AgingRow color="#10b981"        label="0–30 Days"      amount="₹ 3,25,410" pct="28.4%" />
              <AgingRow color="var(--accent)"  label="31–60 Days"     amount="₹ 2,45,320" pct="21.5%" />
              <AgingRow color="#f59e0b"        label="61–90 Days"     amount="₹ 2,15,600" pct="18.8%" />
              <AgingRow color="#f97316"        label="91–120 Days"    amount="₹ 1,45,230" pct="12.7%" />
              <AgingRow color="#ef4444"        label=">120 Days"      amount="₹ 2,11,010" pct="18.6%" />
            </div>
          </div>
        </Card>

        <Card title="Collection Summary">
          <HalfGauge pct={79.8} size={190} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:8 }}>
            {[
              { val:'₹ 45,34,680', label:'Collected',  color:'#16a34a' },
              { val:'₹ 56,78,250', label:'Invoiced',   color:'var(--accent)' },
            ].map((s,i) => (
              <div key={i} style={{ background:'var(--bg3)', borderRadius:8, padding:'8px 10px', textAlign:'center' }}>
                <div style={{ fontSize:13, fontWeight:700, color:s.color }}>{s.val}</div>
                <div style={{ fontSize:10, color:'var(--text3)', marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Recent Activities" action="View All">
          <ActItem iconBg="#dcfce7" icon="ti-credit-card"  title="Payment received from ABC Enterprises"  time="15 May 2024, 10:30 AM" amount="₹ 45,000"  amountColor="#16a34a" />
          <ActItem iconBg="#eff6ff" icon="ti-file-invoice" title="New invoice created for XYZ Solutions"    time="15 May 2024, 10:15 AM" amount="₹ 78,500"  amountColor="var(--accent)" />
          <ActItem iconBg="#fff7ed" icon="ti-alert-triangle" title="Invoice overdue for PQR Industries"     time="15 May 2024, 09:45 AM" amount="₹ 12,450"  amountColor="#ef4444" />
          <ActItem iconBg="#dcfce7" icon="ti-cash"          title="Payment received from Global Tech Ltd." time="15 May 2024, 09:30 AM" amount="₹ 22,000"  amountColor="#16a34a" />
          <ActItem iconBg="#f5f3ff" icon="ti-user-plus"     title="New customer added — Smart Retailers"   time="15 May 2024, 09:10 AM" amount="New"        amountColor="#7c3aed" />
        </Card>
      </div>

      {/* Row 3: Invoices Overview + Top Products + Monthly Cash Flow */}
      <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr 2fr', gap:12 }}>

        <Card title="Invoices Overview">
          {/* Invoice stat boxes */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:12 }}>
            {[
              { icon:'ti-pencil',       iconBg:'#f0f2f7', label:'Draft',     val:'356',   valColor:'var(--text)' },
              { icon:'ti-send',         iconBg:'#eff6ff', label:'Sent',      val:'5,236', valColor:'var(--accent)' },
              { icon:'ti-circle-check', iconBg:'#dcfce7', label:'Paid',      val:'5,808', valColor:'#16a34a' },
              { icon:'ti-circle-x',     iconBg:'#fff1f2', label:'Cancelled', val:'1,445', valColor:'#e11d48' },
            ].map((s,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg3)', borderRadius:8, padding:'8px 10px' }}>
                <div style={{ width:32, height:32, borderRadius:8, background:s.iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <i className={`ti ${s.icon}`} style={{ fontSize:14, color:s.valColor }}></i>
                </div>
                <div>
                  <div style={{ fontSize:10, color:'var(--text3)' }}>{s.label}</div>
                  <div style={{ fontSize:14, fontWeight:800, color:s.valColor }}>{s.val}</div>
                </div>
              </div>
            ))}
          </div>
          <InvoiceProgressBar />
        </Card>

        <Card title="Top Products / Services" action="View All">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product / Service</th>
                <th style={{ textAlign:'right' }}>Sold</th>
                <th style={{ textAlign:'right' }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Web Hosting',         256, '₹ 5,45,000'],
                ['Domain Registration', 154, '₹ 2,15,600'],
                ['SSL Certificates',    112, '₹ 1,12,000'],
                ['Email Services',       98, '₹ 85,400'],
                ['Website Development',  76, '₹ 2,45,600'],
              ].map(([name, sold, rev], i) => (
                <tr key={i}>
                  <td style={{ fontSize:11 }}>{name}</td>
                  <td style={{ textAlign:'right', fontSize:11 }}>{sold}</td>
                  <td style={{ textAlign:'right', fontWeight:600, color:'#16a34a', fontSize:11 }}>{rev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Monthly Cash Flow">
          <div style={{ display:'flex', gap:14, fontSize:10, color:'var(--text3)', marginBottom:6 }}>
            <span style={{ color:'var(--accent)' }}>● Inflow</span>
            <span style={{ color:'#ef4444' }}>● Outflow</span>
          </div>
          <SvgLine height={162}
            labels={months12}
            datasets={[
              { values:[62000,70000,65000,75000,78000,82000,80000,85000,88000,84000,90000,95000], color:'var(--accent)', fill:true, dots:true },
              { values:[38000,42000,39000,45000,48000,46000,50000,52000,48000,55000,58000,40000], color:'#ef4444', fill:true, dots:true },
            ]}
          />
        </Card>
      </div>

      <div style={{ textAlign:'center', fontSize:10, color:'var(--text3)', padding:'10px 0 2px' }}>
        All times in IST (UTC+05:30) &nbsp;|&nbsp; Data refreshed every 5 minutes &nbsp;|&nbsp; BillingPro v2.0.0
      </div>
    </>
  );
}