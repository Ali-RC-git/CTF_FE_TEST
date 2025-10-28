'use client';

import { useState } from 'react';
import ConfirmationModal from './ConfirmationModal';

interface TeamSettingsTabProps {
  onShowSuccess?: (message: string) => void;
  onShowError?: (message: string) => void;
}

export default function TeamSettingsTab({ onShowSuccess, onShowError }: TeamSettingsTabProps = {}) {
  const [settings, setSettings] = useState({
    maxTeamSize: '4',
    defaultVisibility: 'public',
    allowMultipleTeams: true,
    requireAdminApproval: true,
    allowCaptainRemoveMembers: false,
    notifyAdminsOfRequests: true
  });
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSave = () => {
    if (onShowSuccess) {
      onShowSuccess('Team settings updated successfully');
    } else {
      console.log('Team settings updated successfully');
    }
  };

  const handleReset = () => {
    setShowResetModal(true);
  };

  const confirmReset = () => {
    setSettings({
      maxTeamSize: '4',
      defaultVisibility: 'public',
      allowMultipleTeams: true,
      requireAdminApproval: true,
      allowCaptainRemoveMembers: false,
      notifyAdminsOfRequests: true
    });
    if (onShowSuccess) {
      onShowSuccess('Settings reset to defaults');
    } else {
      console.log('Settings reset to defaults');
    }
    setShowResetModal(false);
  };

  return (
    <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
      <h2 className="text-lg mb-5 text-accent-light font-semibold flex items-center gap-2.5">
        <span className="text-xl">⚙️</span>
        Team Configuration
      </h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Maximum Team Size
          </label>
          <select
            value={settings.maxTeamSize}
            onChange={(e) => setSettings({...settings, maxTeamSize: e.target.value})}
            className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
          >
            <option value="2">2 members</option>
            <option value="3">3 members</option>
            <option value="4">4 members</option>
            <option value="5">5 members</option>
            <option value="6">6 members</option>
            <option value="8">8 members</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Default Team Visibility
          </label>
          <select
            value={settings.defaultVisibility}
            onChange={(e) => setSettings({...settings, defaultVisibility: e.target.value})}
            className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
          >
            <option value="public">Public - Anyone can find and request to join</option>
            <option value="private">Private - Only people with team code can join</option>
          </select>
        </div>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.allowMultipleTeams}
              onChange={(e) => setSettings({...settings, allowMultipleTeams: e.target.checked})}
              className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color"
            />
            <span className="text-text-secondary">Allow users to create multiple teams</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.requireAdminApproval}
              onChange={(e) => setSettings({...settings, requireAdminApproval: e.target.checked})}
              className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color"
            />
            <span className="text-text-secondary">Require admin approval for team creation</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.allowCaptainRemoveMembers}
              onChange={(e) => setSettings({...settings, allowCaptainRemoveMembers: e.target.checked})}
              className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color"
            />
            <span className="text-text-secondary">Allow team captains to remove members</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifyAdminsOfRequests}
              onChange={(e) => setSettings({...settings, notifyAdminsOfRequests: e.target.checked})}
              className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color"
            />
            <span className="text-text-secondary">Notify admins of new join requests</span>
          </label>
        </div>
        
        <div className="flex justify-end gap-4 pt-6">
          <button 
            onClick={handleReset}
            className="btn-secondary"
          >
            Reset to Defaults
          </button>
          <button 
            onClick={handleSave}
            className="btn-primary"
          >
            Save Settings
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={confirmReset}
        title="Reset Settings"
        message="Reset all settings to defaults?"
        confirmText="Reset"
        type="warning"
      />
    </div>
  );
}
