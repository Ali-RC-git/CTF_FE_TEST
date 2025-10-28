'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { USER_ROLES } from '@/lib/constants/app';

interface RoleBasedRouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export default function RoleBasedRouteGuard({ 
  children, 
  allowedRoles = [USER_ROLES.STUDENT], 
  redirectTo 
}: RoleBasedRouteGuardProps) {
  const { authState, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return; // Wait for auth to load

    const user = authState.user;
    const userRole = user?.role;

    // If user is not authenticated, redirect to login
    if (!authState.isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    // Check if user role is allowed for this route
    const isRoleAllowed = userRole ? allowedRoles.includes(userRole) : false;

    if (!isRoleAllowed) {
      // Determine redirect based on user role
      if (userRole === USER_ROLES.ADMIN) {
        // Admin users should only access admin pages
        if (!pathname.startsWith('/admin')) {
          router.push('/admin');
        }
      } else {
        // Non-admin users should not access admin pages
        if (pathname.startsWith('/admin')) {
          router.push('/dashboard');
        }
      }
    }
  }, [authState, isLoading, allowedRoles, redirectTo, router, pathname]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-color mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children
  if (!authState.isAuthenticated || !authState.user) {
    return null;
  }

  // Check if user role is allowed
  const userRole = authState.user.role;
  const isRoleAllowed = allowedRoles.includes(userRole);

  if (!isRoleAllowed) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}

// Specific route guards for different user types
export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <RoleBasedRouteGuard allowedRoles={[USER_ROLES.ADMIN]}>
      {children}
    </RoleBasedRouteGuard>
  );
}

export function StudentRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <RoleBasedRouteGuard allowedRoles={[USER_ROLES.STUDENT]}>
      {children}
    </RoleBasedRouteGuard>
  );
}

export function PublicRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <RoleBasedRouteGuard allowedRoles={[USER_ROLES.STUDENT, USER_ROLES.ADMIN]}>
      {children}
    </RoleBasedRouteGuard>
  );
}
