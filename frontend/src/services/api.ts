import axios, { AxiosError } from 'axios';
import { User, Quiz, Question } from '../types';

// Create axios instance
const API = axios.create({
  baseURL: 'http://localhost:5002/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handling helper
export const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message: string }>;
    if (axiosError.response?.data?.message) {
      throw new Error(axiosError.response.data.message);
    }
    if (axiosError.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Your session has expired. Please log in again.');
    }
    if (axiosError.response?.status === 403) {
      throw new Error('You do not have permission to perform this action.');
    }
    if (axiosError.message) {
      throw new Error(axiosError.message);
    }
  }
  throw new Error('An unexpected error occurred');
};

// Add token to requests if it exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData: { username: string; email: string; password: string; role: string }) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials: { email: string; password: string }) => {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await API.get('/users/profile');
    return response.data;
  },
  
  updateProfile: async (userData: { username?: string; email?: string; password?: string }) => {
    const response = await API.put('/users/profile', userData);
    return response.data;
  },
  
  getUsers: async () => {
    const response = await API.get('/users');
    return response.data;
  },
};

// Quiz API
export const quizAPI = {
  getQuizzes: async (params?: { subject?: string; search?: string; all?: boolean; createdBy?: string }) => {
    const response = await API.get('/quizzes', { params });
    return response.data;
  },
  
  getQuiz: async (id: string, take: boolean = false) => {
    const response = await API.get(`/quizzes/${id}`, { params: { take } });
    return response.data;
  },
  
  createQuiz: async (quizData: any) => {
    const response = await API.post('/quizzes', quizData);
    return response.data;
  },
  
  updateQuiz: async (id: string, quizData: any) => {
    const response = await API.put(`/quizzes/${id}`, quizData);
    return response.data;
  },
  
  deleteQuiz: async (id: string) => {
    const response = await API.delete(`/quizzes/${id}`);
    return response.data;
  },
  
  submitQuiz: async (id: string, answers: any[], timeTaken: number) => {
    const response = await API.post(`/quizzes/${id}/submit`, { answers, timeTaken });
    return response.data;
  },
  
  getUserResults: async () => {
    const response = await API.get('/quizzes/results');
    return response.data;
  },
  
  getQuizResults: async (id: string) => {
    const response = await API.get(`/quizzes/${id}/results`);
    return response.data;
  },
};

export default API; 