'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Hint {
  id: string;
  text: string;
  cost: number;
  maxUses: number;
  revealed: boolean;
  revealOrder?: number;
}

interface HintSystemProps {
  hints: Hint[];
  onUseHint: (hintId: string, cost: number) => void;
  questionPoints: number;
  revealedHintsCount: number;
  className?: string;
}

export default function HintSystem({ hints, onUseHint, questionPoints, revealedHintsCount, className = '' }: HintSystemProps) {
  const { t } = useLanguage();
  const [showHints, setShowHints] = useState(false);

  // Sort hints by reveal order
  const sortedHints = [...hints].sort((a, b) => (a.revealOrder || 0) - (b.revealOrder || 0));
  
  const revealedHints = sortedHints.filter(hint => hint.revealed);
  const availableHints = sortedHints.filter(hint => !hint.revealed);
  const totalCost = revealedHints.reduce((sum, hint) => sum + hint.cost, 0);
  const remainingPoints = questionPoints;

  const handleUseHint = (hintId: string, cost: number) => {
    onUseHint(hintId, cost);
  };

  if (hints.length === 0) {
    return null;
  }

  return (
    <div className={`bg-secondary-bg rounded-lg p-4 border border-border-color ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <span className="text-warning-color">💡</span>
          Hints
        </h3>
        <button
          onClick={() => setShowHints(!showHints)}
          className="text-accent-color hover:text-accent-light text-sm font-medium"
        >
          {showHints ? 'Hide Hints' : 'Show Hints'}
        </button>
      </div>

      {showHints && (
        <div className="space-y-3">
          {/* Points Summary */}
          <div className="bg-[#1a102b] rounded-lg p-3 border border-[#4a2d7a]">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-[#c2b0e6]">Question Points:</span>
              <span className="text-[#8a4fff] font-semibold">{questionPoints} pts</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-[#c2b0e6]">Hints Used:</span>
              <span className="text-[#f2c94c] font-semibold">{revealedHintsCount} / {hints.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#c2b0e6]">Total Hint Cost:</span>
              <span className="text-[#eb5757] font-semibold">-{totalCost} pts</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-[#4a2d7a] pt-2 mt-2">
              <span className="text-[#f0e6ff] font-semibold">Current Value:</span>
              <span className={`font-bold ${remainingPoints > 0 ? 'text-[#6fcf97]' : 'text-[#eb5757]'}`}>
                {Math.max(0, remainingPoints - totalCost)} pts
              </span>
            </div>
          </div>

          {/* Available Hints */}
          {availableHints.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-[#f0e6ff] mb-2">💡 Available Hints</h4>
              <div className="space-y-2">
                {availableHints.map((hint, index) => (
                  <div key={hint.id} className="bg-[#1a102b] rounded-lg p-4 border border-[#4a2d7a] hover:border-[#8a4fff] transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm text-[#c2b0e6]">
                        Hint #{(hint.revealOrder || index + 1)} - Cost: <span className="text-[#f2c94c] font-semibold">{hint.cost} pts</span>
                      </span>
                      <button
                        onClick={() => handleUseHint(hint.id, hint.cost)}
                        className="bg-gradient-to-r from-[#f2c94c] to-[#f2994a] hover:opacity-90 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      >
                        Reveal Hint
                      </button>
                    </div>
                    <p className="text-sm text-[#c2b0e6] italic">🔒 Click "Reveal Hint" to see the hint (reduces question points)</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revealed Hints */}
          {revealedHints.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-[#f0e6ff] mb-2">✓ Revealed Hints</h4>
              <div className="space-y-2">
                {revealedHints.map((hint, index) => (
                  <div key={hint.id} className="bg-[#6fcf97]/10 border border-[#6fcf97] rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-[#6fcf97] font-semibold">
                        Hint #{(hint.revealOrder || index + 1)} (-{hint.cost} pts)
                      </span>
                      <span className="text-xs text-[#6fcf97]">✓ Used</span>
                    </div>
                    <p className="text-sm text-[#f0e6ff]">{hint.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Hints Available */}
          {availableHints.length === 0 && revealedHints.length === 0 && (
            <div className="text-center py-4 text-[#c2b0e6]">
              <p className="text-sm">No hints available for this question.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
