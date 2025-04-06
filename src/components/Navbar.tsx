"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import ConfirmationDialog from './ConfirmationDialog';
import { navigationConfig, NavItem } from '@/config/navigation';
import { UserRole } from '@/types/auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [hasLoggedIn, setHasLoggedIn] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Track when user logs in
  useEffect(() => {
    if (user && !hasLoggedIn) {
      console.log('User logged in, setting hasLoggedIn flag');
      setHasLoggedIn(true);
      
      // Ensure logout confirmation is hidden when we first login
      setShowLogoutConfirmation(false);
    } else if (!user) {
      // Reset the flag when user logs out
      setHasLoggedIn(false);
    }
  }, [user, hasLoggedIn]);
  
  // Track logout confirmation dialog state
  useEffect(() => {
    if (showLogoutConfirmation) {
      console.log('Logout confirmation dialog opened');
    }
  }, [showLogoutConfirmation]);
  
  // Check if we just logged in to prevent immediate logout dialog
  useEffect(() => {
    // Force close the logout dialog when component mounts
    setShowLogoutConfirmation(false);
    
    // Additional safety check after a delay
    const timer = setTimeout(() => {
      if (showLogoutConfirmation) {
        console.log('Forcing logout confirmation dialog to close');
        setShowLogoutConfirmation(false);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false);
      }
      
      // Close dropdowns when clicking outside
      if (openDropdown) {
        const currentDropdownRef = dropdownRefs.current[openDropdown];
        if (currentDropdownRef && !currentDropdownRef.contains(event.target as Node)) {
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, openDropdown]);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isOpen) {
          setIsOpen(false);
        }
        if (openDropdown) {
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, openDropdown]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
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

  // Filter navigation items based on user role
  const navigation = navigationConfig.filter(item => 
    user?.role && item.roles.includes(user.role as UserRole)
  );

  // Hide Navbar in these cases:
  // 1. User is not logged in
  if (!user) {
    return null;
  }

  // 2. Always hide on the homepage (/) regardless of login status
  if (pathname === '/') {
    return null;
  }

  // Check if a navigation item is active (including child routes)
  const isActiveNavItem = (item: NavItem): boolean => {
    if (pathname === item.href) return true;
    if (item.children) {
      return item.children.some(child => pathname === child.href);
    }
    return false;
  };

  // Render a dropdown menu for navigation items with children
  const renderDropdown = (item: NavItem) => {
    return (
      <div 
        className="relative" 
        key={item.label}
        ref={(el) => { dropdownRefs.current[item.label] = el; }}
      >
        <button
          className={`${
            isActiveNavItem(item)
              ? 'border-white text-white'
              : 'border-transparent text-indigo-100 hover:border-indigo-300 hover:text-white'
          } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 rounded-md`}
          onClick={() => toggleDropdown(item.label)}
          aria-expanded={openDropdown === item.label}
          aria-haspopup="true"
        >
          {item.label}
          <ChevronDownIcon className="ml-1 h-4 w-4" aria-hidden="true" />
        </button>
        
        {openDropdown === item.label && item.children && (
          <div 
            className="absolute z-10 left-0 mt-2 w-48 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby={`${item.label}-menu-button`}
          >
            {item.children.map((child) => (
              <Link
                key={child.label}
                href={child.href}
                className={`${
                  pathname === child.href
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                } block px-4 py-2 text-sm`}
                role="menuitem"
                onClick={() => setOpenDropdown(null)}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="bg-indigo-600 shadow-lg" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-white font-bold text-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 rounded-md">
                AFP PMS
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8" role="navigation" aria-label="Main menu">
              {navigation.map((item) => (
                item.children 
                  ? renderDropdown(item)
                  : (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`${
                        pathname === item.href
                          ? 'border-white text-white'
                          : 'border-transparent text-indigo-100 hover:border-indigo-300 hover:text-white'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 rounded-md`}
                      aria-current={pathname === item.href ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  )
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/profile"
              className="p-1 rounded-full text-indigo-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
              aria-label="Your profile"
            >
              <UserCircleIcon className="h-6 w-6" aria-hidden="true" />
            </Link>
            <button
              onClick={handleLogoutClick}
              className="p-1 rounded-full text-indigo-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
              aria-label="Logout"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-indigo-100 hover:text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label="Open main menu"
            >
              <span className="sr-only">{isOpen ? 'Close main menu' : 'Open main menu'}</span>
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
      <div
        className={`${isOpen ? 'block' : 'hidden'} sm:hidden`} 
        id="mobile-menu"
        ref={mobileMenuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <div className="space-y-1 px-2 pb-3 pt-2" role="menu">
          {navigation.map((item) => (
            <div key={item.label}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className={`${
                      isActiveNavItem(item)
                        ? 'bg-indigo-700 text-white'
                        : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
                    } flex w-full justify-between rounded-md px-3 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600`}
                    aria-expanded={openDropdown === item.label}
                    aria-controls={`${item.label}-mobile-dropdown`}
                    role="menuitem"
                  >
                    {item.label}
                    <ChevronDownIcon className={`h-5 w-5 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  
                  {openDropdown === item.label && (
                    <div 
                      id={`${item.label}-mobile-dropdown`}
                      className="mt-1 pl-4 space-y-1"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className={`${
                            pathname === child.href
                              ? 'bg-indigo-800 text-white'
                              : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
                          } block rounded-md px-3 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600`}
                          onClick={() => setIsOpen(false)}
                          role="menuitem"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? 'bg-indigo-700 text-white'
                      : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
                  } block rounded-md px-3 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600`}
                  aria-current={pathname === item.href ? 'page' : undefined}
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
          
          <div className="border-t border-indigo-700 pt-4 pb-3">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <UserCircleIcon className="h-10 w-10 text-indigo-100" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">{user.firstName} {user.lastName}</div>
                <div className="text-sm font-medium text-indigo-100">{user.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1 px-2" role="menu">
              <Link
                href="/profile"
                className="block rounded-md px-3 py-2 text-base font-medium text-indigo-100 hover:bg-indigo-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                role="menuitem"
              >
                Your Profile
              </Link>
              <button
                onClick={handleLogoutClick}
                className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-indigo-100 hover:bg-indigo-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                role="menuitem"
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