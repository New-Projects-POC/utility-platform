import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Topbar from '../../shared/components/Topbar';
import Footer from '../../shared/components/Footer';
import MdmDashboard from './pages/MdmDashboard';
import MdmSidebar from './components/MdmSidebar';
import EnergyAuditDashboardPage from './pages/energy-audit/Dashboard';
import VeeMgmtDashboardPage from './pages/vee-mgmt/VeeMgmtDashboard';
import CommunicationDashboardPage from './pages/communication/CommunicationDashboardPage';
import RevenueDashboard from './pages/revenue/RevenueDashboard';
import {
  MeterDataInstant, MeterDataLoadProfile, MeterDataDailyLP,
  MeterDataBilling, MeterDataCurrentBilling
} from './pages/MeterDataPages';

function MdmTopbarTitle() {
  const location = useLocation();
  const segments = location.pathname.split('/');
  const last = segments[segments.length - 1];
  const titles = {
    'energy-audit': 'MDM — Energy Audit',
    'vee-mgmt': 'MDM — VEE Management',
    'communication': 'MDM — Communication',
    'revenue': 'MDM — Revenue',
  };
  return titles[last] || 'MDM — Meter Data Management';
}

export default function MdmApp() {
  return (
    <div className="layout">
      <MdmSidebar />
      <div className="main-wrap">
        <Topbar title={<MdmTopbarTitle />} />
        <div className="content">
          <Routes>
            <Route index element={<MdmDashboard />} />
            <Route path="meter-data" element={<MeterDataInstant />} />
            <Route path="meter-data/instant" element={<MeterDataInstant />} />
            <Route path="meter-data/load-profile" element={<MeterDataLoadProfile />} />
            <Route path="meter-data/daily-lp" element={<MeterDataDailyLP />} />
            <Route path="meter-data/billing" element={<MeterDataBilling />} />
            <Route path="meter-data/current-billing" element={<MeterDataCurrentBilling />} />
            <Route path="energy-audit/dashboard" element={<EnergyAuditDashboardPage />} />
            <Route path="vee/dashboard" element={<VeeMgmtDashboardPage />} />
            <Route path="communication/dashboard" element={<CommunicationDashboardPage />} />
            <Route path="revenue/dashboard" element={<RevenueDashboard />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </div>
  );
}