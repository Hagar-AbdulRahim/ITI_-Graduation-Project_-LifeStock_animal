import api from './api';

const healthRecordService = {
  getAnimalCases: (animalId) => api.get(`/api/health-cases/animal/${animalId}`).then((res) => res.data),
  getCaseById: (caseId) => api.get(`/api/health-cases/${caseId}`).then((res) => res.data),
  resolveCase: (caseId) => api.put(`/api/health-cases/${caseId}/resolve`, { vet_consulted: true }).then((res) => res.data),
};

export default healthRecordService;
