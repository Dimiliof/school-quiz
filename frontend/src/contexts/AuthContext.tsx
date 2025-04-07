import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

// Define types
interface User {
  _id: string;
  username: string;
  email: string;
  role: 'student' | 'teacher';
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { username: string; email: string; password: string; role: string }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      if (state.token) {
        try {
          const userData = await authAPI.getCurrentUser();
          setState(prev => ({
            ...prev,
            user: userData,
            loading: false,
            isAuthenticated: true,
          }));
        } catch (error) {
          localStorage.removeItem('token');
          setState(prev => ({
            ...prev,
            user: null,
            token: null,
            loading: false,
            isAuthenticated: false,
            error: 'Session expired. Please log in again.',
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
        }));
      }
    };

    loadUser();
  }, [state.token]);

  // Register user
  const register = async (userData: { username: string; email: string; password: string; role: string }) => {
    try {
      const data = await authAPI.register(userData);
      localStorage.setItem('token', data.token);
      setState(prev => ({
        ...prev,
        user: data,
        token: data.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Registration failed',
        loading: false,
      }));
      throw error;
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    try {
      const data = await authAPI.login({ email, password });
      localStorage.setItem('token', data.token);
      setState(prev => ({
        ...prev,
        user: data,
        token: data.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Invalid credentials',
        loading: false,
      }));
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setState({
      user: null,
      token: null,
      loading: false,
      error: null,
      isAuthenticated: false,
    });
  };

  // Clear error
  const clearError = () => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 