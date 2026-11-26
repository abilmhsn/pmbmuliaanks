
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'APPLICANT';
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
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isTokenExpired = (tokenString: string): boolean => {
  try {
    const parts = tokenString.split('.');
    if (parts.length < 2) return true;
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = decodeURIComponent(
      atob(payloadBase64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonStr);
    if (payload.exp && typeof payload.exp === 'number') {
      // Buffer toleransi 10 detik sebelum token benar-benar mati
      return Date.now() >= payload.exp * 1000 - 10000;
    }
    return false;
  } catch {
    return true;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pmb_token');
    }
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const fetchProfile = async (authToken?: string) => {
    try {
      const activeToken =
        authToken ||
        token ||
        (typeof window !== 'undefined'
          ? sessionStorage.getItem('pmb_token')
          : null);

      if (!activeToken) {
        setIsLoading(false);
        return;
      }

      // Cegah request dengan token yang sudah kedaluwarsa di sisi browser
      if (isTokenExpired(activeToken)) {
        logout();
        return;
      }

      const response = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      setUser(response.data);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        // Sesi kedaluwarsa ditangani secara normal dengan mengembalikan user ke login
        logout();
      } else {
        console.error('Failed to load profile:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedToken =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('pmb_token')
        : null;

    if (savedToken) {
      if (isTokenExpired(savedToken)) {
        logout();
      } else {
        setToken(savedToken);
        fetchProfile(savedToken);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.post('/auth/login', credentials);
    const accessToken = res.data?.token;
    const userData = res.data?.user;

    if (!accessToken) {
      throw new Error('Gagal mendapatkan sesi login');
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pmb_token', accessToken);
    }
    setToken(accessToken);
    setUser(userData);

    if (userData?.role === 'SUPER_ADMIN') {
      router.push('/super-admin/dashboard');
    } else if (userData?.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  const register = async (formData: any) => {
    const res = await api.post('/auth/register', formData);
    return res.data;
  };

  const refreshUser = async () => {
    const activeToken =
      token ||
      (typeof window !== 'undefined'
        ? sessionStorage.getItem('pmb_token')
        : null);

    if (activeToken) {
      if (isTokenExpired(activeToken)) {
        logout();
        return;
      }
      await fetchProfile(activeToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout, refreshUser }}
    >
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
