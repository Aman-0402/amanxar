import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (username, password) =>
    api.post('/api/auth/login/', { username, password }),
  refresh: (refresh) =>
    api.post('/api/auth/refresh/', { refresh }),
}

export const projectsAPI = {
  getAll: () => api.get('/api/projects/'),
  getBySlug: (slug) => api.get(`/api/projects/${slug}/`),
  create: (data) => api.post('/api/projects/', data),
  update: (slug, data) => api.put(`/api/projects/${slug}/`, data),
  partialUpdate: (slug, data) => api.patch(`/api/projects/${slug}/`, data),
  delete: (slug) => api.delete(`/api/projects/${slug}/`),
}

export default api
