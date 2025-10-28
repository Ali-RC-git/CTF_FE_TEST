"use client";

import { useState, useEffect } from 'react';
import { Challenge, challengesAPI } from '@/lib/api/challenges';
import { ChallengeCard } from './ChallengeCard';
import { useToast } from '@/lib/hooks/useToast';

interface ChallengesListProps {
  eventId: string;
}

type FilterType = 'all' | 'solved' | 'unsolved' | 'in_progress';

export function ChallengesList({ eventId }: ChallengesListProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useToast();

  // Fetch challenges
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await challengesAPI.listChallenges({ event_id: eventId });
        setChallenges(response.results);
      } catch (err) {
        console.error('Failed to fetch challenges:', err);
        setError('Failed to load challenges');
        showError('Failed to load challenges. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchChallenges();
    }
  }, [eventId]);

  // Filter challenges based on active filter
  useEffect(() => {
    const filterChallenges = () => {
      // For now, we'll use mock status data since the API doesn't include user progress
      // In a real implementation, this would come from user progress data
      const challengesWithStatus = challenges.map((challenge, index) => ({
        ...challenge,
        // Mock status - in real implementation, this would come from user progress API
        // Distribute statuses to match wireframe: some solved, some in progress, some unsolved
        userStatus: index % 4 === 0 ? 'solved' : index % 4 === 1 ? 'in_progress' : 'unsolved'
      }));

      let filtered = challengesWithStatus;

      switch (activeFilter) {
        case 'solved':
          filtered = challengesWithStatus.filter(c => c.userStatus === 'solved');
          break;
        case 'unsolved':
          filtered = challengesWithStatus.filter(c => c.userStatus === 'unsolved');
          break;
        case 'in_progress':
          filtered = challengesWithStatus.filter(c => c.userStatus === 'in_progress');
          break;
        default:
          filtered = challengesWithStatus;
      }

      setFilteredChallenges(filtered);
    };

    filterChallenges();
  }, [challenges, activeFilter]);

  const handleStartChallenge = (challengeId: string) => {
    console.log('Starting challenge:', challengeId);
    // Implement challenge start logic
  };

  const handleContinueChallenge = (challengeId: string) => {
    console.log('Continuing challenge:', challengeId);
    // Implement challenge continue logic
  };

  const handleViewChallenge = (challengeId: string) => {
    console.log('Viewing challenge:', challengeId);
    // Implement challenge view logic
  };


  const handleLaunchVM = (challengeId: string) => {
    console.log('Launching VM for challenge:', challengeId);
    // Implement VM launch logic
  };

  // Calculate filter counts based on the same logic as the status distribution
  const getStatusCounts = () => {
    const solved = challenges.filter((_, index) => index % 4 === 0).length;
    const inProgress = challenges.filter((_, index) => index % 4 === 1).length;
    const unsolved = challenges.filter((_, index) => index % 4 !== 0 && index % 4 !== 1).length;
    return { solved, inProgress, unsolved };
  };

  const statusCounts = getStatusCounts();
  
  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'All Challenges', count: challenges.length },
    { key: 'solved', label: 'Solved', count: statusCounts.solved },
    { key: 'unsolved', label: 'Unsolved', count: statusCounts.unsolved },
    { key: 'in_progress', label: 'In Progress', count: statusCounts.inProgress }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-color mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading challenges...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-accent-color text-white px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="border-b border-border-color">
        <nav className="flex space-x-8">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeFilter === filter.key
                  ? 'border-accent-color text-accent-color'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-color'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Challenges Grid */}
      {filteredChallenges.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary text-lg">
            {activeFilter === 'all' 
              ? 'No challenges available for this event.'
              : `No ${activeFilter.replace('_', ' ')} challenges found.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onStartChallenge={handleStartChallenge}
              onContinueChallenge={handleContinueChallenge} 
              onViewChallenge={handleViewChallenge}
              onLaunchVM={handleLaunchVM}
            />
          ))}
        </div>
      )}
    </div>
  );
}
