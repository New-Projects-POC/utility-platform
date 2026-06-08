import React, { useState } from 'react';

const REPORTS = [
  { id: 'comm-status', name: 'Communication Status Report', category: 'Communication', icon: 'ti-wifi', desc: 'Daily/Weekly/Monthly communication status for all meters' },
  { id: 'daily-data', name: 'Daily Data Availability Report', category: 'Data', icon: 'ti-database', desc: 'Data availability percentage across zones' },
  { id: 'tamper', name: 'Tamper Alert Report', category: 'Alerts', icon: 'ti-shield-exclamation', desc: 'All tamper events with meter details' },
  { id: 'load-profile', name: 'Load Profile Summary', category: 'Energy', icon: 'ti-chart-line', desc: 'Aggregated load profile by feeder/DT' },
  { id: 'billing-read', name: 'Billing Read Report', category: 'Billing', icon: 'ti-file-invoice', desc: 'Billing meter reads status for the period' },
  { id: 'odr-log', name: 'ODR Execution Report', category: 'Operations', icon: 'ti-send', desc: 'Summary of on-demand command jobs' },
  { id: 'fota', name: 'FOTA Campaign Report', category: 'Firmware', icon: 'ti-cloud-upload', desc: 'Firmware update status across fleet' },
  { id: 'connectivity', name: 'Connectivity Trend Report', category: 'Communication', icon: 'ti-trending-up', desc: 'Week-over-week connectivity trends' },
];

export function ReportsPage() {
  const [category, setCategory] = useState('');
  const categories = ['All', ...new Set(REPORTS.map(r => r.category))];
  const filtered = !category || category === 'All' ? REPORTS : REPORTS.filter(r => r.category === category);

  return (
    <div>
      <div className="page-header">
        <h2>Reports</h2>
        <p>Generate and download system reports</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        {categories.map(c => (
          <button key={c} className={`btn-sm ${category === c || (c === 'All' && !category) ? 'btn-primary' : ''}`}
            onClick={() => setCategory(c === 'All' ? '' : c)}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {filtered.map(r => (
          <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                <i className={`ti ${r.icon}`}></i>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{r.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{r.desc}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <select style={{ flex: 1, padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 11, outline: 'none' }}>
                <option>Today</option><option>Last 7 Days</option><option>Last 30 Days</option><option>Custom</option>
              </select>
              <select style={{ padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 11, outline: 'none' }}>
                <option>PDF</option><option>Excel</option><option>CSV</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: 10 }}>
                <i className="ti ti-eye"></i> Preview
              </button>
              <button className="btn-sm btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 10 }}>
                <i className="ti ti-download"></i> Generate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const sections = [
    { id: 'general', label: 'General', icon: 'ti-settings' },
    { id: 'communication', label: 'Communication', icon: 'ti-wifi' },
    { id: 'schedule', label: 'Read Schedule', icon: 'ti-calendar' },
    { id: 'alerts', label: 'Alert Rules', icon: 'ti-bell' },
    { id: 'users', label: 'User Management', icon: 'ti-users' },
    { id: 'integration', label: 'Integrations', icon: 'ti-plug' },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>Settings</h2>
        <p>System configuration and preferences</p>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Settings nav */}
        <div style={{ width: 180, flexShrink: 0 }}>
          <div className="card" style={{ padding: '.5rem' }}>
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: activeSection === s.id ? '#eff6ff' : 'transparent', color: activeSection === s.id ? 'var(--accent)' : 'var(--text2)', border: 'none', width: '100%', textAlign: 'left' }}>
                <i className={`ti ${s.icon}`} style={{ fontSize: 15 }}></i> {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings content */}
        <div style={{ flex: 1 }}>
          <div className="card">
            {activeSection === 'general' && (
              <div>
                <div className="card-head"><h3>General Settings</h3></div>
                {[
                  { label: 'System Name', type: 'input', val: 'HES Production Server' },
                  { label: 'Timezone', type: 'select', options: ['Asia/Kolkata', 'UTC', 'Asia/Dubai'] },
                  { label: 'Date Format', type: 'select', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
                  { label: 'Session Timeout (min)', type: 'input', val: '30' },
                  { label: 'Max Retry Count', type: 'input', val: '3' },
                ].map(f => (
                  <div key={f.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <label style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{f.label}</label>
                    {f.type === 'input' ? (
                      <input defaultValue={f.val} style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 12, width: 200, outline: 'none' }} />
                    ) : (
                      <select style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 12, width: 200, outline: 'none' }}>
                        {f.options?.map(o => <option key={o}>{o}</option>)}
                      </select>
                    )}
                  </div>
                ))}
                <div style={{ marginTop: '1rem', display: 'flex', gap: 8 }}>
                  <button className="btn-sm btn-primary"><i className="ti ti-device-floppy"></i> Save Changes</button>
                  <button className="btn-sm"><i className="ti ti-refresh"></i> Reset</button>
                </div>
              </div>
            )}

            {activeSection === 'communication' && (
              <div>
                <div className="card-head"><h3>Communication Settings</h3></div>
                {[
                  { label: 'DLMS Server Port', val: '4059' },
                  { label: 'RF Channel', val: '868 MHz' },
                  { label: 'GPRS APN', val: 'airtelgprs.com' },
                  { label: 'Max Session Duration (s)', val: '120' },
                  { label: 'Comm Retry Interval (s)', val: '30' },
                  { label: 'TCP Keepalive (s)', val: '60' },
                ].map(f => (
                  <div key={f.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <label style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{f.label}</label>
                    <input defaultValue={f.val} style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 12, width: 200, outline: 'none' }} />
                  </div>
                ))}
                <button className="btn-sm btn-primary" style={{ marginTop: '1rem' }}><i className="ti ti-device-floppy"></i> Save Changes</button>
              </div>
            )}

            {activeSection === 'schedule' && (
              <div>
                <div className="card-head"><h3>Read Schedule Configuration</h3></div>
                <table className="data-table">
                  <thead><tr><th>Profile Type</th><th>Schedule</th><th>Priority</th><th>Enabled</th></tr></thead>
                  <tbody>
                    {[
                      ['Instantaneous', 'Every 15 min', 'High'],
                      ['Load Profile (LP)', 'Every 30 min', 'High'],
                      ['Daily LP (DLP)', 'Daily 01:00', 'Medium'],
                      ['Billing Read', 'Monthly Day 1', 'High'],
                      ['TOD Data', 'Every 30 min', 'Medium'],
                      ['Events & Alarms', 'Every 10 min', 'High'],
                    ].map(([t, s, p], i) => (
                      <tr key={i}>
                        <td>{t}</td>
                        <td><input defaultValue={s} style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11, outline: 'none', width: 150 }} /></td>
                        <td><span className={`pill ${p === 'High' ? 'pill-red' : 'pill-amber'}`}>{p}</span></td>
                        <td><input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent)', width: 15, height: 15, cursor: 'pointer' }} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button className="btn-sm btn-primary" style={{ marginTop: '1rem' }}><i className="ti ti-device-floppy"></i> Save Schedule</button>
              </div>
            )}

            {(activeSection === 'alerts' || activeSection === 'users' || activeSection === 'integration') && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text3)' }}>
                <i className={`ti ${sections.find(s => s.id === activeSection)?.icon}`} style={{ fontSize: 40, display: 'block', marginBottom: '1rem' }}></i>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: '.5rem' }}>{sections.find(s => s.id === activeSection)?.label} Settings</div>
                <div style={{ fontSize: 12 }}>Configuration panel coming in next update.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
