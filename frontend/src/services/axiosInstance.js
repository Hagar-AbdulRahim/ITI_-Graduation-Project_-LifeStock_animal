import axios from 'axios'

// نشيل أي "/" أو "/api" زيادة في الآخر عشان مانكررش المسار
// كده يشتغل صح سواء الـ .env مكتوب فيه:
//   VITE_API_BASE_URL=http://127.0.0.1:5000
//   VITE_API_BASE_URL=http://127.0.0.1:5000/api
const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const API_BASE_URL = RAW_BASE_URL.replace(/\/api\/?$/, '').replace(/\/$/, '') + '/api'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,

  timeout: 10000,

  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

axiosInstance.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
    }

    return Promise.reject(error)
  },
)

export default axiosInstance