'use client';

import { useState } from 'react';

interface RankingSettingsProps {
  onShowSuccess: (message: string) => void;
  onShowError: (message: string) => void;
}

export default function RankingSettings({ onShowSuccess, onShowError }: RankingSettingsProps) {
  const [settings, setSettings] = useState({
    algorithm: 'standard',
    tiebreaker: 'last-submission',
    showMovement: true,
    highlightTop3: false,
    realTimeUpdate: true
  });

  const handleSave = () => {
    onShowSuccess('Ranking settings saved successfully');
  };

  return (
    <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
      <h2 className="text-lg mb-5 text-accent-light font-semibold flex items-center gap-2.5">
        <span className="text-xl">⚙️</span>
        Ranking Settings
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Ranking Algorithm
          </label>
          <select
            value={settings.algorithm}
            onChange={(e) => setSettings({...settings, algorithm: e.target.value})}
            className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
          >
            <option value="standard">Standard (Points based)</option>
            <option value="time-weighted">Time-weighted (Earlier solves get bonus)</option>
            <option value="difficulty-weighted">Difficulty-weighted (Harder challenges worth more)</option>
            <option value="custom">Custom formula</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Tiebreaker Method
          </label>
          <select
            value={settings.tiebreaker}
            onChange={(e) => setSettings({...settings, tiebreaker: e.target.value})}
            className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
          >
            <option value="last-submission">Last submission time</option>
            <option value="first-submission">First submission time</option>
            <option value="challenges-solved">Number of challenges solved</option>
            <option value="average-time">Average solve time</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-4 mt-6">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.showMovement}
            onChange={(e) => setSettings({...settings, showMovement: e.target.checked})}
            className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color"
          />
          <span className="text-text-secondary">Show rank movement indicators</span>
        </label>
        
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.highlightTop3}
            onChange={(e) => setSettings({...settings, highlightTop3: e.target.checked})}
            className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color"
          />
          <span className="text-text-secondary">Highlight top 3 teams with special styling</span>
        </label>
        
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.realTimeUpdate}
            onChange={(e) => setSettings({...settings, realTimeUpdate: e.target.checked})}
            className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color"
          />
          <span className="text-text-secondary">Update rankings in real-time</span>
        </label>
      </div>
      
      <div className="flex justify-end gap-4 mt-6">
        <button className="btn-secondary">
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
  );
}
