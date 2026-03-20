import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token (Assume it's in localStorage)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
};

export const marksAPI = {
  add: (data) => api.post('/marks/add', data),
  update: (id, data) => api.put(`/marks/update/${id}`, data),
  getStudent: (studentId) => api.get(`/marks/student/${studentId}`),
  getClass: (classCode) => api.get(`/marks/class/${classCode}`),
  delete: (id) => api.delete(`/marks/${id}`)
};

export const analyticsAPI = {
  getClassSummary: (classCode) => api.get(`/marks/analytics/class-summary/${classCode}`),
  getToppers: (classCode) => api.get(`/marks/analytics/topper/${classCode}`),
  getSubjectAnalysis: (subject) => api.get(`/marks/analytics/subject-analysis/${subject}`)
};

export default api;
