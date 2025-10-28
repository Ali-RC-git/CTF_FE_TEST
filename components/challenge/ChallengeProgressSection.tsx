import { ChallengeDetail } from '@/lib/types';

interface ChallengeProgressSectionProps {
  challenge: ChallengeDetail;
  className?: string;
}

export default function ChallengeProgressSection({ challenge, className = '' }: ChallengeProgressSectionProps) {
  // Calculate progress based on solved questions with safety checks
  const questions = challenge.questions || [];
  const solvedQuestions = questions.filter(q => q.status === 'Solved' || q.solved).length;
  const totalQuestions = questions.length;
  const progressPercentage = totalQuestions > 0 ? (solvedQuestions / totalQuestions) * 100 : 0;
  const earnedPoints = questions
    .filter(q => q.status === 'Solved' || q.solved)
    .reduce((sum, q) => sum + q.points, 0);
  
  const isComplete = solvedQuestions === totalQuestions && totalQuestions > 0;

  return (
    <div className={`${className}`}>
      <div className="bg-[#35215a] rounded-lg p-6 border border-[#4a2d7a]">
        <div className="flex items-center mb-6">
          <div className="text-2xl mr-3">📊</div>
          <h2 className="text-[#f0e6ff] text-xl font-semibold">Challenge Progress</h2>
        </div>

        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-[#1a102b] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#6b30e6] to-[#8a4fff] rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="flex justify-between items-center">
            <div className="text-[#f0e6ff]">
              <span className="text-2xl font-bold">{earnedPoints}</span>
              <span className="text-sm text-[#c2b0e6]">/{challenge.totalPoints} points</span>
            </div>
            <div className="text-[#f0e6ff] text-sm">
              <span className="font-medium">({Math.round(progressPercentage)}%)</span>
            </div>
          </div>

          {/* Question Status Summary */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 bg-[#2d1b4e] rounded-lg border border-[#4a2d7a]">
              <div className="text-[#6fcf97] text-2xl font-bold">{solvedQuestions}</div>
              <div className="text-[#c2b0e6] text-xs mt-1">Solved</div>
            </div>
            <div className="text-center p-3 bg-[#2d1b4e] rounded-lg border border-[#4a2d7a]">
              <div className="text-[#f2c94c] text-2xl font-bold">
                {questions.filter(q => q.status === 'In Progress').length}
              </div>
              <div className="text-[#c2b0e6] text-xs mt-1">In Progress</div>
            </div>
            <div className="text-center p-3 bg-[#2d1b4e] rounded-lg border border-[#4a2d7a]">
              <div className="text-[#c2b0e6] text-2xl font-bold">
                {questions.filter(q => q.status === 'Not attempted' && !q.solved).length}
              </div>
              <div className="text-[#c2b0e6] text-xs mt-1">Not Attempted</div>
            </div>
          </div>

          {/* Completion Badge */}
          {isComplete && (
            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center gap-2 bg-[#6fcf97] text-white px-6 py-3 rounded-full font-bold">
                <span>✅</span>
                <span>Challenge Completed!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
