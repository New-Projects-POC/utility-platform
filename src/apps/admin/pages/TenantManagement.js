import React, { useState, useEffect } from 'react';
import { authApi } from '../../../shared/utils/api';
import { useAuth } from '../../../auth/AuthContext';

export default function TenantManagement() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  const isPlatform = user?.tenantCode === 'PLATFORM' && user?.roles?.includes('SUPER_ADMIN');

  useEffect(() => {
    if (!isPlatform) return;
    authApi.getTenants(0, 50).then(r => {
      setTenants(r?.data?.content || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isPlatform]);

  if (!isPlatform) {
    return (
      <div className="card" style={{ textAlign:'center', padding:'3rem', color:'var(--text3)' }}>
        <i className="ti ti-lock" style={{ fontSize:32, marginBottom:10, display:'block' }}></i>
        Tenant management is only available for platform administrators.
      </div>
    );
  }

  return (
    <div>
      <div className="page-header"><h2>Tenant Management</h2><p>All client tenants on the platform</p></div>
      <div className="section-card">
        {loading ? <div style={{ padding:'2rem', textAlign:'center', color:'var(--text3)' }}>Loading…</div> : (
          <table className="data-table">
            <thead><tr><th>Tenant</th><th>Code</th><th>Modules</th><th>Users</th><th>Status</th></tr></thead>
            <tbody>
              {tenants.map(t => (
                <tr key={t.id} className="data-row">
                  <td style={{ fontWeight:600, fontSize:12 }}>{t.tenantName}</td>
                  <td><code style={{ fontSize:10, background:'#f1f5f9', padding:'2px 6px', borderRadius:4 }}>{t.tenantCode}</code></td>
                  <td>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
                      {(t.allowedModules||[]).map(m => (
                        <span key={m} style={{ fontSize:9, padding:'2px 6px', borderRadius:20, background:'#eff6ff', color:'#1a6bff', border:'1px solid #dbeafe', fontWeight:600 }}>{m}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontSize:12 }}>{t.currentUsers}</td>
                  <td>
                    <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, fontWeight:600,
                      background:t.status==='ACTIVE'?'#f0fdf4':'#fef2f2',
                      color:t.status==='ACTIVE'?'#16a34a':'#dc2626',
                      border:`1px solid ${t.status==='ACTIVE'?'#bbf7d0':'#fecaca'}` }}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
