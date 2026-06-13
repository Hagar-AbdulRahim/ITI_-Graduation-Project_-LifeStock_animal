import api from './api';

export const userService = {
  getProfile: async () => {
    const response = await api.get('/api/users/me');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/api/users/me', userData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    // passwordData should contain { current_password, new_password }
    const response = await api.put('/api/users/me/password', passwordData);
    return response.data;
  },

  updateFcmToken: async (fcmToken) => {
    const response = await api.put('/api/users/me/fcm-token', { fcm_token: fcmToken });
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/api/users/me');
    return response.data;
  }
};
