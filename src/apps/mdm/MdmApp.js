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
import { LoadProfileData} from './pages/meter-data/LoadProfileData';
import {DailyLoadData} from './pages/meter-data/DailyLoadData';
import {InstantData} from './pages/meter-data/InstantData';
import {NameplateData} from './pages/meter-data/NameplateData';
import {AlarmData} from './pages/meter-data/AlarmData';
import {BillingHistoryData} from './pages/meter-data/BillingHistoryData';
import {EventData} from './pages/meter-data/EventData';
import {InstantPushData} from './pages/meter-data/InstantPushData';
import {CurrentBillingData} from './pages/meter-data/CurrentBillingData';

function MdmTopbarTitle() {
  const location = useLocation();
  const segments = location.pathname.split('/');
  const last = segments[segments.length - 1];
  const titles = {
    'energy-audit': 'MDM — Energy Audit',
    'vee-mgmt': 'MDM — VEE Management', 
    'communication': 'MDM — Communication',
    'revenue': 'MDM — Revenue',
    'event': 'MDM — Event Data',
    'instant-push': 'MDM — Instant Push Data',
    'current-billing': 'MDM — Current Billing Data',
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
            <Route path="meter-data/load-profile" element={<LoadProfileData />} />
            <Route path="meter-data/daily-lp" element={<DailyLoadData />} />
            <Route path="meter-data/instant" element={<InstantData />} />
            <Route path="meter-data/instant-push" element={<InstantPushData />} />
            <Route path="meter-data/alarm" element={<AlarmData />} />
            <Route path="meter-data/billing" element={<BillingHistoryData />} />
            <Route path="meter-data/current-billing" element={<CurrentBillingData />} />
            <Route path="meter-data/nameplate" element={<NameplateData />} /> 
            <Route path="meter-data/event" element={<EventData />} />
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