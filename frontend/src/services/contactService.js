import api from './api';

export const sendContactMessage = async (messageData) => {
  const response = await api.post('/api/contact', messageData);
  return response.data;
};

// Optionally for admin dashboard later
export const getAllContactMessages = async () => {
  const response = await api.get('/contact');
  return response.data;
};
