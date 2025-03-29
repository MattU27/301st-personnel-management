"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole, PersonnelStatus, CompanyType } from '@/types/personnel';

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

// Define user interface
interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  company?: CompanyType;
  rank?: string;
  status?: PersonnelStatus;
  serialNumber?: string;
  branch?: string;
}

// Mock user data for 301st Infantry Brigade
const MOCK_USERS = [
  {
    id: 1,
    name: 'CPT Santos, Juan C.',
    email: 'juan.santos@army.mil.ph',
    password: 'password123', // In a real app, this would be hashed
    role: 'RESERVIST' as UserRole,
    company: 'Alpha' as CompanyType,
    rank: 'Captain',
    status: 'Ready' as PersonnelStatus,
    serialNumber: '301-12345',
    branch: '301st Infantry Brigade'
  },
  {
    id: 2,
    name: 'MAJ Cruz, Maria L.',
    email: 'maria.cruz@army.mil.ph',
    password: 'password123',
    role: 'STAFF' as UserRole,
    rank: 'Major',
    serialNumber: '301-23456',
    branch: '301st Infantry Brigade'
  },
  {
    id: 3,
    name: 'COL Reyes, Antonio D.',
    email: 'antonio.reyes@army.mil.ph',
    password: 'password123',
    role: 'ADMIN' as UserRole,
    rank: 'Colonel',
    serialNumber: '301-34567',
    branch: '301st Infantry Brigade'
  },
  {
    id: 4,
    name: 'BGEN De La Cruz, Roberto M.',
    email: 'roberto.delacruz@army.mil.ph',
    password: 'password123',
    role: 'DIRECTOR' as UserRole,
    rank: 'Brigadier General',
    serialNumber: '301-45678',
    branch: '301st Infantry Brigade'
  }
];

// Add a more comprehensive permission system
interface Permission {
  id: string;
  name: string;
  description: string;
}

// Define permissions by role
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  'RESERVIST': [
    'view_own_profile',
    'edit_own_profile',
    'view_own_documents',
    'upload_own_documents',
    'view_trainings',
    'register_trainings',
    'view_announcements',
    'view_calendar',
    'view_attended_trainings',
    'view_policy'
  ],
  'STAFF': [
    'view_own_profile',
    'edit_own_profile',
    'view_own_documents',
    'upload_own_documents',
    'view_trainings',
    'register_trainings',
    'view_announcements',
    'manage_company_personnel',
    'add_personnel_records',
    'update_personnel_records',
    'view_company_personnel',
    'update_reservist_status',
    'approve_reservist_accounts',
    'post_announcements',
    'manage_trainings',
    'validate_documents',
    'upload_policy',
    'manage_policy'
  ],
  'ADMIN': [
    'view_own_profile',
    'edit_own_profile',
    'view_own_documents',
    'upload_own_documents',
    'view_trainings',
    'register_trainings',
    'view_announcements',
    'manage_staff_accounts',
    'deactivate_staff_accounts',
    'add_personnel_records',
    'update_personnel_records',
    'delete_personnel_records',
    'view_all_personnel',
    'approve_reservist_accounts',
    'deactivate_reservist_accounts',
    'manage_system',
    'manage_policy'
  ],
  'DIRECTOR': [
    'view_own_profile',
    'edit_own_profile',
    'view_own_documents',
    'upload_own_documents',
    'view_trainings',
    'register_trainings',
    'view_announcements',
    'create_admin_accounts',
    'review_admin_registrations',
    'approve_admin_accounts',
    'reject_admin_accounts',
    'deactivate_admin_accounts',
    'reactivate_admin_accounts',
    'manage_admin_roles',
    'view_system_analytics',
    'view_prescriptive_analytics',
    'manage_system_configuration',
    'view_reports',
    'manage_reports',
    'export_reports',
    'manage_resources',
    'manage_trainings_schedule'
  ]
};

// Define auth context interface
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (requiredRole: UserRole) => boolean;
  hasSpecificPermission: (permission: string) => boolean;
  sessionExpiring: boolean;
  extendSession: () => void;
  simulateRole: (role: UserRole) => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

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

  const checkAuth = async () => {
    console.log('Running checkAuth...');
    try {
      // Check cookie first
      const userCookie = getCookie('user');
      console.log('User cookie:', userCookie);
      
      if (userCookie) {
        const parsedUser = JSON.parse(userCookie);
        console.log('Parsed user from cookie:', parsedUser);
        setUser(parsedUser);
        // Ensure localStorage is in sync
        localStorage.setItem('user', userCookie);
        return;
      }

      // Fallback to localStorage
      const storedUser = localStorage.getItem('user');
      console.log('Stored user from localStorage:', storedUser);
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('Parsed user from localStorage:', parsedUser);
        setUser(parsedUser);
        // Sync cookie with localStorage
        setCookie('user', storedUser);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset session timeout
  const resetSessionTimeout = useCallback(() => {
    // Clear existing timeouts
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
    
    if (sessionWarningRef.current) {
      clearTimeout(sessionWarningRef.current);
      sessionWarningRef.current = null;
    }
    
    // Only set new timeouts if user is logged in
    if (user) {
      // Set warning timeout (5 minutes before expiry)
      sessionWarningRef.current = setTimeout(() => {
        setSessionExpiring(true);
      }, SESSION_TIMEOUT - 5 * 60 * 1000);
      
      // Set session timeout
      sessionTimeoutRef.current = setTimeout(() => {
        logout();
      }, SESSION_TIMEOUT);
    }
  }, [user]);

  // Extend session
  const extendSession = useCallback(() => {
    setSessionExpiring(false);
    resetSessionTimeout();
  }, [resetSessionTimeout]);

  // Setup event listeners for user activity
  useEffect(() => {
    if (!user) return;
    
    // Reset timeout on initial login
    resetSessionTimeout();
    
    // Events to track for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // Throttled event handler to prevent excessive calls
    let lastActivityTime = Date.now();
    const activityHandler = () => {
      const now = Date.now();
      if (now - lastActivityTime > 60000) { // Only reset if more than a minute has passed
        lastActivityTime = now;
        resetSessionTimeout();
      }
    };
    
    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, activityHandler);
    });
    
    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, activityHandler);
      });
      
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
      
      if (sessionWarningRef.current) {
        clearTimeout(sessionWarningRef.current);
      }
    };
  }, [user, resetSessionTimeout]);

  const login = async (email: string, password: string) => {
    console.log('Login attempt with:', { email });
    setIsLoading(true);
    try {
      // Mock authentication
      const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password);
      console.log('Found user:', mockUser);
      
      if (!mockUser) {
        throw new Error('Invalid credentials');
      }
      
      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = mockUser;
      console.log('Setting user in state:', userWithoutPassword);
      setUser(userWithoutPassword);
      
      const userJson = JSON.stringify(userWithoutPassword);
      console.log('Storing user data...');
      localStorage.setItem('user', userJson);
      setCookie('user', userJson);
      
      // After successful login, reset session timeout
      resetSessionTimeout();
      
      return Promise.resolve();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('Logging out...');
    setIsLoading(true);
    try {
      setUser(null);
      localStorage.removeItem('user');
      document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      router.push('/login');
      
      // Clear session timeouts
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }
      
      if (sessionWarningRef.current) {
        clearTimeout(sessionWarningRef.current);
        sessionWarningRef.current = null;
      }
      
      setSessionExpiring(false);
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!user) return false;
    
    const roleHierarchy: Record<UserRole, number> = {
      'RESERVIST': 0,
      'STAFF': 1,
      'ADMIN': 2,
      'DIRECTOR': 3
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  // Function to simulate a different role for testing
  const simulateRole = (role: UserRole) => {
    setSimulatedRole(role);
    console.log(`Simulating role: ${role}`);
  };

  // Update hasSpecificPermission to use simulatedRole if available
  const hasSpecificPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Use simulatedRole if available, otherwise use user's actual role
    const userRole = simulatedRole || user.role;
    const permissions = ROLE_PERMISSIONS[userRole] || [];
    
    return permissions.includes(permission);
  };

  const contextValue: AuthContextType = {
    user,
    isLoading: !mounted || isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission,
    hasSpecificPermission,
    sessionExpiring,
    extendSession,
    simulateRole
  };

  console.log('AuthContext state:', {
    user,
    isLoading: !mounted || isLoading,
    isAuthenticated: !!user,
    mounted
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {mounted ? children : null}
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