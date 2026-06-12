import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
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
  register: (data) =>
    api.post('/api/auth/register/', data),
}

export const usersAPI = {
  getAll:    ()       => api.get('/api/users/'),
  getById:   (id)     => api.get(`/api/users/${id}/`),
  update:    (id, data) => api.put(`/api/users/${id}/`, data),
  delete:    (id)     => api.delete(`/api/users/${id}/`),
  getProfile: ()      => api.get('/api/users/me/'),
  updateProfile: (data) => api.patch('/api/users/me/', data),
}

export const supportAPI = {
  create: (data) => api.post('/api/support/', data),
  getAll: ()     => api.get('/api/support/'),
}

export const learningAPI = {
  getAll:  ()       => api.get('/api/learning/'),
  claim:   (data)   => api.post('/api/learning/', data),
  remove:  (id)     => api.delete(`/api/learning/${id}/`),
}

export const assessmentsAPI = {
  getAll:       ()            => api.get('/api/assessments/'),
  getById:      (id)          => api.get(`/api/assessments/${id}/`),
  create:       (data)        => api.post('/api/assessments/', data),
  update:       (id, data)    => api.patch(`/api/assessments/${id}/`, data),
  delete:       (id)          => api.delete(`/api/assessments/${id}/`),
  leaderboard:  (id)          => api.get(`/api/assessments/${id}/leaderboard/`),

  getQuestions: (id)          => api.get(`/api/assessments/${id}/questions/`),
  createQuestion: (id, data)  => api.post(`/api/assessments/${id}/questions/`, data),
  updateQuestion: (qId, data) => api.patch(`/api/questions/${qId}/`, data),
  deleteQuestion: (qId)       => api.delete(`/api/questions/${qId}/`),

  getOptions:   (qId)         => api.get(`/api/questions/${qId}/options/`),
  createOption: (qId, data)   => api.post(`/api/questions/${qId}/options/`, data),
  updateOption: (oId, data)   => api.patch(`/api/options/${oId}/`, data),
  deleteOption: (oId)         => api.delete(`/api/options/${oId}/`),

  startAttempt:  (id)         => api.post(`/api/assessments/${id}/start/`),
  submitAttempt: (aId, data)  => api.post(`/api/attempts/${aId}/submit/`, data),
  getResult:     (aId)        => api.get(`/api/attempts/${aId}/result/`),

  getEnrollments: (id)           => api.get(`/api/assessments/${id}/enrollments/`),
  enroll:         (id, userId)   => api.post(`/api/assessments/${id}/enroll/`, { user_id: userId }),
  unenroll:       (id, userId)   => api.delete(`/api/assessments/${id}/enrollments/${userId}/`),
}

export const bookingsAPI = {
  getAll:       ()          => api.get('/api/bookings/'),
  getById:      (id)        => api.get(`/api/bookings/${id}/`),
  create:       (data)      => api.post('/api/bookings/', data),
  reply:        (id, data)  => api.post(`/api/bookings/${id}/reply/`, data),
  setStatus:    (id, data)  => api.patch(`/api/bookings/${id}/status/`, data),
  markRead:     (id)        => api.post(`/api/bookings/${id}/read/`),
}

export const projectsAPI = {
  getAll: () => api.get('/api/projects/'),
  getBySlug: (slug) => api.get(`/api/projects/${slug}/`),
  create: (data, config) => api.post('/api/projects/', data, config),
  update: (slug, data, config) => api.put(`/api/projects/${slug}/`, data, config),
  partialUpdate: (slug, data, config) => api.patch(`/api/projects/${slug}/`, data, config),
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

export const messagesAPI = {
  getAll: () => api.get('/api/messages/'),
  getById: (id) => api.get(`/api/messages/${id}/`),
  create: (data) => api.post('/api/messages/', data),
  markAsRead: (id, data) => api.patch(`/api/messages/${id}/`, data),
  delete: (id) => api.delete(`/api/messages/${id}/`),
}

export const ebooksAPI = {
  getAll: () => api.get('/api/ebooks/'),
  getBySlug: (slug) => api.get(`/api/ebooks/${slug}/`),
  create: (data) => api.post('/api/ebooks/', data),
  update: (slug, data) => api.put(`/api/ebooks/${slug}/`, data),
  delete: (slug) => api.delete(`/api/ebooks/${slug}/`),
}

export const knowledgeHubAPI = {
  getCategories: () => api.get('/api/knowledge-hub/'),
  getCategoryById: (id) => api.get(`/api/knowledge-hub/${id}/`),
  createCategory: (data) => api.post('/api/knowledge-hub/', data),
  updateCategory: (id, data) => api.put(`/api/knowledge-hub/${id}/`, data),
  deleteCategory: (id) => api.delete(`/api/knowledge-hub/${id}/`),
}

export const knowledgeToolsAPI = {
  getAll: () => api.get('/api/knowledge-tools/'),
  getById: (id) => api.get(`/api/knowledge-tools/${id}/`),
  create: (data) => api.post('/api/knowledge-tools/', data),
  update: (id, data) => api.put(`/api/knowledge-tools/${id}/`, data),
  delete: (id) => api.delete(`/api/knowledge-tools/${id}/`),
}

export const galleryAPI = {
  getAll: () => api.get('/api/gallery/'),
  getById: (id) => api.get(`/api/gallery/${id}/`),
  create: (data, config) => api.post('/api/gallery/', data, config),
  update: (id, data, config) => api.put(`/api/gallery/${id}/`, data, config),
  delete: (id) => api.delete(`/api/gallery/${id}/`),
}

export const servicesAPI = {
  getAll: () => api.get('/api/services/'),
  getById: (id) => api.get(`/api/services/${id}/`),
  create: (data) => api.post('/api/services/', data),
  update: (id, data) => api.put(`/api/services/${id}/`, data),
  delete: (id) => api.delete(`/api/services/${id}/`),
}

export const navbarAPI = {
  getAll: () => api.get('/api/navbar-links/'),
  getById: (id) => api.get(`/api/navbar-links/${id}/`),
  create: (data) => api.post('/api/navbar-links/', data),
  update: (id, data) => api.put(`/api/navbar-links/${id}/`, data),
  delete: (id) => api.delete(`/api/navbar-links/${id}/`),
}

export const footerSectionsAPI = {
  getAll: () => api.get('/api/footer-sections/'),
  getById: (id) => api.get(`/api/footer-sections/${id}/`),
  create: (data) => api.post('/api/footer-sections/', data),
  update: (id, data) => api.put(`/api/footer-sections/${id}/`, data),
  delete: (id) => api.delete(`/api/footer-sections/${id}/`),
}

export const footerLinksAPI = {
  getAll: () => api.get('/api/footer-links/'),
  getById: (id) => api.get(`/api/footer-links/${id}/`),
  create: (data) => api.post('/api/footer-links/', data),
  update: (id, data) => api.put(`/api/footer-links/${id}/`, data),
  delete: (id) => api.delete(`/api/footer-links/${id}/`),
}

export const footerCTAAPI = {
  getAll: () => api.get('/api/footer-cta/'),
  getById: (id) => api.get(`/api/footer-cta/${id}/`),
  create: (data) => api.post('/api/footer-cta/', data),
  update: (id, data) => api.put(`/api/footer-cta/${id}/`, data),
}

export const socialLinksAPI = {
  getAll: () => api.get('/api/social-links/'),
  getById: (id) => api.get(`/api/social-links/${id}/`),
  create: (data) => api.post('/api/social-links/', data),
  update: (id, data) => api.put(`/api/social-links/${id}/`, data),
  delete: (id) => api.delete(`/api/social-links/${id}/`),
}

export default api
