import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, SERVICE_META } from './auth/AuthContext';
import LoginPage from './shared/components/LoginPage';
import HesApp from './apps/hes/HesApp';
import MdmApp from './apps/mdm/MdmApp';
import WfmApp from './apps/wfm/WfmApp';
import { BillingApp, ConsumerApp } from './apps/billing/BillingConsumerApps';
import './shared/styles/global.css';

// Protected route — checks auth + service access
function ProtectedRoute({ children, service }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (service && !user.services.includes(service)) {
    // Redirect to first accessible service
    const first = user.services[0];
    const meta = first ? SERVICE_META[first] : null;
    return <Navigate to={meta ? meta.path : '/login'} replace />;
  }
  return children;
}

// After login, redirect to user's first service
function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const first = user.services[0];
  const meta = first ? SERVICE_META[first] : null;
  return <Navigate to={meta ? meta.path : '/login'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RootRedirect />} />

      {/* HES — Head End System */}
      <Route
        path="/hes/*"
        element={
          <ProtectedRoute service="hes">
            <HesApp />
          </ProtectedRoute>
        }
      />

      {/* MDM — Meter Data Management */}
      <Route
        path="/mdm/*"
        element={
          <ProtectedRoute service="mdm">
            <MdmApp />
          </ProtectedRoute>
        }
      />

      {/* WFM — Workforce Management */}
      <Route
        path="/wfm/*"
        element={
          <ProtectedRoute service="wfm">
            <WfmApp />
          </ProtectedRoute>
        }
      />

      {/* Billing System */}
      <Route
        path="/billing/*"
        element={
          <ProtectedRoute service="billing">
            <BillingApp />
          </ProtectedRoute>
        }
      />

      {/* Consumer Portal */}
      <Route
        path="/consumer/*"
        element={
          <ProtectedRoute service="consumer">
            <ConsumerApp />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
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
