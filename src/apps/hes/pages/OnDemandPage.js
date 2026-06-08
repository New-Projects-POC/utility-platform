import React, { useState } from 'react';
import { METERS, ODR_COMMANDS, fmtDT, ri } from '../../../shared/utils/mockData';

export default function OnDemandPage() {
  const [odrType, setOdrType] = useState('profile');
  const [selectedCommands, setSelectedCommands] = useState([]);
  const [selectedMeters, setSelectedMeters] = useState([]);
  const [search, setSearch] = useState('');
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);

  const commands = ODR_COMMANDS[odrType] || [];
  const filtered = METERS.filter(m =>
    !search || m.id.toLowerCase().includes(search.toLowerCase()) ||
    m.consumerNo.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCommand = (cmd) => {
    setSelectedCommands(prev =>
      prev.includes(cmd) ? prev.filter(c => c !== cmd) : [...prev, cmd]
    );
  };

  const toggleMeter = (id) => {
    setSelectedMeters(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedMeters.length === filtered.slice(0, 20).length) setSelectedMeters([]);
    else setSelectedMeters(filtered.slice(0, 20).map(m => m.id));
  };

  const submit = () => {
    if (!selectedCommands.length || !selectedMeters.length) {
      alert('Please select at least one command and one meter.');
      return;
    }
    setRunning(true); setProgress(0); setResult(null);
    let pct = 0;
    const iv = setInterval(() => {
      pct += Math.random() * 20 + 8;
      if (pct >= 100) {
        pct = 100; clearInterval(iv);
        setRunning(false);
        const jobId = `JOB-${Date.now().toString().slice(-6)}`;
        setResult({ success: true, msg: `"${selectedCommands[0]}" executed on ${selectedMeters.length} meter(s). Job: ${jobId}` });
        setLogs(prev => [
          {
            time: new Date().toISOString(), type: odrType, cmd: selectedCommands[0],
            meters: selectedMeters.length, jobId, status: 'SUCCESS', duration: `${ri(2, 18)}s`
          },
          ...prev
        ]);
        setSelectedMeters([]); setSelectedCommands([]);
      }
      setProgress(pct);
    }, 150);
  };

  const ODR_TYPES = [
    { id: 'profile', label: 'Profile Read', icon: 'ti-chart-line' },
    { id: 'config-read', label: 'Config Read', icon: 'ti-eye' },
    { id: 'config-write', label: 'Config Write', icon: 'ti-edit' },
    { id: 'ping', label: 'Ping', icon: 'ti-radar' },
    { id: 'load-control', label: 'Load Control', icon: 'ti-toggle-right' },
    { id: 'firmware', label: 'Firmware', icon: 'ti-cloud-upload' },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>On-Demand Commands (ODR)</h2>
        <p>Send real-time commands to meters — Profile Read, Config, Ping, Load Control & Firmware</p>
      </div>

      {/* Command Type Selector */}
      <div className="odr-card">
        <div className="odr-header"><i className="ti ti-send"></i> ON-DEMAND COMMAND</div>
        <div className="odr-body">
          {/* ODR Type */}
          <div className="odr-radio-row">
            {ODR_TYPES.map(t => (
              <label key={t.id} className="odr-radio">
                <input type="radio" name="odr-type" value={t.id} checked={odrType === t.id}
                  onChange={() => { setOdrType(t.id); setSelectedCommands([]); }} />
                <i className={`ti ${t.icon}`} style={{ fontSize: 13 }}></i> {t.label}
              </label>
            ))}
          </div>

          {/* Commands checklist */}
          <div style={{ background: '#f7f8fa', border: '1px solid var(--border)', borderRadius: 8, padding: '.75rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.4px' }}>
              Commands <span style={{ color: 'var(--text3)', fontWeight: 400 }}>({selectedCommands.length} selected)</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {commands.map(cmd => (
                <label key={cmd} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, cursor: 'pointer', padding: '4px 10px', background: selectedCommands.includes(cmd) ? '#eff6ff' : '#fff', border: `1px solid ${selectedCommands.includes(cmd) ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 20, transition: 'all .15s', color: selectedCommands.includes(cmd) ? 'var(--accent)' : 'var(--text2)' }}>
                  <input type="checkbox" checked={selectedCommands.includes(cmd)} onChange={() => toggleCommand(cmd)} style={{ accentColor: 'var(--accent)' }} />
                  {cmd}
                </label>
              ))}
            </div>
            <button className="btn-sm" style={{ marginTop: '.5rem', fontSize: 10 }} onClick={() => setSelectedCommands(selectedCommands.length === commands.length ? [] : [...commands])}>
              {selectedCommands.length === commands.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Meter Filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input placeholder="Consumer / Meter No." className="search-input" style={{ flex: 1 }} value={search} onChange={e => setSearch(e.target.value)} />
            <select style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, outline: 'none' }}>
              <option>All Types</option><option>Single Phase</option><option>Three Phase</option><option>HT Meter</option>
            </select>
            <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>
              {selectedMeters.length} selected
            </span>
            <button className="btn-sm btn-primary" onClick={submit} disabled={running}>
              <i className="ti ti-send"></i> {running ? 'Sending…' : 'Submit'}
            </button>
          </div>

          {/* Progress */}
          {running && (
            <div className="odr-progress show">
              <div className="odr-progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          )}
          {result && (
            <div className={`odr-result-bar show ${result.success ? '' : 'error'}`}>
              <i className={`ti ${result.success ? 'ti-circle-check' : 'ti-circle-x'}`}></i>
              {result.msg}
            </div>
          )}

          {/* Meter Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="odr-table">
              <thead>
                <tr>
                  <th><input type="checkbox" checked={selectedMeters.length === filtered.slice(0,20).length && selectedMeters.length > 0} onChange={toggleAll} /></th>
                  <th>Consumer No.</th><th>Meter No.</th><th>Type</th><th>Manufacturer</th><th>Group</th><th>Status</th><th>Last Comm.</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 20).map(m => (
                  <tr key={m.id}>
                    <td><input type="checkbox" checked={selectedMeters.includes(m.id)} onChange={() => toggleMeter(m.id)} /></td>
                    <td>{m.consumerNo}</td>
                    <td style={{ color: 'var(--accent)', fontWeight: 500 }}>{m.id}</td>
                    <td>{m.type}</td>
                    <td>{m.manufacturer}</td>
                    <td>{m.group}</td>
                    <td><span className={`pill ${m.status === 'Online' ? 'pill-green' : m.status === 'Offline' ? 'pill-red' : 'pill-amber'}`}>{m.status}</span></td>
                    <td style={{ fontSize: 10 }}>{fmtDT(m.lastComm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Execution Log */}
      <div className="odr-card">
        <div className="odr-header" style={{ background: '#0f172a' }}><i className="ti ti-list-details"></i> Command Execution Log</div>
        <div className="odr-body">
          {logs.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: 12, textAlign: 'center', padding: '1.5rem' }}>
              No commands executed yet. Submit an on-demand request above.
            </div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Time</th><th>Type</th><th>Command</th><th>Meters</th><th>Job ID</th><th>Status</th><th>Duration</th></tr></thead>
              <tbody>
                {logs.map((l, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 10 }}>{fmtDT(l.time)}</td>
                    <td>{l.type}</td>
                    <td>{l.cmd}</td>
                    <td>{l.meters}</td>
                    <td style={{ color: 'var(--accent)', fontWeight: 500 }}>{l.jobId}</td>
                    <td><span className="pill pill-green">{l.status}</span></td>
                    <td>{l.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
