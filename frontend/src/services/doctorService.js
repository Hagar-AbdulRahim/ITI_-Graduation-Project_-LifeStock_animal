import api from './api';

const doctorService = {
  getDashboardStats: () => api.get('/api/doctor/dashboard/stats'),
  getHealthCases: (params) => api.get('/api/doctor/health-cases', { params }),
  reviewHealthCase: (id, data) => api.put(`/api/doctor/health-cases/${id}/review`, data),
  getConsultations: (params) => api.get('/api/doctor/consultations', { params }),
  respondConsultation: (id, data) => api.put(`/api/doctor/consultations/${id}/respond`, data),
  getOutbreaks: (params) => api.get('/api/doctor/outbreaks', { params }),
};

export default doctorService;
