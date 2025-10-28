'use client';

import { useState } from 'react';
import { Challenge } from '@/lib/types';
import ChallengeCard from '@/components/cards/ChallengeCard';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface ChallengesSectionProps {
  challenges: Challenge[];
  userStats: {
    solved: number;
    total: number;
    points: number;
    rank: number;
  };
  onStart?: (challengeId: string) => void;
  onContinue?: (challengeId: string) => void;
  onView?: (challengeId: string) => void;
  onGetHint?: (challengeId: string) => void;
  onLaunchVM?: (challengeId: string) => void;
  className?: string;
}

const FILTER_TABS = ['All Challenges', 'Solved', 'Unsolved', 'In Progress'] as const;
const CATEGORIES = ['All Categories', 'WEB', 'CRYPTO', 'FORENSICS', 'CLOUD', 'REVERSE', 'PWN'] as const;

export default function ChallengesSection({ 
  challenges, 
  userStats,
  onStart, 
  onContinue, 
  onView, 
  onGetHint, 
  onLaunchVM,
  className = '' 
}: ChallengesSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [activeFilter, setActiveFilter] = useState('All Challenges');
  const { t } = useLanguage();

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All Categories' || challenge.category === selectedCategory;
    
    const matchesFilter = activeFilter === 'All Challenges' || 
                         (activeFilter === 'Solved' && challenge.status === 'Solved') ||
                         (activeFilter === 'Unsolved' && challenge.status === 'Unsolved') ||
                         (activeFilter === 'In Progress' && challenge.status === 'In Progress');
    
    return matchesSearch && matchesCategory && matchesFilter;
  });

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-white text-3xl font-bold">Challenges</h1>
        
        {/* User Stats */}
        <div className="text-right">
          <div className="text-white text-sm">
            <span className="font-medium">Solved: {userStats.solved}/{userStats.total}</span>
          </div>
          <div className="text-white text-sm">
            <span className="font-medium">Points: {userStats.points}</span>
          </div>
          <div className="text-white text-sm">
            <span className="font-medium">Rank: {userStats.rank}th</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6">
        {/* Search and Category Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-purple-600 text-white placeholder-white/70 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1">
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors duration-200 ${
                activeFilter === tab
                  ? 'bg-purple-600 text-white border-b-2 border-purple-400'
                  : 'text-white hover:text-purple-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChallenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onStart={onStart}
            onContinue={onContinue}
            onView={onView}
            onGetHint={onGetHint}
            onLaunchVM={onLaunchVM}
          />
        ))}
      </div>

      {/* No Results */}
      {filteredChallenges.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white text-lg opacity-70">
            No challenges found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
}
