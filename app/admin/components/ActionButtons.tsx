'use client';

interface ActionButtonsProps {
  onSimulateUpdate: () => void;
  onSave: () => void;
}

export default function ActionButtons({ onSimulateUpdate, onSave }: ActionButtonsProps) {
  return (
    <div className="flex justify-end gap-4">
      <button
        onClick={onSimulateUpdate}
        className="btn-secondary"
      >
        Simulate Score Update
      </button>
      <button
        onClick={onSave}
        className="btn-primary"
      >
        Save Current State
      </button>
    </div>
  );
}
