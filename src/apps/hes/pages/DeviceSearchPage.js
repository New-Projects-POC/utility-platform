import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { METERS, fmtDT, rf, ri, ODR_COMMANDS } from '../../../shared/utils/mockData';

function MeterKPIs({ meter }) {
  if (!meter) return null;
  return (
    <div className="md-kpi-row">
      {[
        { label: 'Voltage', val: `${meter.voltage} V`, icon: 'ti-bolt', cls: 'ic-blue' },
        { label: 'Current', val: `${meter.current} A`, icon: 'ti-current-ac', cls: 'ic-orange' },
        { label: 'Active Power', val: `${meter.power} kW`, icon: 'ti-activity', cls: 'ic-yellow' },
        { label: 'Power Factor', val: meter.pf, icon: 'ti-chart-pie', cls: 'ic-teal' },
        { label: 'kWh Import', val: `${meter.kwhImport}`, icon: 'ti-plug', cls: 'ic-green' },
        { label: 'kWh Export', val: `${meter.kwhExport}`, icon: 'ti-plug-connected-x', cls: 'ic-sky' },
        { label: 'Max Demand', val: `${meter.maxDemand} kW`, icon: 'ti-trending-up', cls: 'ic-yellow' },
        { label: 'Frequency', val: `${meter.frequency} Hz`, icon: 'ti-wave-square', cls: 'ic-red' },
      ].map((k, i) => (
        <div key={i} className="md-kpi-box">
          <div className={`mdk-icon ${k.cls}`}><i className={`ti ${k.icon}`}></i></div>
          <div>
            <div className="mdk-label">{k.label}</div>
            <div className="mdk-val">{k.val}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function OverviewTab({ meter }) {
  if (!meter) return null;
  const info = [
    ['Meter Serial', meter.serial], ['Consumer No.', meter.consumerNo], ['Type', meter.type],
    ['Manufacturer', meter.manufacturer], ['Zone', meter.zone], ['Circle', meter.circle],
    ['Division', meter.division], ['Firmware', meter.firmware],
  ];
  const conn = [
    ['Protocol', 'DLMS/COSEM'], ['Communication', 'RF Mesh'], ['IP Address', `192.168.${ri(1,254)}.${ri(1,254)}`],
    ['Port', '4059'], ['CT Ratio', '1:1'], ['PT Ratio', '1:1'],
  ];
  const comm = [
    ['Last Communication', fmtDT(meter.lastComm)], ['Status', meter.status],
    ['Signal Strength', `${ri(-80, -40)} dBm`], ['Ping', `${ri(20, 200)} ms`],
    ['Read Success Rate', `${ri(85, 100)}%`], ['Daily Reads', `${ri(44, 48)}/48`],
  ];
  return (
    <div>
      <div className="grid-3" style={{ marginBottom: '1rem' }}>
        <div className="md-section-box">
          <div className="md-sec-hd"><i className="ti ti-info-circle"></i> Meter Information</div>
          <div className="md-param-list">
            {info.map(([l, v]) => <div className="md-param-item" key={l}><span className="mp-label">{l}</span><span className="mp-val">{v}</span></div>)}
          </div>
        </div>
        <div className="md-section-box">
          <div className="md-sec-hd"><i className="ti ti-plug"></i> Connection Details</div>
          <div className="md-param-list">
            {conn.map(([l, v]) => <div className="md-param-item" key={l}><span className="mp-label">{l}</span><span className="mp-val">{v}</span></div>)}
          </div>
        </div>
        <div className="md-section-box">
          <div className="md-sec-hd"><i className="ti ti-wifi"></i> Communication Status</div>
          <div className="md-param-list">
            {comm.map(([l, v]) => <div className="md-param-item" key={l}><span className="mp-label">{l}</span><span className="mp-val">{v}</span></div>)}
          </div>
        </div>
      </div>
      <div className="md-section-box">
        <div className="md-sec-hd"><i className="ti ti-bell-ringing"></i> Active Alerts <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: 10, padding: '1px 7px', borderRadius: 20, fontWeight: 700, marginLeft: 5 }}>2</span></div>
        <table className="data-table" style={{ marginTop: '.5rem' }}>
          <thead><tr><th>Time</th><th>Type</th><th>Message</th><th>Severity</th></tr></thead>
          <tbody>
            {[{ t: 'Tamper', m: 'Cover Opened Detected', s: 'Critical' }, { t: 'Communication', m: 'Read Retry #2', s: 'Warning' }].map((a, i) => (
              <tr key={i}>
                <td style={{ fontSize: 10 }}>{fmtDT(new Date(Date.now() - i * 3600000))}</td>
                <td>{a.t}</td><td>{a.m}</td>
                <td><span className={`pill ${a.s === 'Critical' ? 'pill-red' : 'pill-amber'}`}>{a.s}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EnergyTab({ meter }) {
  if (!meter) return null;
  const tod = [['T1','00:00','06:00'], ['T2','06:00','10:00'], ['T3','10:00','18:00'], ['T4','18:00','22:00'], ['T5','22:00','00:00']];
  return (
    <div>
      <div className="mdetail-kpi-row">
        {[
          { l: 'Voltage R', v: meter.voltage, u: 'V', cls: 'blue' }, { l: 'Current R', v: meter.current, u: 'A', cls: 'blue' },
          { l: 'Active Power', v: meter.power, u: 'kW', cls: 'orange' }, { l: 'Reactive Power', v: rf(0.1, 2, 2), u: 'kVAR', cls: 'orange' },
          { l: 'Apparent Power', v: rf(0.5, 5, 2), u: 'kVA', cls: '' }, { l: 'Power Factor', v: meter.pf, u: '—', cls: '' },
          { l: 'kWh Import', v: meter.kwhImport, u: 'kWh', cls: 'green' }, { l: 'kWh Export', v: meter.kwhExport, u: 'kWh', cls: '' },
          { l: 'kVAh', v: meter.kvah, u: 'kVAh', cls: '' }, { l: 'kVARh', v: rf(10, 100, 1), u: 'kVARh', cls: '' },
          { l: 'Max Demand', v: meter.maxDemand, u: 'kW', cls: 'orange' }, { l: 'Frequency', v: meter.frequency, u: 'Hz', cls: '' },
        ].map((k, i) => (
          <div key={i} className={`mdetail-kpi ${k.cls}`}>
            <div className="mk-label">{k.l}</div>
            <div className="mk-val">{k.v}</div>
            <div className="mk-unit">{k.u}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: '1rem' }}>
        <i className="ti ti-clock" style={{ fontSize: 11 }}></i> Last read: {fmtDT(meter.lastComm)}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.4px' }}>TOD Energy (Time-of-Day Slots)</div>
      <table className="data-table">
        <thead><tr><th>TOD Slot</th><th>Start</th><th>End</th><th>kWh Import</th><th>kWh Export</th><th>kVAh</th><th>kVARh</th></tr></thead>
        <tbody>
          {tod.map(([s, st, en], i) => (
            <tr key={i}><td><b>{s}</b></td><td>{st}</td><td>{en}</td>
              <td>{rf(50, 400, 2)}</td><td>{rf(0, 10, 2)}</td><td>{rf(55, 420, 2)}</td><td>{rf(5, 50, 2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoadProfileTab({ isDelta }) {
  const [from, setFrom] = useState(''); const [to, setTo] = useState('');
  const rows = Array.from({ length: 20 }, (_, i) => {
    const d = new Date(Date.now() - i * 1800000);
    return { date: d.toLocaleDateString('en-IN'), block: `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` };
  });
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: '.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="date" style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, width: 160, outline: 'none' }} value={from} onChange={e => setFrom(e.target.value)} />
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>to</span>
        <input type="date" style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, width: 160, outline: 'none' }} value={to} onChange={e => setTo(e.target.value)} />
        <button className="btn-sm btn-primary"><i className="ti ti-search"></i> Fetch</button>
        <button className="btn-sm" style={{ marginLeft: 'auto' }}><i className="ti ti-file-export"></i> Export CSV</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead><tr>
            <th>Date</th><th>Time Block</th>
            <th>{isDelta ? 'ΔkWh Import' : 'kWh Import'}</th>
            <th>{isDelta ? 'ΔkWh Export' : 'kWh Export'}</th>
            <th>{isDelta ? 'ΔkVAh' : 'kVAh'}</th>
            <th>{isDelta ? 'ΔkVARh' : 'kVARh'}</th>
            <th>{isDelta ? 'ΔMD (kW)' : 'MD (kW)'}</th>
            <th>{isDelta ? 'Quality' : 'Status'}</th>
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.date}</td><td>{r.block}</td>
                <td>{rf(0.1, 2.5, 3)}</td><td>{rf(0, 0.1, 3)}</td>
                <td>{rf(0.1, 2.8, 3)}</td><td>{rf(0, 0.5, 3)}</td><td>{rf(0.5, 3, 2)}</td>
                <td><span className={`pill ${i%8===0?'pill-red':i%4===0?'pill-amber':'pill-green'}`}>{i%8===0?'MISSING':i%4===0?'EST':'OK'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BillingTab() {
  const rows = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    return { month: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }), opening: rf(1000, 5000, 1), closing: rf(5001, 10000, 1), md: rf(2, 10, 2), amount: ri(2000, 8000) };
  });
  return (
    <table className="data-table">
      <thead><tr><th>Bill Month</th><th>Opening (kWh)</th><th>Closing (kWh)</th><th>Consumption</th><th>MD (kW)</th><th>Amount (₹)</th><th>Status</th></tr></thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}><td>{r.month}</td><td>{r.opening}</td><td>{r.closing}</td>
            <td>{(r.closing - r.opening).toFixed(1)} kWh</td><td>{r.md}</td>
            <td><b>₹{r.amount.toLocaleString()}</b></td>
            <td><span className={`pill ${i===0?'pill-amber':i===1?'pill-red':'pill-green'}`}>{i===0?'Pending':i===1?'Overdue':'Paid'}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EventsTab() {
  const events = [
    'Voltage Sag', 'Current Imbalance', 'Cover Open', 'Magnet Tamper', 'Power Fail', 'Power Restore',
    'Low Battery', 'Clock Failure', 'Demand Threshold Cross', 'Reverse Energy',
  ];
  const rows = Array.from({ length: 15 }, (_, i) => ({
    time: new Date(Date.now() - i * ri(3600000, 7200000)).toISOString(),
    event: events[i % events.length], code: `EVT-${1000 + ri(0, 500)}`,
    duration: `${ri(1, 120)} min`,
    sev: i % 5 === 0 ? 'Critical' : i % 3 === 0 ? 'Warning' : 'Info',
  }));
  return (
    <table className="data-table">
      <thead><tr><th></th><th>Date/Time</th><th>Event Code</th><th>Event Type</th><th>Duration</th><th>Severity</th></tr></thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td><div className={`alert-icon-wrap ${r.sev === 'Critical' ? 'ai-red' : 'ai-orange'}`} style={{ width: 20, height: 20 }}><i className="ti ti-alert-triangle" style={{ fontSize: 10 }}></i></div></td>
            <td style={{ fontSize: 10 }}>{fmtDT(r.time)}</td><td>{r.code}</td><td>{r.event}</td><td>{r.duration}</td>
            <td><span className={`pill ${r.sev === 'Critical' ? 'pill-red' : r.sev === 'Warning' ? 'pill-amber' : 'pill-blue'}`}>{r.sev}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function OdrTab({ meter }) {
  const [odrType, setOdrType] = useState('profile');
  const [selected, setSelected] = useState([]);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [relayOn, setRelayOn] = useState(true);
  const cmds = ODR_COMMANDS[odrType] || [];
  const submit = () => {
    if (!selected.length) { alert('Select a command'); return; }
    setRunning(true); setProgress(0); setResult(null);
    let pct = 0;
    const iv = setInterval(() => {
      pct += Math.random() * 25 + 10;
      if (pct >= 100) {
        pct = 100; clearInterval(iv);
        setRunning(false);
        setResult({ ok: true, msg: `"${selected[0]}" executed. Job: JOB-${Date.now().toString().slice(-6)}` });
        setSelected([]);
      }
      setProgress(pct);
    }, 120);
  };
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Meter:</span>
        <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{meter?.id}</span>
        <button className={`btn-sm ${relayOn ? '' : 'btn-danger'}`} onClick={() => setRelayOn(!relayOn)} style={{ marginLeft: 'auto' }}>
          <i className={`ti ti-plug-${relayOn ? 'connected' : 'connected-x'}`}></i> Relay: {relayOn ? 'ON' : 'OFF'}
        </button>
      </div>
      <div className="odr-radio-row">
        {Object.keys(ODR_COMMANDS).map(t => (
          <label key={t} className="odr-radio">
            <input type="radio" name="md-odr-type" checked={odrType === t} onChange={() => { setOdrType(t); setSelected([]); }} />
            {t.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
        {cmds.map(c => (
          <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, cursor: 'pointer', padding: '4px 10px', background: selected.includes(c) ? '#eff6ff' : '#f7f8fa', border: `1px solid ${selected.includes(c) ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 20, color: selected.includes(c) ? 'var(--accent)' : 'var(--text2)' }}>
            <input type="checkbox" checked={selected.includes(c)} onChange={() => setSelected(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])} style={{ accentColor: 'var(--accent)' }} />
            {c}
          </label>
        ))}
      </div>
      {running && <div className="odr-progress show"><div className="odr-progress-fill" style={{ width: `${progress}%` }}></div></div>}
      {result && <div className="odr-result-bar show"><i className="ti ti-circle-check"></i>{result.msg}</div>}
      <button className="btn-sm btn-primary" onClick={submit} disabled={running}>
        <i className="ti ti-send"></i> {running ? 'Sending…' : 'Send Command'}
      </button>
    </div>
  );
}

function LogsTab() {
  const msgs = ['Load profile read OK', 'Config read complete', 'RTC sync written', 'Profile retry success', 'Ping OK', 'DLMS session open', 'Billing data fetched'];
  const statuses = [{ color: '#16a34a', lbl: 'SUCCESS' }, { color: '#16a34a', lbl: 'SUCCESS' }, { color: '#d97706', lbl: 'WARN' }, { color: '#dc2626', lbl: 'FAILED' }, { color: '#16a34a', lbl: 'SUCCESS' }];
  const types = ['Profile Read', 'Config Read', 'Config Write', 'Firmware', 'Ping'];
  const rows = Array.from({ length: 18 }, (_, k) => {
    const st = statuses[k % statuses.length];
    return { time: new Date(Date.now() - (18 - k) * 1800000), msg: msgs[k % msgs.length], st, type: types[k % types.length] };
  });
  return (
    <div className="log-list">
      {rows.map((r, k) => (
        <div className="log-entry" key={k}>
          <div className="log-dot" style={{ background: r.st.color }}></div>
          <div className="log-time">{fmtDT(r.time)}</div>
          <div>
            <div className="log-msg">{r.msg}</div>
            <span className="log-tag" style={{ background: r.st.color + '22', color: r.st.color }}>{r.st.lbl}</span>
            <span className="log-tag" style={{ background: '#eff6ff', color: '#2563eb', marginLeft: 4 }}>{r.type}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ConfigTab({ meter }) {
  if (!meter) return null;
  const params = [
    ['Meter Serial', meter.serial], ['Consumer No.', meter.consumerNo], ['Meter Type', meter.type],
    ['Manufacturer', meter.manufacturer], ['Firmware Ver.', meter.firmware], ['Hardware Ver.', 'v2.1'],
    ['Billing Date', '28'], ['Demand Integration', '30 min'], ['Load Limit', `${rf(3, 15, 0)} kW`],
    ['Sanctioned Load', `${rf(3, 15, 0)} kW`], ['Relay State', 'Closed'], ['Password Level', 'L2'],
    ['RTC Status', 'Synced'], ['Comm Protocol', 'DLMS/COSEM'], ['CT Ratio', '1:1'], ['PT Ratio', '1:1'],
  ];
  const tod = [['T1','00:00','06:00','₹4.50/kWh'], ['T2','06:00','10:00','₹7.20/kWh'], ['T3','10:00','18:00','₹8.50/kWh'], ['T4','18:00','22:00','₹9.00/kWh'], ['T5','22:00','00:00','₹5.00/kWh']];
  return (
    <div>
      <div className="grid-2" style={{ marginBottom: '1rem' }}>
        <div className="md-section-box">
          <div className="md-sec-hd"><i className="ti ti-settings"></i> Meter Configuration</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {params.map(([l, v]) => (
              <div className="md-param-item" key={l}><span className="mp-label">{l}</span><span className="mp-val">{v}</span></div>
            ))}
          </div>
        </div>
        <div className="md-section-box">
          <div className="md-sec-hd"><i className="ti ti-clock"></i> TOD Schedule</div>
          <table className="data-table">
            <thead><tr><th>Slot</th><th>Start</th><th>End</th><th>Rate</th></tr></thead>
            <tbody>
              {tod.map(([s, st, en, r]) => (
                <tr key={s}><td><b>{s}</b></td><td>{st}</td><td>{en}</td><td style={{ color: 'var(--accent)', fontWeight: 600 }}>{r}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function DeviceSearchPage() {
  const location = useLocation();
  const [searchVal, setSearchVal] = useState('');
  const [meter, setMeter] = useState(location.state?.meter || null);
  const [activeTab, setActiveTab] = useState('mdt-overview');

  const TABS = [
    { id: 'mdt-overview', label: 'Overview', icon: 'ti-layout-dashboard' },
    { id: 'mdt-energy', label: 'Energy Data', icon: 'ti-bolt' },
    { id: 'mdt-lp', label: 'Load Profile', icon: 'ti-chart-line' },
    { id: 'mdt-delta', label: 'Delta LP', icon: 'ti-git-diff' },
    { id: 'mdt-billing', label: 'Billing', icon: 'ti-file-invoice' },
    { id: 'mdt-events', label: 'Events', icon: 'ti-alert-circle' },
    { id: 'mdt-alerts', label: 'Alerts', icon: 'ti-bell' },
    { id: 'mdt-odr', label: 'ODR / Commands', icon: 'ti-send' },
    { id: 'mdt-logs', label: 'Logs', icon: 'ti-list-details' },
    { id: 'mdt-config', label: 'Config', icon: 'ti-settings' },
  ];

  const search = () => {
    const found = METERS.find(m => m.id === searchVal || m.serial === searchVal || m.consumerNo === searchVal);
    if (found) setMeter(found);
    else alert('Meter not found. Try: M01001–M01080');
  };

  return (
    <div>
      <div className="page-header">
        <h2>Device Search & Meter Detail</h2>
        <p>Search by Meter ID, Serial Number, or Consumer No.</p>
      </div>

      {/* Search bar */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            className="search-input"
            placeholder="Enter Meter ID (e.g. M01001), Serial No., or Consumer No…"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            style={{ flex: 1 }}
          />
          <button className="btn-sm btn-primary" onClick={search}><i className="ti ti-search"></i> Search</button>
          <button className="btn-sm" onClick={() => setMeter(METERS[ri(0, METERS.length - 1)])}>
            <i className="ti ti-dice"></i> Random
          </button>
        </div>
        {!meter && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: '.5rem', fontWeight: 600 }}>Quick Select:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {METERS.slice(0, 10).map(m => (
                <button key={m.id} className="btn-sm" style={{ fontSize: 10 }} onClick={() => setMeter(m)}>
                  {m.id} <span style={{ color: 'var(--text3)', fontSize: 9 }}>{m.type}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Meter Detail */}
      {meter && (
        <div>
          {/* Meter header */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'var(--accent)', flexShrink: 0 }}>
                <i className="ti ti-bolt"></i>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{meter.id}</span>
                  <span className={`pill ${meter.status === 'Online' ? 'pill-green' : meter.status === 'Offline' ? 'pill-red' : 'pill-amber'}`}>{meter.status}</span>
                  <span className="pill pill-blue">{meter.type}</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto' }}>
                    Last comm: {fmtDT(meter.lastComm)}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                  Serial: {meter.serial} &nbsp;·&nbsp; Consumer: {meter.consumerNo} &nbsp;·&nbsp; {meter.manufacturer} &nbsp;·&nbsp; {meter.address}
                </div>
              </div>
              <button className="btn-sm" style={{ fontSize: 10 }} onClick={() => setMeter(null)}>
                <i className="ti ti-x"></i> Close
              </button>
            </div>
          </div>

          {/* KPI Row */}
          <MeterKPIs meter={meter} />

          {/* Tabs */}
          <div className="card">
            <div className="mdetail-tabs">
              {TABS.map(t => (
                <button key={t.id} className={`mdetail-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                  <i className={`ti ${t.icon}`}></i> {t.label}
                </button>
              ))}
            </div>

            {activeTab === 'mdt-overview' && <OverviewTab meter={meter} />}
            {activeTab === 'mdt-energy' && <EnergyTab meter={meter} />}
            {activeTab === 'mdt-lp' && <LoadProfileTab isDelta={false} />}
            {activeTab === 'mdt-delta' && <LoadProfileTab isDelta={true} />}
            {activeTab === 'mdt-billing' && <BillingTab />}
            {activeTab === 'mdt-events' && <EventsTab />}
            {activeTab === 'mdt-alerts' && <EventsTab />}
            {activeTab === 'mdt-odr' && <OdrTab meter={meter} />}
            {activeTab === 'mdt-logs' && <LogsTab />}
            {activeTab === 'mdt-config' && <ConfigTab meter={meter} />}
          </div>
        </div>
      )}
    </div>
  );
}
