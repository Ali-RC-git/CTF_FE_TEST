import { QuestionProgress } from '@/lib/types';
import { DIFFICULTY_COLORS } from '@/lib/constants';
import { getStatusColor } from '@/lib/colors';

interface ProgressCardProps {
  question: QuestionProgress;
  className?: string;
}

export default function ProgressCard({ question, className = '' }: ProgressCardProps) {
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-state-success';
      case 'In Progress':
        return 'text-state-warning';
      case 'Not Started':
        return 'text-text-muted';
      default:
        return 'text-text-primary';
    }
  };

  return (
    <div className={`bg-dark-surface rounded-lg p-6 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-text-primary font-medium text-lg">
          {question.title}
        </h3>
        <span className={`${DIFFICULTY_COLORS[question.difficulty]} text-text-primary text-xs px-2 py-1 rounded`}>
          {question.difficulty}
        </span>
      </div>
      <p className="text-text-secondary text-sm leading-relaxed mb-4">
        {question.description}
      </p>
      
      <div className="flex justify-between items-center">
        <span className="text-text-primary text-sm font-medium">
          {question.points} pts
        </span>
        <span className={`text-sm font-medium ${getStatusColorClass(question.status)}`}>
          {question.status}
        </span>
      </div>

      {question.progress !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-text-muted mb-1">
            <span>Progress</span>
            <span>{question.progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-interactive-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${question.progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
