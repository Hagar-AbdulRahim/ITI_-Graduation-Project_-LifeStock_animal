// ─── Onboarding Agent — API Service Layer ─────────────────────────────────────
// Connects to: backend/routes/onboarding.routes.js
// Endpoints:
//   POST /api/onboarding/:animalId/chat     → start or continue conversation
//   POST /api/onboarding/:animalId/confirm  → save extracted medical data
// ─────────────────────────────────────────────────────────────────────────────

import axiosInstance from './axiosInstance';

const BASE = '/onboarding';

const onboardingService = {
  /**
   * Start a new onboarding conversation (no message needed).
   * The backend generates the first question automatically.
   * @param {string} animalId — MongoDB ObjectId of the animal
   */
  startChat: async (animalId) => {
    const response = await axiosInstance.post(
      `${BASE}/${animalId}/chat`,
      { history: [] },
      { timeout: 60000 } // AI calls may take longer
    );
    return response.data;
  },

  /**
   * Send a user message and receive the agent's reply.
   * @param {string} animalId
   * @param {string} message  — the farmer's text message
   * @param {Array}  history  — full conversation history array
   */
  sendMessage: async (animalId, message, history = []) => {
    const response = await axiosInstance.post(
      `${BASE}/${animalId}/chat`,
      { message, history },
      { timeout: 60000 } // AI calls may take longer
    );
    return response.data;
  },

  /**
   * Confirm and save the extracted medical data to the database.
   * @param {string} animalId
   * @param {Array}  medical_history — extracted diseases/symptoms
   * @param {Array}  vaccinations    — extracted vaccine records
   */
  confirmData: async (animalId, medical_history = [], vaccinations = []) => {
    const response = await axiosInstance.post(`${BASE}/${animalId}/confirm`, {
      medical_history,
      vaccinations,
    });
    return response.data;
  },
};

export default onboardingService;
