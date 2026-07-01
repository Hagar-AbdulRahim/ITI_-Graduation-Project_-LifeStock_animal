import api from './api';

const healthCaseService = {
  getAnimalHealthCases: (animalId) => api.get(`/api/health-cases/animal/${animalId}`).then((res) => res.data),
  getHealthCaseById: (caseId) => api.get(`/api/health-cases/${caseId}`).then((res) => res.data),
  getMyConsultations: () => api.get(`/api/health-cases/consultations`).then((res) => res.data),
};

export default healthCaseService;
