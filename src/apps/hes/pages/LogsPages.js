import React, { useState } from 'react';
import { ri, fmtDT } from '../../../shared/utils/mockData';

const LOG_DATA = {
  profile: {
    title: 'Profile Read Logs',
    desc: 'Logs of scheduled and on-demand profile read operations',
    msgs: ['Load profile read OK — 96 blocks', 'Instantaneous profile collected', 'Billing data read complete', 'Profile read retry success', 'Historical load profile fetched', 'Profile read timeout — retrying', 'Partial profile received (88/96 blocks)'],
    colors: { 'SUCCESS': '#16a34a', 'WARN': '#d97706', 'FAILED': '#dc2626' },
  },
  'config-read': {
    title: 'Config Read Logs',
    desc: 'Meter configuration read operations',
    msgs: ['RTC read OK', 'Billing date: 28', 'Demand integration: 30 min', 'TOD config fetched', 'Comm params read OK', 'Load limit: 5 kW', 'Relay state: Closed'],
    colors: { 'SUCCESS': '#16a34a', 'WARN': '#d97706', 'FAILED': '#dc2626' },
  },
  'config-write': {
    title: 'Config Write Logs',
    desc: 'Meter configuration write and update operations',
    msgs: ['RTC sync written', 'Load limit set: 10 kW', 'TOD schedule updated', 'Billing date updated to 28', 'Relay state changed: OPEN', 'CT ratio updated', 'Integration period set to 30 min'],
    colors: { 'SUCCESS': '#16a34a', 'WARN': '#d97706', 'FAILED': '#dc2626' },
  },
  fota: {
    title: 'FOTA Logs',
    desc: 'Firmware Over-The-Air update logs',
    msgs: ['Upgrade initiated v3.1→v3.2', 'Block transferred (256/512)', 'CRC check passed', 'Upgrade complete', 'Version confirmed: v3.2.0', 'Download started', 'Image integrity OK'],
    colors: { 'SUCCESS': '#16a34a', 'PENDING': '#0284c7', 'IN_PROGRESS': '#7c3aed', 'FAILED': '#dc2626' },
  },
};

const STATUSES_BY_TYPE = {
  profile: ['SUCCESS', 'SUCCESS', 'SUCCESS', 'WARN', 'FAILED'],
  'config-read': ['SUCCESS', 'SUCCESS', 'SUCCESS', 'WARN', 'SUCCESS'],
  'config-write': ['SUCCESS', 'SUCCESS', 'WARN', 'SUCCESS', 'FAILED'],
  fota: ['SUCCESS', 'PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED'],
};

function LogTable({ logType }) {
  const data = LOG_DATA[logType];
  const statuses = STATUSES_BY_TYPE[logType];

  const rows = Array.from({ length: 25 }, (_, i) => {
    const st = statuses[i % statuses.length];
    const msg = data.msgs[i % data.msgs.length];
    const d = new Date(Date.now() - i * ri(600000, 1800000));
    const color = data.colors[st] || '#16a34a';
    return { time: d, msg, st, color, meterId: `M${1001 + (i % 30)}`, duration: `${ri(2, 60)}s` };
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: '.75rem', flexWrap: 'wrap' }}>
        <input className="search-input" placeholder="Search Meter ID or message…" style={{ flex: 1, minWidth: 200 }} />
        <select style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, outline: 'none' }}>
          <option>All Status</option><option>SUCCESS</option><option>WARN</option><option>FAILED</option>
        </select>
        <input type="date" style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, outline: 'none' }} />
        <button className="btn-sm btn-primary"><i className="ti ti-search"></i> Filter</button>
        <button className="btn-sm" style={{ marginLeft: 'auto' }}><i className="ti ti-file-export"></i> Export</button>
      </div>

      <div className="log-list">
        {rows.map((r, i) => (
          <div className="log-entry" key={i}>
            <div className="log-dot" style={{ background: r.color }}></div>
            <div className="log-time">{fmtDT(r.time)}</div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 11.5, color: 'var(--text)', fontWeight: 500 }}>[{r.meterId}] </span>
              <span className="log-msg">{r.msg}</span>
              <div style={{ marginTop: 3 }}>
                <span className="log-tag" style={{ background: r.color + '22', color: r.color }}>{r.st}</span>
                <span className="log-tag" style={{ background: '#f1f5f9', color: 'var(--text2)', marginLeft: 4 }}>
                  <i className="ti ti-clock" style={{ fontSize: 9 }}></i> {r.duration}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LogsPage({ logType }) {
  const data = LOG_DATA[logType];
  if (!data) return null;
  return (
    <div>
      <div className="page-header">
        <h2>{data.title}</h2>
        <p>{data.desc}</p>
      </div>
      <div className="card">
        <LogTable logType={logType} />
      </div>
    </div>
  );
}

// Combined Logs page with tabs
export function HesLogsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const tabs = [
    { id: 'profile', label: 'Profile Read', icon: 'ti-chart-line' },
    { id: 'config-read', label: 'Config Read', icon: 'ti-settings' },
    { id: 'config-write', label: 'Config Write', icon: 'ti-edit' },
    { id: 'fota', label: 'FOTA Logs', icon: 'ti-cloud-upload' },
  ];
  return (
    <div>
      <div className="page-header">
        <h2>System Logs</h2>
        <p>Operation and communication logs for all meter activities</p>
      </div>
      <div className="card">
        <div className="tabs">
          {tabs.map(t => (
            <button key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              <i className={`ti ${t.icon}`}></i> {t.label}
            </button>
          ))}
        </div>
        <LogTable logType={activeTab} />
      </div>
    </div>
  );
}
