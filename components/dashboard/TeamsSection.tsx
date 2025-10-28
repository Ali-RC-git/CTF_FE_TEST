import { Team } from '@/lib/types';
import TeamCard from '@/components/cards/TeamCard';
import { useTeamsSingleton } from '@/lib/hooks/useTeamsSingleton';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

interface TeamsSectionProps {
  teams: Team[];
  onCreateTeam?: () => void;
  onBackToDashboard?: () => void;
  onManageTeam?: (teamId: string) => void;
  onLeaveTeam?: (teamId: string) => void;
  className?: string;
}

export default function TeamsSection({ 
  teams, 
  onCreateTeam, 
  onBackToDashboard, 
  onManageTeam,
  onLeaveTeam,
  className = '' 
}: TeamsSectionProps) {
  const router = useRouter();
  const { myTeams } = useTeamsSingleton();
  const { authState } = useAuth();
  
  // Check if user is part of any event
  const isPartOfEvent = authState.user?.events && authState.user.events.length > 0;
  
  // Use real teams data if available, otherwise fall back to props
  const displayTeams = myTeams.length > 0 ? myTeams : teams;
  
  const handleCreateAnotherTeam = () => {
    router.push('/team');
  };
  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-white text-3xl font-bold">My Teams</h1>
        
        <button
          onClick={onBackToDashboard}
          className="text-white hover:text-purple-300 transition-colors duration-200"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Teams Overview */}
      <div className="mb-8">
        <h2 className="text-white text-2xl font-semibold mb-6">Teams Overview</h2>
        
        {displayTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onManage={onManageTeam}
                onLeave={onLeaveTeam}
              />
            ))}
            
            {/* Create Another Team Card */}
            <div 
              onClick={isPartOfEvent ? handleCreateAnotherTeam : undefined}
              className={`bg-[#2D1B69] rounded-lg p-6 border-2 border-dashed flex items-center justify-center min-h-[200px] transition-colors ${
                isPartOfEvent 
                  ? "border-purple-400 cursor-pointer hover:border-purple-300" 
                  : "border-gray-500 cursor-not-allowed opacity-50"
              }`}
              title={!isPartOfEvent ? "You must be part of an event to create teams" : ""}
            >
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  isPartOfEvent ? "bg-purple-600" : "bg-gray-500"
                }`}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className={`text-lg font-medium mb-2 ${isPartOfEvent ? "text-white" : "text-gray-400"}`}>
                  Create Another Team
                </p>
                <p className={`text-sm ${isPartOfEvent ? "text-white opacity-70" : "text-gray-400"}`}>
                  {isPartOfEvent ? "Start a new team to collaborate" : "You must be part of an event to create teams"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isPartOfEvent ? "bg-purple-600" : "bg-gray-500"
            }`}>
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className={`text-2xl font-semibold mb-4 ${isPartOfEvent ? "text-white" : "text-gray-400"}`}>
              No Teams Yet
            </h3>
            <p className={`text-lg mb-6 ${isPartOfEvent ? "text-white opacity-70" : "text-gray-400"}`}>
              {isPartOfEvent 
                ? "Create your first team to start collaborating with others" 
                : "You must be part of an event to create or join teams. Please register for an event first."
              }
            </p>
            <button
              onClick={isPartOfEvent ? handleCreateAnotherTeam : undefined}
              disabled={!isPartOfEvent}
              className={`px-8 py-4 rounded-lg transition-colors duration-200 font-medium text-lg ${
                isPartOfEvent 
                  ? "bg-purple-600 hover:bg-purple-700 text-white" 
                  : "bg-gray-500 text-gray-300 cursor-not-allowed"
              }`}
              title={!isPartOfEvent ? "You must be part of an event to create teams" : ""}
            >
              Create Your First Team
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
