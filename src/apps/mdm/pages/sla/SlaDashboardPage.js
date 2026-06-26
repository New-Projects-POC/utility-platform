import React, { useState, useCallback, useRef } from 'react';
import { api } from '../../../../shared/utils/api';

// ── API constants ─────────────────────────────────────────────────────────────
const BASE = '/api/mdm/sla';
const APIS = {
  LP:      { daily: `${BASE}/lp/daily/query`,       list: `${BASE}/lp/list/query`,       excl: `${BASE}/lp/exclusion/query`      },
  DLP:     { daily: `${BASE}/dlp/daily/query`,      list: `${BASE}/dlp/list/query`,      excl: `${BASE}/dlp/exclusion/query`     },
  BILLING: { daily: `${BASE}/billing/daily/query`,  list: `${BASE}/billing/list/query`,  excl: `${BASE}/billing/exclusion/query` },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function getTenantCode() {
  try { return JSON.parse(localStorage.getItem('authUser') || '{}').tenantCode || ''; }
  catch { return ''; }
}
function todayStart() { return fmtDate(new Date(new Date().setHours(0,0,0,0))); }
function todayNow()   { return fmtDate(new Date()); }
function fmtDate(d) {
  const p = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:00`;
}
function pctColor(p) { return p>=90?'#16a34a':p>=70?'#d97706':'#dc2626'; }
function pctPill(p)  { return p>=90?'pill-green':p>=70?'pill-amber':'pill-red'; }
function num(v) { return typeof v==='number'?v:0; }

const inp = {
  padding:'7px 10px', border:'1px solid var(--border)', borderRadius:6,
  fontSize:12, outline:'none', background:'#fff', fontFamily:'Inter,sans-serif',
};

const SLA_TYPES = [
  { key:'LP',      label:'Load Profile SLA',        icon:'ti-bolt',           color:'#1a6bff' },
  { key:'DLP',     label:'Daily Load Profile SLA',  icon:'ti-calendar-stats', color:'#7c3aed' },
  { key:'BILLING', label:'Billing SLA',             icon:'ti-file-invoice',   color:'#d97706' },
];

// ── SVG Bar Chart — CSS keyframe animation + hover tooltip ───────────────────
function SvgBar({ data, labels, colors, height=130, max }) {
  const [mounted, setMounted] = React.useState(false);
  const [tooltip, setTooltip] = React.useState(null);
  React.useEffect(() => { const t = setTimeout(() => setMounted(true), 30); return () => clearTimeout(t); }, []);

  const w=440, pL=8, pR=8, pT=10, pB=24;
  const W=w-pL-pR, H=height-pT-pB;
  const maxV = max || Math.max(...data, 1)*1.1;
  const bW = Math.max(14, (W/data.length)*0.6);
  const gap = W/data.length;
  const col = (i) => Array.isArray(colors) ? colors[i] : (colors||'var(--accent)');

  return (
    <div style={{position:'relative'}}>
      <svg viewBox={`0 0 ${w} ${height}`} style={{width:'100%',height,display:'block'}} preserveAspectRatio="none">
        {/* Grid lines */}
        {[0.25,0.5,0.75,1].map(p=>{
          const y = pT + H - p*H;
          return <line key={p} x1={pL} y1={y} x2={w-pR} y2={y} stroke="#f0f2f5" strokeWidth="1"/>;
        })}
        {data.map((v,i)=>{
          const x = pL + i*gap + gap/2 - bW/2;
          const finalH = Math.max((v/maxV)*H, 0);
          const animH  = mounted ? finalH : 0;
          const animY  = mounted ? pT+H-finalH : pT+H;
          return (
            <g key={i}
              onMouseEnter={e=>setTooltip({i,v,x:pL+i*gap+gap/2,y:pT+H-finalH,label:labels[i]})}
              onMouseLeave={()=>setTooltip(null)}
              style={{cursor:'pointer'}}>
              {/* Bar shadow */}
              <rect x={x+2} y={animY+2} width={bW} height={animH} rx={3} fill="rgba(0,0,0,0.06)"
                style={{transition:`height ${0.5+i*0.05}s cubic-bezier(0.34,1.56,0.64,1) ${i*0.04}s, y ${0.5+i*0.05}s cubic-bezier(0.34,1.56,0.64,1) ${i*0.04}s`}}/>
              {/* Bar */}
              <rect x={x} y={animY} width={bW} height={animH} rx={3} fill={col(i)} opacity={0.88}
                style={{transition:`height ${0.5+i*0.05}s cubic-bezier(0.34,1.56,0.64,1) ${i*0.04}s, y ${0.5+i*0.05}s cubic-bezier(0.34,1.56,0.64,1) ${i*0.04}s`}}/>
              {/* Hover highlight */}
              {tooltip?.i===i && <rect x={x} y={animY} width={bW} height={animH} rx={3} fill="rgba(255,255,255,0.2)"/>}
              {/* Value label on bar */}
              {finalH>16 && mounted && <text x={x+bW/2} y={animY-3} textAnchor="middle" fontSize={7} fill={col(i)} fontWeight="700">
                {v>9999?`${(v/1000).toFixed(1)}K`:v}
              </text>}
              {/* X axis label */}
              <text x={x+bW/2} y={height-6} textAnchor="middle" fontSize={7.5} fill={tooltip?.i===i?'#334155':'#9aa0b8'} fontWeight={tooltip?.i===i?'700':'400'}>
                {labels[i]?.length>6?labels[i].slice(0,5)+'…':labels[i]}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Hover tooltip */}
      {tooltip && (
        <div style={{
          position:'absolute', pointerEvents:'none',
          left:`${(tooltip.x/440)*100}%`, top:0,
          transform:'translate(-50%,-100%)',
          background:'#1e293b', color:'#fff', borderRadius:6,
          padding:'5px 9px', fontSize:11, fontWeight:600, whiteSpace:'nowrap',
          boxShadow:'0 4px 12px rgba(0,0,0,0.2)', zIndex:10,
        }}>
          {tooltip.label}: {tooltip.v?.toLocaleString()}
          <div style={{position:'absolute',bottom:-4,left:'50%',transform:'translateX(-50%)',
            width:8,height:8,background:'#1e293b',clipPath:'polygon(0 0,100% 0,50% 100%)'}}/>
        </div>
      )}
    </div>
  );
}

// ── Donut chart — CSS animation + hover tooltip ───────────────────────────────
function SvgDonut({ data, centerValue, centerLabel, centerColor, size=100 }) {
  const [mounted, setMounted] = React.useState(false);
  const [hovered, setHovered] = React.useState(null);
  React.useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  const total = data.reduce((s,d)=>s+d.value,0)||1;
  const r=size*0.37, cx=size/2, cy=size/2, circ=2*Math.PI*r;
  let offset=0;

  return (
    <div style={{position:'relative',width:size,height:size,flexShrink:0}}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={size*0.12}/>
        {data.map((d,i)=>{
          const pct    = d.value/total;
          const finalDash = mounted ? pct*circ : 0;
          const thisDash  = hovered===i ? finalDash*1.0 : finalDash;
          const gap       = hovered===i ? circ-finalDash-2 : circ-finalDash;
          const thisOffset= -offset*circ;
          const scale     = hovered===i ? 1.06 : 1;
          offset+=pct;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={d.color}
              strokeWidth={hovered===i ? size*0.145 : size*0.12}
              strokeDasharray={`${Math.max(thisDash-1,0)} ${circ}`}
              strokeDashoffset={thisOffset}
              style={{
                transform:`rotate(-90deg) scale(${scale})`,
                transformOrigin:`${cx}px ${cy}px`,
                transition:`stroke-dasharray 0.6s cubic-bezier(0.34,1.56,0.64,1) ${i*0.08}s,
                             stroke-width 0.2s ease,
                             opacity 0.2s ease`,
                opacity: hovered!==null && hovered!==i ? 0.45 : 1,
                cursor:'pointer',
              }}
              onMouseEnter={()=>setHovered(i)}
              onMouseLeave={()=>setHovered(null)}
            />
          );
        })}
      </svg>
      {/* Center text or hover label */}
      <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',textAlign:'center',pointerEvents:'none'}}>
        {hovered!==null && data[hovered] ? (
          <>
            <div style={{fontSize:size*0.13,fontWeight:800,color:data[hovered].color,lineHeight:1}}>
              {((data[hovered].value/total)*100).toFixed(1)}%
            </div>
            <div style={{fontSize:size*0.085,color:'var(--text3)',marginTop:1}}>{data[hovered].label||''}</div>
          </>
        ) : centerValue!==undefined ? (
          <>
            <div style={{fontSize:size*0.14,fontWeight:800,color:centerColor||'var(--text)',lineHeight:1}}>{centerValue}</div>
            {centerLabel&&<div style={{fontSize:size*0.09,color:'var(--text3)',marginTop:1}}>{centerLabel}</div>}
          </>
        ) : null}
      </div>
    </div>
  );
}

// ── Horizontal bar — animated + hover ─────────────────────────────────────────
function HBar({ label, value, max, color, total }) {
  const [mounted, setMounted] = React.useState(false);
  const [hov, setHov] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);
  const pct   = max > 0 ? (value / max) * 100 : 0;
  const share = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
  return (
    <div style={{marginBottom:10,cursor:'default'}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
        <span style={{fontSize:10.5,color:hov?'var(--text)':'var(--text2)',fontWeight:hov?600:500,transition:'color .15s'}}>{label}</span>
        <span style={{fontSize:10.5,fontWeight:700,color}}>
          {value.toLocaleString()} <span style={{fontWeight:400,color:'var(--text3)',fontSize:9}}>({share}%)</span>
        </span>
      </div>
      <div style={{height:hov?10:8,background:'#eef0f5',borderRadius:4,overflow:'hidden',transition:'height .2s'}}>
        <div style={{
          width:`${mounted ? Math.min(pct,100) : 0}%`,
          height:'100%', background:color, borderRadius:4,
          transition:'width 0.7s cubic-bezier(0.34,1.56,0.64,1), opacity .2s',
          opacity: hov ? 1 : 0.85,
          boxShadow: hov ? `0 0 8px ${color}66` : 'none',
        }}/>
      </div>
    </div>
  );
}

// ── Progress bar — animated + hover ──────────────────────────────────────────
function ProgressBar({label, pct, color, sub}) {
  const [mounted, setMounted] = React.useState(false);
  const [hov, setHov]         = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);
  return (
    <div style={{marginBottom:8,cursor:'default'}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
        <span style={{fontSize:10.5,color:hov?'var(--text)':'var(--text2)',transition:'color .15s'}}>{label}</span>
        <span style={{fontSize:10.5,fontWeight:700,color}}>
          {pct}%{sub&&<span style={{fontWeight:400,color:'var(--text3)',fontSize:9,marginLeft:4}}>{sub}</span>}
        </span>
      </div>
      <div style={{height:hov?9:7,background:'#eef0f5',borderRadius:4,overflow:'hidden',transition:'height .2s'}}>
        <div style={{
          width:`${mounted ? Math.min(pct,100) : 0}%`,
          height:'100%', background:color, borderRadius:4,
          transition:'width 0.7s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: hov ? `0 0 6px ${color}88` : 'none',
        }}/>
      </div>
    </div>
  );
}

function Card({title,sub,badge,badgeClass,children,style,extra}) {
  return (
    <div className="card" style={style}>
      <div className="card-head" style={{marginBottom:'0.75rem'}}>
        <div>
          <h3>{title}</h3>
          {sub&&<div style={{fontSize:10,color:'var(--text3)',marginTop:1}}>{sub}</div>}
        </div>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          {badge&&<span className={`pill ${badgeClass||'pill-blue'}`}>{badge}</span>}
          {extra}
        </div>
      </div>
      {children}
    </div>
  );
}

// ── Loading skeleton row ──────────────────────────────────────────────────────
function LoadingRow({ cols }) {
  return (
    <tr>
      {Array.from({length:cols}).map((_,i)=>(
        <td key={i}><div style={{height:10,background:'#f1f5f9',borderRadius:4,animation:'pulse 1.5s ease-in-out infinite'}}/></td>
      ))}
    </tr>
  );
}

// ── Section loading spinner ───────────────────────────────────────────────────
function SectionLoader({ label }) {
  return (
    <div style={{padding:'2rem',textAlign:'center',color:'var(--text3)'}}>
      <i className="ti ti-loader-2" style={{fontSize:22,animation:'spin .8s linear infinite',display:'block',margin:'0 auto 8px'}}></i>
      <div style={{fontSize:11}}>{label}</div>
    </div>
  );
}


// ── Reusable Pagination ───────────────────────────────────────────────────────
function Pagination({ total, page, setPage, pageSize }) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  const start = Math.max(0, page - 2);
  const end   = Math.min(pages, start + 5);
  const nums  = Array.from({ length: end - start }, (_, i) => start + i);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:4, padding:'10px 0 2px',
      borderTop:'1px solid var(--border)', marginTop:8, flexWrap:'wrap' }}>
      <span style={{ fontSize:11, color:'var(--text3)', marginRight:4 }}>
        {page*pageSize+1}–{Math.min((page+1)*pageSize,total)} of {total.toLocaleString()}
      </span>
      <div style={{ marginLeft:'auto', display:'flex', gap:3 }}>
        <button className="btn-sm" disabled={page===0} onClick={()=>setPage(0)}
          style={{ minWidth:28, padding:'3px 6px', fontSize:11 }}>«</button>
        <button className="btn-sm" disabled={page===0} onClick={()=>setPage(p=>p-1)}
          style={{ minWidth:28, padding:'3px 6px', fontSize:11 }}>‹</button>
        {nums.map(n=>(
          <button key={n} className="btn-sm" onClick={()=>setPage(n)}
            style={{ minWidth:30, padding:'3px 6px', fontSize:11,
              background:n===page?'var(--accent)':'',
              color:n===page?'#fff':'',
              border:`1px solid ${n===page?'var(--accent)':'var(--border)'}` }}>
            {n+1}
          </button>
        ))}
        <button className="btn-sm" disabled={page>=pages-1} onClick={()=>setPage(p=>p+1)}
          style={{ minWidth:28, padding:'3px 6px', fontSize:11 }}>›</button>
        <button className="btn-sm" disabled={page>=pages-1} onClick={()=>setPage(pages-1)}
          style={{ minWidth:28, padding:'3px 6px', fontSize:11 }}>»</button>
      </div>
    </div>
  );
}

// ── Column filter input ───────────────────────────────────────────────────────
function ColFilter({ value, onChange, placeholder }) {
  return (
    <input value={value} onChange={e=>onChange(e.target.value)}
      placeholder={placeholder||'Filter…'}
      style={{ padding:'4px 8px', border:'1px solid var(--border)', borderRadius:5,
        fontSize:11, outline:'none', width:160 }}/>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Main Dashboard
// ═════════════════════════════════════════════════════════════════════════════
export default function SlaDashboard() {
  const tenantCode = getTenantCode();

  // ── Filter state ────────────────────────────────────────────────────────────
  const [slaType,    setSlaType]    = useState('LP');
  const [levelName,  setLevelName]  = useState('All');
  const [levelValue, setLevelValue] = useState(tenantCode);
  const [startDate,  setStartDate]  = useState(todayStart());
  const [endDate,    setEndDate]    = useState(todayNow());
  const [viewMode,   setViewMode]   = useState('summary');
  const [groupFilter,setGroupFilter]= useState('ALL');

  // ── Data state — each API is independent ────────────────────────────────────
  const [dailyData,  setDailyData]  = useState([]);
  const [listData,   setListData]   = useState([]);
  const [exclData,   setExclData]   = useState([]);

  const [loadingDaily, setLoadingDaily] = useState(false);
  const [loadingList,  setLoadingList]  = useState(false);
  const [loadingExcl,  setLoadingExcl]  = useState(false);

  const [errorDaily, setErrorDaily] = useState('');
  const [errorList,  setErrorList]  = useState('');
  const [errorExcl,  setErrorExcl]  = useState('');

  const [searched, setSearched] = useState(false);

  // ── Pagination ───────────────────────────────────────────────────────────────
  const [listPage,  setListPage]  = useState(0);
  const [exclPage,  setExclPage]  = useState(0);
  const PAGE = 20; // rows per page

  // ── Column filter ─────────────────────────────────────────────────────────────
  const [listFilter, setListFilter] = useState('');  // filter text
  const [exclFilter, setExclFilter] = useState('');

  // ── Abort controllers — cancel in-flight requests on new search ───────────────
  const abortRef = useRef(null);

  const toInput   = (s) => s ? s.slice(0,16).replace(' ','T') : '';
  const fromInput = (v) => v ? v.replace('T',' ')+':00' : '';

  // ── Fire all 3 APIs independently — show data as each arrives ───────────────
  const handleSearch = useCallback(async () => {
    if (!startDate || !endDate) return;

    // Cancel any in-flight requests from previous search
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    const payload = {
      levelName,
      levelValue: levelName==='All' ? tenantCode : levelValue.trim(),
      startDate,
      endDate,
    };
    const urls = APIS[slaType];

    setSearched(true);
    setGroupFilter('ALL');
    setListPage(0); setExclPage(0);
    setListFilter(''); setExclFilter('');
    // Keep previous data visible while loading — only clear loading flags
    setErrorDaily(''); setErrorList(''); setErrorExcl('');

    // ── API 1: Daily summary — typically fastest ─────────────────────────────
    setLoadingDaily(true);
    api.post(urls.daily, payload)
      .then(res => { if (!signal.aborted) { const d=res?.data??res??[]; setDailyData(Array.isArray(d)?d:[]); } })
      .catch(ex => { if (!signal.aborted) setErrorDaily(ex?.message||'Failed'); })
      .finally(() => { if (!signal.aborted) setLoadingDaily(false); });

    // ── API 2: Meter list — slow, show when ready ────────────────────────────
    setLoadingList(true);
    api.post(urls.list, payload)
      .then(res => { if (!signal.aborted) { const d=res?.data??res??[]; setListData(Array.isArray(d)?d:[]); setListPage(0); } })
      .catch(ex => { if (!signal.aborted) setErrorList(ex?.message||'Failed'); })
      .finally(() => { if (!signal.aborted) setLoadingList(false); });

    // ── API 3: Exclusion — slow, show when ready ─────────────────────────────
    setLoadingExcl(true);
    api.post(urls.excl, payload)
      .then(res => { if (!signal.aborted) { const d=res?.data??res??[]; setExclData(Array.isArray(d)?d:[]); setExclPage(0); } })
      .catch(ex => { if (!signal.aborted) setErrorExcl(ex?.message||'Failed'); })
      .finally(() => { if (!signal.aborted) setLoadingExcl(false); });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slaType, levelName, levelValue, tenantCode, startDate, endDate]);

  const handleLevelChange = (v) => {
    setLevelName(v);
    setLevelValue(v==='All' ? tenantCode : '');
  };

  const isBilling = slaType==='BILLING';
  const currentType = SLA_TYPES.find(t=>t.key===slaType);

  // ── Aggregate daily totals ───────────────────────────────────────────────────
  const agg = dailyData.reduce((a,r)=>({
    totalDevices:  a.totalDevices  + num(r.totalDevices),
    totalExpected: a.totalExpected + num(r.totalExpectedBills||r.totalExpectedSlots||r.totalExpectedRecords),
    totalReceived: a.totalReceived + num(r.totalReceivedBills||r.totalReceived||r.totalReceivedRecords),
    within8h:      a.within8h      + num(r.receivedWithin8Hours),
    within12h:     a.within12h     + num(r.receivedWithin12Hours),
    within24h:     a.within24h     + num(r.receivedWithin24Hours),
    within72h:     a.within72h     + num(r.receivedWithin72Hours),
    within168h:    a.within168h    + num(r.receivedWithin168Hours),
    after168h:     a.after168h     + num(r.receivedAfter168Hours),
  }), {totalDevices:0,totalExpected:0,totalReceived:0,within8h:0,within12h:0,within24h:0,within72h:0,within168h:0,after168h:0});

  const overallPct = agg.totalExpected>0
    ? Number(((agg.totalReceived/agg.totalExpected)*100).toFixed(1)) : 0;

  // ── Exclusion stats ──────────────────────────────────────────────────────────
  const exclTotal = exclData.length;
  // Group exclusion by group
  const exclByGroup = exclData.reduce((acc, r) => {
    const g = r.group || 'Unknown';
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});
  const exclGroups = Object.entries(exclByGroup)
    .sort((a,b) => b[1]-a[1])
    .slice(0, 8);

  // Last gasp analysis (LP/DLP only)
  const withLastGasp    = exclData.filter(r => r.lastGasp && r.lastGasp !== '1970-01-01 05:30:00').length;
  const withFirstBreath = exclData.filter(r => r.firstBreath && r.firstBreath !== '1970-01-01 05:30:00').length;
  const completelyDead  = exclData.filter(r => (!r.lastGasp || r.lastGasp === '1970-01-01 05:30:00') && (!r.firstBreath || r.firstBreath === '1970-01-01 05:30:00')).length;

  // ── List filtered by group ────────────────────────────────────────────────────
  const baseFilteredList = groupFilter==='ALL' ? listData : listData.filter(r=>r.group===groupFilter);
  const filteredList = listFilter
    ? baseFilteredList.filter(r=>(r.meterNo||'').toLowerCase().includes(listFilter.toLowerCase()) ||
        (r.group||'').toLowerCase().includes(listFilter.toLowerCase()))
    : baseFilteredList;
  const listGroups   = ['ALL', ...new Set(listData.map(r=>r.group).filter(Boolean))];

  const filteredExcl = exclFilter
    ? exclData.filter(r=>(r.meterNo||'').toLowerCase().includes(exclFilter.toLowerCase()) ||
        (r.group||'').toLowerCase().includes(exclFilter.toLowerCase()))
    : exclData;

  // Paginated slices
  const listPageData = filteredList.slice(listPage*PAGE, (listPage+1)*PAGE);
  const exclPageData = filteredExcl.slice(exclPage*PAGE, (exclPage+1)*PAGE);

  const anyLoading = loadingDaily || loadingList || loadingExcl;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="page-header">
        <h2>SLA Dashboard</h2>
        <p>Load Profile · Daily Load Profile · Billing — live data from all APIs</p>
      </div>

      {/* ── Filter + SLA type bar ── */}
      <div className="card" style={{marginBottom:12}}>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'flex-end'}}>
          <div>
            <label style={{fontSize:11,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:3}}>Level</label>
            <select style={inp} value={levelName} onChange={e=>handleLevelChange(e.target.value)}>
              <option value="All">All Meters</option>
              <option value="Meter">Specific Meter</option>
            </select>
          </div>
          {levelName==='Meter' && (
            <div>
              <label style={{fontSize:11,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:3}}>Meter No.</label>
              <input style={{...inp,width:170}} value={levelValue} placeholder="e.g. 11202122" onChange={e=>setLevelValue(e.target.value)}/>
            </div>
          )}
          <div>
            <label style={{fontSize:11,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:3}}>From</label>
            <input type="datetime-local" style={{...inp,width:175}} value={toInput(startDate)} onChange={e=>setStartDate(fromInput(e.target.value))}/>
          </div>
          <div>
            <label style={{fontSize:11,fontWeight:600,color:'var(--text2)',display:'block',marginBottom:3}}>To</label>
            <input type="datetime-local" style={{...inp,width:175}} value={toInput(endDate)} onChange={e=>setEndDate(fromInput(e.target.value))}/>
          </div>
          <button className="btn-sm btn-primary" onClick={handleSearch} disabled={anyLoading}
            style={{padding:'7px 20px',alignSelf:'flex-end',fontWeight:600}}>
            {anyLoading
              ? <><i className="ti ti-loader-2" style={{marginRight:4,animation:'spin .8s linear infinite'}}/> Loading…</>
              : <><i className="ti ti-search" style={{marginRight:4}}/>Go</>}
          </button>

          {/* ── SLA type selector — in same row as Go button ── */}
          <div style={{alignSelf:'flex-end',display:'flex',gap:4,borderLeft:'1px solid var(--border)',paddingLeft:10,marginLeft:2}}>
            {SLA_TYPES.map(t=>(
              <button key={t.key} disabled={anyLoading}
                onClick={()=>{
                  if (abortRef.current) abortRef.current.abort();
                  // Switch type then immediately trigger search with current filters
                  setSlaType(t.key);
                  setSearched(true);
                  setDailyData([]); setListData([]); setExclData([]);
                  setListPage(0); setExclPage(0); setListFilter(''); setExclFilter('');
                  setGroupFilter('ALL');
                  setErrorDaily(''); setErrorList(''); setErrorExcl('');
                  const payload = {
                    levelName,
                    levelValue: levelName==='All' ? tenantCode : levelValue.trim(),
                    startDate,
                    endDate,
                  };
                  const urls = APIS[t.key];
                  setLoadingDaily(true);
                  api.post(urls.daily, payload)
                    .then(res=>{ const d=res?.data??res??[]; setDailyData(Array.isArray(d)?d:[]); })
                    .catch(ex=>setErrorDaily(ex?.message||'Failed'))
                    .finally(()=>setLoadingDaily(false));
                  setLoadingList(true);
                  api.post(urls.list, payload)
                    .then(res=>{ const d=res?.data??res??[]; setListData(Array.isArray(d)?d:[]); setListPage(0); })
                    .catch(ex=>setErrorList(ex?.message||'Failed'))
                    .finally(()=>setLoadingList(false));
                  setLoadingExcl(true);
                  api.post(urls.excl, payload)
                    .then(res=>{ const d=res?.data??res??[]; setExclData(Array.isArray(d)?d:[]); setExclPage(0); })
                    .catch(ex=>setErrorExcl(ex?.message||'Failed'))
                    .finally(()=>setLoadingExcl(false));
                }}
                style={{
                  padding:'5px 12px', borderRadius:6, fontSize:11, fontWeight:600,
                  cursor:anyLoading?'not-allowed':'pointer',
                  display:'flex', alignItems:'center', gap:5,
                  border:`1.5px solid ${slaType===t.key?t.color:'var(--border)'}`,
                  background: slaType===t.key ? t.color : '#fff',
                  color:      slaType===t.key ? '#fff'  : 'var(--text2)',
                  transition:'all .15s', opacity: anyLoading?0.6:1,
                }}>
                <i className={`ti ${t.icon}`} style={{fontSize:11}}/>{t.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* ── Empty state ── */}
      {!searched && (
        <div className="card" style={{textAlign:'center',padding:'4rem 1rem',color:'var(--text3)'}}>
          <i className={`ti ${currentType.icon}`} style={{fontSize:40,display:'block',marginBottom:12,opacity:.2,color:currentType.color}}/>
          <div style={{fontSize:13,marginBottom:4}}>Select filters and click <strong>Go</strong></div>
          <div style={{fontSize:11}}>All 3 data sets (summary, meter list, exclusion) load independently — results appear as each completes.</div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SUMMARY VIEW
         ══════════════════════════════════════════════════════════════════════ */}
      {searched && viewMode==='summary' && (
        <>
          {/* KPI row — shows immediately when daily data arrives */}
          {loadingDaily ? (
            <div className="card" style={{marginBottom:12}}>
              <SectionLoader label="Loading summary data…"/>
            </div>
          ) : errorDaily ? (
            <div className="card" style={{marginBottom:12,color:'#dc2626',fontSize:12,padding:'1rem'}}>
              <i className="ti ti-alert-circle" style={{marginRight:5}}/>{errorDaily}
            </div>
          ) : (
            <>
              {/* KPI cards + View toggle — same row */}
              <div style={{display:'flex',gap:8,marginBottom:12,alignItems:'stretch',flexWrap:'wrap'}}>

                {/* KPI stat cards */}
                {[
                  ['Total Devices',  agg.totalDevices.toLocaleString(),  currentType.color, 'ti-device-analytics'],
                  ['Expected',       agg.totalExpected.toLocaleString(), '#64748b',         'ti-file-check'],
                  ['Received',       agg.totalReceived.toLocaleString(), '#16a34a',         'ti-circle-check'],
                  ['Overall SLA %',  `${overallPct}%`,                   pctColor(overallPct),'ti-chart-pie'],
                  ['Not Received',   (agg.totalExpected-agg.totalReceived).toLocaleString(),'#dc2626','ti-circle-x'],
                  ...(!loadingExcl && exclData.length>0 ? [['Exclusions', exclData.length.toLocaleString(),'#f59e0b','ti-alert-triangle']] : []),
                ].map(([l,v,c,icon])=>(
                  <div key={l} className="card" style={{borderBottom:`3px solid ${c}`,padding:'10px 12px',flex:'1 1 110px',minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:32,height:32,borderRadius:8,background:`${c}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,color:c,flexShrink:0}}>
                        <i className={`ti ${icon}`}/>
                      </div>
                      <div style={{minWidth:0}}>
                        <div style={{fontSize:10,color:'var(--text3)',whiteSpace:'nowrap'}}>{l}</div>
                        <div style={{fontSize:15,fontWeight:800,color:c,lineHeight:1.2}}>{v}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* View toggle card — same height as KPI cards */}
                <div className="card" style={{
                  borderBottom:`3px solid ${currentType.color}`,
                  padding:'10px 12px', display:'flex', flexDirection:'column',
                  justifyContent:'center', gap:5, flexShrink:0,
                }}>
                  <div style={{fontSize:10,color:'var(--text3)',fontWeight:600,marginBottom:2}}>View</div>
                  <div style={{display:'flex',gap:4}}>
                    {[
                      {k:'summary', icon:'ti-layout-grid',    label:'Summary'},
                      {k:'list',    icon:'ti-list',           label:'List'},
                      {k:'excl',    icon:'ti-alert-triangle', label:'Exclusion'},
                    ].map(m=>(
                      <button key={m.k}
                        onClick={()=>setViewMode(m.k)}
                        style={{
                          padding:'5px 11px', borderRadius:6, fontSize:11, fontWeight:600,
                          cursor:'pointer', display:'flex', alignItems:'center', gap:4,
                          border:`1.5px solid ${viewMode===m.k ? currentType.color : 'var(--border)'}`,
                          background: viewMode===m.k ? currentType.color : '#fff',
                          color:      viewMode===m.k ? '#fff' : 'var(--text2)',
                          transition:'all .15s', whiteSpace:'nowrap',
                        }}>
                        <i className={`ti ${m.icon}`} style={{fontSize:11}}/>
                        {m.label}
                        {m.k==='list' && loadingList && (
                          <i className="ti ti-loader-2" style={{fontSize:9,animation:'spin .8s linear infinite'}}/>
                        )}
                        {m.k==='list' && !loadingList && listData.length>0 && (
                          <span style={{
                            background:viewMode==='list'?'rgba(255,255,255,0.3)':'#e2e8f0',
                            color:viewMode==='list'?'#fff':'#475569',
                            borderRadius:10,padding:'0 5px',fontSize:8,fontWeight:700,
                          }}>{listData.length}</span>
                        )}
                        {m.k==='excl' && loadingExcl && (
                          <i className="ti ti-loader-2" style={{fontSize:9,animation:'spin .8s linear infinite'}}/>
                        )}
                        {m.k==='excl' && !loadingExcl && exclData.length>0 && (
                          <span style={{
                            background:viewMode==='excl'?'rgba(255,255,255,0.3)':'#fee2e2',
                            color:viewMode==='excl'?'#fff':'#dc2626',
                            borderRadius:10,padding:'0 5px',fontSize:8,fontWeight:700,
                          }}>{exclData.length}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

                            {/* Charts row */}
              <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr 1fr',gap:10,marginBottom:10}}>

                {/* Group SLA bar */}
                <Card title="Group-wise SLA %" sub={`${dailyData.length} groups — ${currentType.label}`}>
                  {dailyData.length===0
                    ? <div style={{textAlign:'center',padding:'2rem',color:'var(--text3)',fontSize:12}}>No data for selected range</div>
                    : <>
                        <SvgBar
                          height={130}
                          data={dailyData.map(r=>Number((r.overallBillingPercentage||r.overallReceivedPercentage||0).toFixed(1)))}
                          labels={dailyData.map(r=>r.group||'N/A')}
                          colors={dailyData.map(r=>pctColor(r.overallBillingPercentage||r.overallReceivedPercentage||0))}
                          max={100}
                        />
                        <div style={{marginTop:6}}>
                          {dailyData.map((r,i)=>(
                            <ProgressBar key={i}
                              label={`Group ${r.group||'N/A'}`}
                              pct={Number((r.overallBillingPercentage||r.overallReceivedPercentage||0).toFixed(1))}
                              color={pctColor(r.overallBillingPercentage||r.overallReceivedPercentage||0)}
                              sub={`${(r.totalReceivedBills||r.totalReceived||r.totalReceivedRecords||0).toLocaleString()} / ${(r.totalExpectedBills||r.totalExpectedSlots||r.totalExpectedRecords||0).toLocaleString()}`}
                            />
                          ))}
                        </div>
                      </>
                  }
                </Card>

                {/* Overall donut */}
                <Card title="Overall SLA" sub="Received vs Not Received">
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
                    <SvgDonut size={108}
                      centerValue={`${overallPct}%`} centerLabel="SLA"
                      centerColor={pctColor(overallPct)}
                      data={[
                        {value:agg.totalReceived,color:currentType.color},
                        {value:Math.max(0,agg.totalExpected-agg.totalReceived),color:'#e2e8f0'},
                      ]}
                    />
                    <div style={{width:'100%'}}>
                      {[
                        ['Received',     agg.totalReceived,                          currentType.color],
                        ['Not Received', agg.totalExpected-agg.totalReceived,        '#94a3b8'],
                      ].map(([l,v,c])=>(
                        <div key={l} style={{display:'flex',alignItems:'center',gap:6,marginBottom:5}}>
                          <span style={{width:8,height:8,borderRadius:'50%',background:c,display:'inline-block',flexShrink:0}}/>
                          <span style={{fontSize:10.5,color:'var(--text2)',flex:1}}>{l}</span>
                          <span style={{fontSize:10.5,fontWeight:600,color:c}}>{v.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Time windows */}
                <Card title="SLA Time Windows" sub="Reception timing">
                  {isBilling ? (
                    <>
                      <ProgressBar label="Within 72h"  pct={agg.totalExpected>0?Number(((agg.within72h/agg.totalExpected)*100).toFixed(1)):0}  color="#16a34a" sub={`${agg.within72h.toLocaleString()} of ${agg.totalExpected.toLocaleString()}`}/>
                      <ProgressBar label="Within 168h" pct={agg.totalExpected>0?Number(((agg.within168h/agg.totalExpected)*100).toFixed(1)):0} color="#d97706" sub={`${agg.within168h.toLocaleString()} of ${agg.totalExpected.toLocaleString()}`}/>
                      <ProgressBar label="After 168h"  pct={agg.totalExpected>0?Number(((agg.after168h/agg.totalExpected)*100).toFixed(1)):0}  color="#dc2626" sub={`${agg.after168h.toLocaleString()} of ${agg.totalExpected.toLocaleString()}`}/>
                    </>
                  ) : (
                    <>
                      <ProgressBar label="Within 8h"  pct={agg.totalExpected>0?Number(((agg.within8h/agg.totalExpected)*100).toFixed(1)):0}  color="#16a34a" sub={`${agg.within8h.toLocaleString()} of ${agg.totalExpected.toLocaleString()}`}/>
                      <ProgressBar label="Within 12h" pct={agg.totalExpected>0?Number(((agg.within12h/agg.totalExpected)*100).toFixed(1)):0} color="#0d9488" sub={`${agg.within12h.toLocaleString()} of ${agg.totalExpected.toLocaleString()}`}/>
                      <ProgressBar label="Within 24h" pct={agg.totalExpected>0?Number(((agg.within24h/agg.totalExpected)*100).toFixed(1)):0} color="#d97706" sub={`${agg.within24h.toLocaleString()} of ${agg.totalExpected.toLocaleString()}`}/>
                    </>
                  )}
                  <div style={{marginTop:10,padding:'8px 10px',background:'#f8fafc',borderRadius:6,fontSize:10,color:'var(--text3)'}}>
                    {agg.totalReceived.toLocaleString()} of {agg.totalExpected.toLocaleString()} received
                  </div>
                </Card>
              </div>

              {/* Group table */}
              <Card title="Group Summary Table" sub={`${dailyData.length} groups`}>
                <div style={{overflowX:'auto'}}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Group</th><th>Devices</th><th>Expected</th><th>Received</th>
                        {!isBilling&&<><th>8h</th><th>12h</th><th>24h</th></>}
                        {isBilling &&<><th>72h</th><th>168h</th><th>After 168h</th></>}
                        <th>SLA %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyData.map((r,i)=>{
                        const pct = r.overallBillingPercentage||r.overallReceivedPercentage||0;
                        return (
                          <tr key={i}>
                            <td style={{fontWeight:600}}>{r.group||'—'}</td>
                            <td>{num(r.totalDevices).toLocaleString()}</td>
                            <td>{num(r.totalExpectedBills||r.totalExpectedSlots||r.totalExpectedRecords).toLocaleString()}</td>
                            <td style={{color:'#16a34a',fontWeight:600}}>{num(r.totalReceivedBills||r.totalReceived||r.totalReceivedRecords||r.billingReceived).toLocaleString()}</td>
                            {!isBilling&&<><td>{num(r.receivedWithin8Hours).toLocaleString()}</td><td>{num(r.receivedWithin12Hours).toLocaleString()}</td><td>{num(r.receivedWithin24Hours).toLocaleString()}</td></>}
                            {isBilling &&<><td>{num(r.within72Hours??r.receivedWithin72Hours).toLocaleString()}</td><td>{num(r.within168Hours??r.receivedWithin168Hours).toLocaleString()}</td><td style={{color:'#dc2626'}}>{num(r.after168Hours??r.receivedAfter168Hours).toLocaleString()}</td></>}
                            <td><span className={`pill ${pctPill(pct)}`} style={{fontSize:10}}>{Number(pct).toFixed(1)}%</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          METER LIST VIEW
         ══════════════════════════════════════════════════════════════════════ */}
      {searched && viewMode==='list' && (
        <>
          {/* KPI cards + View toggle — same style as Summary */}
          <div style={{display:'flex',gap:8,marginBottom:12,alignItems:'stretch',flexWrap:'wrap'}}>
            {/* List KPI cards */}
            {(()=>{
              const total    = filteredList.length;
              const complete = filteredList.filter(r=>{ const rv=num(r.totalReceived||r.totalReceivedBills||r.billingReceived); const ex=num(r.totalExpectedSlots||r.totalExpectedBills||1); return rv>0&&rv>=ex; }).length;
              const partial  = filteredList.filter(r=>{ const rv=num(r.totalReceived||r.totalReceivedBills||r.billingReceived); const ex=num(r.totalExpectedSlots||r.totalExpectedBills||1); return rv>0&&rv<ex; }).length;
              const missing  = filteredList.filter(r=>num(r.totalReceived||r.totalReceivedBills||r.billingReceived)===0).length;
              return [
                ['Total Meters',    total,    currentType.color, 'ti-devices'],
                ['Complete (100%)', complete, '#16a34a',         'ti-circle-check'],
                ['Partial',         partial,  '#d97706',         'ti-circle-half'],
                ['Missing (0%)',    missing,  '#dc2626',         'ti-circle-x'],
              ].map(([l,v,c,icon])=>(
                <div key={l} className="card" style={{borderBottom:`3px solid ${c}`,padding:'10px 12px',flex:'1 1 110px',minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:32,height:32,borderRadius:8,background:`${c}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,color:c,flexShrink:0}}>
                      <i className={`ti ${icon}`}/>
                    </div>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:10,color:'var(--text3)',whiteSpace:'nowrap'}}>{l}</div>
                      <div style={{fontSize:15,fontWeight:800,color:c,lineHeight:1.2}}>{typeof v==='number'?v.toLocaleString():v}</div>
                    </div>
                  </div>
                </div>
              ));
            })()}
                {/* View toggle card — same as summary */}
                <div className="card" style={{
                  borderBottom:`3px solid ${currentType.color}`,
                  padding:'10px 12px', display:'flex', flexDirection:'column',
                  justifyContent:'center', gap:5, flexShrink:0,
                }}>
                  <div style={{fontSize:10,color:'var(--text3)',fontWeight:600,marginBottom:2}}>View</div>
                  <div style={{display:'flex',gap:4}}>
                    {[
                      {k:'summary', icon:'ti-layout-grid',    label:'Summary'},
                      {k:'list',    icon:'ti-list',           label:'List'},
                      {k:'excl',    icon:'ti-alert-triangle', label:'Exclusion'},
                    ].map(m=>(
                      <button key={m.k}
                        onClick={()=>setViewMode(m.k)}
                        style={{
                          padding:'5px 11px', borderRadius:6, fontSize:11, fontWeight:600,
                          cursor:'pointer', display:'flex', alignItems:'center', gap:4,
                          border:`1.5px solid ${viewMode===m.k ? currentType.color : 'var(--border)'}`,
                          background: viewMode===m.k ? currentType.color : '#fff',
                          color:      viewMode===m.k ? '#fff' : 'var(--text2)',
                          transition:'all .15s', whiteSpace:'nowrap',
                        }}>
                        <i className={`ti ${m.icon}`} style={{fontSize:11}}/>
                        {m.label}
                        {m.k==='list' && loadingList && <i className="ti ti-loader-2" style={{fontSize:9,animation:'spin .8s linear infinite'}}/>}
                        {m.k==='list' && !loadingList && listData.length>0 && (
                          <span style={{background:viewMode==='list'?'rgba(255,255,255,0.3)':'#e2e8f0',color:viewMode==='list'?'#fff':'#475569',borderRadius:10,padding:'0 5px',fontSize:8,fontWeight:700}}>{listData.length}</span>
                        )}
                        {m.k==='excl' && loadingExcl && <i className="ti ti-loader-2" style={{fontSize:9,animation:'spin .8s linear infinite'}}/>}
                        {m.k==='excl' && !loadingExcl && exclData.length>0 && (
                          <span style={{background:viewMode==='excl'?'rgba(255,255,255,0.3)':'#fee2e2',color:viewMode==='excl'?'#fff':'#dc2626',borderRadius:10,padding:'0 5px',fontSize:8,fontWeight:700}}>{exclData.length}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
          </div>
          {loadingList ? (
            <Card title="Meter List">
              <SectionLoader label="Fetching meter-wise SLA data… (this may take a moment)"/>
              <div style={{overflowX:'auto',marginTop:8}}>
                <table className="data-table">
                  <thead><tr><th>Meter No.</th><th>Group</th><th>Expected</th><th>Received</th><th>SLA %</th><th>Status</th></tr></thead>
                  <tbody>{Array.from({length:5}).map((_,i)=><LoadingRow key={i} cols={6}/>)}</tbody>
                </table>
              </div>
            </Card>
          ) : errorList ? (
            <div className="card" style={{color:'#dc2626',fontSize:12,padding:'1rem'}}>
              <i className="ti ti-alert-circle" style={{marginRight:5}}/>{errorList}
            </div>
          ) : (
            <>
              {/* Filter row */}
              <div style={{display:'flex',gap:6,marginBottom:8,flexWrap:'wrap',alignItems:'center'}}>
                <ColFilter value={listFilter} onChange={v=>{setListFilter(v);setListPage(0);}} placeholder="Filter meter no or group…"/>
                <div style={{width:1,height:20,background:'var(--border)',margin:'0 2px'}}/>
                <span style={{fontSize:11,fontWeight:600,color:'var(--text2)'}}>Group:</span>
                {listGroups.map(g=>(
                  <button key={g} className="btn-sm" onClick={()=>{setGroupFilter(g);setListPage(0);}}
                    style={{background:groupFilter===g?currentType.color:'',color:groupFilter===g?'#fff':'',
                            border:`1px solid ${groupFilter===g?currentType.color:'var(--border)'}`,fontWeight:groupFilter===g?600:400}}>
                    {g==='ALL'?'All':g}
                  </button>
                ))}
                <span style={{marginLeft:'auto',fontSize:11,color:'var(--text3)'}}>
                  <strong>{filteredList.length.toLocaleString()}</strong> meters
                  {listFilter && <span style={{color:currentType.color,marginLeft:4}}>filtered</span>}
                </span>
              </div>



              <Card title="Meter-wise SLA" sub={`${filteredList.length} meters${groupFilter!=='ALL'?` — Group ${groupFilter}`:''}`}>
                {filteredList.length===0
                  ? <div style={{textAlign:'center',padding:'2rem',color:'var(--text3)',fontSize:12}}>No meters</div>
                  : <div style={{overflowX:'auto'}}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Meter No.</th><th>Group</th>
                            {!isBilling&&<th>Type</th>}
                            <th>Expected</th><th>Received</th><th>SLA %</th>
                            {!isBilling&&<><th>8h</th><th>12h</th><th>24h</th></>}
                            {isBilling &&<><th>72h</th><th>168h</th></>}
                            {!isBilling&&<><th>Last Gasp</th><th>First Breath</th></>}
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {listPageData.map((r,i)=>{
                            const expected = num(r.totalExpectedSlots||r.totalExpectedBills||1);
                            const received = num(r.totalReceived||r.totalReceivedBills||r.billingReceived||0);
                            const slaPct   = expected>0?Number(((received/expected)*100).toFixed(1)):0;
                            const status   = slaPct===100?'Complete':received===0?'Missing':'Partial';
                            const sCls     = slaPct===100?'pill-green':received===0?'pill-red':'pill-amber';
                            return (
                              <tr key={listPage*PAGE+i}>
                                <td style={{fontWeight:500}}>{r.meterNo||'—'}</td>
                                <td><span className="pill pill-blue" style={{fontSize:9}}>{r.group||'—'}</span></td>
                                {!isBilling&&<td style={{fontSize:11,color:'var(--text3)'}}>{r.meterType||'—'}</td>}
                                <td>{expected}</td>
                                <td style={{color:'#16a34a',fontWeight:600}}>{received}</td>
                                <td><span className={`pill ${pctPill(slaPct)}`} style={{fontSize:9}}>{slaPct}%</span></td>
                                {!isBilling&&<><td>{r.receivedWithin8Hours??'—'}</td><td>{r.receivedWithin12Hours??'—'}</td><td>{r.receivedWithin24Hours??'—'}</td></>}
                                {isBilling &&<><td>{r.within72Hours??r.receivedWithin72Hours??'—'}</td><td>{r.within168Hours??r.receivedWithin168Hours??'—'}</td></>}
                                {!isBilling&&(
                                  <>
                                    <td style={{fontSize:10,color:'var(--text3)'}}>{r.lastGasp&&r.lastGasp!=='1970-01-01 05:30:00'?r.lastGasp:'—'}</td>
                                    <td style={{fontSize:10,color:'var(--text3)'}}>{r.firstBreath&&r.firstBreath!=='1970-01-01 05:30:00'?r.firstBreath:'—'}</td>
                                  </>
                                )}
                                <td><span className={`pill ${sCls}`} style={{fontSize:9}}>{status}</span></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <Pagination total={filteredList.length} page={listPage} setPage={setListPage} pageSize={PAGE}/>
                    </div>
                }
              </Card>
            </>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          EXCLUSION VIEW
         ══════════════════════════════════════════════════════════════════════ */}
      {searched && viewMode==='excl' && (
        <>
          {/* Exclusion KPI cards + View toggle — same style as Summary */}
          <div style={{display:'flex',gap:8,marginBottom:12,alignItems:'stretch',flexWrap:'wrap'}}>
            {/* Excl KPI cards */}
            {[
              ['Total Excluded',  exclTotal,        '#dc2626', 'ti-alert-triangle'],
              ...(!isBilling ? [
                ['Last Gasp',     withLastGasp,     '#f59e0b', 'ti-activity-heartbeat'],
                ['First Breath',  withFirstBreath,  '#0d9488', 'ti-heart-rate-monitor'],
                ['No Events',     completelyDead,   '#94a3b8', 'ti-device-mobile-off'],
              ] : [
                ['Not Billed',    exclTotal,        '#dc2626', 'ti-receipt-off'],
              ]),
            ].map(([l,v,c,icon])=>(
              <div key={l} className="card" style={{borderBottom:`3px solid ${c}`,padding:'10px 12px',flex:'1 1 110px',minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:32,height:32,borderRadius:8,background:`${c}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,color:c,flexShrink:0}}>
                    <i className={`ti ${icon}`}/>
                  </div>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:10,color:'var(--text3)',whiteSpace:'nowrap'}}>{l}</div>
                    <div style={{fontSize:15,fontWeight:800,color:c,lineHeight:1.2}}>{typeof v==='number'?v.toLocaleString():v}</div>
                  </div>
                </div>
              </div>
            ))}
                {/* View toggle card — same as summary */}
                <div className="card" style={{
                  borderBottom:`3px solid ${currentType.color}`,
                  padding:'10px 12px', display:'flex', flexDirection:'column',
                  justifyContent:'center', gap:5, flexShrink:0,
                }}>
                  <div style={{fontSize:10,color:'var(--text3)',fontWeight:600,marginBottom:2}}>View</div>
                  <div style={{display:'flex',gap:4}}>
                    {[
                      {k:'summary', icon:'ti-layout-grid',    label:'Summary'},
                      {k:'list',    icon:'ti-list',           label:'List'},
                      {k:'excl',    icon:'ti-alert-triangle', label:'Exclusion'},
                    ].map(m=>(
                      <button key={m.k}
                        onClick={()=>setViewMode(m.k)}
                        style={{
                          padding:'5px 11px', borderRadius:6, fontSize:11, fontWeight:600,
                          cursor:'pointer', display:'flex', alignItems:'center', gap:4,
                          border:`1.5px solid ${viewMode===m.k ? currentType.color : 'var(--border)'}`,
                          background: viewMode===m.k ? currentType.color : '#fff',
                          color:      viewMode===m.k ? '#fff' : 'var(--text2)',
                          transition:'all .15s', whiteSpace:'nowrap',
                        }}>
                        <i className={`ti ${m.icon}`} style={{fontSize:11}}/>
                        {m.label}
                        {m.k==='list' && loadingList && <i className="ti ti-loader-2" style={{fontSize:9,animation:'spin .8s linear infinite'}}/>}
                        {m.k==='list' && !loadingList && listData.length>0 && (
                          <span style={{background:viewMode==='list'?'rgba(255,255,255,0.3)':'#e2e8f0',color:viewMode==='list'?'#fff':'#475569',borderRadius:10,padding:'0 5px',fontSize:8,fontWeight:700}}>{listData.length}</span>
                        )}
                        {m.k==='excl' && loadingExcl && <i className="ti ti-loader-2" style={{fontSize:9,animation:'spin .8s linear infinite'}}/>}
                        {m.k==='excl' && !loadingExcl && exclData.length>0 && (
                          <span style={{background:viewMode==='excl'?'rgba(255,255,255,0.3)':'#fee2e2',color:viewMode==='excl'?'#fff':'#dc2626',borderRadius:10,padding:'0 5px',fontSize:8,fontWeight:700}}>{exclData.length}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
          </div>
          {loadingExcl ? (
            <Card title="Exclusion Analysis">
              <SectionLoader label="Fetching exclusion data… (meters with incomplete/missing SLA)"/>
              <div style={{overflowX:'auto',marginTop:8}}>
                <table className="data-table">
                  <thead><tr><th>Meter No.</th><th>Group</th><th>Received</th><th>Last Gasp</th><th>First Breath</th></tr></thead>
                  <tbody>{Array.from({length:5}).map((_,i)=><LoadingRow key={i} cols={5}/>)}</tbody>
                </table>
              </div>
            </Card>
          ) : errorExcl ? (
            <div className="card" style={{color:'#dc2626',fontSize:12,padding:'1rem'}}>
              <i className="ti ti-alert-circle" style={{marginRight:5}}/>{errorExcl}
            </div>
          ) : exclData.length===0 ? (
            <div className="card" style={{textAlign:'center',padding:'3rem',color:'var(--text3)'}}>
              <i className="ti ti-circle-check" style={{fontSize:36,display:'block',marginBottom:10,color:'#16a34a',opacity:.5}}/>
              <div style={{fontSize:13,fontWeight:600,color:'#16a34a'}}>No exclusions!</div>
              <div style={{fontSize:11,marginTop:4}}>All meters have received their expected data.</div>
            </div>
          ) : (
            <>


              {/* Charts */}
              <div style={{display:'grid',gridTemplateColumns:'1.3fr 1fr',gap:10,marginBottom:10}}>

                {/* Exclusion by group — horizontal bars */}
                <Card title="Exclusions by Group" sub="Top groups with missing data">
                  {exclGroups.length===0
                    ? <div style={{textAlign:'center',padding:'1.5rem',color:'var(--text3)',fontSize:12}}>No group data</div>
                    : exclGroups.map(([g,cnt],i)=>(
                        <HBar key={g} label={`Group ${g}`} value={cnt}
                          max={exclGroups[0][1]} total={exclTotal}
                          color={i===0?'#dc2626':i===1?'#f59e0b':'#94a3b8'}/>
                      ))
                  }
                  <div style={{marginTop:8,fontSize:10,color:'var(--text3)',textAlign:'right'}}>
                    Total exclusions: <strong>{exclTotal.toLocaleString()}</strong>
                  </div>
                </Card>

                {/* Exclusion breakdown donut — LP/DLP only */}
                {!isBilling ? (
                  <Card title="Event Status Breakdown" sub="For excluded meters">
                    <div style={{display:'flex',alignItems:'center',gap:14}}>
                      <SvgDonut size={100}
                        centerValue={exclTotal}
                        centerLabel="Excluded"
                        centerColor="#dc2626"
                        data={[
                          {value:withLastGasp,    color:'#f59e0b'},
                          {value:withFirstBreath, color:'#0d9488'},
                          {value:Math.max(0,completelyDead), color:'#e2e8f0'},
                        ]}
                      />
                      <div style={{flex:1}}>
                        {[
                          ['Last Gasp',     withLastGasp,    '#f59e0b', 'Meter went offline'],
                          ['First Breath',  withFirstBreath, '#0d9488', 'Meter came back online'],
                          ['No Events',     completelyDead,  '#94a3b8', 'No event data at all'],
                        ].map(([l,v,c,sub])=>(
                          <div key={l} style={{display:'flex',alignItems:'flex-start',gap:6,marginBottom:7}}>
                            <span style={{width:8,height:8,borderRadius:'50%',background:c,flexShrink:0,marginTop:2,display:'inline-block'}}/>
                            <div style={{flex:1}}>
                              <div style={{fontSize:10.5,color:'var(--text2)',fontWeight:500}}>{l} <span style={{fontWeight:700,color:c}}>{v.toLocaleString()}</span></div>
                              <div style={{fontSize:9,color:'var(--text3)'}}>{sub}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card title="Not Billed Overview" sub="Meters that missed billing">
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
                      <SvgDonut size={100}
                        centerValue={exclTotal.toLocaleString()}
                        centerLabel="Not Billed"
                        centerColor="#dc2626"
                        data={[
                          {value:exclTotal,color:'#dc2626'},
                          {value:Math.max(0,(agg.totalDevices||exclTotal*3)-exclTotal),color:'#e2e8f0'},
                        ]}
                      />
                      <div style={{fontSize:11,color:'var(--text3)',textAlign:'center'}}>
                        {exclTotal.toLocaleString()} meters did not receive billing data in the selected period.
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Exclusion table */}
              {/* Exclusion filter */}
              <div style={{display:'flex',gap:8,marginBottom:8,alignItems:'center',flexWrap:'wrap'}}>
                <ColFilter value={exclFilter} onChange={v=>{setExclFilter(v);setExclPage(0);}} placeholder="Filter meter no or group…"/>
                <span style={{fontSize:11,color:'var(--text3)',marginLeft:'auto'}}>
                  <strong>{filteredExcl.length.toLocaleString()}</strong> exclusions
                  {exclFilter && <span style={{color:'#dc2626',marginLeft:4}}>filtered</span>}
                </span>
              </div>
              <Card title="Excluded Meters Detail" sub={`${filteredExcl.length} meters`}>
                <div style={{overflowX:'auto'}}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Meter No.</th><th>Group</th>
                        {!isBilling&&<th>Type</th>}
                        <th>Expected</th><th>Received</th>
                        {!isBilling&&<><th>8h</th><th>12h</th><th>24h</th></>}
                        {isBilling &&<><th>72h</th><th>168h</th><th>After 168h</th></>}
                        {!isBilling&&<><th>Last Gasp</th><th>First Breath</th></>}
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exclPageData.map((r,i)=>{
                        const hasLastGasp    = r.lastGasp    && r.lastGasp    !== '1970-01-01 05:30:00';
                        const hasFirstBreath = r.firstBreath && r.firstBreath !== '1970-01-01 05:30:00';
                        const reason = !isBilling
                          ? (hasLastGasp && hasFirstBreath ? 'Last Gasp + Came Back'
                            : hasLastGasp    ? 'Last Gasp (offline)'
                            : hasFirstBreath ? 'First Breath only'
                            : 'No events — check device')
                          : 'Billing not received';
                        const reasonColor = hasLastGasp ? '#f59e0b' : hasFirstBreath ? '#0d9488' : '#94a3b8';
                        return (
                          <tr key={i}>
                            <td style={{fontWeight:500}}>{r.meterNo||'—'}</td>
                            <td><span className="pill pill-red" style={{fontSize:9}}>{r.group||'—'}</span></td>
                            {!isBilling&&<td style={{fontSize:11,color:'var(--text3)'}}>{r.meterType||'—'}</td>}
                            <td>{num(r.totalExpectedSlots||r.totalExpected||1)}</td>
                            <td style={{color:'#dc2626',fontWeight:600}}>{num(r.totalReceived||r.billingReceived)}</td>
                            {!isBilling&&<><td>{r.receivedWithin8Hours??'—'}</td><td>{r.receivedWithin12Hours??'—'}</td><td>{r.receivedWithin24Hours??'—'}</td></>}
                            {isBilling &&<><td>{r.within72Hours??'—'}</td><td>{r.within168Hours??'—'}</td><td style={{color:'#dc2626'}}>{r.after168Hours??'—'}</td></>}
                            {!isBilling&&(
                              <>
                                <td style={{fontSize:10,color:hasLastGasp?'#f59e0b':'var(--text3)'}}>{hasLastGasp?r.lastGasp:'—'}</td>
                                <td style={{fontSize:10,color:hasFirstBreath?'#0d9488':'var(--text3)'}}>{hasFirstBreath?r.firstBreath:'—'}</td>
                              </>
                            )}
                            <td>
                              <span style={{fontSize:9,fontWeight:500,color:reasonColor,
                                background:`${reasonColor}18`,padding:'2px 6px',borderRadius:4,whiteSpace:'nowrap'}}>
                                {reason}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <Pagination total={filteredExcl.length} page={exclPage} setPage={setExclPage} pageSize={PAGE}/>
                </div>
              </Card>
            </>
          )}
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
      `}</style>
    </>
  );
}