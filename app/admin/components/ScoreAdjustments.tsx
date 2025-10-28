'use client';

import { useState } from 'react';

interface ScoreAdjustmentsProps {
  onShowSuccess: (message: string) => void;
  onShowError: (message: string) => void;
}

export default function ScoreAdjustments({ onShowSuccess, onShowError }: ScoreAdjustmentsProps) {
  const [adjustment, setAdjustment] = useState({
    team: '',
    type: 'add',
    points: 0,
    reason: ''
  });

  const teams = [
    'QuantumPoptarts',
    'WEH',
    'TeamName-of-MyChoice',
    'The Undecideds',
    'Geren',
    'Goreme'
  ];

  const handleApply = () => {
    if (!adjustment.team) {
      onShowError('Please select a team');
      return;
    }
    
    if (!adjustment.points || adjustment.points <= 0) {
      onShowError('Please enter a valid point value');
      return;
    }
    
    if (!adjustment.reason) {
      onShowError('Please provide a reason for the adjustment');
      return;
    }
    
    onShowSuccess(`Score adjustment applied to ${adjustment.team}`);
    
    // Reset form
    setAdjustment({
      team: '',
      type: 'add',
      points: 0,
      reason: ''
    });
  };

  return (
    <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
      <h2 className="text-lg mb-5 text-accent-light font-semibold flex items-center gap-2.5">
        <span className="text-xl">📈</span>
        Score Adjustments
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Select Team
          </label>
          <select
            value={adjustment.team}
            onChange={(e) => setAdjustment({...adjustment, team: e.target.value})}
            className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
          >
            <option value="">Select Team</option>
            {teams.map((team) => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Adjustment Type
          </label>
          <select
            value={adjustment.type}
            onChange={(e) => setAdjustment({...adjustment, type: e.target.value})}
            className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
          >
            <option value="add">Add Points</option>
            <option value="subtract">Subtract Points</option>
            <option value="set">Set Points</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Points
          </label>
          <input
            type="number"
            value={adjustment.points}
            onChange={(e) => setAdjustment({...adjustment, points: parseInt(e.target.value) || 0})}
            min="0"
            className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
          />
        </div>
      </div>
      
      <div className="mt-6">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Reason for Adjustment
        </label>
        <input
          type="text"
          value={adjustment.reason}
          onChange={(e) => setAdjustment({...adjustment, reason: e.target.value})}
          placeholder="Enter reason for score adjustment"
          className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
        />
      </div>
      
      <div className="flex justify-end gap-4 mt-6">
        <button 
          onClick={handleApply}
          className="btn-danger"
        >
          Apply Score Adjustment
        </button>
      </div>
    </div>
  );
}
