import React, { useState } from 'react';
import { ri } from '../../../shared/utils/mockData';

const HIERARCHY = {
  root: {
    label: 'Network Root',
    children: [
      { id: 'zone-north', label: 'Zone North', icon: '🧭', type: 'zone', meters: 312, active: 290 },
      { id: 'zone-south', label: 'Zone South', icon: '🧭', type: 'zone', meters: 245, active: 220 },
      { id: 'zone-east', label: 'Zone East', icon: '🧭', type: 'zone', meters: 198, active: 185 },
      { id: 'zone-west', label: 'Zone West', icon: '🧭', type: 'zone', meters: 167, active: 155 },
      { id: 'zone-central', label: 'Zone Central', icon: '🧭', type: 'zone', meters: 289, active: 275 },
    ]
  },
  'zone-north': {
    label: 'Zone North',
    parent: 'root',
    children: [
      { id: 'c1-north', label: 'Circle North-1', icon: '⭕', type: 'circle', meters: 105, active: 99 },
      { id: 'c2-north', label: 'Circle North-2', icon: '⭕', type: 'circle', meters: 112, active: 103 },
      { id: 'c3-north', label: 'Circle North-3', icon: '⭕', type: 'circle', meters: 95, active: 88 },
    ]
  },
  'zone-south': {
    label: 'Zone South', parent: 'root',
    children: [
      { id: 'c1-south', label: 'Circle South-1', icon: '⭕', type: 'circle', meters: 120, active: 110 },
      { id: 'c2-south', label: 'Circle South-2', icon: '⭕', type: 'circle', meters: 125, active: 110 },
    ]
  },
  'zone-east': { label: 'Zone East', parent: 'root', children: [{ id: 'c1-east', label: 'Circle East-1', icon: '⭕', type: 'circle', meters: 98, active: 92 }, { id: 'c2-east', label: 'Circle East-2', icon: '⭕', type: 'circle', meters: 100, active: 93 }] },
  'zone-west': { label: 'Zone West', parent: 'root', children: [{ id: 'c1-west', label: 'Circle West-1', icon: '⭕', type: 'circle', meters: 167, active: 155 }] },
  'zone-central': { label: 'Zone Central', parent: 'root', children: [{ id: 'c1-central', label: 'Circle Central-1', icon: '⭕', type: 'circle', meters: 289, active: 275 }] },
  'c1-north': {
    label: 'Circle North-1', parent: 'zone-north',
    children: [
      { id: 'd1-cn1', label: 'Division N1-A', icon: '🏢', type: 'division', meters: 52, active: 49 },
      { id: 'd2-cn1', label: 'Division N1-B', icon: '🏢', type: 'division', meters: 53, active: 50 },
    ]
  },
  'c2-north': { label: 'Circle North-2', parent: 'zone-north', children: [{ id: 'd1-cn2', label: 'Division N2-A', icon: '🏢', type: 'division', meters: 60, active: 56 }, { id: 'd2-cn2', label: 'Division N2-B', icon: '🏢', type: 'division', meters: 52, active: 47 }] },
  'c3-north': { label: 'Circle North-3', parent: 'zone-north', children: [{ id: 'd1-cn3', label: 'Division N3-A', icon: '🏢', type: 'division', meters: 48, active: 44 }, { id: 'd2-cn3', label: 'Division N3-B', icon: '🏢', type: 'division', meters: 47, active: 44 }] },
  'd1-cn1': {
    label: 'Division N1-A', parent: 'c1-north',
    children: [
      { id: 'fdr1-d1cn1', label: 'Feeder N1A-F1', icon: '⚡', type: 'feeder', meters: 18, active: 17 },
      { id: 'fdr2-d1cn1', label: 'Feeder N1A-F2', icon: '⚡', type: 'feeder', meters: 20, active: 19 },
      { id: 'fdr3-d1cn1', label: 'Feeder N1A-F3', icon: '⚡', type: 'feeder', meters: 14, active: 13 },
    ]
  },
  'd2-cn1': { label: 'Division N1-B', parent: 'c1-north', children: [{ id: 'fdr1-d2cn1', label: 'Feeder N1B-F1', icon: '⚡', type: 'feeder', meters: 28, active: 26 }, { id: 'fdr2-d2cn1', label: 'Feeder N1B-F2', icon: '⚡', type: 'feeder', meters: 25, active: 24 }] },
  'fdr1-d1cn1': {
    label: 'Feeder N1A-F1', parent: 'd1-cn1',
    children: [
      { id: 'dt1-f1', label: 'DT N1A-F1-001', icon: '🔌', type: 'dt', meters: 9, active: 9 },
      { id: 'dt2-f1', label: 'DT N1A-F1-002', icon: '🔌', type: 'dt', meters: 9, active: 8 },
    ]
  },
  'fdr2-d1cn1': { label: 'Feeder N1A-F2', parent: 'd1-cn1', children: [{ id: 'dt1-f2', label: 'DT N1A-F2-001', icon: '🔌', type: 'dt', meters: 10, active: 10 }, { id: 'dt2-f2', label: 'DT N1A-F2-002', icon: '🔌', type: 'dt', meters: 10, active: 9 }] },
  'dt1-f1': { label: 'DT N1A-F1-001', parent: 'fdr1-d1cn1', children: Array.from({length: 9}, (_, i) => ({ id: `m-dt1-f1-${i}`, label: `M${1001+i}`, icon: '⚡', type: 'meter', meters: 1, active: 1 })) },
  'dt2-f1': { label: 'DT N1A-F1-002', parent: 'fdr1-d1cn1', children: Array.from({length: 9}, (_, i) => ({ id: `m-dt2-f1-${i}`, label: `M${1020+i}`, icon: '⚡', type: 'meter', meters: 1, active: i<8?1:0 })) },
};

const TYPE_COLORS = { zone: '#eff6ff', circle: '#f0fdf4', division: '#faf5ff', feeder: '#fff7ed', dt: '#f0fdfa', meter: '#f7f8fa' };
const TYPE_ICON_BG = { zone: '#2563eb', circle: '#16a34a', division: '#7c3aed', feeder: '#ea580c', dt: '#0d9488', meter: '#64748b' };

export default function HierarchyPage() {
  const [current, setCurrent] = useState('root');
  const [path, setPath] = useState([{ id: 'root', label: 'Root' }]);

  const data = HIERARCHY[current];

  const navigateTo = (id, label) => {
    if (!HIERARCHY[id]) return;
    setCurrent(id);
    const parentIdx = path.findIndex(p => p.id === HIERARCHY[id]?.parent);
    if (parentIdx >= 0) {
      setPath([...path.slice(0, parentIdx + 1), { id, label }]);
    } else {
      setPath([...path, { id, label }]);
    }
  };

  const navigateBreadcrumb = (id) => {
    const idx = path.findIndex(p => p.id === id);
    setCurrent(id);
    setPath(path.slice(0, idx + 1));
  };

  if (!data) return <div>Not found</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Network Hierarchy</h2>
        <p>Organizational structure: Zone → Circle → Division → Feeder → DT → Meter</p>
      </div>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <i className="ti ti-home" style={{ fontSize: 11 }}></i>
        {path.map((p, i) => (
          <React.Fragment key={p.id}>
            {i > 0 && <i className="ti ti-chevron-right" style={{ fontSize: 10 }}></i>}
            <button className="breadcrumb-link" onClick={() => navigateBreadcrumb(p.id)}>{p.label}</button>
          </React.Fragment>
        ))}
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Meters', val: data.children?.reduce((s, c) => s + c.meters, 0) || 0, color: '#2563eb' },
          { label: 'Active', val: data.children?.reduce((s, c) => s + c.active, 0) || 0, color: '#16a34a' },
          { label: 'Sub-units', val: data.children?.length || 0, color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: '.5rem 1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.val}</span>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="hier-grid">
        {data.children?.map(child => (
          <div
            key={child.id}
            className="hier-card"
            onClick={() => navigateTo(child.id, child.label)}
            style={{ background: TYPE_COLORS[child.type] || '#fff' }}
          >
            <div className="hier-icon" style={{ background: TYPE_ICON_BG[child.type] + '22', color: TYPE_ICON_BG[child.type] }}>
              <i className={`ti ${child.type === 'zone' ? 'ti-map' : child.type === 'circle' ? 'ti-circle' : child.type === 'division' ? 'ti-building' : child.type === 'feeder' ? 'ti-plug' : child.type === 'dt' ? 'ti-transformer-bolt' : 'ti-bolt'}`} style={{ fontSize: 20 }}></i>
            </div>
            <h4>{child.label}</h4>
            <span style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'capitalize' }}>{child.type}</span>
            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
              <span style={{ fontSize: 10, background: '#dcfce7', color: '#16a34a', padding: '1px 7px', borderRadius: 20, fontWeight: 600 }}>{child.active} Active</span>
              <span style={{ fontSize: 10, background: '#f1f5f9', color: '#64748b', padding: '1px 7px', borderRadius: 20, fontWeight: 600 }}>{child.meters} Total</span>
            </div>
            {HIERARCHY[child.id] && (
              <span style={{ fontSize: 10, color: 'var(--accent)' }}>
                <i className="ti ti-arrow-right" style={{ fontSize: 10 }}></i> Drill down
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
