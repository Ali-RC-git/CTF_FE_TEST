'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserStats, QuestionProgress, ScoreboardEntry } from '@/lib/types';
import StatCard from '@/components/cards/StatCard';
import ProgressCard from '@/components/cards/ProgressCard';
import LiveScoreboard from '@/components/cards/LiveScoreboard';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface StudentDashboardProps {
  user: User;
  stats: UserStats;
  recentQuestions: QuestionProgress[];
  scoreboardEntries: ScoreboardEntry[];
}

export default function StudentDashboard({ user, stats, recentQuestions, scoreboardEntries }: StudentDashboardProps) {
  const router = useRouter();
  const { t } = useLanguage();


  return (
    <div className="min-h-screen bg-primary-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <h1 className="text-text-primary text-3xl font-bold mb-8">{t.dashboard.title}</h1>


        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard value={stats.points} label={t.dashboard.points} />
          <StatCard value={stats.challengesSolved} label={t.dashboard.challengesSolved} />
          <StatCard value={stats.rank} label={t.dashboard.rank} />
          <StatCard value={stats.enrolledCourses} label={t.dashboard.enrolledCourses} />
        </div>

        {/* Recent Question Progress Section */}
        <div className="mb-8">
          <h2 className="text-text-primary text-2xl font-semibold mb-6">{t.dashboard.recentQuestionProgress}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentQuestions.map((question) => (
              <ProgressCard
                key={question.id}
                question={question}
              />
            ))}
          </div>
        </div>

        {/* Live Scoreboard Section */}
        <LiveScoreboard entries={scoreboardEntries} />
      </div>
    </div>
  );
}
