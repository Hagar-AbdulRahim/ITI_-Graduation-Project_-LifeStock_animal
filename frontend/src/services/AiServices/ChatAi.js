import axiosInstance from '../axiosInstance'

// 🤖 CHAT WITH AI (Onboarding / Assistant)
export const chatWithAI = (animalId, message, history = []) => {
  return axiosInstance
    .post(`/onboarding/${animalId}/chat`, {
      message,
      history,
    })
    .then((res) => res.data)
}
