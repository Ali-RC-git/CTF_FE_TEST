'use client';

import { useState, useEffect } from 'react';
import { useTeams } from '@/lib/hooks/useTeams';
import { Team } from '@/lib/types';
import { TeamDetailsView } from '@/components/team-management/TeamDetailsView';
import ModalCloseButton from '@/components/ui/ModalCloseButton';

interface ViewTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
}

export default function ViewTeamModal({ isOpen, onClose, team }: ViewTeamModalProps) {
  const [teamDetails, setTeamDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getTeam } = useTeams();

  useEffect(() => {
    if (isOpen && team) {
      fetchTeamDetails();
    }
  }, [isOpen, team]);

  const fetchTeamDetails = async () => {
    if (!team) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const details = await getTeam(team.id);
      setTeamDetails(details);
    } catch (error) {
      console.error('Failed to fetch team details:', error);
      setError('Failed to load team details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTeamDetails(null);
    setError(null);
    onClose();
  };

  if (!isOpen || !team) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" 
      style={{ 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        backdropFilter: 'blur(4px)', 
        WebkitBackdropFilter: 'blur(4px)',
        position: 'fixed',
        width: '100vw',
        height: '100vh'
      }}
    >
      <div className="bg-card-bg rounded-xl w-full max-w-4xl border border-border-color shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-6 border-b border-border-color sticky top-0 bg-card-bg rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-accent-dark to-accent-color rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">👁️</span>
            </div>
            <h3 className="text-xl font-semibold text-accent-light">Team Details</h3>
          </div>
          <ModalCloseButton onClick={handleClose} />
        </div>
        
        <div className="p-6">
          {error && (
            <div className="bg-danger-color/10 border border-danger-color/20 text-danger-color px-4 py-3 rounded-lg flex items-center mb-6">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          )}

          <TeamDetailsView team={teamDetails} isLoading={isLoading} />
        </div>
        
        <div className="flex justify-end gap-4 p-6 border-t border-border-color">
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-secondary-bg text-text-primary border border-border-color rounded-lg hover:bg-border-color hover:border-accent-color transition-all duration-200 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
