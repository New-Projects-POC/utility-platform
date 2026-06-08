import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HesSidebar from './components/HesSidebar';
import Topbar from '../../shared/components/Topbar';
import Footer from '../../shared/components/Footer';
import HesDashboard from './pages/HesDashboard';
import {
  MeterDataInstant, MeterDataLoadProfile, MeterDataDailyLP,
  MeterDataBilling, MeterDataCurrentBilling
} from './pages/MeterDataPages';
import { HesLogsPage } from './pages/LogsPages';
import HierarchyPage from './pages/HierarchyPage';
import DevicesPage from './pages/DevicesPage';
import OnDemandPage from './pages/OnDemandPage';
import DeviceSearchPage from './pages/DeviceSearchPage';
import AlertsPage from './pages/AlertsPage';
import { ReportsPage, SettingsPage } from './pages/ReportsSettings';

export default function HesApp() {
  return (
    <div className="layout">
      <HesSidebar />
      <div className="main-wrap">
        <Topbar />
        <div className="content">
          <Routes>
            <Route index element={<HesDashboard />} />
            <Route path="meter-data" element={<MeterDataInstant />} />
            <Route path="meter-data/instant" element={<MeterDataInstant />} />
            <Route path="meter-data/load-profile" element={<MeterDataLoadProfile />} />
            <Route path="meter-data/daily-lp" element={<MeterDataDailyLP />} />
            <Route path="meter-data/billing" element={<MeterDataBilling />} />
            <Route path="meter-data/current-billing" element={<MeterDataCurrentBilling />} />
            <Route path="logs" element={<HesLogsPage />} />
            <Route path="logs/profile-read" element={<HesLogsPage />} />
            <Route path="logs/config-read" element={<HesLogsPage />} />
            <Route path="logs/config-write" element={<HesLogsPage />} />
            <Route path="logs/fota" element={<HesLogsPage />} />
            <Route path="hierarchy" element={<HierarchyPage />} />
            <Route path="hierarchy/:level" element={<HierarchyPage />} />
            <Route path="devices" element={<DevicesPage />} />
            <Route path="ondemand" element={<OnDemandPage />} />
            <Route path="device-search" element={<DeviceSearchPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/hes" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </div>
  );
}
