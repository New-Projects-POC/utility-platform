import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { METERS, fmtDT, rf, ri } from '../../../shared/utils/mockData';

function MeterDataLayout({ title, desc, children }) {
  return (
    <div>
      <div className="page-header">
        <h2>{title}</h2>
        <p>{desc}</p>
      </div>
      {children}
    </div>
  );
}

// ---- INSTANTANEOUS ----
export function MeterDataInstant() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const filtered = METERS.filter(m =>
    !search || m.id.toLowerCase().includes(search.toLowerCase()) ||
    m.serial.toLowerCase().includes(search.toLowerCase()) ||
    m.consumerNo.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <MeterDataLayout title="Instantaneous Data" desc="Real-time meter readings">
      <div className="card">
        <div className="search-bar">
          <input placeholder="Search Meter ID, Serial, Consumer No…" value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn-sm"><i className="ti ti-filter"></i> Filter</button>
          <button className="btn-sm btn-primary"><i className="ti ti-refresh"></i> Refresh</button>
          <button className="btn-sm"><i className="ti ti-file-export"></i> Export</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Meter ID</th><th>Serial</th><th>Type</th><th>Voltage (V)</th><th>Current (A)</th><th>Power (kW)</th><th>PF</th><th>Freq (Hz)</th><th>Status</th><th>Last Read</th></tr></thead>
            <tbody>
              {filtered.slice(0, 30).map(m => (
                <tr key={m.id}>
                  <td className="link-cell" onClick={() => navigate('/hes/device-search', { state: { meter: m } })}>{m.id}</td>
                  <td>{m.serial}</td>
                  <td>{m.type}</td>
                  <td>{m.voltage}</td>
                  <td>{m.current}</td>
                  <td>{m.power}</td>
                  <td>{m.pf}</td>
                  <td>{m.frequency}</td>
                  <td><span className={`pill ${m.status === 'Online' ? 'pill-green' : m.status === 'Offline' ? 'pill-red' : 'pill-amber'}`}>{m.status}</span></td>
                  <td style={{ fontSize: 10 }}>{fmtDT(m.lastComm)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MeterDataLayout>
  );
}

// ---- LOAD PROFILE ----
export function MeterDataLoadProfile() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const rows = Array.from({ length: 20 }, (_, i) => {
    const d = new Date(Date.now() - i * 1800000);
    return { date: d.toLocaleDateString('en-IN'), block: `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`, kwhi: rf(0.1, 2.5, 3), kwhe: rf(0, 0.1, 3), kvah: rf(0.1, 2.8, 3), kvarh: rf(0, 0.5, 3), md: rf(0.5, 3, 2) };
  });
  return (
    <MeterDataLayout title="Load Profile (LP)" desc="30-minute interval energy data">
      <div className="card">
        <div className="search-bar">
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ width: 160 }} />
          <span style={{ alignSelf: 'center', fontSize: 12, color: 'var(--text3)' }}>to</span>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ width: 160 }} />
          <select style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, outline: 'none' }}>
            <option>All Meters</option>
            {METERS.slice(0,5).map(m => <option key={m.id}>{m.id}</option>)}
          </select>
          <button className="btn-sm btn-primary"><i className="ti ti-search"></i> Fetch</button>
          <button className="btn-sm" style={{ marginLeft: 'auto' }}><i className="ti ti-file-export"></i> Export CSV</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Date</th><th>Time Block</th><th>kWh Import</th><th>kWh Export</th><th>kVAh</th><th>kVARh Import</th><th>kVARh Export</th><th>MD (kW)</th><th>Status</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.date}</td><td>{r.block}</td><td>{r.kwhi}</td><td>{r.kwhe}</td>
                  <td>{r.kvah}</td><td>{r.kvarh}</td><td>{rf(0,0.2,3)}</td><td>{r.md}</td>
                  <td><span className={`pill ${i%8===0?'pill-red':i%4===0?'pill-amber':'pill-green'}`}>{i%8===0?'MISSING':i%4===0?'ESTIMATED':'OK'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MeterDataLayout>
  );
}

// ---- DAILY LP ----
export function MeterDataDailyLP() {
  const rows = Array.from({ length: 15 }, (_, i) => {
    const d = new Date(Date.now() - i * 86400000);
    return { date: d.toLocaleDateString('en-IN'), kwhi: rf(10, 80, 2), kwhe: rf(0, 2, 2), kvah: rf(12, 90, 2), kvarh: rf(1, 15, 2), md: rf(2, 8, 2), blocks: ri(46, 48), quality: i%6===0?'Partial':'Complete' };
  });
  return (
    <MeterDataLayout title="Daily Load Profile (DLP)" desc="Day-wise aggregated energy data">
      <div className="card">
        <div className="search-bar">
          <input placeholder="Search Meter ID…" />
          <button className="btn-sm btn-primary"><i className="ti ti-refresh"></i> Refresh</button>
          <button className="btn-sm"><i className="ti ti-file-export"></i> Export</button>
        </div>
        <table className="data-table">
          <thead><tr><th>Date</th><th>kWh Import</th><th>kWh Export</th><th>kVAh</th><th>kVARh</th><th>Peak MD (kW)</th><th>Blocks</th><th>Data Quality</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.date}</td><td>{r.kwhi}</td><td>{r.kwhe}</td><td>{r.kvah}</td>
                <td>{r.kvarh}</td><td>{r.md}</td><td>{r.blocks}/48</td>
                <td><span className={`pill ${r.quality==='Complete'?'pill-green':'pill-amber'}`}>{r.quality}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MeterDataLayout>
  );
}

// ---- BILLING HISTORY ----
export function MeterDataBilling() {
  const rows = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    return { month: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }), opening: rf(1000, 5000, 1), closing: rf(5001, 10000, 1), consumption: rf(200, 800, 1), md: rf(2, 10, 2), amount: ri(2000, 8000), status: i===0?'Pending':i===1?'Partial':'Paid' };
  });
  return (
    <MeterDataLayout title="Billing History" desc="Month-wise billing data">
      <div className="card">
        <div className="search-bar">
          <input placeholder="Search Meter ID or Consumer No…" />
          <button className="btn-sm btn-primary"><i className="ti ti-search"></i> Search</button>
          <button className="btn-sm"><i className="ti ti-file-export"></i> Export</button>
        </div>
        <table className="data-table">
          <thead><tr><th>Meter ID</th><th>Bill Month</th><th>Opening (kWh)</th><th>Closing (kWh)</th><th>Consumption</th><th>MD (kW)</th><th>Amount (₹)</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="link-cell">{METERS[i % METERS.length].id}</td>
                <td>{r.month}</td><td>{r.opening}</td><td>{r.closing}</td>
                <td>{r.consumption} kWh</td><td>{r.md}</td>
                <td><b>₹{r.amount.toLocaleString()}</b></td>
                <td><span className={`pill ${r.status==='Paid'?'pill-green':r.status==='Pending'?'pill-red':'pill-amber'}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MeterDataLayout>
  );
}

// ---- CURRENT BILLING ----
export function MeterDataCurrentBilling() {
  const rows = METERS.slice(0, 20).map(m => ({
    ...m,
    period: 'Jun 2025',
    kwhImport: rf(50, 600, 1),
    fixedCharge: ri(100, 500),
    energyCharge: ri(500, 4000),
    total: ri(600, 4500),
    dueDate: '15 Jun 2025',
  }));
  return (
    <MeterDataLayout title="Current Billing" desc="Current month billing data">
      <div className="card">
        <div className="search-bar">
          <input placeholder="Search…" />
          <button className="btn-sm btn-primary"><i className="ti ti-refresh"></i> Refresh</button>
          <button className="btn-sm"><i className="ti ti-file-export"></i> Export</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Meter ID</th><th>Consumer No</th><th>Period</th><th>kWh Import</th><th>MD (kW)</th><th>Fixed (₹)</th><th>Energy (₹)</th><th>Total (₹)</th><th>Due Date</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="link-cell">{r.id}</td>
                  <td>{r.consumerNo}</td>
                  <td>{r.period}</td>
                  <td>{r.kwhImport}</td>
                  <td>{r.maxDemand}</td>
                  <td>₹{r.fixedCharge}</td>
                  <td>₹{r.energyCharge}</td>
                  <td><b style={{ color: 'var(--accent)' }}>₹{r.total.toLocaleString()}</b></td>
                  <td>{r.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MeterDataLayout>
  );
}
