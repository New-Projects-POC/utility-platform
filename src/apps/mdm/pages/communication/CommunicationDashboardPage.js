import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { METERS, fmtDT, ri } from '../../../../shared/utils/mockData';

// ─── Extended meter data for communication page ────────────────────────────────
const COMM_STATUS_MAP = {
  'Online':          'communicating',
  'Offline':         'failure',
  'Inactive':        'inactive',
  'Never Connected': 'never',
};
const COMM_COLORS = {
  communicating: '#16a34a',
  failure:       '#ea580c',
  never:         '#ca8a04',
  inactive:      '#dc2626',
};
const TYPE_COLORS = {
  'Single Phase': '#7c3aed',
  'Three Phase':  '#0891b2',
  'HT Meter':     '#4338ca',
  'CT Meter':     '#e11d48',
};
// Marker shape per type (matches HES)
const DEVICE_ICONS = {
  'Single Phase': { bg: '#7c3aed', border: '#5b21b6', square: false },
  'Three Phase':  { bg: '#0891b2', border: '#0e7490', square: true  },
  'HT Meter':     { bg: '#4338ca', border: '#3730a3', square: false },
  'CT Meter':     { bg: '#e11d48', border: '#be123c', square: false },
};
// Real meter images from web — these use reliable direct URLs
const TYPE_IMAGES = {
  'Single Phase': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Electricity_meter.jpg/320px-Electricity_meter.jpg',
  'Three Phase':  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Three_phase_electricity_meter.jpg/320px-Three_phase_electricity_meter.jpg',
  'HT Meter':     'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/CTs_and_PTs_of_a_HT_meter.JPG/320px-CTs_and_PTs_of_a_HT_meter.JPG',
  'CT Meter':     'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Electricity_meter_CT_operated.jpg/320px-Electricity_meter_CT_operated.jpg',
};

// Extend METERS with comm status
const ALL_COMM_METERS = METERS.map(m => ({
  ...m,
  commStatus: COMM_STATUS_MAP[m.status] || 'communicating',
  lastComm: m.status === 'Online'          ? fmtDT(m.lastComm)
           : m.status === 'Offline'         ? fmtDT(new Date(Date.now() - 86400000).toISOString())
           : m.status === 'Never Connected' ? 'Never'
           : fmtDT(new Date(Date.now() - 2592000000).toISOString()),
}));

const ZONES    = ['All', 'North', 'South', 'East', 'West', 'Central'];
const CIRCLES  = ['All', 'Circle-1', 'Circle-2', 'Circle-3', 'Circle-4'];
const DIVISIONS= ['All', 'Division-1', 'Division-2', 'Division-3'];
const FEEDERS  = ['All', ...new Set(METERS.map(m => m.feeder))].slice(0, 8);
const DTS_ALL  = ['All', ...new Set(METERS.map(m => m.dt))].slice(0, 8);
const TYPES    = ['All', 'Single Phase', 'Three Phase', 'HT Meter', 'CT Meter'];
const TABS     = ['all', 'communicating', 'failure', 'never', 'inactive'];

// ─── SVG Donut ────────────────────────────────────────────────────────────────
function SvgDonut({ data, centerValue, centerLabel, centerColor, size = 100 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = size * 0.39, cx = size / 2, cy = size / 2, circ = 2 * Math.PI * r;
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
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
        <div style={{ fontSize: size * 0.155, fontWeight: 800, color: centerColor || 'var(--text)', lineHeight: 1 }}>{centerValue}</div>
        {centerLabel && <div style={{ fontSize: size * 0.09, color: 'var(--text3)', marginTop: 1 }}>{centerLabel}</div>}
      </div>
    </div>
  );
}

// ─── SVG Line ─────────────────────────────────────────────────────────────────
function SvgLine({ datasets, labels, height = 130, yFmt, xLimit, yMin, yMax }) {
  const w = 460, pL = 38, pR = 10, pT = 10, pB = 20;
  const W = w - pL - pR, H = height - pT - pB;
  const allV = datasets.flatMap(d => d.values);
  const minV = yMin !== undefined ? yMin : 0;
  const maxV = yMax !== undefined ? yMax : Math.max(...allV) * 1.1 || 1;
  const toX = i => pL + (i / (labels.length - 1)) * W;
  const toY = v => pT + H - ((v - minV) / (maxV - minV)) * H;
  const fmt = yFmt || (v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : Math.round(v));
  const skip = xLimit ? Math.ceil(labels.length / xLimit) : 1;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(p => minV + p * (maxV - minV));
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

// ─── SVG H-Bar ────────────────────────────────────────────────────────────────
function SvgHBar({ data, labels, colors, height = 135 }) {
  const w = 400, pL = 92, pR = 36, pT = 6, pB = 10;
  const W = w - pL - pR, H = height - pT - pB;
  const maxV = Math.max(...data) * 1.1;
  const bH = (H / data.length) * 0.58;
  const gap = H / data.length;
  const toW = v => (v / maxV) * W;
  const getCol = (v, i) => Array.isArray(colors) ? colors[i] : colors(v, i);

  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      {data.map((v, i) => {
        const y = pT + i * gap + gap / 2 - bH / 2;
        return (
          <g key={i}>
            <text x={pL - 4} y={y + bH / 2 + 3} textAnchor="end" fontSize="8.5" fill="#5a6080">{labels[i]}</text>
            <rect x={pL} y={y} width={toW(v)} height={bH} rx="3" fill={getCol(v, i)} opacity="0.88" />
            <text x={pL + toW(v) + 4} y={y + bH / 2 + 3} fontSize="8" fill="#5a6080">{v.toLocaleString()}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Meter Type Image Card ─────────────────────────────────────────────────────
function MeterTypeCard({ type, count, pct, color }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 90, overflow: 'hidden', position: 'relative', background: '#f8f9fc' }}>
        {!imgError ? (
          <img
            src={TYPE_IMAGES[type]}
            alt={type}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: color + '18' }}>
            <i className="ti ti-device-desktop-analytics" style={{ fontSize: 36, color }}></i>
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${color}cc, transparent)` }}></div>
        <div style={{ position: 'absolute', bottom: 6, left: 8, right: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,.5)' }}>{type}</div>
        </div>
      </div>
      <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{count.toLocaleString()}</div>
          <div style={{ fontSize: 9.5, color: 'var(--text3)', marginTop: 1 }}>{pct}% of total</div>
        </div>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="ti ti-antenna-bars-5" style={{ fontSize: 16, color }}></i>
        </div>
      </div>
    </div>
  );
}

// ─── Leaflet Map ──────────────────────────────────────────────────────────────
function CommLeafletMap({ filteredMeters, onMarkerClick }) {
  const mapRef     = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef([]);

  // Init map once
  useEffect(() => {
    if (!window.L || leafletRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, { zoom: 11, center: [28.45, 77.55] });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);
    leafletRef.current = map;
    setTimeout(() => map.invalidateSize(), 400);
    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
    };
  }, []);

  // Re-draw markers when filteredMeters changes
  useEffect(() => {
    const map = leafletRef.current;
    if (!map || !window.L) return;
    const L = window.L;

    markersRef.current.forEach(mk => mk.remove());
    markersRef.current = [];

    filteredMeters.forEach(m => {
      const di  = DEVICE_ICONS[m.type] || DEVICE_ICONS['Single Phase'];
      const sc  = COMM_COLORS[m.commStatus] || '#94a3b8';
      const html = `
        <div style="position:relative;width:20px;height:20px;
          background:${di.bg};border:2.5px solid ${di.border};
          border-radius:${di.square ? '4px' : '50%'};
          box-shadow:0 2px 6px rgba(0,0,0,.35);cursor:pointer;">
          <div style="position:absolute;bottom:-4px;right:-4px;
            width:8px;height:8px;border-radius:50%;
            background:${sc};border:1.5px solid #fff;"></div>
        </div>`;

      const icon = L.divIcon({ html, className: '', iconSize: [20, 20], iconAnchor: [10, 10] });

      const imgSrc = TYPE_IMAGES[m.type] || '';
      const popup = L.popup({ maxWidth: 240, className: 'meter-popup' }).setContent(`
        <div style="font-family:'Inter',sans-serif;font-size:12px;min-width:210px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #f1f3f8;">
            <div style="width:36px;height:36px;border-radius:8px;overflow:hidden;flex-shrink:0;background:#f0f2f5;">
              <img src="${imgSrc}" alt="${m.type}" style="width:100%;height:100%;object-fit:cover;"
                onerror="this.style.display='none'" />
            </div>
            <div>
              <div style="font-weight:700;font-size:13px;color:#1a1d2e;">${m.id}</div>
              <div style="color:#9aa0b8;font-size:10px;">${m.type} · ${m.serial}</div>
            </div>
          </div>
          ${[
            ['Zone / Circle', `${m.zone} / ${m.circle}`],
            ['Feeder / DT',   `${m.feeder} / ${m.dt}`],
            ['Status',        `<span style="color:${sc};font-weight:700;">${m.commStatus.charAt(0).toUpperCase()+m.commStatus.slice(1)}</span>`],
            ['Last Comm',     m.lastComm],
            ['Address',       m.address],
          ].map(([k, v]) => `
            <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11px;border-bottom:1px solid #f8f9fc;">
              <span style="color:#9aa0b8;">${k}</span>
              <span style="font-weight:600;color:#1a1d2e;text-align:right;max-width:140px;">${v}</span>
            </div>`).join('')}
        </div>`);

      const marker = L.marker([m.lat, m.lng], { icon })
        .bindPopup(popup)
        .on('click', () => onMarkerClick && onMarkerClick(m.id))
        .addTo(map);
      markersRef.current.push(marker);
    });

    if (filteredMeters.length > 0) {
      map.fitBounds(filteredMeters.map(m => [m.lat, m.lng]), { padding: [30, 30] });
    }
  }, [filteredMeters]); // eslint-disable-line

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: 340, borderRadius: 0 }}></div>
  );
}

// ─── Donut Card ───────────────────────────────────────────────────────────────
function DonutCard({ title, donutData, centerValue, centerLabel, centerColor, legendItems }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 10px' }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text)', marginBottom: 8, textAlign: 'center', lineHeight: 1.3 }}>{title}</div>
      <SvgDonut data={donutData} centerValue={centerValue} centerLabel={centerLabel} centerColor={centerColor} size={100} />
      <div style={{ width: '100%', marginTop: 8 }}>
        {legendItems.map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3, fontSize: 9.5, color: 'var(--text2)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: l.color, flexShrink: 0, display: 'inline-block' }}></span>
            <span style={{ flex: 1 }}>{l.label}</span>
            <span style={{ fontWeight: 600, color: 'var(--text)', marginLeft: 'auto' }}>{l.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function CommunicationPage() {
  const [filters, setFilters] = useState({ zone: '', circle: '', division: '', feeder: '', dt: '', meterType: '' });
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [highlightId, setHighlightId] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const days15  = Array.from({ length: 15 }, (_, i) => `${i + 1} May`);
  const hours24 = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  // Apply hierarchy filters
  const filteredMeters = useMemo(() => {
    return ALL_COMM_METERS.filter(m => {
      if (filters.zone      && m.zone     !== filters.zone)     return false;
      if (filters.circle    && m.circle   !== filters.circle)   return false;
      if (filters.division  && m.division !== filters.division) return false;
      if (filters.feeder    && m.feeder   !== filters.feeder)   return false;
      if (filters.dt        && m.dt       !== filters.dt)       return false;
      if (filters.meterType && m.type     !== filters.meterType)return false;
      return true;
    });
  }, [filters]);

  // Tab + search filtered
  const tableData = useMemo(() => {
    let rows = activeTab === 'all' ? filteredMeters : filteredMeters.filter(m => m.commStatus === activeTab);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(m =>
        m.id.toLowerCase().includes(q) ||
        m.feeder.toLowerCase().includes(q) ||
        m.dt.toLowerCase().includes(q) ||
        m.zone.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [filteredMeters, activeTab, search]);

  const pageCount = Math.max(1, Math.ceil(tableData.length / PAGE_SIZE));
  const pageRows  = tableData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTabChange = (tab) => { setActiveTab(tab); setPage(1); };
  const handleSearch    = (e)   => { setSearch(e.target.value); setPage(1); };
  const applyFilter     = ()    => { setPage(1); };
  const resetFilter     = ()    => { setFilters({ zone: '', circle: '', division: '', feeder: '', dt: '', meterType: '' }); setSearch(''); setPage(1); };

  const updateFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  // Counts
  const counts = useMemo(() => ({
    total:         filteredMeters.length,
    communicating: filteredMeters.filter(m => m.commStatus === 'communicating').length,
    failure:       filteredMeters.filter(m => m.commStatus === 'failure').length,
    never:         filteredMeters.filter(m => m.commStatus === 'never').length,
    inactive:      filteredMeters.filter(m => m.commStatus === 'inactive').length,
    sp:  filteredMeters.filter(m => m.type === 'Single Phase').length,
    tp:  filteredMeters.filter(m => m.type === 'Three Phase').length,
    ht:  filteredMeters.filter(m => m.type === 'HT Meter').length,
    ct:  filteredMeters.filter(m => m.type === 'CT Meter').length,
  }), [filteredMeters]);

  const commPct = counts.total ? Math.round((counts.communicating / counts.total) * 100) : 0;

  // Highlight meter in map when table row clicked
  const handleRowClick = useCallback((id) => {
    setHighlightId(id);
    setTimeout(() => setHighlightId(null), 2000);
  }, []);

  return (
    <>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2>Communication</h2>
          <p>Meter communication health, hierarchy filter, live Leaflet map &amp; per-type status overview</p>
        </div>
        <button
          className="btn-sm btn-primary"
          onClick={() => setFilterOpen(true)}
          style={{ marginTop: 2, gap: 6, whiteSpace: 'nowrap', position: 'relative' }}
        >
          <i className="ti ti-filter"></i>
          Filters
          {Object.values(filters).some(v => v) && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              width: 16, height: 16, borderRadius: '50%',
              background: '#dc2626', color: '#fff',
              fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {Object.values(filters).filter(v => v).length}
            </span>
          )}
        </button>
      </div>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: '1rem' }}>
        {[
          { icon: 'ti-device-desktop-analytics', label: 'Total Meters',  value: counts.total,         sub: 'All meter types',        accent: 'var(--accent)', ic: 'ic-blue' },
          { icon: 'ti-bolt',                     label: 'Single Phase',   value: counts.sp,            sub: `${counts.total ? Math.round(counts.sp/counts.total*100) : 0}% of total`, accent: '#7c3aed', ic: 'ic-purple' },
          { icon: 'ti-bolt',                     label: 'Three Phase',    value: counts.tp,            sub: `${counts.total ? Math.round(counts.tp/counts.total*100) : 0}% of total`, accent: '#0891b2', ic: 'ic-teal' },
          { icon: 'ti-antenna-bars-5',           label: 'HT Meters',     value: counts.ht,            sub: `${counts.total ? Math.round(counts.ht/counts.total*100) : 0}% of total`, accent: '#4338ca', ic: 'ic-blue' },
          { icon: 'ti-plug',                     label: 'CT Meters',     value: counts.ct,            sub: `${counts.total ? Math.round(counts.ct/counts.total*100) : 0}% of total`, accent: '#e11d48', ic: 'ic-red' },
        ].map((k, i) => (
          <div key={i} className="card" style={{ borderBottom: `3px solid ${k.accent}`, padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div className={`kpi-icon ${k.ic}`} style={{ width: 38, height: 38, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>
                <i className={`ti ${k.icon}`}></i>
              </div>
              <div>
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-val">{k.value.toLocaleString()}</div>
                <div className="kpi-sub">{k.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Drawer Overlay ── */}
      {filterOpen && (
        <div
          onClick={() => setFilterOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)',
            zIndex: 999, backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ── Slide-in Filter Drawer ── */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 300,
        background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.13)',
        zIndex: 1000, display: 'flex', flexDirection: 'column',
        transform: filterOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: '14px 16px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-filter" style={{ color: 'var(--accent)', fontSize: 16 }}></i>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Hierarchy Filter</span>
          </div>
          <button
            onClick={() => setFilterOpen(false)}
            className="btn-sm"
            style={{ width: 28, height: 28, padding: 0, fontSize: 16, lineHeight: 1 }}
          >
            <i className="ti ti-x"></i>
          </button>
        </div>

        {/* Drawer Body — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {[
            { key: 'zone',      label: 'Zone',        opts: ZONES },
            { key: 'circle',    label: 'Circle',      opts: CIRCLES },
            { key: 'division',  label: 'Division',    opts: DIVISIONS },
            { key: 'feeder',    label: 'Feeder',      opts: FEEDERS },
            { key: 'dt',        label: 'DT',          opts: DTS_ALL },
            { key: 'meterType', label: 'Meter Type',  opts: TYPES },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={{
                display: 'block', fontSize: 10, fontWeight: 700,
                color: 'var(--text3)', textTransform: 'uppercase',
                letterSpacing: 0.5, marginBottom: 5,
              }}>{f.label}</label>
              <select
                style={{
                  width: '100%', fontSize: 12, padding: '7px 10px',
                  border: '1px solid var(--border)', borderRadius: 6,
                  color: 'var(--text)', background: '#fff', cursor: 'pointer',
                  outline: 'none',
                }}
                value={filters[f.key]}
                onChange={e => updateFilter(f.key, e.target.value)}
              >
                {f.opts.map(o => (
                  <option key={o} value={o === 'All' || o.startsWith('All') ? '' : o}>{o}</option>
                ))}
              </select>
            </div>
          ))}

          {/* Active filter chips */}
          {Object.entries(filters).some(([, v]) => v) && (
            <div style={{ marginTop: 4, marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Active Filters</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {Object.entries(filters).filter(([, v]) => v).map(([k, v]) => (
                  <span key={k} className="pill pill-blue" style={{ fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {k}: {v}
                    <i className="ti ti-x" style={{ fontSize: 10, cursor: 'pointer' }} onClick={() => updateFilter(k, '')}></i>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div style={{
          padding: '12px 16px', borderTop: '1px solid var(--border)',
          display: 'flex', gap: 8, background: 'var(--bg3)',
        }}>
          <button className="btn-sm btn-primary" onClick={() => { applyFilter(); setFilterOpen(false); }} style={{ flex: 1, justifyContent: 'center' }}>
            <i className="ti ti-check"></i> Apply Filter
          </button>
          <button className="btn-sm" onClick={() => { resetFilter(); }} style={{ justifyContent: 'center' }}>
            <i className="ti ti-refresh"></i> Reset
          </button>
        </div>
      </div>

      {/* 6 Donut Charts */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Communication Status Overview</span>
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>Data as of 15 May 2024 10:28 AM</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
          <DonutCard title="Meter Type Distribution" centerValue="1.25L" centerLabel="Total"
            donutData={[
              { value: 68240, color: '#7c3aed' }, { value: 42180, color: '#0891b2' },
              { value: 9840,  color: '#4338ca' }, { value: 5226,  color: '#e11d48' },
            ]}
            legendItems={[
              { label: 'Single Phase', color: '#7c3aed', value: 68240 },
              { label: 'Three Phase',  color: '#0891b2', value: 42180 },
              { label: 'HT Meter',     color: '#4338ca', value: 9840  },
              { label: 'CT Meter',     color: '#e11d48', value: 5226  },
            ]}
          />
          <DonutCard title="Overall Comm. Status" centerValue={`${commPct}%`} centerLabel="Active" centerColor="#16a34a"
            donutData={[
              { value: counts.communicating, color: '#16a34a' }, { value: counts.failure,  color: '#ea580c' },
              { value: counts.never,         color: '#ca8a04' }, { value: counts.inactive, color: '#dc2626' },
            ]}
            legendItems={[
              { label: 'Communicating', color: '#16a34a', value: counts.communicating },
              { label: 'Failure',       color: '#ea580c', value: counts.failure       },
              { label: 'Never Comm.',   color: '#ca8a04', value: counts.never         },
              { label: 'Inactive',      color: '#dc2626', value: counts.inactive      },
            ]}
          />
          {[
            { title: 'Single Phase Status', pct: '86%', data: [58686,4780,3560,1214], items: ['58,686','4,780','3,560','1,214'] },
            { title: 'Three Phase Status',  pct: '81%', data: [34166,3960,2420,1634], items: ['34,166','3,960','2,420','1,634'] },
            { title: 'HT Meter Status',     pct: '76%', data: [7478,1280,640,442],    items: ['7,478', '1,280','640',  '442'  ] },
            { title: 'CT Meter Status',     pct: '49%', data: [2570,420,1304,932],    items: ['2,570', '420',  '1,304','932'  ] },
          ].map((card, ci) => (
            <DonutCard key={ci} title={card.title} centerValue={card.pct} centerLabel="Comm."
              centerColor="#16a34a"
              donutData={[
                { value: card.data[0], color: '#16a34a' }, { value: card.data[1], color: '#ea580c' },
                { value: card.data[2], color: '#ca8a04' }, { value: card.data[3], color: '#dc2626' },
              ]}
              legendItems={[
                { label: 'Communicating', color: '#16a34a', value: card.data[0] },
                { label: 'Failure',       color: '#ea580c', value: card.data[1] },
                { label: 'Never',         color: '#ca8a04', value: card.data[2] },
                { label: 'Inactive',      color: '#dc2626', value: card.data[3] },
              ]}
            />
          ))}
        </div>
      </div>

      {/* Map + Meter List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 12, marginBottom: '1rem' }}>

        {/* Leaflet Map */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                <i className="ti ti-map-pin" style={{ color: 'var(--accent)', marginRight: 5 }}></i>
                Meter Location Map
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>Click a marker for details · Scroll to zoom · Drag to pan</div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[['#16a34a','Communicating'],['#ea580c','Failure'],['#ca8a04','Never'],['#dc2626','Inactive']].map(([c, l]) => (
                <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text2)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block' }}></span>{l}
                </span>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 340 }}>
            <CommLeafletMap filteredMeters={filteredMeters} onMarkerClick={handleRowClick} />
          </div>
          <div style={{ padding: '5px 12px', background: '#f7f9fc', borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--text3)', display: 'flex', gap: 14 }}>
            <span>{filteredMeters.length} meters displayed</span>
            <span>
              <span style={{ color: '#16a34a' }}>●</span> Comm &nbsp;
              <span style={{ color: '#ea580c' }}>●</span> Failure &nbsp;
              <span style={{ color: '#ca8a04' }}>●</span> Never &nbsp;
              <span style={{ color: '#dc2626' }}>●</span> Inactive
            </span>
          </div>
        </div>

        {/* Meter List */}
        <div className="section-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="section-head">
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Meter List</span>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>Showing {tableData.length.toLocaleString()} meters</div>
            </div>
            <input
              type="text"
              placeholder="🔍 Search ID, feeder, zone…"
              value={search}
              onChange={handleSearch}
              className="search-input"
              style={{ width: 180 }}
            />
          </div>

          {/* Tabs */}
          <div className="tabs" style={{ padding: '0 1rem', marginBottom: 0, borderBottom: '1px solid var(--border)' }}>
            {TABS.map(tab => {
              const tabCount = tab === 'all' ? filteredMeters.length : filteredMeters.filter(m => m.commStatus === tab).length;
              const tabColor = tab === 'all' ? 'var(--text3)' : COMM_COLORS[tab];
              return (
                <button key={tab} className={`tab${activeTab === tab ? ' active' : ''}`}
                  onClick={() => handleTabChange(tab)}
                  style={{ fontSize: 11 }}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span style={{ marginLeft: 4, color: tabColor, fontSize: 10 }}>({tabCount.toLocaleString()})</span>
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 300 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Meter ID</th><th>Type</th><th>Zone</th><th>Feeder</th><th>DT</th><th>Last Comm.</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((m, i) => {
                  const sc = COMM_COLORS[m.commStatus];
                  const isHl = m.id === highlightId;
                  return (
                    <tr key={i}
                      onClick={() => handleRowClick(m.id)}
                      style={{ cursor: 'pointer', background: isHl ? '#eff6ff' : undefined, transition: 'background .2s' }}>
                      <td><strong style={{ color: isHl ? 'var(--accent)' : undefined }}>{m.id}</strong></td>
                      <td style={{ fontSize: 10 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 7, height: 7, borderRadius: m.type === 'Three Phase' ? 2 : '50%', background: TYPE_COLORS[m.type], flexShrink: 0, display: 'inline-block' }}></span>
                          {m.type}
                        </span>
                      </td>
                      <td style={{ fontSize: 10, color: 'var(--text3)' }}>{m.zone}</td>
                      <td style={{ fontSize: 10, color: 'var(--text3)' }}>{m.feeder}</td>
                      <td style={{ fontSize: 10, color: 'var(--text3)' }}>{m.dt}</td>
                      <td style={{ fontSize: 10, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{m.lastComm}</td>
                      <td>
                        <span className="pill" style={{
                          background: sc + '22', color: sc,
                          fontSize: 9, display: 'inline-flex', alignItems: 'center', gap: 4
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc, display: 'inline-block' }}></span>
                          {m.commStatus.charAt(0).toUpperCase() + m.commStatus.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ padding: '7px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', fontSize: 10.5, color: 'var(--text3)' }}>
            <span>Page {page} of {pageCount.toLocaleString()} &nbsp;|&nbsp; {PAGE_SIZE} per page</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn-sm" style={{ width: 26, height: 26, padding: 0, fontSize: 13 }}
                onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
              {[1, 2, 3].filter(n => n <= pageCount).map(n => (
                <button key={n} className={`btn-sm${page === n ? ' btn-primary' : ''}`}
                  style={{ width: 26, height: 26, padding: 0, fontSize: 10 }}
                  onClick={() => setPage(n)}>{n}</button>
              ))}
              {pageCount > 3 && <span style={{ padding: '0 4px', lineHeight: '26px' }}>…</span>}
              <button className="btn-sm" style={{ width: 26, height: 26, padding: 0, fontSize: 13 }}
                onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount}>›</button>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 12 }}>

        <div className="card">
          <div className="card-head" style={{ marginBottom: 8 }}>
            <div>
              <h3>Daily Communication Trend</h3>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>Success vs Failure — last 15 days</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>
            <span style={{ color: '#16a34a' }}>● Communicating</span>
            <span style={{ color: '#ea580c' }}>● Failure</span>
          </div>
          <SvgLine
            height={130}
            labels={days15} xLimit={8}
            datasets={[
              { values: [98200,99100,100400,101200,100800,102100,103000,101800,102200,103100,104000,102600,103200,104100,102900], color: '#16a34a', fill: true, dots: true },
              { values: [11200,10800,10400,10100,11100,10200,9800,10700,10500,10200,9900,10600,10300,9900,10440],                 color: '#ea580c', fill: true, dots: true },
            ]}
          />
        </div>

        <div className="card">
          <div className="card-head" style={{ marginBottom: 8 }}>
            <div>
              <h3>Comm. Failure by Type</h3>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>Breakdown of 10,440 failures</div>
            </div>
          </div>
          <SvgHBar
            height={148}
            data={[3840, 2160, 1820, 1240, 680, 480, 220]}
            labels={['Network Timeout', 'SIM Issue', 'Low Signal', 'Meter Fault', 'Config Error', 'Power Down', 'Unknown']}
            colors={['#dc2626','#ea580c','#f59e0b','#f97316','#6366f1','#8b5cf6','#94a3b8']}
          />
        </div>

        <div className="card">
          <div className="card-head" style={{ marginBottom: 8 }}>
            <h3>Hourly Success Rate</h3>
            <span className="pill pill-green" style={{ fontSize: 9 }}>Live</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>Today — % communicating per hour</div>
          <SvgLine
            height={130}
            labels={hours24} xLimit={12}
            yMin={60} yMax={100}
            yFmt={v => `${v}%`}
            datasets={[
              { values: [78,76,75,74,76,80,84,88,91,93,94,95,94,93,92,91,93,94,96,95,92,89,85,81], color: 'var(--accent)', fill: true, dots: false },
            ]}
          />
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text3)', padding: '10px 0 2px' }}>
        All times in IST (UTC+05:30) &nbsp;|&nbsp; Data auto-refreshed every 5 minutes &nbsp;|&nbsp; Communication Module v2.0.0
      </div>
    </>
  );
}