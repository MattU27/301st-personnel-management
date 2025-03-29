import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/documents',
  '/trainings',
  '/personnel',
  '/profile',
];

// Define paths that are only accessible to specific roles
const roleRestrictedPaths = {
  '/personnel': ['staff', 'admin', 'director'],
  '/admin': ['admin', 'director'],
  '/analytics': ['director'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isProtectedPath) {
    // Get the user from the cookie
    const user = request.cookies.get('user')?.value;
    
    // If there's no user, redirect to login
    if (!user) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    try {
      // Parse the user to check role restrictions
      const userData = JSON.parse(user);
      const userRole = userData.role;

      // Check if the path is restricted by role
      for (const [path, roles] of Object.entries(roleRestrictedPaths)) {
        if (pathname === path || pathname.startsWith(`${path}/`)) {
          if (!roles.includes(userRole)) {
            // Redirect to dashboard if the user doesn't have the required role
            return NextResponse.redirect(new URL('/dashboard', request.url));
          }
        }
      }
    } catch (error) {
      // If there's an error parsing the user, redirect to login
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 