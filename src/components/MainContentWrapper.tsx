"use client";

import React, { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from './NotificationBell';
import Footer from './Footer';

interface MainContentWrapperProps {
  children: ReactNode;
}

const MainContentWrapper = ({ children }: MainContentWrapperProps) => {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if current page is a public page (login, register, home, password recovery)
  const isPublicPage = pathname === '/' || 
                     pathname === '/login' || 
                     pathname === '/register' || 
                     pathname.includes('/password-recovery') || 
                     pathname.includes('/reset-password');

  // Determine if we should apply sidebar margin
  const shouldApplySidebarMargin = () => {
    if (!mounted) return false; // During SSR and first mount, don't apply margin
    if (!isAuthenticated || !user) return false; // No margin if not logged in
    if (isPublicPage) return false; // No margin on public pages
    
    return true;
  };

  const sidebarMargin = shouldApplySidebarMargin() ? 'ml-64' : '';
  
  // Only apply padding on authenticated pages
  const contentPadding = isPublicPage ? '' : 'p-6';

  // Determine if footer should be displayed
  const shouldShowFooter = !isAuthenticated && isPublicPage;
  
  // Determine if the header (with notification bell) should be shown
  const shouldShowHeader = mounted && isAuthenticated && !isPublicPage;

  return (
    <>
      <main 
        id="main-content" 
        tabIndex={-1} 
        className={`${sidebarMargin} ${contentPadding} flex-grow min-h-screen ${isPublicPage ? '' : 'bg-gray-50'}`}
      >
        {shouldShowHeader && (
          <div className="flex justify-end mb-2">
            <NotificationBell />
          </div>
        )}
        {children}
      </main>
      {shouldShowFooter && <Footer className={sidebarMargin} />}
    </>
  );
};

export default MainContentWrapper; 