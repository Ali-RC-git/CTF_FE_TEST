'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

/**
 * AdminRouteGuard component that protects admin routes
 * - Redirects non-authenticated users to login
 * - Redirects non-admin users to dashboard
 * - Shows loading state while checking authentication
 */
export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { authState, isLoading } = useAuth();
  const router = useRouter();

  // Development mode - bypass authentication for testing
  //const isDevelopment = process.env.NODE_ENV === 'development';
  
  useEffect(() => {
    // In development, allow access without authentication
    // if (isDevelopment) {
    //   console.log('Development mode: Bypassing authentication');
    //   return;
    // }

    // Don't redirect while loading
    if (isLoading) return;

    // If not authenticated, redirect to login
    if (!authState.isAuthenticated) {
      router.push('/login');
      return;
    }

    // If authenticated but not admin, redirect to dashboard
    if (authState.user && authState.user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [authState, isLoading, router]);

  // Show loading while checking authentication (only in production)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-color mx-auto mb-4"></div>
          <p className="text-text-secondary">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // In development, always render children
  // if (isDevelopment) {
  //   return (
  //     <div>
  //       <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
  //         <p className="font-bold">Development Mode</p>
  //         <p>Authentication is bypassed for testing purposes.</p>
  //       </div>
  //       {children}
  //     </div>
  //   );
  // }

  // If not authenticated or not admin, don't render children
  if (!authState.isAuthenticated || (authState.user && authState.user.role !== 'admin')) {
    return null;
  }

  // Render admin content
  return <>{children}</>;
}
