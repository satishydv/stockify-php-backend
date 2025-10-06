"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

// Helper function to check if we're in the browser
const isBrowser = () => typeof window !== 'undefined';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  address?: string;
  role?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Only run auth check in the browser
    if (isBrowser()) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      // Check if we're in the browser
      if (!isBrowser()) {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Verify token with PHP backend
      try {
        const userData = await apiClient.getCurrentUser();
        setUser(userData.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Token verification failed:', error);
        // Token is invalid, clear it
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // On error, assume not authenticated and clear any stored data
      if (isBrowser()) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await apiClient.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage and redirect
      setUser(null);
      setIsAuthenticated(false);
      router.push('/');
    }
  };

  const requireAuth = () => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    requireAuth,
    checkAuth
  };
}
