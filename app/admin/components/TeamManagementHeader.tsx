'use client';

import { adminExportAPI } from '@/lib/api/admin-export';
import { useToast } from '@/lib/hooks/useToast';
import { Download, Plus } from 'lucide-react';

interface TeamManagementHeaderProps {
  onCreateTeam: () => void;
}

export default function TeamManagementHeader({ onCreateTeam }: TeamManagementHeaderProps) {
  const { showSuccess, showError } = useToast();

  const handleExportTeams = async () => {
    try {
      console.log('🚀 Export Teams button clicked from header!');
      await adminExportAPI.exportAndDownloadTeams({
        format: 'excel',
        includeInactive: true
      });
      showSuccess('Teams data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      showError(`Failed to export teams data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="flex justify-between items-start flex-wrap gap-5">
      <div className="flex items-center">
        <div className="bg-gradient-to-r from-accent-dark to-accent-color w-10 h-10 rounded-lg flex items-center justify-center mr-3 font-bold text-white">
          C
        </div>
        <div className="text-2xl font-bold text-text-primary">
          CRDF Global <span className="bg-admin-color text-white text-xs px-2 py-1 rounded-full ml-2">ADMIN</span>
        </div>
      </div>
      
      <div className="flex-1">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-dark to-accent-color bg-clip-text text-transparent mb-2">
          Team Management
        </h1>
        <p className="text-text-secondary">
          Admin controls for managing teams, users, and permissions
        </p>
      </div>
      
      <div className="flex gap-4">
        <button 
          onClick={handleExportTeams}
          className="btn-secondary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Teams
        </button>
        <button 
          onClick={onCreateTeam}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Team
        </button>
      </div>
    </div>
  );
}
