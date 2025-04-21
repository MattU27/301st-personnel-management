"use client";

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { 
  isValidEmailFormat, 
  isAllowedAlternativeEmailDomain, 
  getAlternativeEmailDomainsErrorMessage 
} from '@/utils/validation';

export default function PasswordRecoveryPage() {
  const [step, setStep] = useState<'method' | 'serviceId' | 'email' | 'success'>('method');
  const [method, setMethod] = useState<'serviceId' | 'email'>('serviceId');
  const [serviceId, setServiceId] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleMethodSelection = (selectedMethod: 'serviceId' | 'email') => {
    setMethod(selectedMethod);
    setStep(selectedMethod);
  };

  const handleServiceIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!serviceId.trim()) {
      setError('Please enter your Service ID');
      setIsLoading(false);
      return;
    }

    try {
      // Call the service ID password recovery API
      const response = await axios.post('/api/auth/recover-password/service-id', { serviceId });
      
      if (response.data.success) {
        setIsLoading(false);
        setStep('success');
        setSuccessMessage(response.data.message || 'If your Service ID is registered in our system, you will receive a password reset link at your registered email address.');
      } else if (process.env.NODE_ENV !== 'production' && response.data.devToken) {
        // Handle development mode response with token
        setIsLoading(false);
        
        // For development, show the token and reset URL
        setStep('success');
        setSuccessMessage(
          `DEVELOPMENT MODE: Email sending failed, but you can use this link to reset your password: 
          <a href="${response.data.devResetUrl}" class="text-blue-600 underline">${response.data.devResetUrl}</a>`
        );
      } else {
        setError(response.data.error || 'Password recovery failed. Please try again.');
        
        // If we're in development mode and there are details, show them
        if (process.env.NODE_ENV !== 'production' && response.data.details) {
          setError(`${response.data.error} - Details: ${response.data.details}`);
        }
        
        setIsLoading(false);
      }
    } catch (error: any) {
      setIsLoading(false);
      
      console.error('Password reset error:', error);
      
      if (error.response?.data?.error) {
        setError(error.response.data.error);
        
        // If we're in development mode and there are details, show them
        if (process.env.NODE_ENV !== 'production' && error.response.data.details) {
          setError(`${error.response.data.error} - Details: ${error.response.data.details}`);
        }
      } else if (error.message) {
        setError(`Request failed: ${error.message}`);
      } else {
        setError('Password recovery failed. Please try again.');
      }
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email.trim()) {
      setError('Please enter your alternative email');
      setIsLoading(false);
      return;
    }

    // Validate email format
    if (!isValidEmailFormat(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Validate allowed email domains
    if (!isAllowedAlternativeEmailDomain(email)) {
      setError(getAlternativeEmailDomainsErrorMessage());
      setIsLoading(false);
      return;
    }

    try {
      // Call the email password recovery API
      const response = await axios.post('/api/auth/recover-password/email', { email });
      
      if (response.data.success) {
        setIsLoading(false);
        setStep('success');
        setSuccessMessage(response.data.message || 'If your email is registered in our system, you will receive a password reset link.');
      } else if (process.env.NODE_ENV !== 'production' && response.data.devToken) {
        // Handle development mode response with token
        setIsLoading(false);
        
        // For development, show the token and reset URL
        setStep('success');
        setSuccessMessage(
          `DEVELOPMENT MODE: Email sending failed, but you can use this link to reset your password: 
          <a href="${response.data.devResetUrl}" class="text-blue-600 underline">${response.data.devResetUrl}</a>`
        );
      } else {
        setError(response.data.error || 'Password recovery failed. Please try again.');
        
        // If we're in development mode and there are details, show them
        if (process.env.NODE_ENV !== 'production' && response.data.details) {
          setError(`${response.data.error} - Details: ${response.data.details}`);
        }
        
        setIsLoading(false);
      }
    } catch (error: any) {
      setIsLoading(false);
      
      console.error('Password reset error:', error);
      
      if (error.response?.data?.error) {
        setError(error.response.data.error);
        
        // If we're in development mode and there are details, show them
        if (process.env.NODE_ENV !== 'production' && error.response.data.details) {
          setError(`${error.response.data.error} - Details: ${error.response.data.details}`);
        }
      } else if (error.message) {
        setError(`Request failed: ${error.message}`);
      } else {
        setError('Password recovery failed. Please try again.');
      }
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
            <h2 className="text-3xl font-extrabold text-[#092140] animate-slideInUp animation-delay-300">Password Recovery</h2>
            <p className="mt-2 text-sm text-gray-600 animate-slideInUp animation-delay-500">
              Recover access to your account
            </p>
            
            {/* Enhanced gold line accent */}
            <div className="relative w-32 h-[2px] bg-[#D1B000] mx-auto mt-4 mb-8 animate-slideInUp animation-delay-600">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#D1B000]"></div>
            </div>
          </div>

          <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-100 animate-slideInUp animation-delay-700 transition-all duration-300 hover:shadow-2xl">
            {step === 'method' && (
              <div className="p-8">
                <h3 className="text-xl font-medium text-center text-gray-900 mb-8">Select recovery method</h3>
                
                <div className="space-y-6">
                  <button
                    onClick={() => handleMethodSelection('serviceId')}
                    className="w-full flex items-center justify-between p-6 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#092140] transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center">
                      <div className="p-3 bg-[#092140] bg-opacity-10 rounded-full mr-5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#092140]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-lg text-[#092140]">Recover with Service ID</p>
                        <p className="text-base text-gray-600 mt-1">Use your AFP Service ID number</p>
                      </div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => handleMethodSelection('email')}
                    className="w-full flex items-center justify-between p-6 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#092140] transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center">
                      <div className="p-3 bg-[#092140] bg-opacity-10 rounded-full mr-5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#092140]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-lg text-[#092140]">Recover with Alternative Email</p>
                        <p className="text-base text-gray-600 mt-1">Use your registered personal email</p>
                      </div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                <div className="mt-8 text-center">
                  <Link
                    href="/login"
                    className="text-base font-medium text-[#092140] hover:text-[#0a2d5a] transition-colors"
                  >
                    Return to login
                  </Link>
                </div>
              </div>
            )}

            {step === 'serviceId' && (
              <form className="p-8" onSubmit={handleServiceIdSubmit}>
                <h3 className="text-xl font-medium text-center text-gray-900 mb-8">Recover with Service ID</h3>
                
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
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
                
                <div className="mb-8">
                  <label htmlFor="service-id" className="block text-base font-medium text-gray-700 mb-2">
                    Service ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                    </div>
                    <input
                      id="service-id"
                      name="serviceId"
                      type="text"
                      value={serviceId}
                      onChange={(e) => setServiceId(e.target.value)}
                      required
                      className="appearance-none relative block w-full pl-12 px-4 py-4 text-base border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-[#092140] focus:border-[#092140] focus:z-10"
                      placeholder="Enter your Service ID"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    We'll send a password reset link to the email associated with this Service ID
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('method')}
                    className="py-3 px-5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Back
                  </button>
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
                    ) : 'Submit'}
                  </button>
                </div>
              </form>
            )}

            {step === 'email' && (
              <form className="p-8" onSubmit={handleEmailSubmit}>
                <h3 className="text-xl font-medium text-center text-gray-900 mb-8">Recover with Alternative Email</h3>
                
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
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
                
                <div className="mb-8">
                  <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-2">
                    Alternative Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="appearance-none relative block w-full pl-12 px-4 py-4 text-base border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-[#092140] focus:border-[#092140] focus:z-10"
                      placeholder="Enter your alternative email"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    We'll send a password reset link to this email address
                  </p>
                  
                  {/* Allowed email domains */}
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Accepted email providers:</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        Gmail
                      </span>
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                        Yahoo
                      </span>
                      <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                        Outlook
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('method')}
                    className="py-3 px-5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Back
                  </button>
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
                    ) : 'Submit'}
                  </button>
                </div>
              </form>
            )}

            {step === 'success' && (
              <div className="p-8 text-center">
                <div className="mb-6">
                  <svg className="h-16 w-16 text-green-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">Check Your Email</h3>
                <div 
                  className="text-gray-600 mb-8"
                  dangerouslySetInnerHTML={{ __html: successMessage }}
                ></div>
                <p className="text-sm text-gray-500 mb-6">
                  {process.env.NODE_ENV === 'production' ? (
                    "If you don't receive an email within a few minutes, please check your spam folder."
                  ) : (
                    "This is a development environment. Check the server console for email details if you don't see a reset link above."
                  )}
                </p>
                <button
                  onClick={() => setStep('method')}
                  className="w-full bg-[#092140] text-white py-3 px-4 rounded-lg hover:bg-[#0c2c54] focus:outline-none focus:ring-2 focus:ring-[#092140] focus:ring-opacity-50 transition duration-200"
                >
                  Start Over
                </button>
              </div>
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