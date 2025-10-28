'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { LiveScoreboard } from '@/components/cards';
import CoursesSection from '@/components/dashboard/CoursesSection';
import { ScoreboardEntry } from '@/lib/types';
import { MOCK_COURSES } from '@/lib/constants';
import { StudentRouteGuard } from '@/components/auth/RoleBasedRouteGuard';

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

export default function CoursesPage() {


  const handleEnroll = (courseId: string) => {
    console.log(`Enrolling in course: ${courseId}`);
    // Handle enrollment logic here
  };

  return (
    <StudentRouteGuard>
      <div className="min-h-screen bg-primary-bg flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Available Courses Section */}
            <CoursesSection 
              courses={MOCK_COURSES}
              onEnroll={handleEnroll}
              className="mb-8"
            />
          </div>
        </main>
        <Footer />
      </div>
    </StudentRouteGuard>
  );
}
