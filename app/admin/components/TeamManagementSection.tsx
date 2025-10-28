'use client';

import { User, UserTeam, Team } from '@/lib/api';
import TeamCard from './TeamCard';
import TeamSelector from './TeamSelector';

interface TeamManagementSectionProps {
  user: User;
  onRemoveFromTeam: (teamId: string) => void;
  className?: string;
}

export default function TeamManagementSection({
  user,
  onRemoveFromTeam,
  className = ''
}: TeamManagementSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-text-primary">Team Management</h4>
        <span className="text-sm text-text-secondary">
          {user?.teams?.length || 0} team(s) assigned
        </span>
      </div>
      
      {/* Current Teams */}
      {user?.teams && user.teams.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-text-secondary">Current Teams</h5>
          <div className="space-y-2">
            {user.teams.map((team, index) => (
              <TeamCard
                key={index}
                team={team}
                onRemove={onRemoveFromTeam}
                showRemoveButton={true}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Show message if no teams */}
      {(!user?.teams || user.teams.length === 0) && (
        <div className="text-center py-6">
          <p className="text-text-secondary">No teams assigned to this user.</p>
          <p className="text-sm text-text-secondary mt-1">Use the Team Assignment section above to add the user to a team.</p>
        </div>
      )}
    </div>
  );
}
