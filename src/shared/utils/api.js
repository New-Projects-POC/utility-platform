// const BASE_URL = process.env.REACT_APP_API_URL || 'http://10.48.136.151:6402';
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';


export const TokenStore = {
  getAccess:  () => localStorage.getItem('accessToken'),
  getRefresh: () => localStorage.getItem('refreshToken'),
  setTokens:  (access, refresh) => {
    localStorage.setItem('accessToken', access);
    if (refresh) localStorage.setItem('refreshToken', refresh);
  },
  clear: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('authUser');
  },
};

let isRefreshing = false;
let refreshQueue = [];

function flushQueue(err, token) {
  refreshQueue.forEach(({ resolve, reject }) => err ? reject(err) : resolve(token));
  refreshQueue = [];
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = TokenStore.getAccess();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 && path !== '/api/auth/login' && path !== '/api/auth/refresh') {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const rt = TokenStore.getRefresh();
        if (!rt) throw new Error('No refresh token');
        const r = await fetch(`${BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: rt }),
        });
        if (!r.ok) throw new Error('Refresh failed');
        const d = await r.json();
        TokenStore.setTokens(d.data.accessToken, d.data.refreshToken);
        flushQueue(null, d.data.accessToken);
        isRefreshing = false;
        return request(path, options);
      } catch (err) {
        flushQueue(err, null);
        isRefreshing = false;
        TokenStore.clear();
        window.location.href = '/login';
        throw err;
      }
    }
    return new Promise((resolve, reject) => refreshQueue.push({ resolve, reject }))
      .then(t => request(path, { ...options, headers: { ...headers, Authorization: `Bearer ${t}` } }));
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || data.error || `HTTP ${res.status}`);
    error.status = res.status; error.data = data; throw error;
  }
  return data;
}

export const api = {
  get:    (path, opts = {}) => request(path, { method: 'GET', ...opts }),
  post:   (path, body, opts = {}) => request(path, { method: 'POST', body: JSON.stringify(body), ...opts }),
  put:    (path, body, opts = {}) => request(path, { method: 'PUT', body: JSON.stringify(body), ...opts }),
  patch:  (path, body, opts = {}) => request(path, { method: 'PATCH', body: JSON.stringify(body), ...opts }),
  delete: (path, opts = {}) => request(path, { method: 'DELETE', ...opts }),
};

export const authApi = {
  login: (username, password, tenantCode) =>
    api.post('/api/auth/login', { username, password, tenantCode, deviceInfo: 'Web Browser' }),
  logout: () => api.post('/api/auth/logout'),
  changePassword: (currentPassword, newPassword, confirmPassword) =>
    api.post('/api/auth/change-password', { currentPassword, newPassword, confirmPassword }),
  forgotPassword: (email, tenantCode) =>
    api.post('/api/auth/forgot-password', { email, tenantCode }),
  resetPassword: (email, tenantCode, otp, newPassword, confirmPassword) =>
    api.post('/api/auth/reset-password', { email, tenantCode, otp, newPassword, confirmPassword }),

  // Users
  getUsers: (page = 0, size = 20, search = '') =>
    api.get(`/api/auth/users?page=${page}&size=${size}${search ? `&search=${encodeURIComponent(search)}` : ''}`),
  getUserById: (id) => api.get(`/api/auth/users/${id}`),
  createUser: (data) => api.post('/api/auth/users', data),
  updateUser: (id, data) => api.put(`/api/auth/users/${id}`, data),
  deleteUser: (id) => api.delete(`/api/auth/users/${id}`),
  toggleUserStatus: (id) => api.patch(`/api/auth/users/${id}/toggle-status`),

  // Roles
  getRoles: () => api.get('/api/auth/roles'),
  getRoleById: (id) => api.get(`/api/auth/roles/${id}`),
  createRole: (data) => api.post('/api/auth/roles', data),
  updateRole: (id, data) => api.put(`/api/auth/roles/${id}`, data),
  assignPermissions: (roleId, permissions) =>
    api.put(`/api/auth/roles/${roleId}/permissions`, { permissions }),
  deleteRole: (id) => api.delete(`/api/auth/roles/${id}`),

  // Modules (for permission matrix)
  getModules: () => api.get('/api/auth/modules'),

  // Tenants
  getTenants: (page = 0, size = 20) => api.get(`/api/auth/tenants?page=${page}&size=${size}`),
  getTenantById: (id) => api.get(`/api/auth/tenants/${id}`),
  createTenant: (data) => api.post('/api/auth/tenants', data),
  updateTenant: (id, data) => api.put(`/api/auth/tenants/${id}`, data),
  addModules: (id, newModules) => api.patch(`/api/auth/tenants/${id}/add-modules`, { newModules }),
  removeModules: (id, newModules) => api.patch(`/api/auth/tenants/${id}/remove-modules`, { newModules }),
  activateTenant: (id) => api.patch(`/api/auth/tenants/${id}/activate`),
  deactivateTenant: (id) => api.patch(`/api/auth/tenants/${id}/deactivate`),

  // Audit
  getAuditLogs: (params = {}) => {
    const q = new URLSearchParams({ page: 0, size: 50, ...params }).toString();
    return api.get(`/api/auth/audit-logs?${q}`);
  },
};
