'use client';

import { useAuth } from '@/lib/context/AuthContext';

interface AuthLoaderProps {
  children: React.ReactNode;
}

/**
 * AuthLoader component that handles the initial authentication loading state
 * and ensures the AuthContext is properly initialized before rendering children
 */
export default function AuthLoader({ children }: AuthLoaderProps) {
  const { isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-color mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
