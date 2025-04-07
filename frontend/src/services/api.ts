import axios from 'axios';
import { User, Quiz, Question } from '../types';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
  },
};

// Quiz API
export const quizAPI = {
  getAllQuizzes: async () => {
    const response = await api.get('/quizzes');
    return response.data;
  },
  getQuizById: async (id: string) => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
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
    const response = await api.post('/quizzes', quizData);
    return response.data;
  },
  updateQuiz: async (id: string, quizData: Partial<Quiz>) => {
    const response = await api.put(`/quizzes/${id}`, quizData);
    return response.data;
  },
  deleteQuiz: async (id: string) => {
    const response = await api.delete(`/quizzes/${id}`);
    return response.data;
  },
  submitQuiz: async (quizId: string, answers: number[]) => {
    const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  updateProfile: async (userData: Partial<User>) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },
  getQuizResults: async () => {
    const response = await api.get('/users/results');
    return response.data;
  },
};

export default api; 