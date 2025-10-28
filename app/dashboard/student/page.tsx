'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import StudentDashboard from '@/components/dashboard/StudentDashboard';

/**
 * Student Dashboard page
 * - Only accessible to non-admin users
 * - Redirects admin users to /admin
 */
export default function StudentDashboardPage() {
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

    // If authenticated but admin, redirect to admin dashboard
    if (authState.user && authState.user.role === 'admin') {
      router.push('/admin');
      return;
    }
  }, [authState, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-color mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or admin, don't render content
  if (!authState.isAuthenticated || (authState.user && authState.user.role === 'admin')) {
    return null;
  }

  // Mock data to keep the same UI - you can replace this with real API calls later
  const mockStats = {
    points: 0,
    challengesSolved: 0,
    rank: 0,
    enrolledCourses: 0
  };

  const mockRecentQuestions: any[] = [];
  const mockScoreboardEntries: any[] = [];

  return (
    <div className="min-h-screen bg-primary-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <StudentDashboard
          user={authState.user!}
          stats={mockStats}
          recentQuestions={mockRecentQuestions}
          scoreboardEntries={mockScoreboardEntries}
        />
      </main>
    </div>
  );
}
