import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { METERS, fmtDT, getStatusPill } from '../../../shared/utils/mockData';

export default function DevicesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = METERS.filter(m => {
    const matchSearch = !search || m.id.toLowerCase().includes(search.toLowerCase()) ||
      m.serial.toLowerCase().includes(search.toLowerCase()) || m.zone.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || m.type === typeFilter;
    const matchStatus = !statusFilter || m.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div>
      <div className="page-header">
        <h2>Device Management</h2>
        <p>All connected metering devices and their status</p>
      </div>

      {/* Summary row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total', val: METERS.length, color: '#2563eb', bg: '#eff6ff' },
          { label: 'Online', val: METERS.filter(m => m.status === 'Online').length, color: '#16a34a', bg: '#dcfce7' },
          { label: 'Offline', val: METERS.filter(m => m.status === 'Offline').length, color: '#dc2626', bg: '#fee2e2' },
          { label: 'Inactive', val: METERS.filter(m => m.status === 'Inactive').length, color: '#d97706', bg: '#fef3c7' },
          { label: 'Never', val: METERS.filter(m => m.status === 'Never Connected').length, color: '#94a3b8', bg: '#f1f5f9' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}33`, borderRadius: 8, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
            onClick={() => setStatusFilter(s.label === 'Total' ? '' : s.label === 'Never' ? 'Never Connected' : s.label)}>
            <span style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.val}</span>
            <span style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="search-bar">
          <input
            placeholder="Search Device ID, Serial, Zone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, outline: 'none' }}
            value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option>Single Phase</option><option>Three Phase</option><option>HT Meter</option><option>CT Meter</option>
          </select>
          <select style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, outline: 'none' }}
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option>Online</option><option>Offline</option><option>Inactive</option><option>Never Connected</option>
          </select>
          <button className="btn-sm" onClick={() => { setSearch(''); setTypeFilter(''); setStatusFilter(''); }}>
            <i className="ti ti-x"></i> Clear
          </button>
          <button className="btn-sm" style={{ marginLeft: 'auto' }}><i className="ti ti-file-export"></i> Export</button>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: '.5rem' }}>Showing {filtered.length} of {METERS.length} devices</div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Device ID</th><th>Serial No.</th><th>Consumer No.</th><th>Type</th>
                <th>Manufacturer</th><th>Zone</th><th>Feeder</th><th>DT</th>
                <th>Status</th><th>Firmware</th><th>Last Comm.</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 40).map(m => (
                <tr key={m.id}>
                  <td className="link-cell" onClick={() => navigate('/hes/device-search', { state: { meter: m } })}>{m.id}</td>
                  <td>{m.serial}</td>
                  <td>{m.consumerNo}</td>
                  <td>{m.type}</td>
                  <td>{m.manufacturer}</td>
                  <td>{m.zone}</td>
                  <td>{m.feeder}</td>
                  <td>{m.dt}</td>
                  <td><span className={`pill ${getStatusPill(m.status)}`}>{m.status}</span></td>
                  <td>{m.firmware}</td>
                  <td style={{ fontSize: 10 }}>{fmtDT(m.lastComm)}</td>
                  <td>
                    <button className="btn-sm" style={{ padding: '3px 8px' }} onClick={() => navigate('/hes/device-search', { state: { meter: m } })}>
                      <i className="ti ti-eye" style={{ fontSize: 11 }}></i>
                    </button>
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
