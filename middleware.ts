import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/otp-verification',
  '/otp-verification-screen',
  '/verification',
  '/forgot-password',
  '/demo',
  '/language-demo',
];

// Define API routes that should be accessible
const API_ROUTES = [
  '/api/',
];

// Define admin-only routes
const ADMIN_ROUTES = [
  '/admin',
];

// Define student-only routes (non-admin routes)
const STUDENT_ROUTES = [
  '/dashboard',
  '/events',
  '/courses',
  '/scoreboard',
  '/teams',
  '/team',
  '/my-invitations',
  '/manage-teams',
  '/team-leader',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow API routes
  if (API_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for authentication token in cookies or headers
  const accessToken = request.cookies.get('access_token')?.value;
  const authHeader = request.headers.get('authorization');

  // If no authentication found, redirect to login
  if (!accessToken && !authHeader) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check for user role in cookies (this would need to be set by the auth system)
  const userRole = request.cookies.get('user_role')?.value;

  // If accessing admin routes, check if user is admin
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    if (userRole !== 'admin') {
      // Redirect non-admin users to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // If accessing student routes, check if user is not admin
  if (STUDENT_ROUTES.some(route => pathname.startsWith(route))) {
    if (userRole === 'admin') {
      // Redirect admin users to admin dashboard
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // If authenticated, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
