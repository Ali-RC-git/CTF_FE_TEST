'use client';

import { UserTeam } from '@/lib/api';
import { Trash2 } from 'lucide-react';

interface TeamCardProps {
  team: UserTeam;
  onRemove?: (teamId: string) => void;
  showRemoveButton?: boolean;
  className?: string;
}

export default function TeamCard({ 
  team, 
  onRemove, 
  showRemoveButton = false,
  className = '' 
}: TeamCardProps) {
  return (
    <div className={`flex items-center justify-between p-3 bg-secondary-bg rounded-lg border border-border-color ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-accent-color/20 flex items-center justify-center">
          <span className="text-xs font-bold text-accent-color">T</span>
        </div>
        <div>
          <div className="font-medium text-text-primary">{team.team_name}</div>
          <div className="text-xs text-text-secondary">
            Joined: {new Date(team.joined_at).toLocaleDateString()}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          team.role === 'leader' 
            ? 'bg-primary-500/20 text-primary-300' 
            : 'bg-text-secondary/20 text-text-secondary'
        }`}>
          {team.role}
        </span>
        {showRemoveButton && onRemove && (
          <button
            type="button"
            onClick={() => onRemove(team.team_id)}
            className="p-1 text-danger-color hover:bg-danger-color/10 rounded transition-colors"
            title="Remove from team"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
