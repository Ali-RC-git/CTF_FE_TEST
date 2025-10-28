"use client";

import { Challenge } from '@/lib/api/challenges';

interface ChallengeCardProps {
  challenge: Challenge;
  onStartChallenge?: (challengeId: string) => void;
  onContinueChallenge?: (challengeId: string) => void;
  onViewChallenge?: (challengeId: string) => void;
  onLaunchVM?: (challengeId: string) => void;
}

export function ChallengeCard({
  challenge,
  onStartChallenge,
  onContinueChallenge,
  onViewChallenge,
  onLaunchVM
}: ChallengeCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'web':
        return 'bg-purple-500';
      case 'crypto':
        return 'bg-yellow-500';
      case 'forensics':
        return 'bg-green-500';
      case 'cloud':
        return 'bg-blue-500';
      case 'reverse':
        return 'bg-red-500';
      case 'pwn':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-red-400';
      case 'expert':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusInfo = () => {
    // This would be determined by user progress, for now using mock data
    const mockStatus = {
      status: (challenge as any).userStatus || 'unsolved', // 'solved', 'in_progress', 'unsolved'
      timeSpent: challenge.timeSpent || '2 hours',
      progress: challenge.userProgress?.progressPercentage || 25
    };
    return mockStatus;
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="bg-card-bg rounded-xl p-6 border border-border-color hover:border-accent-color transition-colors duration-200 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          {challenge.category && (
            <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getCategoryColor(challenge.category)}`}>
              {challenge.category.toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {statusInfo.status === 'solved' && (
            <span className="px-2 py-1 rounded text-xs font-medium text-white bg-green-500">
              ✓ Solved
            </span>
          )}
          {statusInfo.status === 'in_progress' && (
            <span className="px-2 py-1 rounded text-xs font-medium text-white bg-yellow-500">
              In Progress
            </span>
          )}
          {statusInfo.status === 'unsolved' && (
            <span className="px-2 py-1 rounded text-xs font-medium text-white bg-purple-500">
              Unsolved
            </span>
          )}
        </div>
      </div>

      {/* Title and Description - Flexible content area */}
      <div className="flex-1 mb-4">
        <h3 className="text-xl font-bold text-text-primary mb-2">{challenge.title}</h3>
        <p className="text-text-secondary text-sm leading-relaxed">{challenge.description}</p>
      </div>

      {/* Challenge Details */}
      <div className="flex items-center space-x-4 mb-4 text-sm">
        <span className="text-accent-color font-medium">{challenge.points} pts</span>
        <span className={`font-medium ${getDifficultyColor(challenge.difficulty)}`}>
          {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
        </span>
        {challenge.solves && (
          <span className="text-text-secondary">{challenge.solves} solves</span>
        )}
      </div>

      {/* Progress Bar (for in-progress challenges) */}
      {statusInfo.status === 'in_progress' && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-text-secondary">{statusInfo.timeSpent} spent</span>
            <span className="text-sm text-text-secondary">{statusInfo.progress}% complete</span>
          </div>
          <div className="w-full bg-secondary-bg rounded-full h-2">
            <div 
              className="bg-accent-color h-2 rounded-full transition-all duration-300"
              style={{ width: `${statusInfo.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* VM Status (for cloud challenges) */}
      {challenge.vmAvailable && (
        <div className="mb-4 flex items-center space-x-2">
          <span className="px-2 py-1 rounded text-xs font-medium text-white bg-blue-500">
            VM Available
          </span>
          <span className="text-sm text-text-secondary">
            {challenge.vmStatus || 'Ready to deploy'}
          </span>
        </div>
      )}

      {/* Action Buttons - Always at bottom with consistent height */}
      <div className="flex space-x-3 mt-auto pt-4">
        {/* Primary Action Button */}
        {statusInfo.status === 'solved' && (
          <button
            onClick={() => onViewChallenge?.(challenge.id)}
            className="flex-1 bg-accent-color text-white py-3 px-4 rounded-lg font-medium hover:bg-accent-dark transition-colors duration-200"
          >
            View Challenge
          </button>
        )}
        {statusInfo.status === 'in_progress' && (
          <button
            onClick={() => onContinueChallenge?.(challenge.id)}
            className="flex-1 bg-accent-color text-white py-3 px-4 rounded-lg font-medium hover:bg-accent-dark transition-colors duration-200"
          >
            Continue
          </button>
        )}
        {statusInfo.status === 'unsolved' && (
          <button
            onClick={() => onStartChallenge?.(challenge.id)}
            className="flex-1 bg-accent-color text-white py-3 px-4 rounded-lg font-medium hover:bg-accent-dark transition-colors duration-200"
          >
            Start Challenge
          </button>
        )}

        {/* VM Launch Button (for cloud challenges) */}
        {challenge.vmAvailable && (
          <button
            onClick={() => onLaunchVM?.(challenge.id)}
            className="px-4 py-3 border border-blue-500 text-blue-400 rounded-lg font-medium hover:bg-blue-500 hover:text-white transition-colors duration-200"
          >
            Launch VM
          </button>
        )}
      </div>

    </div>
  );
}
