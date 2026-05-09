import axios from 'axios'

const defaultApiOrigin = import.meta.env.PROD
  ? 'https://mouha-market-api.onrender.com'
  : 'http://localhost:3000'

function getApiBaseURL(apiOrigin) {
  const origin = typeof apiOrigin === 'string' && apiOrigin.trim()
    ? apiOrigin.trim()
    : defaultApiOrigin
  const cleanOrigin = origin.replace(/\/+$/, '')

  return cleanOrigin.endsWith('/api') ? cleanOrigin : `${cleanOrigin}/api`
}

const api = axios.create({
  baseURL: getApiBaseURL(import.meta.env.VITE_API_URL),
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api
