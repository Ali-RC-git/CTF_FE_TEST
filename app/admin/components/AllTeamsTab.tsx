'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTeamsSingleton } from '@/lib/hooks/useTeamsSingleton';
import { useToast } from '@/lib/hooks/useToast';
import { formatTeamSize, formatTeamStatus } from '@/lib/utils/api-mappers';
import SearchBox from './SearchBox';
import DataTable from './DataTable';
import ActionButton from './ActionButton';
import CreateTeamModal from './CreateTeamModal';
import { TeamManagementModal } from '@/components/team-management/TeamManagementModal';
import ViewTeamModal from './ViewTeamModal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import Pagination from '@/components/ui/Pagination';

export default function AllTeamsTab() {
  const { 
    teams, 
    teamsPagination,
    isLoading, 
    error, 
    deleteTeam, 
    updateTeam, 
    fetchTeams,
    setTeamsPage
  } = useTeamsSingleton();
  const { showSuccess, showError } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  
  // Fetch teams on mount
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);
  
  // Transform teams data for the table
  const transformedTeams = useMemo(() => {
    return teams.map(team => ({
      id: team.id,
      name: team.name,
      captain: team.leader_name || 'Unknown',
      members: `${team.current_size || 0}/${team.max_size || 0}`,
      points: '0', // This would come from a scoreboard API
      status: formatTeamStatus(team.status || 'active'),
      created: new Date(team.created_at || Date.now()).toLocaleDateString()
    }));
  }, [teams]);
  
  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTeams({ 
        search: searchTerm || undefined
      });
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchTeams]);


  const handleManage = (team: any) => {
    setSelectedTeam(team);
    setShowManageModal(true);
  };

  const handleView = (team: any) => {
    setSelectedTeam(team);
    setShowViewModal(true);
  };

  const handleDelete = (team: any) => {
    setSelectedTeam(team);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedTeam) return;
    
    try {
      await deleteTeam(selectedTeam.id);
      await fetchTeams(); // Refresh the teams list
      showSuccess(`${selectedTeam.name} deleted successfully`);
      setShowDeleteModal(false);
      setSelectedTeam(null);
    } catch (error) {
      showError(`Failed to delete ${selectedTeam.name}. Please try again.`);
    }
  };

  const handleCreateTeam = async (teamData: any) => {
    try {
      await fetchTeams(); // Refresh the teams list
      showSuccess(`${teamData.name} created successfully`);
    } catch (error) {
      showError(`Failed to create team. Please try again.`);
    }
  };


  const getStatusBadge = (status: string) => {
    const statusClasses = {
      'Active': 'bg-success-color/20 text-success-color',
      'Inactive': 'bg-danger-color/20 text-danger-color',
      'Pending': 'bg-warning-color/20 text-warning-color'
    };
    
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status}
      </span>
    );
  };

  const columns = [
    { key: 'name', label: 'Team Name' },
    { key: 'captain', label: 'Captain' },
    { key: 'members', label: 'Members' },
    { key: 'points', label: 'Points' },
    { key: 'status', label: 'Status' },
    { key: 'created', label: 'Created' },
    { key: 'actions', label: 'Actions' }
  ];

  const renderCell = (team: any, column: string) => {
    switch (column) {
      case 'status':
        return getStatusBadge(team.status);
      case 'actions':
        return (
          <div className="flex gap-2">
            <ActionButton icon="✏️" title="Manage" onClick={() => handleManage(team)} />
            <ActionButton icon="👁️" title="View Details" onClick={() => handleView(team)} />
            <ActionButton 
              icon="🗑️" 
              title="Delete" 
              onClick={() => handleDelete(team)}
              className="hover:text-danger-color"
            />
          </div>
        );
      default:
        return team[column];
    }
  };

  return (
    <>
      <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg text-accent-light font-semibold flex items-center gap-2.5">
            <span className="text-xl">👥</span>
            All Teams
          </h2>
        </div>
        
        <SearchBox
          placeholder="Search teams by name, description, or captain..."
          value={searchTerm}
          onChange={setSearchTerm}
          className="mb-6"
        />
        
        <DataTable
          columns={columns}
          data={transformedTeams}
          renderCell={renderCell}
        />
        
        {/* Pagination */}
        {teamsPagination && (
          <div className="mt-6">
            <Pagination
              currentPage={teamsPagination.currentPage}
              totalPages={teamsPagination.totalPages}
              totalCount={teamsPagination.totalCount}
              pageSize={teamsPagination.pageSize}
              onPageChange={setTeamsPage}
            />
          </div>
        )}
      </div>
      
          <CreateTeamModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSave={handleCreateTeam}
          />
          
          <TeamManagementModal
            isOpen={showManageModal}
            onClose={() => {
              setShowManageModal(false);
              setSelectedTeam(null);
            }}
            teamId={selectedTeam?.id || ''}
            teamName={selectedTeam?.name || ''}
          />
          
          <ViewTeamModal
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setSelectedTeam(null);
            }}
            team={selectedTeam}
          />
          
          <ConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedTeam(null);
            }}
            onConfirm={confirmDelete}
            title="Delete Team"
            message={`Are you sure you want to delete "${selectedTeam?.name}"? This action cannot be undone and will remove all team data.`}
            confirmText="Delete"
            cancelText="Cancel"
            type="delete"
          />
        </>
      );
    }
