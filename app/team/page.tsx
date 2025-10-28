"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/lib/context/AuthContext";
import { useTeamsSingleton } from "@/lib/hooks/useTeamsSingleton";
import Header from "@/components/layout/Header";
import { getTeamColor } from "@/lib/colors";
import { CreateTeamData, createTeamSchema } from "@/lib/validation";
import { APIError } from "@/lib/api";
import { useFormErrors } from "@/lib/hooks/useFormErrors";
import { TeamRequestForm } from "@/components/team-management/TeamRequestForm";
import { TeamManagementModal } from "@/components/team-management/TeamManagementModal";
import { StudentRouteGuard } from "@/components/auth/RoleBasedRouteGuard";
import { useToast } from "@/lib/hooks/useToast";
import { Users, Target, Star, Plus, Rocket } from "lucide-react";
import { handleTeamCreationError } from "@/lib/utils/errorHandlers";
import { hasAnyEvents } from "@/lib/utils/event-utils";

// Avatar component for team members
const MemberAvatar = ({ initials}: { initials: string; color: string }) => (
  <div className={`w-8 h-8 rounded-full bg-accent-color hover:bg-accent-dark flex items-center justify-center text-xs font-medium text-white`}>
    {initials}
  </div>
);

// Team card component that fetches and displays team details
const TeamCardWithDetails = ({ team, onJoinRequest, fetchTeamDetails, teamDetails }: { 
  team: any;  
  onJoinRequest: (team: { id: string; name: string }) => void;
  fetchTeamDetails: (teamId: string) => Promise<void>;
  teamDetails: { [teamId: string]: any } | null;
}) => {
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    const loadTeamDetails = async () => {
      // Skip if we already have details for this team
      if (teamDetails && teamDetails[team.id]) {
        return;
      }

      setIsLoadingDetails(true);
      try {
        await fetchTeamDetails(team.id);
        // The fetchTeamDetails function updates the global state
      } catch (error) {
        console.error('Failed to load team details:', error);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    loadTeamDetails();
  }, [team.id, fetchTeamDetails, teamDetails]);

  const currentTeamDetails = teamDetails?.[team.id];
  const members = currentTeamDetails?.members || [];

  return <TeamCard team={team} onJoinRequest={onJoinRequest} members={members} isLoadingDetails={isLoadingDetails} />;
};

// Team card component for existing teams
const TeamCard = ({ team, onJoinRequest, members = [], isLoadingDetails = false }: { 
  team: any; 
  onJoinRequest: (team: { id: string; name: string }) => void;
  members?: any[];
  isLoadingDetails?: boolean;
}) => {
  const { t } = useLanguage();
  
  // Determine if this is the user's team
  const isUserTeam = team.isUserTeam || team.leader === team.currentUserId;
  const currentSize = team.current_size || members.length || 0;
  const maxSize = team.max_size || 4;
  const isFull = team.is_full || currentSize >= maxSize; // Use backend is_full or calculate
  const canJoin = team.can_join !== undefined ? team.can_join : !isFull; // Use backend can_join or calculate
  const isRecentlyCreated = team.created_at ? 
    (Date.now() - new Date(team.created_at).getTime()) < 24 * 60 * 60 * 1000 : false;
  
  return (
    <div className="bg-secondary-bg rounded-lg p-4 mb-4 relative">
      {/* New Team Tag */}
      {isRecentlyCreated && (
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
            New
          </span>
        </div>
      )}
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-text-primary mb-1">{team.name}</h3>
          <p className="text-sm text-text-secondary mb-2 flex flex-col">
            <span> {currentSize}/{maxSize} members </span> <span>Rank: {team.rank || 'N/A'}</span> 
          </p>
          <p className="text-sm text-text-secondary">{team.description || 'No description provided'}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex -space-x-2">
          {isLoadingDetails ? (
            // Show loading placeholders
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="w-8 h-8 rounded-full bg-accent-color hover:bg-accent-dark animate-pulse"></div>
            ))
          ) : (
            <>
              {members.slice(0, 5).map((member: any, index: number) => {
                // Extract initials from various possible member data structures
                let initials = '??';
                if (member.user?.username) {
                  initials = member.user.username.substring(0, 2).toUpperCase();
                } else if (member.user?.first_name && member.user?.last_name) {
                  initials = (member.user.first_name.charAt(0) + member.user.last_name.charAt(0)).toUpperCase();
                } else if (member.user?.first_name) {
                  initials = member.user.first_name.substring(0, 2).toUpperCase();
                } else if (member.username) {
                  initials = member.username.substring(0, 2).toUpperCase();
                } else if (member.name) {
                  initials = member.name.substring(0, 2).toUpperCase();
                }
                
                return (
                  <MemberAvatar 
                    key={index} 
                    initials={initials} 
                    color={getTeamColor(index)} 
                  />
                );
              })}
              {members.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-accent-color flex items-center justify-center text-xs text-white">
                  +{members.length - 5}
                </div>
              )}
            </>
          )}
        </div>
        
        {!isUserTeam && (
          <button
            onClick={() => onJoinRequest({ id: team.id, name: team.name })}
            disabled={!canJoin}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              !canJoin
                ? "bg-gray-600 text-white cursor-not-allowed"
                : "bg-accent-color text-white hover:bg-accent-dark"
            }`}
          >
            {!canJoin ? (isFull ? 'Team Full' : 'Cannot Join') : 'Request to Join'}
          </button>
        )}
        
        {isUserTeam && (
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg text-sm font-medium bg-accent-color text-white hover:bg-accent-dark">
              Manage Team
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium border border-accent-color text-accent-color hover:bg-accent-color/10">
              View Progress
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

function TeamPageContent() {
  const { t } = useLanguage();
  const { authState } = useAuth();
  const { showSuccess, showError, showLoading } = useToast();
  const searchParams = useSearchParams();
  
  // Check if user is part of any event
  const isPartOfEvent = authState.user?.events && authState.user.events.length > 0;
  
  // Get event code from URL params first, then fall back to user's events
  const urlEventCode = searchParams.get('eventCode') || '';
  const userEvents = authState.user?.events || [];
  const userEventCode = userEvents.length > 0 ? userEvents[0].event_code : '';
  const eventCode = urlEventCode || userEventCode;
  const { 
    teams, 
    myTeams, 
    invitations,
    requests,
    availableTeams,
    requestStats,
    teamDetails,
    isLoading, 
    error,
    createTeam, 
    joinTeam, 
    leaveTeam,
    sendInvitation,
    respondToInvitation,
    cancelInvitation,
    fetchUserInvitations,
    fetchTeamInvitations,
    getInvitationDetails,
    fetchAvailableUsers,
    sendTeamRequest,
    cancelTeamRequest,
    approveTeamRequest,
    rejectTeamRequest,
    fetchAvailableTeams,
    fetchRequestStats,
    bulkActionRequests,
    respondToRequest,
    fetchTeamDetails,
    fetchMyTeams,
    removeTeamMember,
    clearError,
    refreshData
  } = useTeamsSingleton();

  // Get all teams where user is either a member or leader
  const allMyTeams = myTeams || [];
  
  // Fetch user's teams when component mounts
  useEffect(() => {
    if (authState.user?.id) {
      fetchMyTeams();
    }
  }, [authState.user?.id, fetchMyTeams]);
  
  // Form handling for team creation
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      description: '',
      max_size: 4,
      min_size: 1,
      is_invite_only: false,
      event_code: eventCode
    }
  });

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<{ id: string; name: string } | null>(null);
  const [showTeamManagementModal, setShowTeamManagementModal] = useState(false);
  const [selectedTeamForManagement, setSelectedTeamForManagement] = useState<{ id: string; name: string } | null>(null);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [teamToLeave, setTeamToLeave] = useState<{ id: string; name: string } | null>(null);

  // Check if user is a team leader
  const isTeamLeader = myTeams.some(team => team.leader === authState.user?.id);

  // Filter teams based on search term - only show availableTeams from the API
  const filteredTeams = availableTeams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle team creation
  const onSubmit = async (data: any) => {
    clearError();
    const loadingToast = showLoading('Creating team...');
    
    try {
      const teamData = {
        name: data.name,
        description: data.description || '',
        max_size: data.max_size,
        min_size: data.min_size,
        is_invite_only: data.is_invite_only === 'true',
        event_code: data.event_code
      };
      
      const newTeam = await createTeam(teamData);
      showSuccess('Team created successfully!');
      
      // Reset form
      reset();
      
      // Refresh teams data to update the join teams section
      try {
        await refreshData();
      } catch (refreshError) {
        console.warn('Failed to refresh teams data:', refreshError);
        // Don't fail the entire operation if refresh fails
      }
    } catch (error) {
      console.error('Team creation error:', error);
      handleTeamCreationError(error, { 
        showError,
        fallbackMessage: 'Failed to create team. Please try again.'
      });
    } finally {
      loadingToast();
    }
  };

  // Helper function to extract error message from ErrorDetail format
  const extractErrorMessage = (message: string): string => {
    // Handle [ErrorDetail(string='...', code='invalid')] format
    const errorDetailMatch = message.match(/\[ErrorDetail\(string='([^']+)', code='[^']+'\)\]/);
    if (errorDetailMatch) {
      return errorDetailMatch[1];
    }
    return message;
  };

  // Handle join request
  const handleJoinRequest = async (team: { id: string; name: string }) => {
    clearError();
    const loadingToast = showLoading('Sending request...');
    
    try {
      // Send team request directly
      await sendTeamRequest(team.id, { message: '' });
      showSuccess(`Request sent to join "${team.name}"! You'll be notified when approved.`);
      
      // Refresh available teams to update the list
      try {
        await fetchAvailableTeams();
      } catch (refreshError) {
        console.warn('Failed to refresh available teams:', refreshError);
        // Don't fail the entire operation if refresh fails
      }
    } catch (error) {
      console.error('Join request error:', error);
      
      if (error instanceof APIError) {
        const extractedMessage = extractErrorMessage(error.message);
        
        if (error.status === 400) {
          if (extractedMessage.includes('You are already a member of an active team for this event')) {
            showError('You are already a member of an active team for this event. Please leave your current team before joining a new one.');
          } else if (extractedMessage.includes('You have already been approved for this team')) {
            showError('You have already been approved for this team. You are already a member.');
          } else {
            showError(extractedMessage || 'Failed to send request. Please try again.');
          }
        } else {
          showError(extractedMessage || 'Failed to send request. Please try again.');
        }
      } else {
        showError('Failed to send request. Please try again.');
      }
    } finally {
      loadingToast();
    }
  };

  // Handle join with code
  const handleJoinWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const loadingToast = showLoading('Joining team...');
    
    try {
      await joinTeam({ invite_code: teamCode });
      showSuccess('Successfully joined the team!');
      setTeamCode('');
      
      // Refresh teams data
      try {
        await refreshData();
      } catch (refreshError) {
        console.warn('Failed to refresh teams data:', refreshError);
      }
    } catch (error) {
      console.error('Join team error:', error);
      
      if (error instanceof APIError) {
        if (error.status === 400 && error.message.includes('You are already a member of an active team for this event')) {
          showError('You are already a member of an active team for this event. Please leave your current team before joining a new one.');
        } else {
          showError(error.message || 'Failed to join team. Please try again.');
        }
      } else {
        showError('Failed to join team. Please try again.');
      }
    } finally {
      loadingToast();
    }
  };

  // Handle invitation actions
  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      await respondToInvitation(invitationId, { status: 'accepted' });
      showSuccess('Invitation accepted successfully!');
      await refreshData();
    } catch (error) {
      showError('Failed to accept invitation. Please try again.');
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      await respondToInvitation(invitationId, { status: 'declined' });
      showSuccess('Invitation declined successfully!');
      await refreshData();
    } catch (error) {
      showError('Failed to decline invitation. Please try again.');
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await cancelTeamRequest(requestId);
      showSuccess('Team request cancelled.');
    } catch (error) {
      showError('Failed to cancel team request. Please try again.');
    }
  };

  // Team leader actions
  const handleApproveRequest = async (requestId: string) => {
    try {
      await respondToRequest(requestId, 'approved');
      showSuccess('Request approved successfully!');
    } catch (error) {
      showError('Failed to approve request. Please try again.');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await respondToRequest(requestId, 'rejected');
      showSuccess('Request rejected successfully!');
    } catch (error) {
      showError('Failed to reject request. Please try again.');
    }
  };

  const handleManageTeam = (team: { id: string; name: string }) => {
    setSelectedTeamForManagement(team);
    setShowTeamManagementModal(true);
  };

  // Handle leaving team - show confirmation modal
  const handleLeaveTeam = (teamId: string, teamName: string) => {
    setTeamToLeave({ id: teamId, name: teamName });
    setShowLeaveConfirmation(true);
  };

  // Confirm leaving team
  const confirmLeaveTeam = async () => {
    if (!teamToLeave) return;
    
    try {
      // Use removeTeamMember API with current user's ID
      await removeTeamMember(teamToLeave.id, authState.user?.id || '');
      showSuccess('Successfully left the team');
      // Refresh the teams list
      await fetchMyTeams();
      // Close modal
      setShowLeaveConfirmation(false);
      setTeamToLeave(null);
    } catch (error) {
      showError('Failed to leave team. Please try again.');
    }
  };

  // Cancel leaving team
  const cancelLeaveTeam = () => {
    setShowLeaveConfirmation(false);
    setTeamToLeave(null);
  };

  const handleRequestToJoin = (team: { id: string; name: string }) => {
    setSelectedTeam(team);
    setShowRequestForm(true);
  };

  const handleSendRequest = async (data: { message: string }) => {
    if (!selectedTeam) return;
    
    clearError();
    const loadingToast = showLoading('Sending request...');
    
    try {
      await sendTeamRequest(selectedTeam.id, data);
      showSuccess(`Request sent to join "${selectedTeam.name}"! You'll be notified when approved.`);
      setShowRequestForm(false);
      setSelectedTeam(null);
    } catch (error) {
      console.error('Join request error:', error);
      showError('Failed to send request. Please try again.');
    } finally {
      loadingToast();
    }
  };

  // Fetch available teams when component mounts
  useEffect(() => {
    fetchAvailableTeams();
  }, [fetchAvailableTeams]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        fetchAvailableTeams({ search: searchTerm });
      } else {
        fetchAvailableTeams();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchAvailableTeams]);

  return (
    <StudentRouteGuard>
      <div className="min-h-screen flex flex-col bg-primary-bg text-text-primary">
      <Header />
      
      <div className="flex-grow py-10 px-4">
        <div className="container mx-auto max-w-7xl space-y-8">
            <div className="bg-card-bg rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="bg-yellow-500 w-8 h-8 rounded-full flex items-center justify-center text-white">
                  <Star className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-semibold text-accent-color">My Teams</h2>
              </div>
              {/* <a 
                href="/my-invitations" 
                className="flex items-center gap-2 px-4 py-2 bg-accent-color hover:bg-accent-dark text-white rounded-lg text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                My Invitations
              </a> */}
            </div>
            
            {allMyTeams.map(team => {
              const members = team.members || [];
              const isCaptain = team.leader === authState.user?.id || (team as any).captain;
              
              // Check if team was created recently (within last 24 hours)
              const isRecentlyCreated = team.created_at ? 
                (Date.now() - new Date(team.created_at).getTime()) < 24 * 60 * 60 * 1000 : false;
              
              // Get user's role in the team
              const userRole = isCaptain ? 'Leader' : 'Member';
              const memberCount = members.length;
              const maxSize = team.max_size || 4;
              
              return (
                <div key={team.id} className="bg-secondary-bg rounded-lg p-4 mb-4 relative">
                  {/* Status Tag */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isCaptain 
                        ? 'bg-accent-color text-white' 
                        : 'bg-text-secondary/20 text-text-secondary'
                    }`}>
                      {isCaptain ? 'You are Captain' : 'You are Member'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-start mb-3 pr-20">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-text-primary mb-1">{team.name}</h3>
                      <p className="text-sm text-text-secondary mb-2">{team.description || 'No description provided'}</p>
                      <div className="flex items-center gap-4 text-sm text-text-secondary">
                        <span>Rank: {team.rank || 'N/A'}</span>
                        <span>•</span>
                        <span>{memberCount}/{maxSize} members</span>
                        <span>•</span>
                        <span>Your role: {userRole}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-accent-color flex items-center justify-center text-xs text-white">
                        You
                      </div>
                      {members.slice(0, 3).map((member: any, index: number) => {
                        // Extract initials from various possible member data structures
                        let initials = '??';
                        if (member.user?.username) {
                          initials = member.user.username.substring(0, 2).toUpperCase();
                        } else if (member.user?.first_name && member.user?.last_name) {
                          initials = (member.user.first_name.charAt(0) + member.user.last_name.charAt(0)).toUpperCase();
                        } else if (member.user?.first_name) {
                          initials = member.user.first_name.substring(0, 2).toUpperCase();
                        } else if (member.username) {
                          initials = member.username.substring(0, 2).toUpperCase();
                        } else if (member.name) {
                          initials = member.name.substring(0, 2).toUpperCase();
                        }
                        
                        return (
                          <MemberAvatar 
                            key={index} 
                            initials={initials} 
                            color={getTeamColor(index + 1)} 
                          />
                        );
                      })}
                      {members.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-accent-color flex items-center justify-center text-xs text-white">
                          +{members.length - 3}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {/* Only show Manage Team button if user is the team captain/leader and part of an event */}
                      {isCaptain && (
                        <button 
                          onClick={() => handleManageTeam({ id: team.id, name: team.name })}
                          disabled={!isPartOfEvent}
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            isPartOfEvent 
                              ? "bg-accent-color text-white hover:bg-accent-dark" 
                              : "bg-gray-500 text-gray-300 cursor-not-allowed"
                          }`}
                          title={!isPartOfEvent ? "You must be part of an event to manage teams" : ""}
                        >
                          Manage Team
                        </button>
                      )}
                      <button 
                        disabled={!isPartOfEvent}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                          isPartOfEvent 
                            ? "border-accent-color text-accent-color hover:bg-accent-color/10" 
                            : "border-gray-500 text-gray-300 cursor-not-allowed"
                        }`}
                        title={!isPartOfEvent ? "You must be part of an event to view team progress" : ""}
                      >
                        View Progress
                      </button>
                      {/* Leave Team button for all members - only disabled if not part of event */}
                      <button 
                        onClick={() => handleLeaveTeam(team.id, team.name)}
                        disabled={!isPartOfEvent}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isPartOfEvent 
                            ? "bg-red-500 hover:bg-red-600 text-white" 
                            : "bg-gray-500 text-gray-300 cursor-not-allowed"
                        }`}
                        title={!isPartOfEvent ? "You must be part of an event to leave teams" : ""}
                      >
                        Leave Team
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isLoading && allMyTeams.length === 0 && (
              <div className="text-center py-8 text-text-secondary">
                <div className="text-lg mb-2 flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent-color"></div>
                  Loading your teams...
                </div>
              </div>
            )}
            
            {!isLoading && allMyTeams.length === 0 && (
              <div className="text-center py-8 text-text-secondary">
                <div className="text-lg mb-2 flex items-center justify-center gap-2">
                  <Users className="w-5 h-5" />
                  No teams yet
                </div>
                <div className="text-sm">
                  {isPartOfEvent 
                    ? "Create a team or join an existing one to get started!" 
                    : "You must be part of an event to create or join teams. Please register for an event first."
                  }
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Create Team Card */}
            <div className={`bg-card-bg rounded-2xl p-6 shadow-lg ${!isPartOfEvent ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-2 mb-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                  isPartOfEvent ? 'bg-accent-color' : 'bg-gray-500'
                }`}>
                  <Rocket className="w-4 h-4" />
                </div>
                <h2 className={`text-xl font-semibold ${isPartOfEvent ? 'text-accent-color' : 'text-gray-500'}`}>
                  Create New Team
                </h2>
                {!isPartOfEvent && (
                  <span className="text-xs text-gray-400 ml-auto">(Inactive - No Event)</span>
                )}
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-text-primary">Team Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      {...register('name')}
                      placeholder="Enter your team name"
                      disabled={!isPartOfEvent}
                      className={`w-full p-3 rounded-lg bg-secondary-bg border border-border-color text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color ${
                        !isPartOfEvent ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500">{errors.name.message}</p>
                    )}
                    <p className="text-xs text-text-secondary">Choose a unique name that represents your team.</p>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-text-primary">Team Description (Optional)</label>
                    <textarea
                      {...register('description')}
                      placeholder="Describe your team's focus or expertise"
                      className="w-full p-3 rounded-lg bg-secondary-bg border border-border-color text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color h-24 resize-none"
                    />
                    {errors.description && (
                      <p className="text-xs text-red-500">{errors.description.message}</p>
                    )}
                    <p className="text-xs text-text-secondary">This will help other participants understand your team's approach.</p>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-text-primary">Event Code <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register('event_code')}
                        placeholder="Enter event code (e.g., TES-2025-001)"
                        readOnly={!!userEventCode}
                        className={`w-full p-3 rounded-lg bg-secondary-bg border border-border-color text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color ${
                          userEventCode ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                      />
                      {userEventCode && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            Auto-filled
                          </span>
                        </div>
                      )}
                    </div>
                    {errors.event_code && (
                      <p className="text-xs text-red-500">{errors.event_code.message}</p>
                    )}
                    <p className="text-xs text-text-secondary">
                      {userEventCode 
                        ? `Automatically filled from your event: ${userEventCode}`
                        : 'Enter the event code for this team.'
                      }
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-text-primary">Team Visibility</label>
                    <select
                      {...register('is_invite_only')}
                      className="w-full p-3 rounded-lg bg-secondary-bg border border-border-color text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                    >
                      <option value="false">Public - Anyone can find and request to join</option>
                      <option value="true">Private - Invite only</option>
                    </select>
                    <p className="text-xs text-text-secondary">Public teams can be discovered and joined by anyone.</p>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-text-primary">Maximum Team Size</label>
                    <select
                      {...register('max_size', { valueAsNumber: true })}
                      className="w-full p-3 rounded-lg bg-secondary-bg border border-border-color text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                    >
                      <option value={2}>2 members</option>
                      <option value={3}>3 members</option>
                      <option value={4}>4 members (Recommended)</option>
                    </select>
                    <p className="text-xs text-text-secondary">Choose the maximum number of team members.</p>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading || !isPartOfEvent}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                      isPartOfEvent 
                        ? "bg-accent-color text-white hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed" 
                        : "bg-gray-500 text-gray-300 cursor-not-allowed"
                    }`}
                    title={!isPartOfEvent ? "You must be part of an event to create teams" : ""}
                  >
                    <Plus className="w-4 h-4" />
                    {isLoading ? "Creating..." : "Create Team"}
                  </button>
                </form>
            </div>

            {/* Join Team Card */}
            <div className={`bg-card-bg rounded-2xl p-6 shadow-lg ${!isPartOfEvent ? 'opacity-50' : ''}`}>
               <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                  isPartOfEvent ? 'bg-accent-color' : 'bg-gray-500'
                }`}>
                  <Users className="w-4 h-4" />
                </div>
                <h2 className={`text-xl font-semibold ${isPartOfEvent ? 'text-accent-color' : 'text-gray-500'}`}>
                  Join Existing Team
                </h2>
                {!isPartOfEvent && (
                  <span className="text-xs text-gray-400 ml-auto">(Inactive - No Event)</span>
                )}
              </div>
              <div>
              <div className="mb-4 mt-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for teams..."
                    disabled={!isPartOfEvent}
                    className={`w-full p-3 pl-10 rounded-lg bg-secondary-bg border border-border-color text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color ${
                      !isPartOfEvent ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
                    🔍
                  </div>
                </div>
              </div>
              
              <div className="teams-list h-[500px] overflow-y-auto pr-2 mb-6 space-y-2">
                {isLoading ? (
                  <div className="text-center py-8 text-text-secondary">
                    Loading teams...
                  </div>
                ) : filteredTeams.length > 0 ? (
                  filteredTeams.map(team => (
                    <TeamCardWithDetails 
                      key={team.id} 
                      team={team} 
                      onJoinRequest={handleJoinRequest}
                      fetchTeamDetails={fetchTeamDetails}
                      teamDetails={teamDetails}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-text-secondary">
                    {searchTerm ? (
                      'No teams found matching your search.'
                    ) : (
                      <div>
                        <div className="text-lg mb-2 flex items-center justify-center gap-2">
                          <Target className="w-5 h-5" />
                          No teams available to join
                        </div>
                        <div className="text-sm">
                          You're already a member of all available teams, have pending requests, or all teams are full.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              </div>
              <div className="border-t border-border-color pt-4">
                <h3 className="text-sm font-medium mb-2 text-text-primary">Have a team code?</h3>
                
                <form onSubmit={handleJoinWithCode} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value)}
                    placeholder="Enter team code"
                    className="flex-grow p-3 rounded-lg bg-secondary-bg border border-border-color text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-accent-color text-white py-3 px-6 rounded-lg font-semibold hover:bg-accent-dark transition"
                  >
                    {isLoading ? "Joining..." : "Join"}
                  </button>
                </form>
              </div>
              </div>
            </div>
          </div>
          
          {/* My Teams Section */}
        

        </div>
      </div>

      {/* Team Request Form Modal */}
      {showRequestForm && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <TeamRequestForm
              teamName={selectedTeam.name}
              onSubmit={handleSendRequest}
              onCancel={() => {
                setShowRequestForm(false);
                setSelectedTeam(null);
              }}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Team Management Modal */}
      <TeamManagementModal
        isOpen={showTeamManagementModal}
        onClose={() => {
          setShowTeamManagementModal(false);
          setSelectedTeamForManagement(null);
        }}
        teamId={selectedTeamForManagement?.id || ''}
        teamName={selectedTeamForManagement?.name || ''}
      />

      {/* Leave Team Confirmation Modal */}
      {showLeaveConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card-bg rounded-xl p-6 max-w-md w-full mx-4 border border-border-color">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary">Leave Team</h3>
            </div>
            
            <p className="text-text-secondary mb-6">
              Are you sure you want to leave <span className="font-semibold text-accent-color">"{teamToLeave?.name}"</span>? 
              This action cannot be undone and you will lose access to all team resources.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelLeaveTeam}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-border-color text-text-secondary hover:bg-secondary-bg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLeaveTeam}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Leave Team
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </StudentRouteGuard>
  );
}

export default function TeamPage() {
  return <TeamPageContent />;
}