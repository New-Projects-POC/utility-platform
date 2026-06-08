import React, { createContext, useContext, useState } from 'react';

// Mock users with roles and service access
export const MOCK_USERS = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    name: 'Rajesh Kumar',
    role: 'Super Admin',
    email: 'admin@utility.com',
    avatar: 'RK',
    services: ['hes', 'mdm', 'wfm', 'billing', 'consumer'],
  },
  {
    id: 2,
    username: 'hes_user',
    password: 'hes123',
    name: 'Priya Sharma',
    role: 'HES Operator',
    email: 'priya@utility.com',
    avatar: 'PS',
    services: ['hes'],
  },
  {
    id: 3,
    username: 'mdm_user',
    password: 'mdm123',
    name: 'Amit Singh',
    role: 'MDM Analyst',
    email: 'amit@utility.com',
    avatar: 'AS',
    services: ['mdm', 'billing'],
  },
  {
    id: 4,
    username: 'field_user',
    password: 'field123',
    name: 'Sunita Patel',
    role: 'Field Engineer',
    email: 'sunita@utility.com',
    avatar: 'SP',
    services: ['hes', 'wfm'],
  },
];

export const SERVICE_META = {
  hes: {
    key: 'hes',
    label: 'Head End System',
    short: 'HES',
    icon: 'ti-antenna',
    color: '#1a6bff',
    bg: '#eff6ff',
    description: 'Meter communication, data acquisition & device management',
    path: '/hes',
    status: 'active',
  },
  mdm: {
    key: 'mdm',
    label: 'Meter Data Management',
    short: 'MDM',
    icon: 'ti-database',
    color: '#7c3aed',
    bg: '#faf5ff',
    description: 'Meter data validation, estimation & aggregation',
    path: '/mdm',
    status: 'coming_soon',
  },
  wfm: {
    key: 'wfm',
    label: 'Workforce Management',
    short: 'WFM',
    icon: 'ti-users',
    color: '#0d9488',
    bg: '#f0fdfa',
    description: 'Field workforce scheduling, dispatch & tracking',
    path: '/wfm',
    status: 'coming_soon',
  },
  billing: {
    key: 'billing',
    label: 'Billing System',
    short: 'BILL',
    icon: 'ti-file-invoice',
    color: '#d97706',
    bg: '#fffbeb',
    description: 'Revenue management, billing cycles & payments',
    path: '/billing',
    status: 'coming_soon',
  },
  consumer: {
    key: 'consumer',
    label: 'Consumer Portal',
    short: 'CP',
    icon: 'ti-user-circle',
    color: '#16a34a',
    bg: '#f0fdf4',
    description: 'Consumer self-service, usage & complaints',
    path: '/consumer',
    status: 'coming_soon',
  },
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  const login = (username, password) => {
    const found = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (found) {
      setUser(found);
      setError('');
      return true;
    }
    setError('Invalid username or password');
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
