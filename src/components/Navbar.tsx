"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import ConfirmationDialog from './ConfirmationDialog';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const pathname = usePathname();
  const { user, logout, hasSpecificPermission } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

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

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Documents', href: '/documents' },
    { name: 'Trainings', href: '/trainings' },
    { 
      name: 'Personnel', 
      href: '/personnel',
      requiredPermission: ['view_company_personnel', 'view_all_personnel']
    }
  ].filter(item => 
    !item.requiredPermission || 
    (Array.isArray(item.requiredPermission) 
      ? item.requiredPermission.some(p => hasSpecificPermission(p))
      : hasSpecificPermission(item.requiredPermission))
  );

  if (!user) {
    return null;
  }

  return (
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
                  className={`${
                    pathname === item.href
                      ? 'border-white text-white'
                      : 'border-transparent text-indigo-100 hover:border-indigo-300 hover:text-white'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
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
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-indigo-100 hover:text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="space-y-1 px-2 pb-3 pt-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                pathname === item.href
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
              } block rounded-md px-3 py-2 text-base font-medium`}
            >
              {item.name}
            </Link>
          ))}
          <div className="border-t border-indigo-700 pt-4 pb-3">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <UserCircleIcon className="h-10 w-10 text-indigo-100" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">{user.name}</div>
                <div className="text-sm font-medium text-indigo-100">{user.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1 px-2">
              <Link
                href="/profile"
                className="block rounded-md px-3 py-2 text-base font-medium text-indigo-100 hover:bg-indigo-700 hover:text-white"
              >
                Your Profile
              </Link>
              <button
                onClick={handleLogoutClick}
                className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-indigo-100 hover:bg-indigo-700 hover:text-white"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout confirmation dialog */}
      <ConfirmationDialog
        isOpen={showLogoutConfirmation}
        onClose={() => setShowLogoutConfirmation(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
        confirmText="Logout"
        cancelText="Cancel"
        type="warning"
      />
    </nav>
  );
};

export default Navbar; 