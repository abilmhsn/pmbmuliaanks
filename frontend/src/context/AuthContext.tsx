'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'APPLICANT';
  applicant?: {
    id: string;
    fullName: string;
    phone: string;
    registrationNumber: string;
    personalData?: any;
    educationData?: any;
    registrations?: any[];
    documents?: any[];
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('pmb_token');
    if (savedToken) {
      setToken(savedToken);
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: any) => {
    const res = await api.post('/auth/login', credentials);
    const { token: jwtToken, user: userData } = res.data;
    localStorage.setItem('pmb_token', jwtToken);
    setToken(jwtToken);
    setUser(userData);

    if (userData.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  const register = async (formData: any) => {
    const res = await api.post('/auth/register', formData);
    const { token: jwtToken, user: userData } = res.data;
    localStorage.setItem('pmb_token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('pmb_token');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    if (token) {
      await fetchProfile();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
