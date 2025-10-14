"use client";

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface UserPermissions {
  [module: string]: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
}

interface JWTToken {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  permissions: UserPermissions;
  exp: number;
}

export function usePermissions() {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadPermissionsFromToken();
    } else {
      setPermissions({});
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadPermissionsFromToken = () => {
    try {
      setLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      console.log('🔑 Token found:', !!token);
      
      if (!token) {
        console.log('❌ No token found in localStorage');
        setPermissions({});
        setLoading(false);
        return;
      }

      // Decode JWT token (client-side only, no verification needed for permissions)
      const decodedToken = decodeJWT(token);
      console.log('🔓 Decoded token:', decodedToken);
      
      if (decodedToken && decodedToken.permissions) {
        console.log('✅ Permissions found:', decodedToken.permissions);
        setPermissions(decodedToken.permissions);
      } else {
        console.log('❌ No permissions in token');
        setPermissions({});
      }
    } catch (error) {
      console.error('Error loading permissions from token:', error);
      setPermissions({});
    } finally {
      setLoading(false);
    }
  };

  const decodeJWT = (token: string): JWTToken | null => {
    try {
      // Split the token into parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      // Decode the payload (second part)
      const payload = parts[1];
      
      // Add padding if needed
      const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
      
      // Decode base64
      const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
      
      // Parse JSON
      const parsedPayload = JSON.parse(decodedPayload);
      
      // Check if token is expired
      if (parsedPayload.exp && parsedPayload.exp < Date.now() / 1000) {
        console.warn('JWT token has expired');
        return null;
      }
      
      return parsedPayload as JWTToken;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  const hasPermission = (module: string, action: 'create' | 'read' | 'update' | 'delete'): boolean => {
    if (!permissions[module]) {
      return false;
    }
    return permissions[module][action] === true;
  };

  const hasAnyPermission = (module: string): boolean => {
    if (!permissions[module]) {
      return false;
    }
    return Object.values(permissions[module]).some(permission => permission === true);
  };

  const canRead = (module: string): boolean => hasPermission(module, 'read');
  const canCreate = (module: string): boolean => hasPermission(module, 'create');
  const canUpdate = (module: string): boolean => hasPermission(module, 'update');
  const canDelete = (module: string): boolean => hasPermission(module, 'delete');

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    refetch: loadPermissionsFromToken
  };
}
