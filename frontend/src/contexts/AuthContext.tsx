'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/utils/api';
import { toast } from 'react-toastify';

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
};

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  enrolledCourses?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, recaptchaToken: string) => Promise<void>;
  loginWithToken: (user: User, token: string) => void;
  register: (name: string, email: string, password: string, recaptchaToken: string) => Promise<void>;
  googleSignIn: () => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data);
    } catch {
      localStorage.removeItem('token');
    }
    setLoading(false);
  };

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === 'object' && error && 'response' in error) {
      const response = (error as ApiError).response;
      const message = response?.data?.message;
      if (typeof message === 'string') return message;
    }
    return fallback;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadUser();
    } else {
      // Check for token in URL (Google OAuth callback)
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      if (urlToken) {
        localStorage.setItem('token', urlToken);
        loadUser();
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        setLoading(false);
      }
    }
  }, []);

  const login = async (email: string, password: string, recaptchaToken: string) => {
    try {
      const res = await api.post('/auth/login', { email, password, recaptchaToken });
      const { token, data } = res.data;
      localStorage.setItem('token', token);
      setUser(data);
      toast.success('Login successful!');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Login failed'));
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, recaptchaToken: string) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, recaptchaToken });
      const { token, data } = res.data;
      localStorage.setItem('token', token);
      setUser(data);
      toast.success('Registration successful!');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Registration failed'));
      throw error;
    }
  };

  const loginWithToken = (userData: User, token: string) => {
    localStorage.setItem('token', token);
    setUser(userData);
    toast.success('Login successful!');
  };

  const googleSignIn = () => {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) {
      toast.error('Google login is not configured');
      return;
    }
    const normalizedBase = base.replace(/\/$/, '');
    window.location.href = `${normalizedBase}/auth/google`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.info('Logged out successfully');
  };

  const value = {
    user,
    loading,
    login,
    loginWithToken,
    register,
    googleSignIn,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
