import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { METERS, ALERTS, fmtDT, ri } from '../../../shared/utils/mockData';

// ─── KPI Card ─────────────────────────────────────────────────────────────────
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

// ─── Donut Chart (SVG) ────────────────────────────────────────────────────────
function DonutChart({ data, title }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#94a3b8'];
  let offset = 0;
  const r = 38, cx = 45, cy = 45, circ = 2 * Math.PI * r;

  return (
    <div className="donut-cell">
      <div className="donut-cell-title">{title}</div>
      <div className="donut-canvas-wrap">
        <svg viewBox="0 0 90 90" width="90" height="90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
          {data.map((d, i) => {
            const pct = total ? d.count / total : 0;
            const dash = pct * circ;
            const el = (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={COLORS[i]}
                strokeWidth="10"
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-offset * circ}
                strokeLinecap="butt"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '45px 45px' }}
              />
            );
            offset += pct;
            return el;
          })}
        </svg>
        <div className="donut-center">
          <div className="dc-val">{total}</div>
          <div className="dc-sub">meters</div>
        </div>
      </div>
      <div className="donut-stats">
        {data.map((d, i) => (
          <div className="ds-row" key={i}>
            <div className="ds-dot" style={{ background: COLORS[i] }}></div>
            <span>{d.label}</span>
            <span className="ds-count">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Device type marker config ─────────────────────────────────────────────────
const DEVICE_ICONS = {
  'Single Phase': { bg: '#1a6bff', border: '#1250cc', square: false },
  'Three Phase':  { bg: '#7c3aed', border: '#5b21b6', square: true  },
  'HT Meter':     { bg: '#d97706', border: '#b45309', square: false },
  'CT Meter':     { bg: '#0d9488', border: '#0f766e', square: false },
};
const STATUS_COLORS = {
  'Online':          '#16a34a',
  'Offline':         '#ef4444',
  'Inactive':        '#f59e0b',
  'Never Connected': '#94a3b8',
};

// ─── Map Component ────────────────────────────────────────────────────────────
function MeterMap() {
  const mapRef     = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef([]);

  const [filterZone,   setFilterZone]   = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType,   setFilterType]   = useState('All');
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0, inactive: 0, never: 0 });

  const ZONES    = ['All', 'North', 'South', 'East', 'West', 'Central'];
  const STATUSES = ['All', 'Online', 'Offline', 'Inactive', 'Never Connected'];
  const TYPES    = ['All', 'Single Phase', 'Three Phase', 'HT Meter', 'CT Meter'];

  const filtered = METERS.filter(m =>
    (filterZone   === 'All' || m.zone   === filterZone)   &&
    (filterStatus === 'All' || m.status === filterStatus) &&
    (filterType   === 'All' || m.type   === filterType)
  );

  // Recompute stats
  useEffect(() => {
    setStats({
      total:    filtered.length,
      online:   filtered.filter(m => m.status === 'Online').length,
      offline:  filtered.filter(m => m.status === 'Offline').length,
      inactive: filtered.filter(m => m.status === 'Inactive').length,
      never:    filtered.filter(m => m.status === 'Never Connected').length,
    });
  }, [filterZone, filterStatus, filterType]); // eslint-disable-line

  // Init map once
  useEffect(() => {
    if (!window.L || leafletRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, { zoom: 11, center: [28.45, 77.55] });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);
    leafletRef.current = map;
    setTimeout(() => map.invalidateSize(), 400);
    return () => { if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null; } };
  }, []);

  // Re-draw markers when filters change
  useEffect(() => {
    const map = leafletRef.current;
    if (!map || !window.L) return;
    const L = window.L;

    markersRef.current.forEach(mk => mk.remove());
    markersRef.current = [];

    filtered.forEach(m => {
      const di = DEVICE_ICONS[m.type] || DEVICE_ICONS['Single Phase'];
      const sc = STATUS_COLORS[m.status] || '#94a3b8';
      const html = `
        <div style="position:relative;width:18px;height:18px;
          background:${di.bg};border:2px solid ${di.border};
          border-radius:${di.square ? '3px' : '50%'};
          box-shadow:0 2px 5px rgba(0,0,0,.3);cursor:pointer;">
          <div style="position:absolute;bottom:-3px;right:-3px;
            width:7px;height:7px;border-radius:50%;
            background:${sc};border:1.5px solid #fff;"></div>
        </div>`;

      const icon = L.divIcon({ html, className: '', iconSize: [18, 18], iconAnchor: [9, 9] });

      const popup = L.popup({ maxWidth: 220, className: 'meter-popup' }).setContent(`
        <div style="font-family:'Inter',sans-serif;font-size:12px;min-width:190px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #f1f3f8;">
            <div style="width:30px;height:30px;border-radius:8px;background:${di.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <i class="ti ti-bolt" style="font-size:15px;color:#fff;"></i>
            </div>
            <div>
              <div style="font-weight:700;font-size:13px;color:#1a1d2e;">${m.id}</div>
              <div style="color:#9aa0b8;font-size:10px;">${m.serial} · ${m.type}</div>
            </div>
          </div>
          ${[
            ['Zone / Circle', `${m.zone} / ${m.circle}`],
            ['Feeder / DT',   `${m.feeder} / ${m.dt}`],
            ['Status',        `<span style="color:${sc};font-weight:700;">${m.status}</span>`],
            ['Voltage',       `${m.voltage} V`],
            ['Current',       `${m.current} A`],
            ['Power',         `${m.power} kW`],
            ['PF',            m.pf],
            ['kWh Import',    `${m.kwhImport} kWh`],
            ['Last Comm',     fmtDT(m.lastComm)],
          ].map(([k, v]) => `
            <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11px;border-bottom:1px solid #f8f9fc;">
              <span style="color:#9aa0b8;">${k}</span>
              <span style="font-weight:600;color:#1a1d2e;">${v}</span>
            </div>
          `).join('')}
          <div style="margin-top:8px;font-size:10px;color:#9aa0b8;">${m.address}</div>
        </div>
      `);

      const marker = L.marker([m.lat, m.lng], { icon }).bindPopup(popup).addTo(map);
      markersRef.current.push(marker);
    });

    if (filtered.length > 0) {
      map.fitBounds(filtered.map(m => [m.lat, m.lng]), { padding: [30, 30] });
    }
  }, [filterZone, filterStatus, filterType]); // eslint-disable-line

  const pct = (n) => stats.total ? ((n / stats.total) * 100).toFixed(0) : 0;

  return (
    <div className="map-card">
      {/* Header */}
      <div className="map-card-head">
        <h3><i className="ti ti-map-pin" style={{ marginRight: 6, color: 'var(--accent)' }}></i>
          Meter Installation Map
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text3)', background: 'var(--bg3)', padding: '1px 8px', borderRadius: 20, marginLeft: 8 }}>
            {stats.total} devices
          </span>
        </h3>
        <button className="btn-sm" onClick={() => { setFilterZone('All'); setFilterStatus('All'); setFilterType('All'); }}>
          <i className="ti ti-focus-2"></i> Reset
        </button>
      </div>

      {/* Map + Filter sidebar (matching HTML layout) */}
      <div className="map-wrap">
        {/* Leaflet map takes remaining space */}
        <div ref={mapRef} id="meter-map" style={{ flex: 1, minHeight: 0, zIndex: 0 }}></div>

        {/* Filter panel on the right — matching .map-filters from HTML */}
        <div className="map-filters">
          <div>
            <div className="mf-label">Zone</div>
            <select value={filterZone} onChange={e => setFilterZone(e.target.value)}>
              {ZONES.map(z => <option key={z} value={z}>{z === 'All' ? 'All Zones' : z}</option>)}
            </select>
          </div>
          <div>
            <div className="mf-label">Status</div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>)}
            </select>
          </div>
          <div>
            <div className="mf-label">Meter Type</div>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}>
              {TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
            </select>
          </div>

          {/* Mini stat summary */}
          <div style={{ marginTop: 4, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
            <div className="mf-label" style={{ marginBottom: 6 }}>Summary</div>
            {[
              { label: 'Online',   count: stats.online,   color: '#16a34a' },
              { label: 'Offline',  count: stats.offline,  color: '#ef4444' },
              { label: 'Inactive', count: stats.inactive, color: '#f59e0b' },
              { label: 'Never',    count: stats.never,    color: '#94a3b8' },
            ].map(s => (
              <div key={s.label} style={{ marginBottom: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                  <span style={{ color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, display: 'inline-block' }}></span>
                    {s.label}
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--text)' }}>{s.count}</span>
                </div>
                <div style={{ height: 3, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct(s.count)}%`, background: s.color, borderRadius: 2, transition: 'width .4s' }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Device type legend */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
            <div className="mf-label" style={{ marginBottom: 6 }}>Device Types</div>
            {Object.entries(DEVICE_ICONS).map(([type, di]) => {
              const cnt = filtered.filter(m => m.type === type).length;
              return (
                <div key={type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, fontSize: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 9, height: 9, borderRadius: di.square ? 2 : '50%', background: di.bg, flexShrink: 0 }}></div>
                    <span style={{ color: 'var(--text2)' }}>{type}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{cnt}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer legend */}
      <div className="map-footer">
        {Object.entries(STATUS_COLORS).map(([s, c]) => (
          <div className="map-leg" key={s}>
            <div className="map-leg-dot" style={{ background: c }}></div> {s}
          </div>
        ))}
        <div className="map-view-btn" style={{ marginLeft: 'auto' }}>
          <i className="ti ti-maximize" style={{ fontSize: 12 }}></i> View Full Screen
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function HesDashboard() {
  const navigate = useNavigate();

  // KPI values matching the HTML
  const SP  = 65230, TP = 45120, HT = 10540, CT = 4730;
  const total    = SP + TP + HT + CT;
  const active   = 118245;
  const inactive = 3125;
  const commDev  = 2450;

  // Donut zone data
  const donutZones = [
    { title: 'Zone North',   data: [{ label: 'Online', count: ri(80,120) }, { label: 'Offline', count: ri(5,20)  }, { label: 'Inactive', count: ri(2,10) }, { label: 'Never', count: ri(1,5)  }] },
    { title: 'Zone South',   data: [{ label: 'Online', count: ri(60,100) }, { label: 'Offline', count: ri(4,18)  }, { label: 'Inactive', count: ri(2,8)  }, { label: 'Never', count: ri(1,4)  }] },
    { title: 'Zone East',    data: [{ label: 'Online', count: ri(50,90)  }, { label: 'Offline', count: ri(3,15)  }, { label: 'Inactive', count: ri(2,8)  }, { label: 'Never', count: ri(1,4)  }] },
    { title: 'Zone West',    data: [{ label: 'Online', count: ri(70,120) }, { label: 'Offline', count: ri(5,22)  }, { label: 'Inactive', count: ri(3,10) }, { label: 'Never', count: ri(2,6)  }] },
    { title: 'Zone Central', data: [{ label: 'Online', count: ri(90,150) }, { label: 'Offline', count: ri(6,25)  }, { label: 'Inactive', count: ri(3,12) }, { label: 'Never', count: ri(2,6)  }] },
    { title: 'All Zones',    data: [{ label: 'Online', count: ri(400,550)}, { label: 'Offline', count: ri(25,80) }, { label: 'Inactive', count: ri(10,35)}, { label: 'Never', count: ri(5,20) }] },
  ];

  const DEVICE_TYPES = [
    { type: 'Single Phase Meter', total: 65230, active: 60200, inactive: 5030 },
    { type: 'Three Phase Meter',  total: 45120, active: 43500, inactive: 1620 },
    { type: 'HT Meter',           total: 10540, active: 10100, inactive: 440  },
    { type: 'CT Meter',           total: 4730,  active: 4445,  inactive: 285  },
    { type: 'DCU / Concentrator', total: 2450,  active: 2380,  inactive: 70   },
  ];

  return (
    <div>
      {/* ── KPI Row (matching HTML exactly) ── */}
      <div className="stat-row">
        <KpiCard icon="ti-meter"             label="Total Meters"    value={total.toLocaleString()}   sub="All Installed Meters"  colorClass="ic-blue"   />
        <KpiCard icon="ti-plug"              label="Single Phase"    value={SP.toLocaleString()}      sub="Meters"                colorClass="ic-orange" />
        <KpiCard icon="ti-plug-connected"    label="Three Phase"     value={TP.toLocaleString()}      sub="Meters"                colorClass="ic-yellow" />
        <KpiCard icon="ti-transformer-bolt"  label="HT Meters"       value={HT.toLocaleString()}      sub="Meters"                colorClass="ic-teal"   />
        <KpiCard icon="ti-circuit-capacitor" label="CT Meters"       value={CT.toLocaleString()}      sub="Meters"                colorClass="ic-purple" />
        <KpiCard icon="ti-circle-check"      label="Active Meters"   value={active.toLocaleString()}  sub={`${((active/total)*100).toFixed(2)}%`}  subClass="green" colorClass="ic-green"  />
        <KpiCard icon="ti-circle-x"          label="Inactive Meters" value={inactive.toLocaleString()} sub={`${((inactive/total)*100).toFixed(2)}%`} subClass="red"   colorClass="ic-red"   />
        <KpiCard icon="ti-wifi"              label="Comm. Devices"   value={commDev.toLocaleString()} sub="All Devices"           colorClass="ic-sky"    />
      </div>

      {/* ── Mid Row: Map (left) + Comm Status (right) — matching HTML grid ── */}
      <div className="mid-row">
        {/* MAP */}
        <MeterMap />

        {/* COMM STATUS */}
        <div className="comm-card">
          <div className="comm-card-head">
            <h3>Communication Status <i className="ti ti-info-circle" style={{ fontSize: 13, color: 'var(--text3)' }}></i></h3>
            <select className="comm-select">
              <option>Today</option>
              <option>Yesterday</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="donuts-grid">
            {donutZones.map(z => (
              <DonutChart key={z.title} title={z.title} data={z.data} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="bot-row">
        {/* Recent Alerts */}
        <div className="section-card">
          <div className="section-head">
            <h3>Recent Alerts</h3>
            <button className="view-all" onClick={() => navigate('/hes/alerts')}>View All</button>
          </div>
          <table className="alerts-table">
            <thead>
              <tr><th></th><th>Time</th><th>Meter No.</th><th>Message</th><th>Type</th><th>Status</th></tr>
            </thead>
            <tbody>
              {ALERTS.slice(0, 6).map(a => (
                <tr key={a.id}>
                  <td><div className={`alert-icon-wrap ${a.severity === 'Critical' ? 'ai-red' : 'ai-orange'}`}><i className="ti ti-alert-triangle" style={{ fontSize: 12 }}></i></div></td>
                  <td style={{ fontSize: 10 }}>{fmtDT(a.time)}</td>
                  <td style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/hes/device-search')}>{a.meterNo}</td>
                  <td>{a.message}</td>
                  <td><span className="pill pill-blue">{a.type}</span></td>
                  <td><span className={`pill ${a.status === 'Active' ? 'pill-red' : 'pill-green'}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Devices by Type */}
        <div className="section-card">
          <div className="section-head">
            <h3>All Devices by Type</h3>
            <button className="view-all" onClick={() => navigate('/hes/devices')}>View All Devices</button>
          </div>
          <table className="data-table">
            <thead><tr><th>Device Type</th><th>Total</th><th>Active</th><th>Inactive</th><th>Comm. %</th></tr></thead>
            <tbody>
              {DEVICE_TYPES.map((d, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text)', fontWeight: 500 }}>{d.type}</td>
                  <td><b>{d.total.toLocaleString()}</b></td>
                  <td style={{ color: 'var(--success)' }}>{d.active.toLocaleString()}</td>
                  <td style={{ color: 'var(--danger)' }}>{d.inactive.toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 5, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${((d.active / d.total) * 100).toFixed(0)}%`, background: 'var(--success)', borderRadius: 3 }}></div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text2)', minWidth: 30 }}>{((d.active / d.total) * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
