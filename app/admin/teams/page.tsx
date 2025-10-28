'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useTeamsSingleton } from '@/lib/hooks/useTeamsSingleton';
import { useToast } from '@/lib/hooks/useToast';
import TeamManagementHeader from '../components/TeamManagementHeader';
import TeamStatsOverview from '../components/TeamStatsOverview';
import TeamTabs from '../components/TeamTabs';
import AllTeamsTab from '../components/AllTeamsTab';
import UserManagementTab from '../components/UserManagementTab';
import JoinRequestsTab from '../components/JoinRequestsTab';
import TeamSettingsTab from '../components/TeamSettingsTab';
import CreateTeamModal from '../components/CreateTeamModal';

export default function TeamManagementPage() {
  const { t } = useLanguage();
  const { teams, myTeams, invitations, isLoading, error, refreshData } = useTeamsSingleton();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('teams');
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);

  const handleCreateTeam = () => {
    setIsCreateTeamModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateTeamModalOpen(false);
  };

  const handleSaveTeam = (teamData: any) => {
    // Team creation is handled by the CreateTeamModal component
    showSuccess('Team created successfully!');
    setIsCreateTeamModalOpen(false);
    // Refresh the teams data
    refreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <TeamManagementHeader onCreateTeam={handleCreateTeam} />

      {/* Stats Overview */}
      <TeamStatsOverview />

      {/* Tabs Navigation */}
      <TeamTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="">
        {activeTab === 'teams' && <AllTeamsTab />}
        {activeTab === 'users' && <UserManagementTab />}
        {activeTab === 'requests' && <JoinRequestsTab />}
        {activeTab === 'settings' && <TeamSettingsTab />}
      </div>

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={isCreateTeamModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTeam}
      />
    </div>
  );
}