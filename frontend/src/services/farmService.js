import api from './api';

const BASE_URL = '/api/farms';

export const farmService = {
  getMyFarms: async () => {
    const response = await api.get(BASE_URL);
    return response.data;
  },
  getFarmById: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },
  getFarmStats: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}/stats`);
    return response.data;
  },
  createFarm: async (data) => {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },
  getFarmVaccinations: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}/vaccinations`);
    return response.data;
  },
  getFarmAlerts: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}/alerts`);
    return response.data;
  },
  updateFarm: async (id, data) => {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },
  deleteFarm: async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
};
