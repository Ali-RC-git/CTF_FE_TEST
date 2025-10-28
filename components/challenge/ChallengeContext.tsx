import { ChallengeDetail } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface ChallengeContextProps {
  challenge: ChallengeDetail;
  className?: string;
}

export default function ChallengeContext({ challenge, className = '' }: ChallengeContextProps) {
  const { t } = useLanguage();
  
  return (
    <div className={`${className}`}>
      {/* Scenario Section */}
      <div className="bg-secondary-bg rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 bg-danger-color rounded flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-text-primary text-xl font-semibold">{t.challenges.scenario}</h2>
        </div>
        
        <p className="text-text-primary text-sm leading-relaxed mb-4">
          {challenge.scenario}
        </p>

        {/* Context Notes */}
        {challenge.contextNotes && challenge.contextNotes.length > 0 && (
          <div className="bg-primary-bg rounded-lg p-4">
            <h3 className="text-text-primary text-lg font-medium mb-3">{t.challenges.contextNotes}</h3>
            <ul className="space-y-2">
              {challenge.contextNotes.map((note, index) => (
                <li key={index} className="text-text-primary text-sm flex items-start">
                  <span className="text-accent-color mr-2">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
