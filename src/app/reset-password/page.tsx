"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string>('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    // Get token from URL query parameters
    const tokenFromUrl = searchParams?.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setTokenError(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!token) {
      setError('Invalid or missing password reset token');
      setIsLoading(false);
      return;
    }

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Please enter and confirm your new password');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/auth/reset-password', {
        token,
        newPassword,
      });

      if (response.data.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(response.data.error || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred while resetting your password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100">
      {/* Navy blue header bar */}
      <div className="bg-[#092140] text-white py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center">
          <Link href="/" className="flex items-center group">
            <div className="flex flex-col relative overflow-hidden">
              <span className="text-white font-bold text-lg tracking-wider group-hover:text-[#D1B000] transition-colors duration-300">301st READY RESERVE</span>
              <span className="text-[#D1B000] text-xs tracking-widest">INFANTRY BATTALION</span>
              <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D1B000] group-hover:w-full transition-all duration-500"></div>
            </div>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-20 left-[10%] w-32 h-32 rounded-full bg-[#092140] opacity-5 transform rotate-45"></div>
          <div className="absolute bottom-20 right-[10%] w-40 h-40 rounded-full bg-[#D1B000] opacity-5"></div>
          <div className="absolute top-[40%] right-[15%] w-24 h-24 rounded-full bg-[#092140] opacity-5"></div>
        </div>
        
        <div className="max-w-xl w-full space-y-8 animate-fadeIn relative z-10">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full opacity-50 bg-gradient-to-r from-[#D1B000] to-[#092140] blur-sm animate-pulse"></div>
                <img 
                  src="/AFP_seal.png" 
                  alt="301st Battalion Seal" 
                  className="h-24 w-24 animate-slideInUp relative"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }} 
                />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-[#092140] animate-slideInUp animation-delay-300">Reset Password</h2>
            
            {/* Enhanced gold line accent */}
            <div className="relative w-32 h-[2px] bg-[#D1B000] mx-auto mt-4 mb-8 animate-slideInUp animation-delay-600">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#D1B000]"></div>
            </div>
          </div>

          <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-100 animate-slideInUp animation-delay-700 transition-all duration-300 hover:shadow-2xl">
            {tokenError ? (
              <div className="p-8 text-center">
                <div className="text-red-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Invalid Reset Link</h3>
                <p className="text-gray-600 mb-6">
                  The password reset link is invalid or has expired. Please request a new password reset.
                </p>
                <Link 
                  href="/password-recovery"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#092140] hover:bg-[#0a2d5a] focus:outline-none"
                >
                  Return to Password Recovery
                </Link>
              </div>
            ) : success ? (
              <div className="p-8 text-center">
                <div className="text-green-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Password Reset Successful</h3>
                <p className="text-gray-600 mb-6">
                  Your password has been updated successfully. You will be redirected to the login page shortly.
                </p>
                <Link 
                  href="/login"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#092140] hover:bg-[#0a2d5a] focus:outline-none"
                >
                  Login Now
                </Link>
              </div>
            ) : (
              <form className="p-8" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mb-6">
                  <label htmlFor="new-password" className="block text-base font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="new-password"
                      name="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="appearance-none relative block w-full pl-12 px-4 py-4 text-base border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-[#092140] focus:border-[#092140] focus:z-10"
                      placeholder="Enter your new password"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Password must be at least 8 characters long
                  </p>
                </div>
                
                <div className="mb-8">
                  <label htmlFor="confirm-password" className="block text-base font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="appearance-none relative block w-full pl-12 px-4 py-4 text-base border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-[#092140] focus:border-[#092140] focus:z-10"
                      placeholder="Confirm your new password"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`py-3 px-8 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#092140] hover:bg-[#0a2d5a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#092140] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-[#092140] border-t border-gray-800 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center text-[10px] py-1">
            <div className="flex items-center">
              <div className="mr-4">
                <div className="flex items-center mb-1">
                  <div className="w-6 h-[1px] bg-[#D1B000] mr-2"></div>
                  <div className="w-6 h-[1px] bg-[#D1B000]"></div>
                </div>
                <span className="font-semibold">301st READY RESERVE</span>
                <span className="text-[#D1B000] ml-1">INFANTRY BATTALION</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-gray-400">
              <span>© {new Date().getFullYear()} AFP</span>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes slideInUp {
          0% { 
            opacity: 0;
            transform: translateY(20px);
          }
          100% { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.8s ease-out forwards;
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        
        .animation-delay-500 {
          animation-delay: 500ms;
        }
        
        .animation-delay-600 {
          animation-delay: 600ms;
        }
        
        .animation-delay-700 {
          animation-delay: 700ms;
        }
      `}</style>
    </div>
  );
} 