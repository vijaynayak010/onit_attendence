import axios from 'axios';

// Using relative path to utilize the Vite proxy correctly
const BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
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
  getMyWorkUpdates: (params) => api.get('/employee/work-updates', { params }),
  getWorkUpdates: (params) => api.get('/admin/work-updates', { params }),
};

export const profileService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

export const taskService = {
  // Admin methods
  createTask: (data) => api.post('/tasks', data),
  getAdminTasks: () => api.get('/tasks/admin'),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  
  // Shared/Employee methods
  getMyTasks: () => api.get('/tasks/my'),
  updateTaskStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
};

export const attendanceService = {
  checkIn: () => api.post('/attendance/check-in'),
  checkOut: () => api.post('/attendance/check-out'),
  getMyAttendance: (params) => api.get('/attendance/my', { params }),
};

export const adminAttendanceService = {
  getAll: (date) => api.get('/attendance/all', { params: date ? { date } : {} }),
  getEmployeeAttendance: (id, params) => api.get(`/attendance/employee/${id}`, { params }),
};

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export default api;

