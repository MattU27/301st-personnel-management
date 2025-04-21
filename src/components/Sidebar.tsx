"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  AcademicCapIcon, 
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  MegaphoneIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { navigationConfig, NavItem } from '@/config/navigation';
import { UserRole } from '@/types/auth';

const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything during SSR or if not mounted yet to avoid hydration issues
  if (!mounted) return null;
  
  // Hide Sidebar in these cases:
  // 1. User is not logged in or not authenticated
  if (!user || !isAuthenticated) {
    return null;
  }

  // 2. Always hide on the homepage (/) regardless of login status
  if (pathname === '/' || pathname === '/login' || pathname === '/register') {
    return null;
  }
  
  // Filter navigation items based on user role
  const navigation = navigationConfig.filter(item => {
    // If no user role, don't show the item
    if (!user?.role) return false;
    
    // Check if the user role is included in item.roles
    const userRole = user.role as UserRole;
    return item.roles.includes(userRole);
  });

  // Get the appropriate icon for each navigation item
  const getNavIcon = (label: string) => {
    switch (label) {
      case 'Dashboard':
        return <HomeIcon className="h-6 w-6" aria-hidden="true" />;
      case 'Documents':
        return <DocumentTextIcon className="h-6 w-6" aria-hidden="true" />;
      case 'Trainings':
        return <AcademicCapIcon className="h-6 w-6" aria-hidden="true" />;
      case 'Personnel':
        return <UserGroupIcon className="h-6 w-6" aria-hidden="true" />;
      case 'Analytics':
        return <ChartBarIcon className="h-6 w-6" aria-hidden="true" />;
      case 'Announcements':
        return <MegaphoneIcon className="h-6 w-6" aria-hidden="true" />;
      case 'Policy':
        return <ClipboardDocumentListIcon className="h-6 w-6" aria-hidden="true" />;
      case 'Policy Control':
        return <ShieldCheckIcon className="h-6 w-6" aria-hidden="true" />;
      case 'Companies':
        return <BuildingOfficeIcon className="h-6 w-6" aria-hidden="true" />;
      case 'Manage Accounts':
        return <Cog6ToothIcon className="h-6 w-6" aria-hidden="true" />;
      default:
        return <HomeIcon className="h-6 w-6" aria-hidden="true" />;
    }
  };

  const handleLogoutClick = async () => {
    try {
      await logout();
      // We don't need to manually redirect - the AuthContext should handle that
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Check if a navigation item is active
  const isActiveNavItem = (item: NavItem): boolean => {
    if (pathname === item.href) return true;
    if (item.children) {
      return item.children.some(child => pathname === child.href);
    }
    return false;
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-black shadow-lg flex flex-col z-10">
      {/* Logo */}
      <div className="flex-shrink-0 p-4 border-b border-gray-800">
        <Link href="/" className="text-white font-bold text-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded-md block">
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg tracking-wider">301st RRIBN</span>
            <span className="text-[#FFBF00] text-xs tracking-widest">INFANTRY BATTALION</span>
          </div>
        </Link>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navigation.map((item) => (
          <div key={item.label}>
            <Link
              href={item.href}
              className={`
                ${isActiveNavItem(item) 
                  ? 'bg-gray-900 text-[#FFBF00]' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
                group flex items-center px-3 py-3 rounded-md text-sm font-medium w-full
              `}
              aria-current={isActiveNavItem(item) ? 'page' : undefined}
            >
              <div className="mr-3">
                {getNavIcon(item.label)}
              </div>
              {item.label}
            </Link>

            {item.children && isActiveNavItem(item) && (
              <div className="ml-8 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.label}
                    href={child.href}
                    className={`
                      ${pathname === child.href
                        ? 'bg-gray-900 text-[#FFBF00]'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }
                      group flex items-center px-3 py-2 rounded-md text-sm font-medium w-full
                    `}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      
      {/* User Profile and Logout */}
      <div className="p-4 border-t border-gray-800">
        {/* Role Indicator */}
        {user?.role && (
          <div className="mb-3 px-1">
            <div className="bg-gray-800 rounded-md py-1 px-2 flex items-center justify-center">
              <ShieldCheckIcon className="h-4 w-4 text-[#FFBF00] mr-2" aria-hidden="true" />
              <span className="text-xs font-medium text-white capitalize">
                {user.role === UserRole.ADMINISTRATOR || user.role === UserRole.ADMIN ? 'Administrator' : 
                 user.role === UserRole.DIRECTOR ? 'Director' : 
                 user.role === UserRole.STAFF ? 'Staff Member' : 
                 user.role === UserRole.RESERVIST ? 'Reservist' :
                 user.role === UserRole.ENLISTED ? 'Enlisted' :
                 String(user.role)}
              </span>
            </div>
          </div>
        )}
        <Link
          href="/profile"
          className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md mb-2"
        >
          <UserCircleIcon className="h-6 w-6 mr-3" aria-hidden="true" />
          Profile
        </Link>
        <button
          onClick={handleLogoutClick}
          className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md w-full"
        >
          <ArrowRightOnRectangleIcon className="h-6 w-6 mr-3" aria-hidden="true" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 