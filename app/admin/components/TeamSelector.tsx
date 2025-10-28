'use client';

import { Team } from '@/lib/api';

interface TeamSelectorProps {
  teams: Team[];
  selectedTeam: string;
  onTeamChange: (teamId: string) => void;
  onAddToTeam: () => void;
  selectedRole: 'leader' | 'member';
  onRoleChange: (role: 'leader' | 'member') => void;
  isLoading?: boolean;
  error?: string | null;
  userTeams?: Array<{ team_id: string }>;
  className?: string;
}

export default function TeamSelector({
  teams,
  selectedTeam,
  onTeamChange,
  onAddToTeam,
  selectedRole,
  onRoleChange,
  isLoading = false,
  error = null,
  userTeams = [],
  className = ''
}: TeamSelectorProps) {
  // Filter out teams the user is already in (additional client-side filtering)
  const availableTeams = teams.filter(team => 
    !userTeams.some(userTeam => userTeam.team_id === team.id)
  );

  return (
    <div className={`space-y-3 ${className}`}>
      <h5 className="text-sm font-medium text-text-secondary">Add to Team</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Select Team
          </label>
          <select
            value={selectedTeam}
            onChange={(e) => onTeamChange(e.target.value)}
            className={`w-full px-4 py-3 bg-secondary-bg border rounded-lg text-text-primary focus:outline-none focus:ring-2 ${
              error 
                ? 'border-danger-color focus:ring-danger-color' 
                : 'border-border-color focus:ring-accent-color'
            }`}
            disabled={isLoading}
          >
            <option value="">Select a team...</option>
            {isLoading ? (
              <option value="" disabled>Loading teams...</option>
            ) : error ? (
              <option value="" disabled>Error loading teams</option>
            ) : (
              availableTeams.map((team) => (
                <option 
                  key={team.id} 
                  value={team.id}
                >
                  {team.name} ({team.current_size}/{team.max_size})
                </option>
              ))
            )}
          </select>
          {error && (
            <p className="text-danger-color text-sm mt-1">{error}</p>
          )}
        </div>
        
        {selectedTeam && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Team Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => onRoleChange(e.target.value as 'leader' | 'member')}
              className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
            >
              <option value="member">Member</option>
              <option value="leader">Leader</option>
            </select>
          </div>
        )}
      </div>
      
      {selectedTeam && (
        <button
          type="button"
          onClick={onAddToTeam}
          className="px-4 py-2 bg-accent-color text-white rounded-lg hover:bg-accent-dark transition-colors text-sm font-medium"
        >
          Add to Team
        </button>
      )}
    </div>
  );
}
