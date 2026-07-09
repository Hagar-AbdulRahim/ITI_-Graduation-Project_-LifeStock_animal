import api from './api';

const adminService = {
  getDashboardStats: () => api.get('/api/admin/dashboard/stats'),
  getUsers: (params) => api.get('/api/admin/users', { params }),
  createUser: (data) => api.post('/api/admin/users', data),
  getUserById: (id) => api.get(`/api/admin/users/${id}`),
  toggleUser: (id) => api.put(`/api/admin/users/${id}/toggle`),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  // Farms
  getFarms: (params) => api.get('/api/admin/farms', { params }),
  getFarmById: (id) => api.get(`/api/admin/farms/${id}`),
  deleteFarm: (id) => api.delete(`/api/admin/farms/${id}`),
  // Animals
  getAnimals: (params) => api.get('/api/admin/animals', { params }),
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
  approveOutbreak: (id) => api.put(`/api/admin/outbreaks/${id}/approve`),
  rejectOutbreak:  (id) => api.put(`/api/admin/outbreaks/${id}/reject`),
  getUsersGrowth: (params) => api.get('/api/admin/analytics/users-growth', { params }),
  // Notifications
  getNotifications: (params) => api.get('/api/admin/notifications', { params }),
  broadcastNotification: (data) => api.post('/api/admin/notifications/broadcast', data),
  // Outbreak Analytics
  getOutbreakCandidates: (params) => api.get('/api/admin/outbreak-analytics/candidates', { params }),
  getSymptomsStats: (params) => api.get('/api/admin/outbreak-analytics/symptoms', { params }),
  triggerOutbreakDetection: () => api.post('/api/admin/outbreak-analytics/detect'),
};

export default adminService;
