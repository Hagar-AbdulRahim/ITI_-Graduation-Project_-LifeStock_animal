import axiosInstance from './axiosInstance'

// 📋 GET ALL HEALTH CASES FOR ANIMAL
export const getHealthHistory = (animalId) => {
  return axiosInstance
    .get(`/health-cases/animal/${animalId}`)
    .then((res) => res.data)
}

// 📄 GET SINGLE CASE
export const getCaseDetails = (caseId) => {
  return axiosInstance.get(`/health-cases/${caseId}`).then((res) => res.data)
}

// ✅ RESOLVE CASE
export const resolveCase = (caseId) => {
  return axiosInstance
    .put(`/health-cases/${caseId}/resolve`, {
      vet_consulted: true,
    })
    .then((res) => res.data)
}
