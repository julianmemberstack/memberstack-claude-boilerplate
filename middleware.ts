/**
 * Next.js Middleware for Memberstack Authentication & Authorization
 * 
 * This middleware provides server-side route protection using the centralized
 * auth configuration. It runs before pages load, ensuring protected content
 * is never exposed to unauthorized users.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authConfig, isProtectedRoute, isPublicRoute, getRedirectUrl } from '@/lib/auth-config';

// Get public key for later use
const publicKey = process.env.NEXT_PUBLIC_MEMBERSTACK_KEY;

if (!publicKey) {
  throw new Error("NEXT_PUBLIC_MEMBERSTACK_KEY environment variable is required");
}

/**
 * Extract authentication information from request cookies
 * This is a simplified approach that reads Memberstack session cookies
 */
function getAuthFromCookies(request: NextRequest): { isAuthenticated: boolean; member?: any } {
  try {
    // Look for Memberstack session cookies
    const sessionCookie = request.cookies.get('_ms-sid');
    const memberCookie = request.cookies.get('_ms-mid');
    
    // Basic authentication check based on cookie presence
    // In a production app, you might want to validate these cookies more thoroughly
    const isAuthenticated = !!(sessionCookie?.value && memberCookie?.value);
    
    return { isAuthenticated };
  } catch (error) {
    console.error('Error reading auth cookies:', error);
    return { isAuthenticated: false };
  }
}

/**
 * Check if user has basic access to a route
 * For detailed plan/permission checking, we'll rely on client-side validation
 */
function checkBasicRouteAccess(pathname: string, isAuthenticated: boolean): {
  hasAccess: boolean;
  redirectUrl?: string;
  reason?: string;
} {
  // Find the protected route configuration
  const protectedRoute = authConfig.routes.protected.find(route => 
    pathname.startsWith(route.path) || route.path === pathname
  );

  if (!protectedRoute) {
    return { hasAccess: true };
  }

  // Basic authentication check
  if (!protectedRoute.allowUnauthenticated && !isAuthenticated) {
    return { 
      hasAccess: false, 
      redirectUrl: getRedirectUrl('unauthenticated'),
      reason: 'Authentication required'
    };
  }

  // For now, allow access if authenticated - detailed checks happen client-side
  return { hasAccess: true };
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check if route is protected
  if (isProtectedRoute(pathname)) {
    try {
      // Get basic auth info from cookies
      const authInfo = getAuthFromCookies(request);

      // Check basic route access
      const accessCheck = checkBasicRouteAccess(pathname, authInfo.isAuthenticated);

      if (!accessCheck.hasAccess) {
        // Log access attempt for debugging
        if (authConfig.settings.enableDebugMode) {
          console.log(`Access denied to ${pathname}: ${accessCheck.reason}`);
        }

        // Redirect to appropriate page
        const redirectUrl = new URL(accessCheck.redirectUrl || getRedirectUrl('unauthenticated'), request.url);
        
        // Add query parameters for context
        redirectUrl.searchParams.set('redirect', pathname);
        redirectUrl.searchParams.set('reason', accessCheck.reason || 'access_denied');

        return NextResponse.redirect(redirectUrl);
      }

      // Basic access granted - continue to page
      // Detailed plan/permission checks will happen client-side
      return NextResponse.next();

    } catch (error) {
      // Error checking auth - redirect to login
      console.error('Middleware auth error:', error);
      
      const redirectUrl = new URL(getRedirectUrl('unauthenticated'), request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      redirectUrl.searchParams.set('reason', 'auth_error');
      
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Default: allow access
  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};

// Export types for use in other files
export type RouteAccessCheck = {
  hasAccess: boolean;
  redirectUrl?: string;
  reason?: string;
};