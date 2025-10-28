'use client';

import { Team, TeamMember } from '@/lib/types';

interface TeamDetailsViewProps {
  team: Team | null;
  isLoading?: boolean;
  onRemoveMember?: (userId: string, userName: string) => void;
}

export function TeamDetailsView({ team, isLoading = false, onRemoveMember }: TeamDetailsViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-color"></div>
        <span className="ml-3 text-text-secondary">Loading team details...</span>
      </div>
    );
  }
  if (!team) {
    return (
      <div className="text-center py-8 text-text-secondary">
        Failed to load team details.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Basic Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">
              Team Name
            </label>
            <div className="px-3 py-2 bg-secondary-bg border border-border-color rounded-md text-text-primary font-medium">
              {team.name || 'Unknown Team'}
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">
              Description
            </label>
            <div className="px-3 py-2 bg-secondary-bg border border-border-color rounded-md text-text-primary">
              {team.description || 'No description provided'}
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">
                Team Size
              </label>
              <div className="px-3 py-2 bg-secondary-bg border border-border-color rounded-md text-text-primary font-medium text-center">
                {team.members?.length || 0} / {team.max_size || 4}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">
                Status
              </label>
              <div className="px-3 py-2 bg-secondary-bg border border-border-color rounded-md flex items-center justify-center">
                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                  team.status === 'active' 
                    ? 'bg-success-color/20 text-success-color' 
                    : 'bg-warning-color/20 text-warning-color'
                }`}>
                  {team.status || 'Active'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">
                Visibility
              </label>
              <div className="px-3 py-2 bg-secondary-bg border border-border-color rounded-md text-text-primary text-sm">
                {team.is_invite_only ? 'Private' : 'Public'}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">
                Created
              </label>
              <div className="px-3 py-2 bg-secondary-bg border border-border-color rounded-md text-text-primary text-sm">
                {team.created_at ? new Date(team.created_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Leader */}
      {team.leader_name && (
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
            Team Leader
          </label>
          <div className="px-3 py-2 bg-secondary-bg border border-border-color rounded-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent-dark to-accent-color flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {(team.leader_name || 'L').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="text-text-primary font-medium text-sm">
                  {team.leader_name}
                </div>
                <div className="text-text-secondary text-xs">
                  ID: {team.leader}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Members */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
          Team Members ({team.members?.length || 0})
        </label>
        <div className="bg-secondary-bg border border-border-color rounded-md p-3">
          {team.members && team.members.length > 0 ? (
            <div className="space-y-2">
              {team.members.map((member: TeamMember, index: number) => (
                <div key={member.id || index} className="flex items-center justify-between p-2 bg-card-bg rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-accent-dark to-accent-color flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {member.initials || member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-text-primary font-medium text-sm">
                        {member.name}
                      </div>
                      <div className="text-text-secondary text-xs">
                        ID: {member.id}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.role === 'leader' 
                        ? 'bg-accent-color/20 text-accent-color' 
                        : 'bg-text-secondary/20 text-text-secondary'
                    }`}>
                      {member.role || 'member'}
                    </span>
                    {member.role !== 'leader' && onRemoveMember && (
                      <button
                        onClick={() => onRemoveMember(
                          member.id, 
                          member.name
                        )}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded transition-colors"
                        title="Remove member"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-text-secondary text-sm">
              No members found
            </div>
          )}
        </div>
      </div>

      {/* Team Statistics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-secondary-bg border border-border-color rounded-md p-3 text-center">
          <div className="text-lg font-bold text-accent-color">
            {team.members?.length || 0}
          </div>
          <div className="text-text-secondary text-xs uppercase tracking-wide">Current</div>
        </div>
        <div className="bg-secondary-bg border border-border-color rounded-md p-3 text-center">
          <div className="text-lg font-bold text-accent-color">
            {team.max_size || 4}
          </div>
          <div className="text-text-secondary text-xs uppercase tracking-wide">Max</div>
        </div>
        <div className="bg-secondary-bg border border-border-color rounded-md p-3 text-center">
          <div className="text-lg font-bold text-accent-color">
            {Math.round(((team.members?.length || 0) / (team.max_size || 4)) * 100)}%
          </div>
          <div className="text-text-secondary text-xs uppercase tracking-wide">Capacity</div>
        </div>
      </div>

      {/* Team Invite Code */}
      {team.invite_code && (
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
            Invite Code
          </label>
          <div className="px-3 py-2 bg-secondary-bg border border-border-color rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-text-primary font-mono text-sm">
                {team.invite_code}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(team.invite_code || '')}
                className="px-2 py-1 bg-accent-color/20 text-accent-color rounded text-xs hover:bg-accent-color hover:text-white transition-all duration-200"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
