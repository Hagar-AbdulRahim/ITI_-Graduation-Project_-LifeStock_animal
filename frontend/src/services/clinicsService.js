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
 *
 * ملحوظة: الـ timeout هنا 25 ثانية بدل الـ 10 ثواني الافتراضية،
 * لأن الباك اند بيجرب أكتر من Overpass mirror + Gemini قبل ما يرد،
 * وده ممكن ياخد وقت أطول من الطلبات العادية
 */
export const emergencyChat = ({ message, lat, lng }) => {
  return axiosInstance
    .post(
      '/clinics/emergency',
      { message, lat, lng },
      { timeout: 25000 }
    )
    .then((r) => r.data)
}