import axios from 'axios';

// Using relative path to utilize the Vite proxy correctly
const BASE_URL = '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authService = {
  adminLogin: (email, password) => api.post('/auth/admin/login', { email, password }),
  employeeLogin: (email, password) => api.post('/auth/employee/login', { email, password }),
  changePassword: (oldPassword, newPassword) => api.post('/auth/change-password', { oldPassword, newPassword }),
};

export const adminService = {
  createEmployee: (data) => api.post('/admin/create-employee', data),
  getEmployees: () => api.get('/admin/employees'),
  updateEmployee: (id, data) => api.put(`/admin/employee/${id}`, data),
  deleteEmployee: (id) => api.delete(`/admin/employee/${id}`),
  resetPassword: (id, password) => api.put(`/admin/employee/${id}/reset-password`, { password }),
};

export const workService = {
  addWork: (data) => api.post('/employee/add-work', {
    taskTitle: data.title,
    description: data.description,
    status: data.status,
  }),
  getWorkUpdates: () => api.get('/admin/work-updates'),
};

export const profileService = {
  getProfile: () => api.get('/employee/profile'),
};

export const attendanceService = {
  checkIn: () => api.post('/attendance/check-in'),
  checkOut: () => api.post('/attendance/check-out'),
  getMyAttendance: () => api.get('/attendance/my'),
};

export const adminAttendanceService = {
  getAll: (date) => api.get('/attendance/all', { params: date ? { date } : {} }),
};

export default api;

