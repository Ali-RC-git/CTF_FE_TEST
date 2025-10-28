'use client';

interface ScoreboardControlsProps {
  isVisible: boolean;
  isFrozen: boolean;
  onToggleVisibility: () => void;
  onToggleFreeze: () => void;
  onReset: () => void;
  onClear: () => void;
}

export default function ScoreboardControls({
  isVisible,
  isFrozen,
  onToggleVisibility,
  onToggleFreeze,
  onReset,
  onClear
}: ScoreboardControlsProps) {
  return (
    <div className="flex gap-4 mb-6 flex-wrap">
      <button
        onClick={onToggleVisibility}
        className="btn-primary"
      >
        {isVisible ? 'Hide Scoreboard' : 'Show Scoreboard'}
      </button>
      <button
        onClick={onToggleFreeze}
        className={`btn-secondary ${isFrozen ? 'btn-danger' : ''}`}
      >
        {isFrozen ? 'Unfreeze Rankings' : 'Freeze Rankings'}
      </button>
      <button
        onClick={onReset}
        className="btn-secondary"
      >
        Reset Scoreboard
      </button>
      <button
        onClick={onClear}
        className="btn-danger"
      >
        Clear All Scores
      </button>
    </div>
  );
}
