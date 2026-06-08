import React, { useState } from 'react';
import { ALERTS, fmtDT } from '../../../shared/utils/mockData';

export default function AlertsPage() {
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = ALERTS.filter(a => {
    return (!severityFilter || a.severity === severityFilter) &&
      (!statusFilter || a.status === statusFilter) &&
      (!typeFilter || a.type === typeFilter);
  });

  const counts = {
    Critical: ALERTS.filter(a => a.severity === 'Critical').length,
    Warning: ALERTS.filter(a => a.severity === 'Warning').length,
    Active: ALERTS.filter(a => a.status === 'Active').length,
    Cleared: ALERTS.filter(a => a.status === 'Cleared').length,
  };

  return (
    <div>
      <div className="page-header">
        <h2>Alerts & Alarms</h2>
        <p>System-wide alerts from all connected meters</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 10, marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Critical', val: counts.Critical, color: '#dc2626', bg: '#fee2e2' },
          { label: 'Warning', val: counts.Warning, color: '#d97706', bg: '#fef3c7' },
          { label: 'Active', val: counts.Active, color: '#1d4ed8', bg: '#eff6ff' },
          { label: 'Cleared', val: counts.Cleared, color: '#16a34a', bg: '#dcfce7' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}44`, borderRadius: 8, padding: '6px 16px', display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</span>
            <span style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="search-bar">
          <input placeholder="Search alert message or meter…" style={{ flex: 1 }} />
          <select style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, outline: 'none' }}
            value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
            <option value="">All Severity</option><option>Critical</option><option>Warning</option><option>Info</option>
          </select>
          <select style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, outline: 'none' }}
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option><option>Active</option><option>Cleared</option>
          </select>
          <select style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, outline: 'none' }}
            value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option>Communication</option><option>Tamper</option><option>Voltage</option><option>Load</option><option>Billing</option>
          </select>
          <button className="btn-sm"><i className="ti ti-file-export"></i> Export</button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th></th><th>Time</th><th>Alert ID</th><th>Meter No.</th>
              <th>Type</th><th>Message</th><th>Severity</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id}>
                <td>
                  <div className={`alert-icon-wrap ${a.severity === 'Critical' ? 'ai-red' : 'ai-orange'}`}>
                    <i className="ti ti-alert-triangle" style={{ fontSize: 11 }}></i>
                  </div>
                </td>
                <td style={{ fontSize: 10 }}>{fmtDT(a.time)}</td>
                <td style={{ color: 'var(--accent)', fontWeight: 500 }}>{a.id}</td>
                <td style={{ color: 'var(--accent)', fontWeight: 500 }}>{a.meterNo}</td>
                <td>{a.type}</td>
                <td>{a.message}</td>
                <td><span className={`pill ${a.severity === 'Critical' ? 'pill-red' : a.severity === 'Warning' ? 'pill-amber' : 'pill-blue'}`}>{a.severity}</span></td>
                <td><span className={`pill ${a.status === 'Active' ? 'pill-red' : 'pill-green'}`}>{a.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-sm" style={{ padding: '3px 7px', fontSize: 10 }}>Ack</button>
                    <button className="btn-sm" style={{ padding: '3px 7px', fontSize: 10 }}>Clear</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
