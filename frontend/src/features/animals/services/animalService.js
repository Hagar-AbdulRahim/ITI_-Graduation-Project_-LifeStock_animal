// ─── Animal Profile Feature — API Service Layer ───────────────────────────────
// All functions are backend-ready and use the shared axios instance from api.js.
// Backend team: ensure your endpoints match the functions below.
// See: backend/routes/Animal.routes.js

import api from '../../../services/api';

const BASE_URL = '/api/animals';

export const animalService = {
  /**
   * GET /api/animals/:id
   * Fetch a single animal's full profile data.
   * @param {string} id - Animal MongoDB ObjectId
   */
  getAnimalById: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * GET /api/animals/farm/:farmId
   * Fetch all animals belonging to a specific farm.
   * @param {string} farmId - Farm MongoDB ObjectId
   */
  getAnimalsByFarm: async (farmId) => {
    const response = await api.get(`${BASE_URL}/farm/${farmId}`);
    return response.data;
  },

  /**
   * GET /api/animals/:id/vaccinations
   * Fetch the vaccination history for a specific animal.
   * NOTE: Backend team needs to implement this endpoint.
   * @param {string} id - Animal MongoDB ObjectId
   */
  getAnimalVaccinations: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}/vaccinations`);
    return response.data;
  },

  /**
   * GET /api/animals/:id/health-cases
   * Fetch medical history (health cases) for a specific animal.
   * NOTE: Backend team needs to implement this endpoint.
   * @param {string} id - Animal MongoDB ObjectId
   */
  getAnimalMedicalHistory: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}/health-cases`);
    return response.data;
  },

  /**
   * GET /api/animals/:id/diagnoses
   * Fetch AI diagnosis history for a specific animal.
   * NOTE: Backend team needs to implement this endpoint.
   * @param {string} id - Animal MongoDB ObjectId
   */
  getAnimalDiagnosisHistory: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}/diagnoses`);
    return response.data;
  },

  /**
   * GET /api/animals/:id/weights
   * Fetch weight tracking history for a specific animal.
   * NOTE: Backend team needs to implement this endpoint.
   * @param {string} id - Animal MongoDB ObjectId
   */
  getAnimalWeightHistory: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}/weights`);
    return response.data;
  },

  /**
   * POST /api/animals
   * Create a new animal profile.
   * @param {Object} data - Animal data (name, species, gender, birth_date, etc.)
   */
  createAnimal: async (data) => {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },

  /**
   * PUT /api/animals/:id
   * Update an existing animal's information.
   * @param {string} id - Animal MongoDB ObjectId
   * @param {Object} data - Partial or full animal data to update
   */
  updateAnimal: async (id, data) => {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * DELETE /api/animals/:id
   * Delete an animal and cascade-delete its vaccinations and health cases.
   * @param {string} id - Animal MongoDB ObjectId
   */
  deleteAnimal: async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  addAnimalVaccination: async (id, data) => {
    const response = await api.post(`${BASE_URL}/${id}/vaccinations`, data);
    return response.data;
  },

  updateAnimalVaccination: async (vacId, data) => {
    const response = await api.put(`${BASE_URL}/vaccinations/${vacId}`, data);
    return response.data;
  },

  deleteAnimalVaccination: async (vacId) => {
    const response = await api.delete(`${BASE_URL}/vaccinations/${vacId}`);
    return response.data;
  },

  /**
   * POST /api/animals/:id/health-cases
   * Add a new medical record (health case) for an animal.
   * @param {string} id - Animal MongoDB ObjectId
   * @param {Object} data - Medical record data
   */
  addAnimalMedicalRecord: async (id, data) => {
    const response = await api.post(`${BASE_URL}/${id}/health-cases`, data);
    return response.data;
  },
};
