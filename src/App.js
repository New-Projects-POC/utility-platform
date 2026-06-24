import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, SERVICE_META, isSuperAdmin, isAdmin } from './auth/AuthContext';
import LoginPage from './shared/components/LoginPage';
import HesApp    from './apps/hes/HesApp';
import MdmApp    from './apps/mdm/MdmApp';
import WfmApp    from './apps/wfm/WfmApp';
import { BillingApp, ConsumerApp } from './apps/billing/BillingConsumerApps';
import AdminApp  from './apps/admin/AdminApp';
import './shared/styles/global.css';

function LoadingScreen() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#050d1a', flexDirection:'column', gap:16 }}>
      <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#1a6bff,#0a3db0)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(26,107,255,0.4)' }}>
        <i className="ti ti-bolt" style={{ fontSize:22, color:'#fff' }}></i>
      </div>
      <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', fontFamily:"'Inter',sans-serif" }}>Restoring session…</div>
    </div>
  );
}

function ProtectedRoute({ children, service }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (service && !user.services.includes(service)) {
    const roles = user.roles || [];
    if (isSuperAdmin(roles) || isAdmin(roles)) return <Navigate to="/admin" replace />;
    const first = user.services[0];
    const meta  = first ? SERVICE_META[first] : null;
    return <Navigate to={meta ? meta.path : '/login'} replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  const roles = user.roles || [];
  if (!isSuperAdmin(roles) && !isAdmin(roles)) {
    const first = user.services[0];
    const meta  = first ? SERVICE_META[first] : null;
    return <Navigate to={meta ? meta.path : '/login'} replace />;
  }
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  const roles = user.roles || [];
  // SUPER_ADMIN and admins go to admin panel first
  if (isSuperAdmin(roles) || isAdmin(roles)) return <Navigate to="/admin" replace />;
  const first = user.services[0];
  const meta  = first ? SERVICE_META[first] : null;
  return <Navigate to={meta ? meta.path : '/login'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"       element={<LoginPage />} />
      <Route path="/"            element={<RootRedirect />} />

      {/* Admin panel — for SUPER_ADMIN and *_ADMIN roles */}
      <Route path="/admin/*"     element={<AdminRoute><AdminApp /></AdminRoute>} />

      {/* Service apps */}
      <Route path="/hes/*"       element={<ProtectedRoute service="hes">     <HesApp />     </ProtectedRoute>} />
      <Route path="/mdm/*"       element={<ProtectedRoute service="mdm">     <MdmApp />     </ProtectedRoute>} />
      <Route path="/wfm/*"       element={<ProtectedRoute service="wfm">     <WfmApp />     </ProtectedRoute>} />
      <Route path="/billing/*"   element={<ProtectedRoute service="billing"> <BillingApp /> </ProtectedRoute>} />
      <Route path="/consumer/*"  element={<ProtectedRoute service="consumer"><ConsumerApp /></ProtectedRoute>} />

      <Route path="*"            element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
