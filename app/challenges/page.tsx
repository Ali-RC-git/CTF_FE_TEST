'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { challengesAPI } from '@/lib/api';
import { Challenge } from '@/lib/types';
import { StudentRouteGuard } from '@/components/auth/RoleBasedRouteGuard';
import Header from '@/components/layout/Header';

function ChallengesContent() {
  const { t } = useLanguage();
  const { authState } = useAuth();
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [activeTab, setActiveTab] = useState('all');
  const [userStats, setUserStats] = useState({ points: 850, rank: 5 });

  const categories = ['All Categories', 'WEB', 'CRYPTO', 'FORENSICS', 'CLOUD', 'OT/ICS Security', 'Network Security'];

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setIsLoading(true);
      const response = await challengesAPI.listChallenges();
      setChallenges(response.results || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChallenge = (challengeId: string) => {
    router.push(`/challenge/${challengeId}`);
  };

  const handleContinueChallenge = (challengeId: string) => {
    router.push(`/challenge/${challengeId}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      case 'expert': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'WEB': return 'bg-purple-500';
      case 'CRYPTO': return 'bg-orange-500';
      case 'FORENSICS': return 'bg-green-500';
      case 'CLOUD': return 'bg-blue-500';
      case 'OT/ICS Security': return 'bg-indigo-500';
      case 'Network Security': return 'bg-cyan-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = !searchTerm || 
      challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All Categories' || 
      challenge.category === selectedCategory;
    
    // Get challenge status - check userProgress or status field
    const challengeStatus = challenge.userProgress?.status || challenge.status || 'not_started';
    
    // Filter by tab based on challenge status
    let matchesTab = true;
    if (activeTab === 'unsolved') {
      // Show challenges that are not started or not completed
      matchesTab = challengeStatus === 'not_started' || challengeStatus === 'Not attempted' || challenge.isCompleted !== true;
    } else if (activeTab === 'inprogress') {
      // Show challenges that are in progress
      matchesTab = challengeStatus === 'in_progress' || challengeStatus === 'In Progress' || (challenge.isStarted === true && challenge.isCompleted !== true);
    }
    // 'allchallenges' or 'all' shows everything (matchesTab = true)
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-color"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-bg text-text-primary">
      <Header />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary">Challenges</h1>
          <div className="text-right">
            <div className="text-2xl font-bold text-accent-color">Points: {userStats.points}</div>
            <div className="text-lg text-text-secondary">Rank: {userStats.rank}th</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-secondary-bg text-text-primary placeholder-text-secondary rounded-lg border border-border-color focus:ring-2 focus:ring-accent-color focus:outline-none"
            />
          </div>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-secondary-bg text-text-primary rounded-lg border border-border-color focus:ring-2 focus:ring-accent-color focus:outline-none appearance-none pr-8"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-card-bg">
                  {category}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-8">
          {['All Challenges', 'Unsolved', 'In Progress'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase().replace(' ', ''))}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === tab.toLowerCase().replace(' ', '')
                  ? 'bg-accent-color text-white'
                  : 'bg-secondary-bg text-text-secondary hover:bg-card-bg border border-border-color'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => (
            <div key={challenge.id} className="bg-card-bg rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-border-color flex flex-col h-full">
              {/* Category Tag */}
              <div className="flex gap-2 mb-4 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(challenge.category)}`}>
                  {challenge.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium text-white bg-accent-color">
                  ○ Unsolved
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-text-primary mb-3">{challenge.title}</h3>

              {/* Description */}
              <p className="text-text-secondary text-sm mb-4 line-clamp-2 flex-grow">{challenge.description}</p>

              {/* Action Buttons - Always at bottom */}
              <div className="mt-auto">
                <button 
                  onClick={() => handleStartChallenge(challenge.id)}
                  className="w-full bg-accent-color hover:bg-accent-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  ▶ Start Challenge
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Challenges Message */}
        {filteredChallenges.length === 0 && (
          <div className="text-center py-12">
            <div className="text-text-secondary text-lg">No challenges found</div>
            <div className="text-text-secondary text-sm mt-2">
              Try adjusting your search or filter criteria
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default function ChallengesPage() {
  return (
    <StudentRouteGuard>
      <ChallengesContent />
    </StudentRouteGuard>
  );
}
