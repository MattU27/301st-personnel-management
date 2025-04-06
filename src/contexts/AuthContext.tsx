"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole, UserStatus } from '@/types/auth';
import axios from 'axios';
import Cookies from 'js-cookie';
import { hasPermission as checkRolePermission } from '@/utils/rolePermissions';
import { auditService } from '@/utils/auditService';

// Cookie helper functions
const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
};

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  return null;
};

// Add a more comprehensive permission system
interface Permission {
  id: string;
  name: string;
  description: string;
}

// Add RegisterData interface
interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
  rank?: string;
  company?: string;
}

// Define auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mounted: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasSpecificPermission: (permission: string) => boolean;
  sessionExpiring: boolean;
  extendSession: () => void;
  simulateRole: (role: UserRole) => void;
  isRedirecting: boolean;
  register: (userData: RegisterData) => Promise<void>;
  getToken: () => Promise<string | null>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;
// Warning timeout (2 minutes before session expiry)
const WARNING_TIMEOUT = SESSION_TIMEOUT - (2 * 60 * 1000);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [sessionExpiring, setSessionExpiring] = useState(false);
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionWarningRef = useRef<NodeJS.Timeout | null>(null);
  const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    console.log('AuthProvider mounted');
    setMounted(true);
  }, []);

  // Check for existing session
  useEffect(() => {
    if (mounted) {
      console.log('Checking auth state...');
      checkAuth();
    }
  }, [mounted]);

  // Log the current auth context state
  useEffect(() => {
    console.log('AuthContext state:', { user, isLoading, isAuthenticated: !!user, mounted });
  }, [user, isLoading, mounted]);

  const checkAuth = async () => {
    console.log('Running checkAuth...');
    try {
      // Check for token in cookies or localStorage
      const token = Cookies.get('token') || localStorage.getItem('token');
      
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      // If token exists, verify with the API
      const response = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setUser(response.data.data.user);
        startSessionTimer();
      } else {
        setUser(null);
        Cookies.remove('token');
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      Cookies.remove('token');
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset session timeout
  const resetSessionTimeout = useCallback(() => {
    console.log('Resetting session timeout');
    
    // Clear existing timeouts
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }

    if (sessionWarningRef.current) {
      clearTimeout(sessionWarningRef.current);
      sessionWarningRef.current = null;
    }

    // Set new timeouts only if user is logged in
    if (user) {
      console.log('Setting new session timeouts');
      
      sessionWarningRef.current = setTimeout(() => {
        console.log('Session warning triggered');
        setSessionExpiring(true);
      }, WARNING_TIMEOUT);

      sessionTimeoutRef.current = setTimeout(() => {
        console.log('Session timeout triggered, logging out');
        logout();
      }, SESSION_TIMEOUT);
    }
  }, [user]);

  // Start session timer
  const startSessionTimer = useCallback(() => {
    console.log('Starting session timer');
    resetSessionTimeout();

    // Add activity listeners
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'click'];
    
    const activityHandler = () => {
      if (user) {
        resetSessionTimeout();
        if (sessionExpiring) {
          setSessionExpiring(false);
        }
      }
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, activityHandler);
    });

    return () => {
      console.log('Cleaning up session timer');
      activityEvents.forEach(event => {
        window.removeEventListener(event, activityHandler);
      });
      
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }
      
      if (sessionWarningRef.current) {
        clearTimeout(sessionWarningRef.current);
        sessionWarningRef.current = null;
      }
    };
  }, [user, resetSessionTimeout, sessionExpiring]);

  // Setup session timeout when user changes
  useEffect(() => {
    const cleanupFunction = startSessionTimer();
    return cleanupFunction;
  }, [user, startSessionTimer]);

  // Extend session
  const extendSession = useCallback(() => {
    if (sessionExpiring) {
      setSessionExpiring(false);
      resetSessionTimeout();
    }
  }, [sessionExpiring, resetSessionTimeout]);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('AuthContext: Sending login request');
      const response = await axios.post('/api/auth/login', { email, password });
      
      console.log('AuthContext: Login response:', response.data);
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        
        console.log('AuthContext: Login successful, storing token and user data');
        
        // Save token to both localStorage and cookies for redundancy
        localStorage.setItem('token', token);
        Cookies.set('token', token, { expires: 1, secure: process.env.NODE_ENV === 'production' });
        
        // Clear any existing session timeouts before setting user
        if (sessionTimeoutRef.current) {
          clearTimeout(sessionTimeoutRef.current);
          sessionTimeoutRef.current = null;
        }
        
        if (sessionWarningRef.current) {
          clearTimeout(sessionWarningRef.current);
          sessionWarningRef.current = null;
        }
        
        // Make sure session expiring flag is turned off
        setSessionExpiring(false);
        
        // Reset any simulated role
        setSimulatedRole(null);
        
        setUser(user);
        
        // Reset redirection flag to false first, then set it to true
        // This helps prevent issues with stale state
        setIsRedirecting(false);
        
        // Initialize session timer with a delay to avoid immediate triggers
        setTimeout(() => {
          resetSessionTimeout();
          // Now that everything is set up, redirect
          setIsRedirecting(true);
          router.push('/dashboard');
        }, 100);
      } else {
        console.error('AuthContext: Login failed with error from server:', response.data.error);
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('AuthContext: Login failed with exception:', error);
      if (error.response) {
        console.error('AuthContext: Error response data:', error.response.data);
        console.error('AuthContext: Error response status:', error.response.status);
      }
      throw new Error(error.response?.data?.error || error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get('token') || localStorage.getItem('token');
      
      // Log the logout action to the audit system
      if (user) {
        try {
          const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
          const userRank = user.rank ? `${user.rank} ` : '';
          const userCompany = user.company ? ` (${user.company})` : '';
          
          await auditService.logUserAction(
            user._id,
            fullName,
            user.role,
            'logout',
            'user',
            user._id,
            `${userRank}${fullName}${userCompany} logged out`
          );
        } catch (auditError) {
          console.error('Error logging logout to audit system:', auditError);
          // Don't fail the logout if audit logging fails
        }
      }
      
      // Clear cookies and local storage
      Cookies.remove('token');
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      
      // Notify server about logout
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }).catch(err => console.error('Error during logout:', err));
      }
      
      // Reset the state
      setUser(null);
      
      // Clear timeouts
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }
      
      if (sessionWarningRef.current) {
        clearTimeout(sessionWarningRef.current);
        sessionWarningRef.current = null;
      }
      
      setSessionExpiring(false);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      
      // Still clear local state even if server request fails
      setUser(null);
      Cookies.remove('token');
      localStorage.removeItem('token');
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has required role or higher
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Define role-based permissions
    const rolePermissions: Record<UserRole, string[]> = {
      [UserRole.DIRECTOR]: [
        'view_personnel',
        'manage_company_personnel',
        'approve_reservist_accounts',
        'create_admin_accounts',
        'manage_admin_accounts',
        'post_announcements',
        'manage_announcements',
        'manage_trainings',
        'manage_documents',
        'upload_policy',
        'edit_policy',
        'delete_policy',
        'access_system_settings',
        'view_audit_logs',
        'run_reports',
        'export_data'
      ],
      [UserRole.ADMIN]: [
        'view_personnel',
        'manage_company_personnel',
        'approve_reservist_accounts',
        'post_announcements',
        'manage_announcements',
        'manage_trainings',
        'manage_documents',
        'upload_policy',
        'edit_policy',
        'delete_policy',
        'run_reports',
        'export_data'
      ],
      [UserRole.STAFF]: [
        'view_personnel',
        'manage_company_personnel',
        'post_announcements',
        'manage_trainings',
        'manage_documents'
      ],
      [UserRole.ENLISTED]: [
        'view_personnel'
      ],
      [UserRole.RESERVIST]: [
        'view_personnel'
      ]
    };

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes(permission);
  };

  // Simulate a role for testing purposes
  const simulateRole = (role: UserRole) => {
    setSimulatedRole(role);
  };

  // Check if user has a specific permission
  const hasSpecificPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Use simulated role if set
    const roleToCheck = simulatedRole || user.role;
    
    // Use the imported checkPermission function
    return checkRolePermission(roleToCheck, permission as any);
  };

  const getToken = async (): Promise<string | null> => {
    try {
      return Cookies.get('token') || localStorage.getItem('token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  // Add register function
  const register = async (userData: RegisterData): Promise<void> => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.response?.data?.error || error.message || 'Registration failed');
    }
  };

  // Provide auth context value
  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    mounted,
    login,
    logout,
    hasPermission,
    hasSpecificPermission,
    sessionExpiring,
    extendSession,
    simulateRole,
    isRedirecting,
    getToken,
    register,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 