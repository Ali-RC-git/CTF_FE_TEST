"use client";
import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/lib/hooks/useToast';
import { adminExportAPI } from '@/lib/api/admin-export';
import { Download, Plus } from 'lucide-react';

import ConfirmationModal from './ConfirmationModal';

export default function TeamsContent() {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<any>(null);

  const mockTeams = [
    {
      id: '1',
      name: 'Cyber Warriors',
      members: [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Leader' },
        { id: '2', name: 'Sarah Smith', email: 'sarah@example.com', role: 'Member' },
        { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'Member' }
      ],
      score: 2450,
      rank: 1,
      created: '2023-01-15',
      lastActivity: '2023-12-01',
      status: 'active'
    },
    {
      id: '2',
      name: 'Security Squad',
      members: [
        { id: '4', name: 'Lisa Brown', email: 'lisa@example.com', role: 'Leader' },
        { id: '5', name: 'David Wilson', email: 'david@example.com', role: 'Member' }
      ],
      score: 1980,
      rank: 2,
      created: '2023-02-20',
      lastActivity: '2023-11-28',
      status: 'active'
    },
    {
      id: '3',
      name: 'Code Breakers',
      members: [
        { id: '6', name: 'Alex Chen', email: 'alex@example.com', role: 'Leader' },
        { id: '7', name: 'Emma Davis', email: 'emma@example.com', role: 'Member' },
        { id: '8', name: 'Ryan Miller', email: 'ryan@example.com', role: 'Member' },
        { id: '9', name: 'Sophie Taylor', email: 'sophie@example.com', role: 'Member' }
      ],
      score: 1750,
      rank: 3,
      created: '2023-03-10',
      lastActivity: '2023-11-25',
      status: 'inactive'
    }
  ];

  const handleExportTeams = async () => {
    try {
      await adminExportAPI.exportAndDownloadTeams({
        format: 'excel',
        includeInactive: activeTab === 'all'
      });
      showSuccess('Teams data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      showError(`Failed to export teams data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };


  const handleAddTeam = () => {
    showSuccess('Add team functionality would open a modal here');
  };

  const handleEditTeam = (teamId: string) => {
    showSuccess(`Edit team ${teamId} functionality would open a modal here`);
  };

  const handleDeleteTeam = (teamId: string) => {
    const team = mockTeams.find(t => t.id === teamId);
    if (team) {
      setTeamToDelete(team);
      setShowDeleteModal(true);
    }
  };

  const confirmDeleteTeam = () => {
    if (teamToDelete) {
      showSuccess(`Team ${teamToDelete.name} deleted successfully!`);
      setShowDeleteModal(false);
      setTeamToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2.5 py-1 rounded-full text-xs font-bold uppercase";
    if (status === 'active') {
      return `${baseClasses} bg-success-color/20 text-success-color`;
    }
    return `${baseClasses} bg-warning-color/20 text-warning-color`;
  };

  return (
    <section>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-dark to-accent-color bg-clip-text text-transparent">
          {t.admin.teams.title}
        </h1>
        <div className="flex gap-4 md:flex-row flex-col">
          <button 
            onClick={handleExportTeams}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {t.admin.teams.exportTeams}
          </button>
          <button 
            onClick={handleAddTeam}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t.admin.teams.addTeam}
          </button>
        </div>
      </header>

      <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
        <div className="flex border-b border-border-color mb-5 overflow-x-auto">
          {['all', 'active', 'inactive'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-5 cursor-pointer transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab
                  ? 'text-accent-color border-b-accent-color'
                  : 'text-text-secondary border-b-transparent'
              }`}
            >
              {tab === 'all' ? t.admin.teams.allTeams :
               tab === 'active' ? t.admin.teams.activeTeams : t.admin.teams.inactiveTeams}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto" style={{ height: '400px', overflowY: 'auto' }}>
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-card-bg z-10">
              <tr>
                <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">
                  {t.admin.teams.teamName}
                </th>
                <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">
                  {t.admin.teams.members}
                </th>
                <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">
                  {t.admin.teams.score}
                </th>
                <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">
                  {t.admin.teams.rank}
                </th>
                <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">
                  {t.admin.teams.created}
                </th>
                <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">
                  {t.admin.teams.lastActivity}
                </th>
                <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">
                  {t.admin.dashboard.status}
                </th>
                <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">
                  {t.admin.users.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {mockTeams
                .filter(team => activeTab === 'all' || team.status === activeTab)
                .map((team) => (
                <tr key={team.id} className="hover:bg-white/3">
                  <td className="py-3 px-4 border-b border-white/5">
                    <div className="font-medium text-text-primary">{team.name}</div>
                  </td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <div className="flex -space-x-2">
                      {team.members.slice(0, 3).map((member, index) => (
                        <div
                          key={member.id}
                          className="w-8 h-8 bg-accent-color rounded-full flex items-center justify-center border-2 border-card-bg text-white text-xs font-medium"
                          style={{ zIndex: team.members.length - index }}
                          title={`${member.name} (${member.role})`}
                        >
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      ))}
                      {team.members.length > 3 && (
                        <div className="w-8 h-8 bg-secondary-bg rounded-full flex items-center justify-center border-2 border-card-bg text-text-secondary text-xs font-medium">
                          +{team.members.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      {team.members.length} {t.admin.teams.members.toLowerCase()}
                    </div>
                  </td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <span className="font-bold text-accent-color">{team.score.toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <span className="font-bold text-text-primary">#{team.rank}</span>
                  </td>
                  <td className="py-3 px-4 border-b border-white/5 text-text-secondary">
                    {new Date(team.created).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 border-b border-white/5 text-text-secondary">
                    {new Date(team.lastActivity).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <span className={getStatusBadge(team.status)}>
                      {team.status === 'active' ? t.admin.users.active : t.admin.users.inactive}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditTeam(team.id)}
                        className="p-1 text-text-secondary hover:text-accent-color"
                        title="Edit Team"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteTeam(team.id)}
                        className="p-1 text-text-secondary hover:text-danger-color"
                        title="Delete Team"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTeamToDelete(null);
        }}
        onConfirm={confirmDeleteTeam}
        title="Delete Team"
        message={`Are you sure you want to delete "${teamToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </section>
  );
}