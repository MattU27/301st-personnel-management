'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { 
  UserGroupIcon, 
  DocumentTextIcon, 
  AcademicCapIcon, 
  ShieldCheckIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, logout, hasSpecificPermission } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  
  useEffect(() => {
    // Update logged in state after component mounts to avoid hydration mismatch
    setIsLoggedIn(!!user);
  }, [user]);

  const handleLogoutClick = () => {
    setShowLogoutConfirmation(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const features = [
    {
      name: 'Personnel Management',
      description: 'Efficiently manage reservist and enlisted personnel records with role-based access control.',
      icon: UserGroupIcon,
    },
    {
      name: 'Document Validation',
      description: 'Secure document upload, verification, and management with blockchain-backed immutability.',
      icon: DocumentTextIcon,
    },
    {
      name: 'Training Tracking',
      description: 'Schedule, manage, and track training sessions and attendance for all personnel.',
      icon: AcademicCapIcon,
    },
    {
      name: 'Secure Infrastructure',
      description: 'Built with security in mind, featuring JWT authentication and role-based permissions.',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Analytics Dashboard',
      description: 'Comprehensive analytics and reporting for data-driven decision making.',
      icon: ChartBarIcon,
    },
    {
      name: 'Mobile Responsive',
      description: 'Access the system on any device with a fully responsive design.',
      icon: DevicePhoneMobileIcon,
    },
  ];

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { 
      name: 'Documents', 
      href: '/documents',
      requiredPermission: ['manage_documents']
    },
    { 
      name: 'Policy Control', 
      href: '/policies',
      requiredPermission: ['upload_policy', 'edit_policy', 'delete_policy'] 
    },
    { 
      name: 'Trainings', 
      href: '/trainings',
      requiredPermission: ['manage_trainings'] 
    },
    { 
      name: 'Personnel', 
      href: '/personnel',
      requiredPermission: ['view_personnel', 'manage_company_personnel']
    },
    { 
      name: 'Companies', 
      href: '/companies',
      requiredPermission: ['manage_company_personnel']
    }
  ];

  // Filter navigation based on permissions
  const navigation = navigationItems.filter(item =>
    !item.requiredPermission || 
    (Array.isArray(item.requiredPermission) 
      ? item.requiredPermission.some(p => hasSpecificPermission?.(p))
      : hasSpecificPermission?.(item.requiredPermission))
  );

  return (
    <div className="bg-gray-100">
      {/* Custom navigation for logged-in users */}
      {isLoggedIn && (
        <nav className="bg-indigo-600 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="text-white font-bold text-xl">
                    AFP PMS
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="border-transparent text-indigo-100 hover:border-indigo-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                <Link
                  href="/profile"
                  className="p-1 rounded-full text-indigo-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <UserCircleIcon className="h-6 w-6" aria-hidden="true" />
                </Link>
                <button
                  onClick={handleLogoutClick}
                  className="p-1 rounded-full text-indigo-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Hero section */}
      <div className="relative bg-gray-900">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-50"
            src="https://images.unsplash.com/photo-1579912437766-7896df6d3cd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
            alt="Military formation"
          />
          <div className="absolute inset-0 bg-gray-900 opacity-70" aria-hidden="true" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            {!isLoggedIn && (
              <img 
                src="/AFP_seal.png" 
                alt="AFP Seal" 
                className="h-28 mb-6"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }} 
              />
            )}
            <h1 className={`text-4xl font-bold tracking-tight text-white sm:text-5xl ${isLoggedIn ? 'lg:text-5xl' : 'lg:text-6xl'}`}>
              ARMED FORCES OF THE PHILIPPINES
            </h1>
            <h2 className="text-2xl font-medium text-white mt-4">
              Personnel Management System
            </h2>
            <p className="mt-6 text-xl text-gray-300 max-w-3xl">
              A comprehensive system for managing military personnel, document validation, and training tracking.
            </p>
            {!isLoggedIn && (
              <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/login">
                  <Button size="lg" variant="primary" className="bg-yellow-600 hover:bg-yellow-700 min-w-[150px]">
                    SIGN IN
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="bg-gray-200 hover:bg-gray-300 text-gray-900 min-w-[150px]">
                    REGISTER
                  </Button>
                </Link>
              </div>
            )}
            {isLoggedIn && (
              <div className="mt-10">
                <Link href="/dashboard">
                  <Button size="lg" variant="primary" className="bg-yellow-600 hover:bg-yellow-700 min-w-[200px]">
                    GO TO DASHBOARD
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mission statement */}
      <div className="bg-gray-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-medium">
            "Serving the Filipino people, securing the sovereignty of the state, and protecting the integrity of our national territory."
          </p>
        </div>
      </div>

      {/* Features section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-yellow-600 font-semibold tracking-wide uppercase">SYSTEM CAPABILITIES</h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
              Enhanced Command and Control
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Our system provides robust tools for personnel management, document validation, and training coordination.
            </p>
          </div>

          <div className="mt-12">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {features.map((feature) => (
                <div key={feature.name} className="relative border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-600 text-white">
                      <feature.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg leading-6 font-bold text-gray-900">{feature.name}</h3>
                  </div>
                  <p className="mt-3 text-base text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA section - only show when not logged in */}
      {!isLoggedIn && (
        <div className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                <span className="block">Ready to serve?</span>
                <span className="block text-yellow-500">Access the system or request assistance.</span>
              </h2>
              <p className="mt-4 text-lg text-gray-300">
                Authorized personnel can access the system to manage records, training, and documents.
              </p>
            </div>
            <div className="mt-8 flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-4 lg:mt-0 lg:flex-shrink-0">
              <Link href="/register">
                <Button variant="primary" size="lg" className="bg-yellow-600 hover:bg-yellow-700 min-w-[150px]">
                  GET STARTED
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="secondary" size="lg" className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 min-w-[150px]">
                  CONTACT US
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer section */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm">Armed Forces of the Philippines © {new Date().getFullYear()} All Rights Reserved</p>
            <p className="text-xs mt-2">This system is for authorized personnel only. Unauthorized access is prohibited.</p>
          </div>
        </div>
      </footer>

      {/* Logout confirmation dialog */}
      {isLoggedIn && showLogoutConfirmation && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Confirm Logout</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Are you sure you want to log out of your account?</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleLogout}
                >
                  Logout
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowLogoutConfirmation(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
