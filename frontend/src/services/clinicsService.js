import axiosInstance from './axiosInstance'

/**
 * البحث عن عيادات بيطرية قريبة
 * @param {number} lat
 * @param {number} lng
 * @param {number} radius - بالمتر (اختياري)
 */
export const getNearbyClinics = ({ lat, lng, radius }) => {
  const params = { lat, lng }
  if (radius) params.radius = radius
  return axiosInstance.get('/clinics/nearby', { params }).then((r) => r.data)
}

/**
 * شات الطوارئ مع الـ AI
 * @param {string} message - سؤال المستخدم
 * @param {number} lat
 * @param {number} lng
 */
export const emergencyChat = ({ message, lat, lng }) => {
  return axiosInstance
    .post('/clinics/emergency', { message, lat, lng })
    .then((r) => r.data)
}
