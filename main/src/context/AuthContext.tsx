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
  // TEMPORARY: Create a mock user for development using our actual mock data
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Use the first customer user as default for development
  const mockUser: User = {
    id: 'customer_1',
    name: 'Per Pixel',
    email: 'perpixel@email.com',
    role: 'customer',
  };

  const [user, setUser] = useState<User | null>(isDevelopment ? mockUser : null);
  const [isLoading, setIsLoading] = useState(!isDevelopment);

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    toast.success('Login successful');
  };

  const logout = async () => {
    try {
      // Call logout API to clear cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setUser(null);
      // Clear any stored tokens
      document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local state
      setUser(null);
      // Clear any stored tokens
      document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      toast.success('Logged out successfully');
    }
  };

  const checkAuth = async () => {
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
