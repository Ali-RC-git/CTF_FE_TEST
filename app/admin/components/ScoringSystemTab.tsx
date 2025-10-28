'use client';

import { useState } from 'react';
import ScoringConfiguration from './ScoringConfiguration';
import ScoreAdjustments from './ScoreAdjustments';

interface ScoringSystemTabProps {
  onShowSuccess: (message: string) => void;
  onShowError: (message: string) => void;
}

export default function ScoringSystemTab({ onShowSuccess, onShowError }: ScoringSystemTabProps) {
  return (
    <div className="space-y-6">
      <ScoringConfiguration onShowSuccess={onShowSuccess} onShowError={onShowError} />
      <ScoreAdjustments onShowSuccess={onShowSuccess} onShowError={onShowError} />
    </div>
  );
}
