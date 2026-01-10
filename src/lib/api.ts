import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from '@/hooks/use-toast';

// API Base URL - will be set from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as { message?: string; error?: string };

      switch (status) {
        case 401:
          localStorage.removeItem('authToken');
          window.location.href = '/auth?mode=signin';
          toast({
            title: 'Session expired',
            description: 'Please sign in again',
            variant: 'destructive',
          });
          break;
        case 403:
          toast({
            title: 'Access denied',
            description: 'You do not have permission to perform this action',
            variant: 'destructive',
          });
          break;
        case 404:
          toast({
            title: 'Not found',
            description: data.message || 'The requested resource was not found',
            variant: 'destructive',
          });
          break;
        case 500:
          toast({
            title: 'Server error',
            description: 'Something went wrong. Please try again later.',
            variant: 'destructive',
          });
          break;
        default:
          toast({
            title: 'Error',
            description: data.message || data.error || 'An error occurred',
            variant: 'destructive',
          });
      }
    } else if (error.request) {
      toast({
        title: 'Network error',
        description: 'Please check your internet connection',
        variant: 'destructive',
      });
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signUp: async (data: { email?: string; phone?: string; password: string; name?: string }) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },
  signIn: async (data: { email?: string; phone?: string; password: string }) => {
    const response = await api.post('/auth/signin', data);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },
  sendOTP: async (phone: string) => {
    const response = await api.post('/auth/send-otp', { phone });
    return response.data;
  },
  verifyOTP: async (phone: string, otp: string) => {
    const response = await api.post('/auth/verify-otp', { phone, otp });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },
};

// Profile APIs
export const profileAPI = {
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },
  updateProfile: async (data: any) => {
    const response = await api.put('/profile', data);
    return response.data;
  },
  uploadDocument: async (type: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const response = await api.post(`/profile/documents/${type}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// OCR APIs
export const ocrAPI = {
  extractText: async (file: File, type: 'aadhar' | 'income' | 'caste' | 'marksheet') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const response = await api.post('/ocr/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  parseDocument: async (text: string, type: string) => {
    const response = await api.post('/ocr/parse', { text, type });
    return response.data;
  },
};

// Scholarship APIs
export const scholarshipAPI = {
  getAll: async (filters?: any) => {
    const response = await api.get('/scholarships', { params: filters });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/scholarships/${id}`);
    return response.data;
  },
  getMatches: async () => {
    const response = await api.get('/scholarships/matches');
    return response.data;
  },
  checkEligibility: async (scholarshipId: string) => {
    const response = await api.get(`/scholarships/${scholarshipId}/eligibility`);
    return response.data;
  },
  predictEligibility: async (criteria: {
    income: number;
    category: string;
    gender: string;
    educationLevel: string;
    state: string;
    percentage?: number;
  }) => {
    const response = await api.post('/scholarships/predict-eligibility', criteria);
    return response.data;
  },
  saveScholarship: async (scholarshipId: string) => {
    const response = await api.post(`/scholarships/${scholarshipId}/save`);
    return response.data;
  },
  unsaveScholarship: async (scholarshipId: string) => {
    const response = await api.delete(`/scholarships/${scholarshipId}/save`);
    return response.data;
  },
};

// Application APIs
export const applicationAPI = {
  getAll: async () => {
    const response = await api.get('/applications');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },
  create: async (scholarshipId: string, data: any) => {
    const response = await api.post(`/applications`, { scholarshipId, ...data });
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/applications/${id}`, data);
    return response.data;
  },
  submit: async (id: string) => {
    const response = await api.post(`/applications/${id}/submit`);
    return response.data;
  },
  getStatus: async (id: string) => {
    const response = await api.get(`/applications/${id}/status`);
    return response.data;
  },
};

// Admin APIs
export const adminAPI = {
  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },
  getUsers: async (filters?: any) => {
    const response = await api.get('/admin/users', { params: filters });
    return response.data;
  },
  getUserById: async (id: string) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },
};

// Mentor APIs
export const mentorAPI = {
  getAssignedStudents: async () => {
    const response = await api.get('/mentor/students');
    return response.data;
  },
  getStudentApplication: async (studentId: string, applicationId: string) => {
    const response = await api.get(`/mentor/students/${studentId}/applications/${applicationId}`);
    return response.data;
  },
  approveEligibility: async (studentId: string, applicationId: string, comments?: string) => {
    const response = await api.post(`/mentor/students/${studentId}/applications/${applicationId}/approve`, { comments });
    return response.data;
  },
  rejectEligibility: async (studentId: string, applicationId: string, reason: string) => {
    const response = await api.post(`/mentor/students/${studentId}/applications/${applicationId}/reject`, { reason });
    return response.data;
  },
};

// Notification APIs
export const notificationAPI = {
  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
  getPreferences: async () => {
    const response = await api.get('/notifications/preferences');
    return response.data;
  },
  updatePreferences: async (preferences: { email: boolean; sms: boolean }) => {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data;
  },
};

export default api;



