import axios from 'axios';

let store;
export const injectStore = (_store) => {
  store = _store;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for sending/receiving HttpOnly cookies (refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
  (config) => {
    // Get token from Redux store (or localStorage if you prefer)
    let token = null;
    if (store) {
      const state = store.getState();
      token = state.auth?.accessToken;
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 and Token Refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If 401 and it's not a retry already, and we are not calling the login or refresh endpoints
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      originalRequest.url !== '/api/auth/login' &&
      originalRequest.url !== '/api/auth/refresh'
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token using the refresh endpoint
        // The refresh token is sent automatically via http-only cookie due to withCredentials: true
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data.access_token;
        
        if (store) {
          store.dispatch({ type: 'auth/updateToken', payload: newAccessToken });
        }

        // Update the failed request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is expired or invalid
        // Force logout
        if (store) {
          store.dispatch({ type: 'auth/logout' });
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
