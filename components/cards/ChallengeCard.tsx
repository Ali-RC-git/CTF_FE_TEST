import Link from 'next/link';
import { Challenge } from '@/lib/types';
import { CATEGORY_COLORS, STATUS_COLORS, DIFFICULTY_COLORS } from '@/lib/constants';
import { getDifficultyColor } from '@/lib/colors';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface ChallengeCardProps {
  challenge: Challenge;
  onStart?: (challengeId: string) => void;
  onContinue?: (challengeId: string) => void;
  onView?: (challengeId: string) => void;
  onGetHint?: (challengeId: string) => void;
  onLaunchVM?: (challengeId: string) => void;
  className?: string;
}

export default function ChallengeCard({ 
  challenge, 
  onStart, 
  onContinue, 
  onView, 
  onGetHint, 
  onLaunchVM,
  className = '' 
}: ChallengeCardProps) {
  const { t } = useLanguage();
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Solved':
        return '✓';
      case 'In Progress':
        return '⏱';
      case 'Unsolved':
        return '○';
      default:
        return '○';
    }
  };

  const getHintCost = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return '-5pts';
      case 'Medium':
        return '-10pts';
      case 'Hard':
        return '-15pts';
      default:
        return '-10pts';
    }
  };

  const getActionButton = () => {
    switch (challenge.status) {
      case 'Solved':
        return (
          <button
            onClick={() => onView?.(challenge.id)}
            className="bg-accent-color hover:bg-accent-dark text-white px-4 py-2 rounded transition-colors duration-200 text-sm font-medium"
          >
            View Challenge
          </button>
        );
      case 'In Progress':
        return (
          <button
            onClick={() => onContinue?.(challenge.id)}
            className="bg-accent-color hover:bg-accent-dark text-white px-4 py-2 rounded transition-colors duration-200 text-sm font-medium"
          >
            Continue
          </button>
        );
      case 'Unsolved':
        return (
          <button
            onClick={() => onStart?.(challenge.id)}
            className="bg-accent-color hover:bg-accent-dark text-white px-4 py-2 rounded transition-colors duration-200 text-sm font-medium"
          >
            Start Challenge
          </button>
        );
      default:
        return null;
    }
  };

  const getSecondaryButton = () => {
    if (challenge.vmAvailable && challenge.status === 'Unsolved') {
      return (
        <button
          onClick={() => onLaunchVM?.(challenge.id)}
          className="border border-accent-color text-accent-color hover:bg-accent-color hover:text-white px-4 py-2 rounded transition-colors duration-200 text-sm font-medium"
        >
          Launch VM
        </button>
      );
    } else {
      return (
        <button
          onClick={() => onGetHint?.(challenge.id)}
          className="border border-accent-color text-accent-color hover:bg-accent-color hover:text-white px-4 py-2 rounded transition-colors duration-200 text-sm font-medium"
        >
          Get Hint ({getHintCost(challenge.difficulty)})
        </button>
      );
    }
  };

  return (
    <div className={`bg-secondary-bg rounded-lg p-6 ${className}`}>
      {/* Header with Category and Status */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex space-x-2">
          <span className={`${CATEGORY_COLORS[challenge.category]} text-text-primary text-xs px-2 py-1 rounded`}>
            {challenge.category}
          </span>
          <span className={`${STATUS_COLORS[challenge.status]} text-text-primary text-xs px-2 py-1 rounded`}>
            {getStatusIcon(challenge.status)} {challenge.status}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-text-primary font-bold text-lg mb-3">
        {challenge.title}
      </h3>

      {/* Description */}
      <p className="text-text-secondary text-sm leading-relaxed mb-4">
        {challenge.description}
      </p>

      {/* Details */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4 text-sm">
            <span className="text-text-primary font-medium">{challenge.points} {t.challenges.points}</span>
          <span className={`${DIFFICULTY_COLORS[challenge.difficulty]} text-text-primary px-2 py-1 rounded text-xs`}>
            {challenge.difficulty}
          </span>
          <span className="text-text-muted">{challenge.solves} solves</span>
        </div>
      </div>

      {/* Progress Bar for In Progress */}
      {challenge.status === 'In Progress' && challenge.timeSpent && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-text-muted mb-1">
            <span>{challenge.timeSpent}</span>
          </div>
          <div className="w-full bg-primary-bg rounded-full h-2">
            <div className="bg-accent-color h-2 rounded-full w-1/3"></div>
          </div>
        </div>
      )}

      {/* VM Status */}
      {challenge.vmAvailable && (
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <span className="bg-accent-color text-white text-xs px-2 py-1 rounded">
              VM Available
            </span>
            <span className="text-text-secondary text-sm">
              {challenge.vmStatus}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Link href={`/challenge/${challenge.id}`}>
          {getActionButton()}
        </Link>
        {getSecondaryButton()}
      </div>
    </div>
  );
}
