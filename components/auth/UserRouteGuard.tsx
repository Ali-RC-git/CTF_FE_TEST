'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

interface UserRouteGuardProps {
  children: React.ReactNode;
}

/**
 * UserRouteGuard component that protects user routes
 * - Redirects non-authenticated users to login
 * - Shows loading state while checking authentication
 */
export default function UserRouteGuard({ children }: UserRouteGuardProps) {
  const { authState, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // If not authenticated, redirect to login
    if (!authState.isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [authState, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children
  if (!authState.isAuthenticated) {
    return null;
  }

  // Render user content
  return <>{children}</>;
}
