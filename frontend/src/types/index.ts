export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  createdAt: string;
}

export interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  createdBy: User;
  subject: string;
  timeLimit: number;
  isActive: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface QuizState {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  loading: boolean;
  error: string | null;
} 