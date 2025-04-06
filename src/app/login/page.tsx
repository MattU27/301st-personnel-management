"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { UserStatus } from '@/types/auth';

// Component with useSearchParams, wrapped in Suspense
function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pendingAccount, setPendingAccount] = useState(false);
  const [inactiveAccount, setInactiveAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user, isRedirecting } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    console.log('Login page mounted, auth state:', { isAuthenticated, user, isRedirecting });
    
    // Only redirect if authenticated and not currently in a redirect process
    if (isAuthenticated && user && !isRedirecting) {
      console.log('User is authenticated, redirecting to dashboard...');
      // Use direct location for more reliable redirect
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated, user, isRedirecting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPendingAccount(false);
    setInactiveAccount(false);
    setIsLoading(true);
    console.log('Attempting login with:', { email });

    try {
      // Check account status first
      const statusResponse = await axios.post('/api/auth/check-status', { email });
      
      // If account exists, check its status
      if (statusResponse.data.success && statusResponse.data.user) {
        const userStatus = statusResponse.data.user.status;
        
        if (userStatus === UserStatus.PENDING) {
          setPendingAccount(true);
          setIsLoading(false);
          return;
        }
        
        if (userStatus === UserStatus.INACTIVE) {
          setInactiveAccount(true);
          setIsLoading(false);
          return;
        }
      }
      
      // Proceed with login if account is active
      await login(email, password);
      console.log('Login successful, redirecting...');
    } catch (err: any) {
      console.error('Login failed:', err);
      // Check if it's a specific error from the API
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(err.message || 'Invalid email or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">301st Infantry Brigade</h2>
          <p className="mt-2 text-sm text-gray-600">Personnel Management System</p>
        </div>
        <Card>
          {pendingAccount ? (
            <div className="p-6">
              <div className="flex items-center justify-center mb-4 text-yellow-500">
                <ClockIcon className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Account Pending Approval</h3>
              <p className="text-gray-600 text-center mb-6">
                Your account is currently pending approval by a system administrator. 
                Please check back later or contact your administrator for assistance.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setPendingAccount(false);
                    setEmail('');
                    setPassword('');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Try Another Account
                </button>
              </div>
            </div>
          ) : inactiveAccount ? (
            <div className="p-6">
              <div className="flex items-center justify-center mb-4 text-red-500">
                <ExclamationTriangleIcon className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Account Inactive</h3>
              <p className="text-gray-600 text-center mb-6">
                Your account has been deactivated. Please contact your system administrator
                for assistance or to reactivate your account.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setInactiveAccount(false);
                    setEmail('');
                    setPassword('');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Try Another Account
                </button>
              </div>
            </div>
          ) : (
            <form className="mt-8 space-y-6 p-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  fullWidth
                  isLoading={isLoading}
                  className="group relative"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Sign in
                </Button>
              </div>
            </form>
          )}
          <div className="mt-6 text-center pb-6">
            <p className="text-sm text-gray-600">
              Don't have an account? 
              <Link href="/register" className="ml-1 font-medium text-primary hover:text-primary-dark">
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Main login page component with Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
} 