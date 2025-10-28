'use client';

import { useState } from 'react';
import DataTable from './DataTable';
import ActionButton from './ActionButton';
import RankingSettings from './RankingSettings';
import ConfirmationModal from './ConfirmationModal';

interface RankingControlsTabProps {
  onShowSuccess: (message: string) => void;
  onShowError: (message: string) => void;
}

export default function RankingControlsTab({ onShowSuccess, onShowError }: RankingControlsTabProps) {
  const [teams, setTeams] = useState([
    {
      id: 1,
      name: 'QuantumPoptarts',
      score: 6242,
      movement: 'stable',
      lastActivity: '2 minutes ago'
    },
    {
      id: 2,
      name: 'WEH',
      score: 5995,
      movement: 'down',
      lastActivity: '5 minutes ago'
    },
    {
      id: 3,
      name: 'TeamName-of-MyChoice',
      score: 5258,
      movement: 'stable',
      lastActivity: '15 minutes ago'
    },
    {
      id: 4,
      name: 'The Undecideds',
      score: 3489,
      movement: 'up',
      lastActivity: '8 minutes ago'
    }
  ]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<{id: number, name: string} | null>(null);

  const handleUpdateRankings = () => {
    onShowSuccess('Team rankings updated successfully');
  };

  const handleDelete = (teamId: number, teamName: string) => {
    setTeamToDelete({ id: teamId, name: teamName });
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (teamToDelete) {
      setTeams(teams.filter(team => team.id !== teamToDelete.id));
      onShowSuccess(`${teamToDelete.name} removed from scoreboard`);
      setShowDeleteModal(false);
      setTeamToDelete(null);
    }
  };

  const handleScoreChange = (teamId: number, newScore: number) => {
    setTeams(teams.map(team => 
      team.id === teamId ? { ...team, score: newScore } : team
    ));
  };

  const handleMovementChange = (teamId: number, newMovement: string) => {
    setTeams(teams.map(team => 
      team.id === teamId ? { ...team, movement: newMovement } : team
    ));
  };

  const columns = [
    { key: 'rank', label: 'Rank' },
    { key: 'name', label: 'Team Name' },
    { key: 'score', label: 'Score' },
    { key: 'movement', label: 'Movement' },
    { key: 'lastActivity', label: 'Last Activity' },
    { key: 'actions', label: 'Actions' }
  ];

  const renderCell = (team: any, column: string) => {
    switch (column) {
      case 'rank':
        return teams.indexOf(team) + 1;
      case 'score':
        return (
          <input
            type="number"
            value={team.score}
            onChange={(e) => handleScoreChange(team.id, parseInt(e.target.value))}
            className="w-24 px-2 py-1 bg-secondary-bg border border-border-color rounded text-text-primary text-sm"
          />
        );
      case 'movement':
        return (
          <select
            value={team.movement}
            onChange={(e) => handleMovementChange(team.id, e.target.value)}
            className="w-20 px-2 py-1 bg-secondary-bg border border-border-color rounded text-text-primary text-sm"
          >
            <option value="up">↑ Up</option>
            <option value="down">↓ Down</option>
            <option value="stable">→ Stable</option>
          </select>
        );
      case 'actions':
        return (
          <div className="flex gap-2">
            <ActionButton icon="✏️" title="Edit" onClick={() => console.log('Edit', team.id)} />
            <ActionButton 
              icon="🗑️" 
              title="Remove" 
              onClick={() => handleDelete(team.id, team.name)}
              className="hover:text-danger-color"
            />
          </div>
        );
      default:
        return team[column];
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
        <h2 className="text-lg mb-5 text-accent-light font-semibold flex items-center gap-2.5">
          <span className="text-xl">📊</span>
          Ranking Management
        </h2>
        
        <DataTable
          columns={columns}
          data={teams}
          renderCell={renderCell}
        />
        
        <div className="flex justify-end gap-4 mt-6">
          <button className="btn-secondary">
            Add New Team
          </button>
          <button 
            onClick={handleUpdateRankings}
            className="btn-primary"
          >
            Update All Rankings
          </button>
        </div>
      </div>
      
      <RankingSettings onShowSuccess={onShowSuccess} onShowError={onShowError} />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTeamToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Remove Team"
        message={`Are you sure you want to remove "${teamToDelete?.name}" from the scoreboard?`}
        confirmText="Remove"
        type="danger"
      />
    </div>
  );
}
