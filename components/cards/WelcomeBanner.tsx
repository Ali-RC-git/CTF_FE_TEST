import { User } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface WelcomeBannerProps {
  user: User;
  onCreateTeam?: () => void;
  onViewTeams?: () => void;
  className?: string;
  isPartOfEvent?: boolean;
}

export default function WelcomeBanner({ 
  user, 
  onCreateTeam, 
  onViewTeams, 
  className = '',
  isPartOfEvent = true
}: WelcomeBannerProps) {
  const { t } = useLanguage();
  
  return (
    <div className={`bg-accent-color rounded-lg p-8 ${className}`}>
      <div className="mb-6">
        <h1 className="text-white text-3xl font-bold mb-2">
          {t.dashboard.welcomeBack} {user.name}!
        </h1>
        <p className="text-white text-lg opacity-90">
          {t.dashboard.organization} {user.organization}
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onCreateTeam}
          disabled={!isPartOfEvent}
          className={`px-6 py-3 rounded-lg transition-colors duration-200 font-medium ${
            isPartOfEvent 
              ? "bg-white/20 hover:bg-white/30 text-white" 
              : "bg-white/10 text-white/50 cursor-not-allowed"
          }`}
          title={!isPartOfEvent ? "You must be part of an event to create or join teams" : ""}
        >
          {t.dashboard.createJoinTeam}
        </button>
        <button
          onClick={onViewTeams}
          disabled={!isPartOfEvent}
          className={`px-6 py-3 rounded-lg transition-colors duration-200 font-medium ${
            isPartOfEvent 
              ? "bg-white/20 hover:bg-white/30 text-white" 
              : "bg-white/10 text-white/50 cursor-not-allowed"
          }`}
          title={!isPartOfEvent ? "You must be part of an event to view teams" : ""}
        >
          {t.dashboard.viewMyTeams}
        </button>
      </div>
    </div>
  );
}
