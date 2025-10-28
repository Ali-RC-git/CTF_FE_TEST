/**
 * Challenge Card component for Events Page
 * Displays challenge with progress status and action buttons
 */

'use client';

import { useRouter } from 'next/navigation';
import { Play, Eye, ArrowRight, Trophy, Clock, Target } from 'lucide-react';
import { TeamChallengeData } from '@/lib/hooks/useTeamEventData';

interface EventChallengeCardProps {
  challenge: TeamChallengeData;
  eventId: string;
  onStart?: (challengeId: string) => Promise<void>;
}

export default function EventChallengeCard({
  challenge,
  eventId,
  onStart,
}: EventChallengeCardProps) {
  const router = useRouter();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'hard':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'expert':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusBadge = () => {
    switch (challenge.progress) {
      case 'completed':
        return (
          <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-xs font-medium flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            Solved
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full text-xs font-medium">
            In Progress
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-xs font-medium">
            Not Started
          </span>
        );
    }
  };

  const getActionButton = () => {
    const handleAction = async () => {
      if (challenge.progress === 'not_started' && onStart) {
        try {
          await onStart(challenge.id);
        } catch (error) {
          console.error('Error starting challenge:', error);
        }
      }
      // Navigate to challenge page with eventId
      router.push(`/challenge/${challenge.id}?eventId=${eventId}`);
    };

    const buttonClass = `
      w-full px-4 py-2.5 rounded-lg font-medium transition-all duration-200 
      flex items-center justify-center gap-2
    `;

    switch (challenge.progress) {
      case 'completed':
        return (
          <button
            onClick={handleAction}
            className={`${buttonClass} bg-secondary-bg hover:bg-border-color text-text-primary border border-border-color`}
          >
            <Eye className="w-4 h-4" />
            View Challenge
          </button>
        );
      case 'in_progress':
        return (
          <button
            onClick={handleAction}
            className={`${buttonClass} bg-yellow-600 hover:bg-yellow-700 text-white`}
          >
            <ArrowRight className="w-4 h-4" />
            Continue
          </button>
        );
      default:
        return (
          <button
            onClick={handleAction}
            className={`${buttonClass} bg-accent-color hover:bg-accent-dark text-white`}
          >
            <Play className="w-4 h-4" />
            Start Challenge
          </button>
        );
    }
  };

  return (
    <div className="bg-card-bg border border-border-color rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-1">
            {challenge.title}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(challenge.difficulty)}`}>
              {challenge.difficulty}
            </span>
            <span className="px-2.5 py-1 bg-secondary-bg text-text-secondary rounded-full text-xs font-medium">
              {challenge.category}
            </span>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Description */}
      <p className="text-sm text-text-secondary mb-4 line-clamp-2 min-h-[40px]">
        {challenge.description || 'No description available'}
      </p>

      {/* Progress Info */}
      {challenge.progress !== 'not_started' && (
        <div className="mb-4 p-3 bg-secondary-bg rounded-lg space-y-2">
          {/* Time Spent */}
          {challenge.timeSpent !== undefined && challenge.timeSpent > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Time Spent
              </span>
              <span className="text-text-primary font-medium">
                {Math.floor(challenge.timeSpent / 3600)}h {Math.floor((challenge.timeSpent % 3600) / 60)}m
              </span>
            </div>
          )}
          
          {/* Questions Progress */}
          {challenge.questionsAnswered !== undefined && challenge.totalQuestions !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary flex items-center gap-1">
                <Target className="w-4 h-4" />
                Questions
              </span>
              <span className="text-text-primary font-medium">
                {challenge.questionsAnswered}/{challenge.totalQuestions}
              </span>
            </div>
          )}
          
          {/* Score */}
          {challenge.score !== undefined && challenge.score > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                Score
              </span>
              <span className={`font-semibold ${challenge.progress === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>
                {challenge.score} pts
              </span>
            </div>
          )}
          
          {/* Last Activity */}
          {challenge.progress === 'in_progress' && challenge.lastUpdated && (
            <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-border-color">
              <span className="text-text-secondary">Last activity</span>
              <span className="text-text-secondary">
                {new Date(challenge.lastUpdated).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-text-secondary mb-4 pb-4 border-b border-border-color">
        <div className="flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5" />
          <span>{challenge.points || 100} points</span>
        </div>
        {challenge.timeSpent && (
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{challenge.timeSpent}</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      {getActionButton()}
    </div>
  );
}

