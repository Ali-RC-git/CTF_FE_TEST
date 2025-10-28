import { ChallengeDetail } from '@/lib/types';
import { DIFFICULTY_COLORS } from '@/lib/constants';
import { getDifficultyColor } from '@/lib/colors';

interface ChallengeHeaderProps {
  challenge: ChallengeDetail;
  onBack?: () => void;
  onGetHint?: () => void;
  className?: string;
}

export default function ChallengeHeader({ challenge, onBack, onGetHint, className = '' }: ChallengeHeaderProps) {
  return (
    <div className={`${className}`}>
      {/* Header with Logo and Title */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          {/* <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-white text-xl font-semibold mr-6">CRDF Global</span> */}
          <h1 className="text-text-primary text-2xl font-bold">{challenge.title}</h1>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onBack}
            className="bg-accent-color hover:bg-accent-dark text-white px-4 py-2 rounded flex items-center space-x-2 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Back to Challenges</span>
          </button>
          
        </div>
      </div>

      {/* Challenge Overview */}
      <div className="flex flex-wrap items-center gap-6 mb-6">
        <span className={`${DIFFICULTY_COLORS[challenge.difficulty]} text-text-primary text-sm px-3 py-1 rounded`}>
          {challenge.difficulty}
        </span>
        
        <div className="flex items-center space-x-2 text-text-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>{challenge.category}</span>
        </div>
        
        {challenge.estimatedTime && (
          <div className="flex items-center space-x-2 text-text-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Estimated: {challenge.estimatedTime}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-2 text-text-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <span>{challenge.totalPoints || 0} pts total</span>
        </div>
      </div>

    </div>
  );
}
