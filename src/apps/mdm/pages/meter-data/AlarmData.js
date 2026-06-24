import React, { useState, useRef, useCallback } from 'react';
import { api } from '../../../../shared/utils/api';

// ── Constants ─────────────────────────────────────────────────────────────────
const LP_API           = '/api/mdm/meter-data/getAlarmData/query';
const PAGE_SIZE        = 10;
const PREFETCH_TRIGGER = 2;

function getTenantCode() {
  try {
    const raw = localStorage.getItem('authUser');
    if (raw) return JSON.parse(raw).tenantCode || '';
  } catch {}
  return '';
}

const inp = {
  padding: '7px 10px',
  border: '1px solid var(--border)',
  borderRadius: 6,
  fontSize: 12,
  outline: 'none',
  background: '#fff',
  fontFamily: 'Inter, sans-serif',
};

export function AlarmData() {
  const tenantCode = getTenantCode();

  const [levelName,  setLevelName]  = useState('ALL');
  const [levelValue, setLevelValue] = useState(tenantCode);
  const [devType,    setDevType]    = useState('1P');
  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);

  const [rows,       setRows]       = useState([]);
  const [headers,    setHeaders]    = useState([]);
  const [totalRows,  setTotalRows]  = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [uiPage,     setUiPage]     = useState(0);
  const [loading,    setLoading]    = useState(false);
  const [bgLoading,  setBgLoading]  = useState(false);
  const [error,      setError]      = useState('');
  const [searched,   setSearched]   = useState(false);

  const cursorTimeRef   = useRef(null);
  const cursorDeviceRef = useRef(null);
  const hasMoreRef      = useRef(false);
  const prefetchedRef   = useRef([]);
  const isFetchingRef   = useRef(false);

  const loadedPages  = Math.ceil(rows.length / PAGE_SIZE);
  const uiRows       = rows.slice(uiPage * PAGE_SIZE, (uiPage + 1) * PAGE_SIZE);
  const displayTotal = totalPages > 0
    ? Math.max(totalPages, loadedPages)
    : loadedPages;

  // ── parseResponse ──────────────────────────────────────────────────────────
  // API returns data as a plain object: { "0": [headers], "1": [row], ... }
  // NOT an array — so we read it directly as an object.
  function parseResponse(res) {
    let root = res;

    // Unwrap raw axios response if needed
    if (res && res.status !== undefined && res.data !== undefined) {
      root = res.data;
    }

    let content = [];
    let hdrs    = [];

    // ── KEY FIX: data is a plain object { "0": [], "1": [], ... } ──────────
    const dataBlock = root?.data;

    if (dataBlock && typeof dataBlock === 'object' && !Array.isArray(dataBlock)) {
      const keys = Object.keys(dataBlock).sort((a, b) => Number(a) - Number(b));
      keys.forEach(k => {
        if (k === '0') {
          hdrs = dataBlock[k];        // header row
        } else {
          content.push(dataBlock[k]); // value rows
        }
      });
    }

    const cursor = root?.nextCursor || {};
    return {
      content,
      headers:      hdrs,
      totalRows:    root?.totalRows   || 0,
      totalPages:   root?.totalPages  || 0,
      cursorTime:   cursor.cursorTime   || null,
      cursorDevice: cursor.cursorDevice || null,
    };
  }

  const buildPayload = useCallback((cursorTime = null, cursorDevice = null) => ({
    levelName,
    levelValue: levelName === 'ALL' ? tenantCode : levelValue.trim(),
    devType,
    startDate: startDate.replace('T', ' ') + ':00',
    endDate:   endDate.replace('T', ' ')   + ':59',
    cursorTime,
    cursorDevice,
    page:      0,
    totalRows: 0,
    totalPages: 0,
  }), [levelName, levelValue, devType, startDate, endDate, tenantCode]);

  const handleSearch = useCallback(async () => {
    if (!startDate || !endDate) {
      setError('Please select Start Date and End Date.');
      return;
    }
    if (levelName !== 'ALL' && !levelValue.trim()) {
      setError(`Please enter a value for ${levelName}.`);
      return;
    }
    setError('');
    setLoading(true);
    setRows([]);
    setHeaders([]);
    setUiPage(0);
    setTotalRows(0);
    setTotalPages(0);
    cursorTimeRef.current   = null;
    cursorDeviceRef.current = null;
    hasMoreRef.current      = false;
    prefetchedRef.current   = [];
    isFetchingRef.current   = false;

    try {
      const res    = await api.post(LP_API, buildPayload());
      const parsed = parseResponse(res);

      if (parsed.content.length === 0 && parsed.headers.length === 0) {
        console.warn('[AlarmData] parseResponse returned empty — raw res:', res);
      }

      setRows(parsed.content);
      setHeaders(parsed.headers);
      setTotalRows(parsed.totalRows   || parsed.content.length);
      setTotalPages(parsed.totalPages || 0);

      if (parsed.cursorTime || parsed.cursorDevice) {
        cursorTimeRef.current   = parsed.cursorTime;
        cursorDeviceRef.current = parsed.cursorDevice;
        hasMoreRef.current      = true;
      }
      setSearched(true);
    } catch (ex) {
      setError(ex?.message || 'Failed to fetch data. Please try again.');
    }
    setLoading(false);
  }, [startDate, endDate, levelName, levelValue, buildPayload]);

  const prefetchNext = useCallback(async () => {
    if (!hasMoreRef.current)          return;
    if (isFetchingRef.current)        return;
    if (prefetchedRef.current.length) return;

    isFetchingRef.current = true;
    setBgLoading(true);
    try {
      const res    = await api.post(LP_API, buildPayload(
        cursorTimeRef.current,
        cursorDeviceRef.current,
      ));
      const parsed = parseResponse(res);

      prefetchedRef.current   = parsed.content;
      cursorTimeRef.current   = parsed.cursorTime;
      cursorDeviceRef.current = parsed.cursorDevice;
      hasMoreRef.current      = !!(parsed.cursorTime || parsed.cursorDevice);
    } catch {
      // silent — user still sees current data
    }
    isFetchingRef.current = false;
    setBgLoading(false);
  }, [buildPayload]);

  const handlePageChange = useCallback((newPage) => {
    if (hasMoreRef.current && newPage >= loadedPages - PREFETCH_TRIGGER) {
      prefetchNext();
    }

    if (newPage >= loadedPages) {
      if (prefetchedRef.current.length > 0) {
        const batch = prefetchedRef.current;
        prefetchedRef.current = [];
        setRows(prev => [...prev, ...batch]);
        setUiPage(newPage);
      }
      return;
    }

    setUiPage(newPage);
  }, [loadedPages, prefetchNext]);

  const handleLevelChange = (v) => {
    setLevelName(v);
    setLevelValue(v === 'ALL' ? tenantCode : '');
    setError('');
  };

  // AUTO-BIND: headers and values come purely from the API response
  const colHeaders = headers;

  function Pagination() {
    if (displayTotal <= 1 && !hasMoreRef.current) return null;

    const total  = displayTotal;
    const start  = Math.max(0, uiPage - 2);
    const end    = Math.min(total, start + 5);
    const nums   = Array.from({ length: end - start }, (_, i) => start + i);
    const isLast = uiPage >= loadedPages - 1;
    const canNext = isLast
      ? hasMoreRef.current || prefetchedRef.current.length > 0
      : uiPage < total - 1;

    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '10px 0 2px', borderTop: '1px solid var(--border)',
        flexWrap: 'wrap', marginTop: 8,
      }}>
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>
          {rows.length > 0
            ? `${uiPage * PAGE_SIZE + 1}–${Math.min((uiPage + 1) * PAGE_SIZE, rows.length)} of ${totalRows > 0 ? totalRows.toLocaleString() : rows.length}`
            : '0 records'}
        </span>

        {bgLoading && (
          <span style={{
            fontSize: 10, color: '#d97706',
            display: 'flex', alignItems: 'center', gap: 3, marginLeft: 6,
          }}>
            <i className="ti ti-loader-2" style={{ animation: 'spin .8s linear infinite' }}></i>
            Fetching next batch…
          </span>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <button className="btn-sm" disabled={uiPage === 0}
            onClick={() => handlePageChange(0)}
            style={{ minWidth: 28, padding: '4px 7px', fontSize: 11 }}>«</button>

          <button className="btn-sm" disabled={uiPage === 0}
            onClick={() => handlePageChange(uiPage - 1)}
            style={{ minWidth: 28, padding: '4px 7px', fontSize: 11 }}>‹</button>

          {nums.map(n => (
            <button key={n} className="btn-sm"
              onClick={() => handlePageChange(n)}
              style={{
                minWidth: 30, padding: '4px 7px', fontSize: 11,
                background: n === uiPage ? 'var(--accent)' : '',
                color:      n === uiPage ? '#fff'          : '',
                border:    `1px solid ${n === uiPage ? 'var(--accent)' : 'var(--border)'}`,
              }}>
              {n + 1}
            </button>
          ))}

          <button className="btn-sm" disabled={!canNext}
            onClick={() => handlePageChange(uiPage + 1)}
            style={{ minWidth: 28, padding: '4px 7px', fontSize: 11 }}>›</button>

          {hasMoreRef.current && isLast ? (
            <span style={{
              fontSize: 10, padding: '3px 8px', borderRadius: 20,
              background: '#eff6ff', color: '#1d4ed8',
              border: '1px solid #bfdbfe', alignSelf: 'center',
            }}>
              {totalPages > 0 ? `of ${totalPages.toLocaleString()} pages` : 'more…'}
            </span>
          ) : (
            <button className="btn-sm"
              disabled={uiPage >= total - 1 && !hasMoreRef.current}
              onClick={() => handlePageChange(total - 1)}
              style={{ minWidth: 28, padding: '4px 7px', fontSize: 11 }}>»</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Alarm Data</h2>
      </div>

      {/* ── Filter card ───────────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 3 }}>
              Level
            </label>
            <select style={inp} value={levelName} onChange={e => handleLevelChange(e.target.value)}>
              <option value="ALL">All Meters</option>
              <option value="METER">Meter</option>
            </select>
          </div>

          {levelName !== 'ALL' && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 3 }}>
                {levelName === 'METER'     ? 'Meter Serial No.'
                  : levelName === 'FEEDER' ? 'Feeder Name'
                  : levelName === 'DT'     ? 'DT Name'
                  :                          'Substation Name'}
              </label>
              <input
                style={{ ...inp, width: 185 }}
                value={levelValue}
                placeholder={levelName === 'METER' ? 'e.g. 11202122' : `Enter ${levelName.toLowerCase()} name`}
                onChange={e => setLevelValue(e.target.value)}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 3 }}>
              Meter Phase
            </label>
            <select style={inp} value={devType} onChange={e => setDevType(e.target.value)}>
              <option value="1P">Single Phase (1P)</option>
              <option value="3P">Three Phase (3P)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 3 }}>
              From
            </label>
            <input
              type="datetime-local"
              style={{ ...inp, width: 175 }}
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 3 }}>
              To
            </label>
            <input
              type="datetime-local"
              style={{ ...inp, width: 175 }}
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>

          <button
            className="btn-sm btn-primary"
            onClick={handleSearch}
            disabled={loading}
            style={{ padding: '7px 20px', alignSelf: 'flex-end', fontWeight: 600 }}>
            {loading
              ? <><i className="ti ti-loader-2" style={{ marginRight: 4, animation: 'spin .8s linear infinite' }}></i>Loading…</>
              : <><i className="ti ti-search" style={{ marginRight: 4 }}></i>Go</>}
          </button>

          {rows.length > 0 && (
            <button className="btn-sm" style={{ alignSelf: 'flex-end' }}>
              <i className="ti ti-file-export" style={{ marginRight: 4 }}></i>Export CSV
            </button>
          )}
        </div>

        {error && (
          <div style={{
            marginTop: 10, padding: '7px 12px',
            background: '#fef2f2', color: '#dc2626',
            borderRadius: 6, fontSize: 12,
            border: '1px solid #fecaca',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <i className="ti ti-alert-circle"></i>{error}
          </div>
        )}
      </div>

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {!searched && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text3)' }}>
          <i className="ti ti-table-import" style={{
            fontSize: 40, display: 'block', marginBottom: 12, opacity: .2,
          }}></i>
          <div style={{ fontSize: 13, marginBottom: 4 }}>
            Select filters above and click <strong>Go</strong> to load data.
          </div>
        </div>
      )}

      {/* ── Results card ─────────────────────────────────────────────────── */}
      {searched && (
        <div className="card">

          {!loading && rows.length > 0 && (
            <div style={{
              display: 'flex', gap: 14, marginBottom: 10,
              flexWrap: 'wrap', alignItems: 'center',
              paddingBottom: 10, borderBottom: '1px solid var(--border)',
            }}>
              {[
                ['Total Records',    totalRows  > 0 ? totalRows.toLocaleString()  : '—', '#1a6bff'],
                ['Total Pages',      totalPages > 0 ? totalPages.toLocaleString() : '—', '#7c3aed'],
                ['Current Page',     `${uiPage + 1} / ${displayTotal || loadedPages}`,   '#64748b'],
                ['Phase',            devType === '1P' ? 'Single Phase' : 'Three Phase',   '#d97706'],
              ].map(([l, v, c]) => (
                <div key={l} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: 'var(--text3)' }}>{l}:</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: c }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {loading && (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text3)' }}>
              <i className="ti ti-loader-2" style={{
                fontSize: 30, animation: 'spin .8s linear infinite',
                display: 'block', margin: '0 auto 12px',
              }}></i>
              <div style={{ fontSize: 12 }}>Fetching alarm data…</div>
            </div>
          )}

          {!loading && rows.length === 0 && (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
              <i className="ti ti-database-off" style={{
                fontSize: 30, display: 'block', marginBottom: 10, opacity: .25,
              }}></i>
              No records found for the selected criteria.
            </div>
          )}

          {!loading && uiRows.length > 0 && (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      {colHeaders.map((h, i) => (
                        <th key={i} style={{ whiteSpace: 'nowrap', fontSize: 11 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uiRows.map((row, ri) => (
                      <tr key={ri}>
                        {colHeaders.map((_, ci) => (
                          <td key={ci} style={{
                            textAlign: typeof row[ci] === 'number' ? 'right' : 'left',
                            whiteSpace: 'nowrap',
                            fontSize: ci <= 2 ? 11 : undefined,
                            fontWeight: ci === 0 ? 500 : undefined,
                            color: ci === 1 ? 'var(--text2)' : undefined,
                          }}>
                            {row[ci] ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination />
            </>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const getDefaultDateTimes = () => {
  const now = new Date();

  const currentDate =
    now.getFullYear() +
    '-' +
    String(now.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(now.getDate()).padStart(2, '0');

  return {
    start: `${currentDate}T00:00`,
    end:
      `${currentDate}T` +
      String(now.getHours()).padStart(2, '0') +
      ':' +
      String(now.getMinutes()).padStart(2, '0'),
  };
};

const defaultDates = getDefaultDateTimes();

export default AlarmData;