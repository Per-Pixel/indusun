'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import {
  CustomerUser,
  authenticateCustomer,
  getCustomerById,
  updateCustomerLastActive,
  logoutCustomer,
  getCustomerDashboardData,
  CustomerDashboardData
} from '../lib/mock-auth-data';

interface AuthContextType {
  user: CustomerUser | null;
  isLoading: boolean;
  dashboardData: CustomerDashboardData | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshDashboardData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [dashboardData, setDashboardData] = useState<CustomerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authenticateCustomer({ email, password });

      if (response.success && response.user) {
        setUser(response.user);
        updateCustomerLastActive(response.user.id);

        // Store token in localStorage for persistence (in production, use secure storage)
        if (response.token) {
          localStorage.setItem('customer_token', response.token);
          localStorage.setItem('customer_user', JSON.stringify(response.user));
        }

        // Load dashboard data
        refreshDashboardData(response.user.id);

        toast.success('Login successful');
        return true;
      } else {
        toast.error(response.message || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('customer_token');

      if (token) {
        await logoutCustomer(token);
      }

      // Clear stored data
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_user');

      setUser(null);
      setDashboardData(null);
      toast.success('Logged out successfully');

      // Redirect to login page
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      // Check for stored token and user data
      const token = localStorage.getItem('customer_token');
      const storedUser = localStorage.getItem('customer_user');

      if (token && storedUser) {
        const userData = JSON.parse(storedUser) as CustomerUser;

        // Verify user still exists and is active
        const currentUser = getCustomerById(userData.id);
        if (currentUser && currentUser.status === 'active') {
          setUser(currentUser);
          updateCustomerLastActive(currentUser.id);
          refreshDashboardData(currentUser.id);
        } else {
          // User no longer exists or is inactive, clear storage
          localStorage.removeItem('customer_token');
          localStorage.removeItem('customer_user');
          setUser(null);
          setDashboardData(null);
        }
      } else {
        setUser(null);
        setDashboardData(null);
      }
    } catch (error) {
      console.error('Authentication check error:', error);
      setUser(null);
      setDashboardData(null);
      // Clear potentially corrupted storage
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_user');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDashboardData = (userId?: string) => {
    const customerId = userId || user?.id;
    if (customerId) {
      const data = getCustomerDashboardData(customerId);
      setDashboardData(data);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      dashboardData,
      login,
      logout,
      checkAuth,
      refreshDashboardData
    }}>
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
