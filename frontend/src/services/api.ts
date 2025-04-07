import axios, { AxiosError } from 'axios';
import { User, Quiz, Question } from '../types';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
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

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  logout: () => {
    localStorage.removeItem('token');
  },
};

// Quiz API
export const quizAPI = {
  getAllQuizzes: async () => {
    try {
      const response = await api.get('/quizzes');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getQuizById: async (id: string) => {
    try {
      const response = await api.get(`/quizzes/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  createQuiz: async (quizData: {
    title: string;
    description: string;
    subject: string;
    timeLimit: number;
    questions: {
      question: string;
      options: string[];
      correctAnswer: number;
      points: number;
    }[];
  }) => {
    try {
      const response = await api.post('/quizzes', quizData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  updateQuiz: async (id: string, quizData: Partial<Quiz>) => {
    try {
      const response = await api.put(`/quizzes/${id}`, quizData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  deleteQuiz: async (id: string) => {
    try {
      const response = await api.delete(`/quizzes/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  submitQuiz: async (quizId: string, answers: number[]) => {
    try {
      const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getActiveQuizzes: async () => {
    try {
      const response = await api.get('/quizzes/active');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  updateProfile: async (userData: Partial<User>) => {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getQuizResults: async () => {
    try {
      const response = await api.get('/users/results');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getResultById: async (resultId: string) => {
    try {
      const response = await api.get(`/users/results/${resultId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default api; 