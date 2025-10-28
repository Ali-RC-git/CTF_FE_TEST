'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { LiveScoreboard } from '@/components/cards';
import TeamsSection from '@/components/dashboard/TeamsSection';
import { TeamManagementModal } from '@/components/team-management/TeamManagementModal';
import { ScoreboardEntry } from '@/lib/types';
import { useTeamsSingleton } from '@/lib/hooks/useTeamsSingleton';
import { StudentRouteGuard } from '@/components/auth/RoleBasedRouteGuard';
import { useToast } from '@/lib/hooks/useToast';
import { useAuth } from '@/lib/context/AuthContext';

const mockScoreboardEntries: ScoreboardEntry[] = [
  {
    id: '1',
    rank: 1,
    teamName: 'QuantumPoptarts',
    points: 6242,
    trend: 'stable',
    highlight: 'gold'
  },
  {
    id: '2',
    rank: 2,
    teamName: 'WEH',
    points: 5995,
    trend: 'up',
    highlight: 'silver'
  },
  {
    id: '3',
    rank: 3,
    teamName: 'TeamName-of-MyChoice',
    points: 5258,
    trend: 'stable',
    highlight: 'bronze'
  },
  {
    id: '4',
    rank: 4,
    teamName: 'The Undecideds',
    points: 3489,
    trend: 'down'
  }
];

export default function TeamsPage() {
  const router = useRouter();
  const { authState } = useAuth();
  const { myTeams, removeTeamMember, fetchMyTeams } = useTeamsSingleton();
  const { showSuccess, showError } = useToast();
  const [showTeamManagementModal, setShowTeamManagementModal] = useState(false);
  const [selectedTeamForManagement, setSelectedTeamForManagement] = useState<{ id: string; name: string } | null>(null);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [teamToLeave, setTeamToLeave] = useState<{ id: string; name: string } | null>(null);

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleManageTeam = (teamId: string) => {
    const team = myTeams.find(t => t.id === teamId);
    if (team) {
      setSelectedTeamForManagement({ id: team.id, name: team.name });
      setShowTeamManagementModal(true);
    }
  };

  const handleLeaveTeam = (teamId: string) => {
    const team = myTeams.find(t => t.id === teamId);
    if (team) {
      setTeamToLeave({ id: teamId, name: team.name });
      setShowLeaveConfirmation(true);
    }
  };

  // Confirm leaving team
  const confirmLeaveTeam = async () => {
    if (!teamToLeave) return;
    
    try {
      // Use removeTeamMember API with current user's ID
      await removeTeamMember(teamToLeave.id, authState.user?.id || '');
      showSuccess('Successfully left the team');
      // Refresh the teams list
      await fetchMyTeams();
      // Close modal
      setShowLeaveConfirmation(false);
      setTeamToLeave(null);
    } catch (error) {
      showError('Failed to leave team. Please try again.');
    }
  };

  // Cancel leaving team
  const cancelLeaveTeam = () => {
    setShowLeaveConfirmation(false);
    setTeamToLeave(null);
  };

  return (
    <StudentRouteGuard>
      <div className="min-h-screen bg-dark-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Teams Section */}
          <TeamsSection 
            teams={myTeams}
            onBackToDashboard={handleBackToDashboard}
            onManageTeam={handleManageTeam}
            onLeaveTeam={handleLeaveTeam}
            className="mb-8"
          />

          {/* Live Scoreboard Section */}
          <LiveScoreboard entries={mockScoreboardEntries} />
        </div>
      </main>
      <Footer />

      {/* Team Management Modal */}
      {selectedTeamForManagement && (
        <TeamManagementModal
          isOpen={showTeamManagementModal}
          onClose={() => {
            setShowTeamManagementModal(false);
            setSelectedTeamForManagement(null);
          }}
          teamId={selectedTeamForManagement.id}
          teamName={selectedTeamForManagement.name}
        />
      )}

      {/* Leave Team Confirmation Modal */}
      {showLeaveConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card-bg rounded-xl p-6 max-w-md w-full mx-4 border border-border-color">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary">Leave Team</h3>
            </div>
            
            <p className="text-text-secondary mb-6">
              Are you sure you want to leave <span className="font-semibold text-accent-color">"{teamToLeave?.name}"</span>? 
              This action cannot be undone and you will lose access to all team resources.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelLeaveTeam}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-border-color text-text-secondary hover:bg-secondary-bg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLeaveTeam}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Leave Team
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </StudentRouteGuard>
  );
}
