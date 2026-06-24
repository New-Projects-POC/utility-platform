import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, TokenStore } from '../shared/utils/api';

export const SERVICE_META = {
  hes:      { key:'hes',      label:'Head End System',       short:'HES',  icon:'ti-antenna',      color:'#1a6bff', bg:'#eff6ff', description:'Meter communication, data acquisition & device management', path:'/hes',      status:'active'      },
  mdm:      { key:'mdm',      label:'Meter Data Management', short:'MDM',  icon:'ti-database',     color:'#7c3aed', bg:'#faf5ff', description:'Meter data validation, estimation & aggregation',          path:'/mdm',      status:'coming_soon' },
  wfm:      { key:'wfm',      label:'Workforce Management',  short:'WFM',  icon:'ti-users',        color:'#0d9488', bg:'#f0fdfa', description:'Field workforce scheduling, dispatch & tracking',           path:'/wfm',      status:'coming_soon' },
  billing:  { key:'billing',  label:'Billing System',        short:'BILL', icon:'ti-file-invoice', color:'#d97706', bg:'#fffbeb', description:'Revenue management, billing cycles & payments',             path:'/billing',  status:'coming_soon' },
  consumer: { key:'consumer', label:'Consumer Portal',       short:'CP',   icon:'ti-user-circle',  color:'#16a34a', bg:'#f0fdf4', description:'Consumer self-service, usage & complaints',                path:'/consumer', status:'coming_soon' },
};

const MODULE_CODE_MAP = { HES:'hes', MDM:'mdm', BILLING:'billing', WFM:'wfm', CONSUMER_PORTAL:'consumer' };

export const HES_FEATURE_MAP = {
  METER_DATA:['meter-data'], LOGS:['logs'], COMMUNICATION_LOGS:['logs'],
  HIERARCHY:['hierarchy'], DEVICE_MANAGEMENT:['devices','device-search'],
  ON_DEMAND_COMMANDS:['ondemand'], COMMAND_SCHEDULING:['ondemand'],
  EVENT_MANAGEMENT:['alerts'], REPORTS:['reports'],
};

export const MDM_FEATURE_MAP = {
  METER_DATA:['meter-data'], LOAD_PROFILE:['meter-data'],
  DATA_VALIDATION:['vee'], DATA_ESTIMATION:['vee'], DATA_EDITING:['vee'], VEE_MANAGEMENT:['vee'],
  AGGREGATION:['energy-audit','demand-service'], EVENT_STORAGE:['exceptions'], BILLING_DATA:['revenue'],
};

function buildServices(moduleAccess = []) {
  return moduleAccess.map(m => MODULE_CODE_MAP[m.moduleCode]).filter(Boolean);
}

export function buildAllowedNavIds(moduleAccess = [], moduleCode, featureMap) {
  const mod = moduleAccess.find(m => m.moduleCode === moduleCode);
  if (!mod) return new Set();
  const allowed = new Set(['dashboard','settings']);
  mod.features.forEach(f => {
    if (f.canRead) (featureMap[f.featureCode] || []).forEach(id => allowed.add(id));
  });
  return allowed;
}

// Role hierarchy
export const ROLE_LEVEL = {
  SUPER_ADMIN: 3,
  HES_ADMIN: 2, MDM_ADMIN: 2, BILLING_ADMIN: 2, WFM_ADMIN: 2,
  DEFAULT: 1,
};

export function getRoleLevel(roles = []) {
  return Math.max(...roles.map(r => ROLE_LEVEL[r] || ROLE_LEVEL.DEFAULT), 0);
}

export function isSuperAdmin(roles = []) { return roles.includes('SUPER_ADMIN'); }
export function isAdmin(roles = []) { return roles.some(r => r.endsWith('_ADMIN')); }

function buildUser(data) {
  const { user, accessToken, refreshToken } = data;
  const moduleAccess = user.moduleAccess || [];
  const parts = (user.fullName || user.username || '').trim().split(' ');
  const avatar = parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length-1][0]}`.toUpperCase()
    : (user.username || '??').substring(0,2).toUpperCase();
  return {
    id: user.userId, username: user.username,
    name: user.fullName, email: user.email, avatar,
    role: user.roles?.[0] || 'User', roles: user.roles || [],
    tenantId: user.tenantId, tenantCode: user.tenantCode, tenantName: user.tenantName,
    services: buildServices(moduleAccess),
    moduleAccess, accessToken, refreshToken,
  };
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('authUser');
    const token  = TokenStore.getAccess();
    if (stored && token) { try { setUser(JSON.parse(stored)); } catch { TokenStore.clear(); } }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password, tenantCode) => {
    setError('');
    try {
      const res = await authApi.login(username, password, tenantCode);
      if (!res.success) { setError(res.message || 'Login failed'); return { ok:false, error:res.message }; }
      const userData = buildUser(res.data);
      TokenStore.setTokens(res.data.accessToken, res.data.refreshToken);
      localStorage.setItem('authUser', JSON.stringify(userData));
      setUser(userData);
      return { ok:true, user:userData };
    } catch (err) {
      const msg = err.status === 423 ? 'Account locked. Contact your administrator.' : err.message || 'Invalid credentials';
      setError(msg);
      return { ok:false, error:msg };
    }
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    TokenStore.clear(); localStorage.removeItem('authUser');
    setUser(null); setError('');
  }, []);

  const hasService = useCallback((key) => user?.services?.includes(key) ?? false, [user]);
  const hasPermission = useCallback((moduleCode, featureCode, perm='canRead') => {
    if (!user?.moduleAccess) return false;
    const mod = user.moduleAccess.find(m => m.moduleCode === moduleCode);
    if (!mod) return false;
    const feat = mod.features?.find(f => f.featureCode === featureCode);
    return feat?.[perm] === true;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, error, loading, login, logout, hasService, hasPermission, setError, isSuperAdmin: () => isSuperAdmin(user?.roles || []), isAdmin: () => isAdmin(user?.roles || []) }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
