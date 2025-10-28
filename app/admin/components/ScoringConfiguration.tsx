'use client';

import { useState } from 'react';
import ConfirmationModal from './ConfirmationModal';

interface ScoringConfigurationProps {
  onShowSuccess: (message: string) => void;
  onShowError: (message: string) => void;
}

export default function ScoringConfiguration({ onShowSuccess, onShowError }: ScoringConfigurationProps) {
  const [config, setConfig] = useState({
    easyPoints: 100,
    mediumPoints: 250,
    hardPoints: 500,
    dynamicScoring: true,
    firstBlood: true,
    speedBonus: false,
    completionBonus: true,
    incorrectPenalty: true,
    hintPenalty: false
  });
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSave = () => {
    onShowSuccess('Scoring configuration saved successfully');
  };

  const handleReset = () => {
    setShowResetModal(true);
  };

  const confirmReset = () => {
    setConfig({
      easyPoints: 100,
      mediumPoints: 250,
      hardPoints: 500,
      dynamicScoring: true,
      firstBlood: true,
      speedBonus: false,
      completionBonus: true,
      incorrectPenalty: true,
      hintPenalty: false
    });
    onShowSuccess('Scoring configuration reset to defaults');
    setShowResetModal(false);
  };

  return (
    <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
      <h2 className="text-lg mb-5 text-accent-light font-semibold flex items-center gap-2.5">
        <span className="text-xl">🎯</span>
        Scoring Configuration
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Base Points (Easy Challenges)
          </label>
          <input
            type="number"
            value={config.easyPoints}
            onChange={(e) => setConfig({...config, easyPoints: parseInt(e.target.value)})}
            min="0"
            className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Base Points (Medium Challenges)
          </label>
          <input
            type="number"
            value={config.mediumPoints}
            onChange={(e) => setConfig({...config, mediumPoints: parseInt(e.target.value)})}
            min="0"
            className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Base Points (Hard Challenges)
          </label>
          <input
            type="number"
            value={config.hardPoints}
            onChange={(e) => setConfig({...config, hardPoints: parseInt(e.target.value)})}
            min="0"
            className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
          />
        </div>
      </div>
      
      <div className="mt-6">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Dynamic Scoring
        </label>
        <select
          value={config.dynamicScoring ? 'enabled' : 'disabled'}
          onChange={(e) => setConfig({...config, dynamicScoring: e.target.value === 'enabled'})}
          className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
        >
          <option value="enabled">Enabled (Points decrease as more teams solve)</option>
          <option value="disabled">Disabled (Fixed point values)</option>
        </select>
      </div>
      
      <div className="mt-6">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Bonus Points
        </label>
        <div className="flex gap-6 flex-wrap">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.firstBlood}
              onChange={(e) => setConfig({...config, firstBlood: e.target.checked})}
              className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color"
            />
            <span className="text-text-secondary">First blood (first solve)</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.speedBonus}
              onChange={(e) => setConfig({...config, speedBonus: e.target.checked})}
              className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color"
            />
            <span className="text-text-secondary">Speed bonus (based on solve time)</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.completionBonus}
              onChange={(e) => setConfig({...config, completionBonus: e.target.checked})}
              className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color"
            />
            <span className="text-text-secondary">Full completion bonus</span>
          </label>
        </div>
      </div>
      
      <div className="mt-6">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Penalty System
        </label>
        <div className="flex gap-6 flex-wrap">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.incorrectPenalty}
              onChange={(e) => setConfig({...config, incorrectPenalty: e.target.checked})}
              className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color"
            />
            <span className="text-text-secondary">Incorrect submission penalty</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.hintPenalty}
              onChange={(e) => setConfig({...config, hintPenalty: e.target.checked})}
              className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color"
            />
            <span className="text-text-secondary">Hint usage penalty</span>
          </label>
        </div>
      </div>
      
      <div className="flex justify-end gap-4 mt-6">
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
          Save Scoring Configuration
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={confirmReset}
        title="Reset Configuration"
        message="Reset scoring configuration to defaults?"
        confirmText="Reset"
        type="warning"
      />
    </div>
  );
}
