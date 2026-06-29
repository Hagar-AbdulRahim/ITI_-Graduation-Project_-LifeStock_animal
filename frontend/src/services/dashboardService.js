import api from './api';

const dashboardService = {
  getFarmStats: (farmId) => api.get(`/api/farms/${farmId}/stats`),
};

export default dashboardService;
