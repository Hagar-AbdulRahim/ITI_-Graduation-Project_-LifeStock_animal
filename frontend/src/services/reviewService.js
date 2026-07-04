import api from './api';

const BASE_URL = '/api/reviews';

export const reviewService = {
  getAllReviews: async () => {
    const response = await api.get(BASE_URL);
    return response.data;
  },

  getReviewById: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  createReview: async (data) => {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },

  deleteReview: async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
};

export const getAllReviews  = reviewService.getAllReviews;
export const getReviewById = reviewService.getReviewById;
export const createReview  = reviewService.createReview;
export const deleteReview  = reviewService.deleteReview;
