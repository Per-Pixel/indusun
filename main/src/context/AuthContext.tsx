'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role?: 'customer' | 'broker' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // TEMPORARY: Create a mock user for development
  const isDevelopment = process.env.NODE_ENV === 'development';
  const mockUser: User = {
    id: '1',
    name: 'Development User',
    email: 'dev@example.com',
    role: 'broker', // Set to broker for testing broker dashboard
  };

  const [user, setUser] = useState<User | null>(isDevelopment ? mockUser : null);
  const [isLoading, setIsLoading] = useState(!isDevelopment);

  useEffect(() => {
    if (!isDevelopment) {
      checkAuth();
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    toast.success('Login successful');
  };

  const logout = () => {
    if (isDevelopment) {
      toast.success('Logout disabled in development mode');
      return;
    }
    setUser(null);
  };

  const checkAuth = async () => {
    // In development mode, always return the mock user
    if (isDevelopment) {
      console.log('🔧 Development mode: Using mock user');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Authentication check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
