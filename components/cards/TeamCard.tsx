import { Team } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/context/AuthContext';
import { Sparkles } from 'lucide-react';

interface TeamCardProps {
  team: Team;
  onManage?: (teamId: string) => void;
  onLeave?: (teamId: string) => void;
  className?: string;
}

export default function TeamCard({ team, onManage, onLeave, className = '' }: TeamCardProps) {
  const { t } = useLanguage();
  const { authState } = useAuth();
  
  // Check if team was created recently (within last 24 hours)
  const isRecentlyCreated = team.created_at ? 
    (Date.now() - new Date(team.created_at).getTime()) < 24 * 60 * 60 * 1000 : false;
  
  // Check if current user is the team leader
  const isLeader = team.leader === authState.user?.id;
  
  return (
    <div className={`bg-secondary-bg rounded-lg p-6 ${isRecentlyCreated ? 'ring-2 ring-green-400 ring-opacity-50' : ''} ${className}`}>
      {/* Team Name */}
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-text-primary font-bold text-xl">
          {team.name}
        </h3>
        {isRecentlyCreated && (
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            New
          </span>
        )}
      </div>

      {/* Team Size */}
      <p className="text-text-secondary text-sm mb-2">
        {team.current_size || team.size || team.members?.length || 0} members
      </p>
      
      {/* Creation Date for Recently Created Teams */}
      {isRecentlyCreated && team.created_at && (
        <p className="text-green-400 text-xs mb-4">
          Created {new Date(team.created_at).toLocaleDateString()}
        </p>
      )}

      {/* Members */}
      <div className="mb-6">
        <div className="flex -space-x-2">
          {(team.members || []).slice(0, 4).map((member, index) => (
            <div
              key={member.id}
              className="w-10 h-10 bg-accent-color rounded-full flex items-center justify-center border-2 border-secondary-bg text-white text-sm font-medium"
              style={{ zIndex: (team.members || []).length - index }}
            >
              {member.initials}
            </div>
          ))}
        </div>
      </div>

      {/* Manage Team Button - Only show for team leaders */}
      {isLeader && (
        <button
          onClick={() => onManage?.(team.id)}
          className="w-full bg-accent-color hover:bg-accent-dark text-white px-4 py-2 rounded transition-colors duration-200 font-medium"
        >
          {t.teamPage.myTeams.manageTeam}
        </button>
      )}
      
      {/* View Team Button - Show for all team members */}
      {!isLeader && (
        <button
          onClick={() => onManage?.(team.id)}
          className="w-full bg-secondary-bg hover:bg-secondary-bg/80 text-text-primary border border-border-color px-4 py-2 rounded transition-colors duration-200 font-medium"
        >
          View Team
        </button>
      )}
      
      {/* Leave Team Button - Show for all team members */}
      <button
        onClick={() => onLeave?.(team.id)}
        className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors duration-200 font-medium mt-2"
      >
        Leave Team
      </button>
    </div>
  );
}
