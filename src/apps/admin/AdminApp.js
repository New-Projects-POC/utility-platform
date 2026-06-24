import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import Topbar from '../../shared/components/Topbar';
import Footer from '../../shared/components/Footer';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import RoleManagement from './pages/RoleManagement';
import ServicesAccess from './pages/ServicesAccess';
import ProfilePage from './pages/ProfilePage';
import TenantManagement from './pages/TenantManagement';

const NAV = [
  { id:'dashboard', label:'Dashboard',        icon:'ti-layout-dashboard', path:'/admin',             roles:['all'] },
  { id:'profile',   label:'My Profile',       icon:'ti-user-circle',      path:'/admin/profile',     roles:['all'] },
  { id:'users',     label:'User Management',  icon:'ti-users',            path:'/admin/users',       roles:['SUPER_ADMIN','_ADMIN'] },
  { id:'roles',     label:'Roles & Permissions', icon:'ti-shield',        path:'/admin/roles',       roles:['SUPER_ADMIN','_ADMIN'] },
  { id:'services',  label:'Service Access',   icon:'ti-apps',             path:'/admin/services',    roles:['SUPER_ADMIN'] },
  { id:'tenants',   label:'Tenant Management',icon:'ti-building',         path:'/admin/tenants',     roles:['PLATFORM_ADMIN'] },
];

function AdminSidebar() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const roles     = user?.roles || [];

  const canSee = (item) => {
    if (item.roles.includes('all')) return true;
    if (item.roles.includes('PLATFORM_ADMIN') && roles.includes('SUPER_ADMIN') && user?.tenantCode === 'PLATFORM') return true;
    if (item.roles.includes('SUPER_ADMIN') && roles.includes('SUPER_ADMIN')) return true;
    if (item.roles.includes('_ADMIN') && roles.some(r => r.endsWith('_ADMIN'))) return true;
    return false;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon" style={{ background:'#1a6bff' }}>
          <i className="ti ti-settings" style={{ fontSize:18 }}></i>
        </div>
        <div className="logo-text">Admin<small>Control Panel</small></div>
      </div>
      <nav className="sidebar-nav">
        {NAV.filter(canSee).map(item => {
          const active = item.id === 'dashboard'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(item.path) && item.path !== '/admin';
          return (
            <button key={item.id} className={`nav-item ${active ? 'active' : ''}`}
              onClick={() => navigate(item.path)}>
              <i className={`ti ${item.icon}`}></i>{item.label}
            </button>
          );
        })}
      </nav>
      <div className="sidebar-bottom">
        <div className="sys-status">
          <div className="sys-title">Account Info</div>
          <div className="sys-row">
            <span style={{ color:'var(--text3)', fontSize:10 }}>{user?.tenantCode}</span>
            <span style={{ color:'var(--text3)', fontSize:10 }}>{user?.roles?.[0]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminApp() {
  return (
    <div className="layout">
      <AdminSidebar />
      <div className="main-wrap">
        <Topbar title="Admin Panel" />
        <div className="content">
          <Routes>
            <Route path="/"         element={<AdminDashboard />} />
            <Route path="/profile"  element={<ProfilePage />} />
            <Route path="/users"    element={<UserManagement />} />
            <Route path="/roles"    element={<RoleManagement />} />
            <Route path="/services" element={<ServicesAccess />} />
            <Route path="/tenants"  element={<TenantManagement />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </div>
  );
}
