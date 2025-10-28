'use client';

import { useState } from 'react';
import ConfirmationModal from './ConfirmationModal';

interface DisplaySettingsTabProps {
  onShowSuccess: (message: string) => void;
  onShowError: (message: string) => void;
}

export default function DisplaySettingsTab({ onShowSuccess, onShowError }: DisplaySettingsTabProps) {
  const [settings, setSettings] = useState({
    title: 'Live Scoreboard',
    updateFrequency: '30',
    teamsToDisplay: '25',
    visibility: 'public',
    showMovement: true,
    highlightTop3: true,
    showStatistics: false,
    showLastUpdate: false
  });
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSave = () => {
    onShowSuccess('Display settings saved successfully');
  };

  const handleReset = () => {
    setShowResetModal(true);
  };

  const confirmReset = () => {
    setSettings({
      title: 'Live Scoreboard',
      updateFrequency: '30',
      teamsToDisplay: '25',
      visibility: 'public',
      showMovement: true,
      highlightTop3: true,
      showStatistics: false,
      showLastUpdate: false
    });
    onShowSuccess('Display settings reset to defaults');
    setShowResetModal(false);
  };

  return (
    <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
      <h2 className="text-lg mb-5 text-accent-light font-semibold flex items-center gap-2.5">
        <span className="text-xl">👁️</span>
        Display Settings
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Scoreboard Title
          </label>
          <input
            type="text"
            value={settings.title}
            onChange={(e) => setSettings({...settings, title: e.target.value})}
            className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Update Frequency
          </label>
          <select
            value={settings.updateFrequency}
            onChange={(e) => setSettings({...settings, updateFrequency: e.target.value})}
            className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
          >
            <option value="10">10 seconds</option>
            <option value="30">30 seconds</option>
            <option value="60">1 minute</option>
            <option value="300">5 minutes</option>
            <option value="manual">Manual updates only</option>
          </select>
        </div>
      </div>
      
      <div className="mt-6">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Teams to Display
        </label>
        <select
          value={settings.teamsToDisplay}
          onChange={(e) => setSettings({...settings, teamsToDisplay: e.target.value})}
          className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
        >
          <option value="10">Top 10 teams</option>
          <option value="25">Top 25 teams</option>
          <option value="50">Top 50 teams</option>
          <option value="all">All teams</option>
        </select>
      </div>
      
      <div className="mt-6">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Public Visibility
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={settings.visibility === 'public'}
              onChange={(e) => setSettings({...settings, visibility: e.target.value})}
              className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color focus:ring-accent-color"
            />
            <span className="text-text-secondary">Public (visible to all)</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="visibility"
              value="private"
              checked={settings.visibility === 'private'}
              onChange={(e) => setSettings({...settings, visibility: e.target.value})}
              className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color focus:ring-accent-color"
            />
            <span className="text-text-secondary">Private (admin only)</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="visibility"
              value="participants"
              checked={settings.visibility === 'participants'}
              onChange={(e) => setSettings({...settings, visibility: e.target.value})}
              className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color focus:ring-accent-color"
            />
            <span className="text-text-secondary">Participants only</span>
          </label>
        </div>
      </div>
      
      <div className="mt-6">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Display Options
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.showMovement}
              onChange={(e) => setSettings({...settings, showMovement: e.target.checked})}
              className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color"
            />
            <span className="text-text-secondary">Show team movement indicators</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.highlightTop3}
              onChange={(e) => setSettings({...settings, highlightTop3: e.target.checked})}
              className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color"
            />
            <span className="text-text-secondary">Highlight top 3 teams</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.showStatistics}
              onChange={(e) => setSettings({...settings, showStatistics: e.target.checked})}
              className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color"
            />
            <span className="text-text-secondary">Show solve statistics</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.showLastUpdate}
              onChange={(e) => setSettings({...settings, showLastUpdate: e.target.checked})}
              className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color"
            />
            <span className="text-text-secondary">Show last update time</span>
          </label>
        </div>
      </div>
      
      <div className="flex justify-end gap-4 mt-6">
        <button 
          onClick={handleReset}
          className="btn-secondary"
        >
          Reset Display Settings
        </button>
        <button 
          onClick={handleSave}
          className="btn-primary"
        >
          Save Display Settings
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={confirmReset}
        title="Reset Settings"
        message="Reset display settings to defaults?"
        confirmText="Reset"
        type="warning"
      />
    </div>
  );
}
