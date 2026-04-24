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

export const aboutAPI = {
  getStats: () => api.get('/api/about/stats/'),
  createStat: (data) => api.post('/api/about/stats/', data),
  updateStat: (id, data) => api.put(`/api/about/stats/${id}/`, data),
  deleteStat: (id) => api.delete(`/api/about/stats/${id}/`),

  getWhatIDo: () => api.get('/api/about/what-i-do/'),
  createWhatIDo: (data) => api.post('/api/about/what-i-do/', data),
  updateWhatIDo: (id, data) => api.put(`/api/about/what-i-do/${id}/`, data),
  deleteWhatIDo: (id) => api.delete(`/api/about/what-i-do/${id}/`),

  getBio: () => api.get('/api/about/bio/'),
  createBio: (data) => api.post('/api/about/bio/', data),
  updateBio: (id, data) => api.put(`/api/about/bio/${id}/`, data),
  deleteBio: (id) => api.delete(`/api/about/bio/${id}/`),

  getHighlights: () => api.get('/api/about/highlights/'),
  createHighlight: (data) => api.post('/api/about/highlights/', data),
  updateHighlight: (id, data) => api.put(`/api/about/highlights/${id}/`, data),
  deleteHighlight: (id) => api.delete(`/api/about/highlights/${id}/`),
}

export const skillsAPI = {
  getAll: () => api.get('/api/skills/'),
  getById: (id) => api.get(`/api/skills/${id}/`),
  create: (data) => api.post('/api/skills/', data),
  update: (id, data) => api.put(`/api/skills/${id}/`, data),
  delete: (id) => api.delete(`/api/skills/${id}/`),
}

export const techStackAPI = {
  getAll: () => api.get('/api/tech-stack/'),
  getById: (id) => api.get(`/api/tech-stack/${id}/`),
  create: (data) => api.post('/api/tech-stack/', data),
  update: (id, data) => api.put(`/api/tech-stack/${id}/`, data),
  delete: (id) => api.delete(`/api/tech-stack/${id}/`),
}

export const timelineAPI = {
  getAll: () => api.get('/api/timeline/'),
  getById: (id) => api.get(`/api/timeline/${id}/`),
  create: (data) => api.post('/api/timeline/', data),
  update: (id, data) => api.put(`/api/timeline/${id}/`, data),
  delete: (id) => api.delete(`/api/timeline/${id}/`),
}

export default api
