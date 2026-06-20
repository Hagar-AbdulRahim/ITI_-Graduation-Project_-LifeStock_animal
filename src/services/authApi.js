import axios from 'axios';

const API_URL = '/api/auth';

export const loginUser = async (data) => {
    // Placeholder endpoint, will be updated when backend is ready
    const response = await axios.post(`${API_URL}/login`, data);
    return response.data;
};

export const registerUser = async (data) => {
    // Placeholder endpoint, will be updated when backend is ready
    const response = await axios.post(`${API_URL}/register`, data);
    return response.data;
};
