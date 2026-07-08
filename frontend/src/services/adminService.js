import api from './api';

const adminService = {
  getDashboardStats: () => api.get('/api/admin/dashboard/stats'),
  getUsers: (params) => api.get('/api/admin/users', { params }),
  getUserById: (id) => api.get(`/api/admin/users/${id}`),
  createUser: (data) => api.post('/api/admin/users', data),
  updateUser: (id, data) => api.put(`/api/admin/users/${id}`, data),
  toggleUser: (id) => api.put(`/api/admin/users/${id}/toggle`),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  getFarms: (params) => api.get('/api/admin/farms', { params }),
  getFarmById: (id) => api.get(`/api/admin/farms/${id}`),
  deleteFarm: (id) => api.delete(`/api/admin/farms/${id}`),
  getAnimals: (params) => api.get('/api/admin/animals', { params }),
  getHealthCases: (params) => api.get('/api/admin/health-cases', { params }),
  updateHealthCase: (id, data) => api.put(`/api/admin/health-cases/${id}`, data),
  getConsultations: (params) => api.get('/api/admin/consultations', { params }),
  getClinics: (params) => api.get('/api/admin/clinics', { params }),
  createClinic: (data) => api.post('/api/admin/clinics', data),
  updateClinic: (id, data) => api.put(`/api/admin/clinics/${id}`, data),
  deleteClinic: (id) => api.delete(`/api/admin/clinics/${id}`),
  getKnowledgeBaseStats: () => api.get('/api/admin/knowledge/stats'),
  rebuildKnowledgeBase: () => api.post('/api/admin/knowledge/rebuild'),
  getOutbreaks: (params) => api.get('/api/admin/outbreaks', { params }),
  createOutbreak: (data) => api.post('/api/admin/outbreaks', data),
  resolveOutbreak: (id) => api.put(`/api/admin/outbreaks/${id}/resolve`),
  getNotifications: (params) => api.get('/api/admin/notifications', { params }),
  broadcastNotification: (data) => api.post('/api/admin/notifications/broadcast', data),
  getUsersGrowth: (params) => api.get('/api/admin/analytics/users-growth', { params }),
  getHealthTrends: () => api.get('/api/admin/analytics/health-trends'),
  getVaccinationAnalytics: () => api.get('/api/admin/analytics/vaccinations'),
};

export default adminService;
