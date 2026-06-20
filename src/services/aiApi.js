import axiosInstance from './axiosInstance'

export const analyzeImage = async (imageData) => {
  const response = await axiosInstance.post('/ai/analyze-image', { image: imageData })
  return response.data
}

export const getDiagnosis = async (symptoms) => {
  const response = await axiosInstance.post('/ai/diagnose', { symptoms })
  return response.data
}

export const chatWithAI = async (message, history = []) => {
  const response = await axiosInstance.post('/ai/chat', { message, history })
  return response.data
}

export default {
  analyzeImage,
  getDiagnosis,
  chatWithAI,
}
