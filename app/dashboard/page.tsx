'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import { useAuth } from '@/lib/context/AuthContext';
import { User, UserStats, QuestionProgress, ScoreboardEntry, AuthState } from '@/lib/types';
import { StudentRouteGuard } from '@/components/auth/RoleBasedRouteGuard';
import { hasOngoingEvents, hasAnyEvents, hasUpcomingEvents } from '@/lib/utils/event-utils';

// Mock data - replace with actual data fetching
const mockUser: User = {
  id: '1',
  name: 'Rey Gengania',
  initials: 'RG',
  role: 'student',
  organization: 'CRDF Global'
};

const mockStats: UserStats = {
  points: 850,
  challengesSolved: 12,
  rank: 5,
  enrolledCourses: 3
};

const mockRecentQuestions: QuestionProgress[] = [
  {
    id: '1',
    title: 'Java Attack Analysis',
    difficulty: 'Medium',
    description: 'Analyze the Java Attack that occurred on 02 April 2012...',
    points: 15,
    status: 'Solved'
  },
  {
    id: '2',
    title: 'Shellbags Analysis',
    difficulty: 'Easy',
    description: 'Determine when a specific folder was opened...',
    points: 5,
    status: 'In Progress'
  },
  {
    id: '3',
    title: 'Network Forensics',
    difficulty: 'Hard',
    description: 'Identify the source of a network intrusion...',
    points: 25,
    status: 'Not attempted'
  }
];

const mockScoreboardEntries: ScoreboardEntry[] = [
  {
    id: '1',
    rank: 1,
    teamName: 'QuantumPoptarts',
    points: 6242,
    trend: 'stable',
    highlight: 'gold'
  },
  {
    id: '2',
    rank: 2,
    teamName: 'WEH',
    points: 5995,
    trend: 'stable',
    highlight: 'silver'
  },
  {
    id: '3',
    rank: 3,
    teamName: 'TeamName-of-MyChoice',
    points: 5800,
    trend: 'stable',
    highlight: 'bronze'
  },
  {
    id: '4',
    rank: 4,
    teamName: 'The Undecideds',
    points: 5500,
    trend: 'stable'
  },
  {
    id: '5',
    rank: 5,
    teamName: 'Geren',
    points: 5200,
    trend: 'down'
  },
  {
    id: '6',
    rank: 6,
    teamName: 'Goreme',
    points: 5000,
    trend: 'down'
  }
];

export default function DashboardPage() {
  const { authState, isLoading } = useAuth();
  const router = useRouter();

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-color mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!authState.isAuthenticated || !authState.user) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Please log in</h1>
          <p className="text-text-secondary mb-6">You need to be logged in to access the dashboard.</p>
          <a 
            href="/login" 
            className="bg-accent-color text-white px-6 py-2 rounded-lg hover:bg-accent-dark transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Check event status
  const hasAny = hasAnyEvents(authState.user as any);
  const hasOngoing = hasOngoingEvents(authState.user as any);
  const hasUpcoming = hasUpcomingEvents(authState.user as any);
  
  // Redirect to events page if no events at all
  if (!hasAny) {
    router.push('/events');
    return null;
  }
  
  // Show placeholder if event is upcoming
  if (hasUpcoming && !hasOngoing) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Event Starts Soon</h1>
          <p className="text-text-secondary mb-6">The dashboard will be available once the event begins.</p>
          <a 
            href="/events" 
            className="bg-accent-color text-white px-6 py-2 rounded-lg hover:bg-accent-dark transition-colors"
          >
            View Events
          </a>
        </div>
      </div>
    );
  }

  return (
    <StudentRouteGuard>
      <div className="min-h-screen bg-primary-bg flex flex-col">
        <Header />
        <main className="flex-1">
          <StudentDashboard 
            user={authState.user}
            stats={mockStats}
            recentQuestions={mockRecentQuestions}
            scoreboardEntries={mockScoreboardEntries}
          />
        </main>
        <Footer />
      </div>
    </StudentRouteGuard>
  );
}
