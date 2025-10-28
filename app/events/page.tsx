'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { StudentRouteGuard } from '@/components/auth/RoleBasedRouteGuard';
import { useAuth } from '@/lib/context/AuthContext';
import EventChallengeCard from '@/components/events/EventChallengeCard';
import { useTeamEventData } from '@/lib/hooks/useTeamEventData';
import { eventsAPI } from '@/lib/api/events';
import { useToast } from '@/lib/hooks/useToast';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Calendar, Clock, Trophy, Target, Lock, Play, Award, TrendingUp, Zap, Shield, Key, Bug, Eye, Cpu, UserPlus, UserMinus, CheckCircle, PlayCircle, XCircle, Loader2 } from "lucide-react";

export default function EventsPage() {
  const { authState } = useAuth();
  const router = useRouter();
  const { showSuccess, showError, showLoading } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUnregistering, setIsUnregistering] = useState(false);
  const [eventCode, setEventCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    eventData?: any;
  } | null>(null);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);

  // Get the current active event (if user is registered)
  const currentEvent = useMemo(() => {
    if (!authState.user?.events) return null;
    
    const now = new Date();
    return authState.user.events.find(event => {
      const startTime = new Date(event.starts_at);
      const endTime = new Date(event.ends_at);
      return now >= startTime && now <= endTime;
    });
  }, [authState.user?.events]);

  // Check if user is registered for any event
  const isRegisteredForEvent = useMemo(() => {
    return authState.user?.events && authState.user.events.length > 0;
  }, [authState.user?.events]);

  // Check if user has a team
  const hasTeam = useMemo(() => {
    return !!authState.user?.current_team?.team_id || 
           (authState.user as any)?.teams?.length > 0;
  }, [authState.user]);

  // Fetch team event data only if there's an active event and user has a team
  const {
    challenges,
    progress,
    recentActivity,
    loading: dataLoading,
    error: dataError,
    refetchData,
    startChallenge,
  } = useTeamEventData(currentEvent?.id);

  const handleCreateTeam = () => {
    router.push('/team');
  };

  const handleViewTeams = () => {
    router.push('/team');
  };

  // Handle event code validation
  const handleEventCodeValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventCode.trim()) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      console.log('Validating event code:', eventCode.trim());
      const result = await eventsAPI.validateEventCode(eventCode.trim());
      console.log('Validation result:', result);
      
      if (result.success && result.valid) {
        console.log('Event code is valid, proceeding with registration');
        // If valid, proceed with registration
        try {
          await handleRegisterForEventWithCode(eventCode.trim());
        } catch (registrationError) {
          // Registration error - don't show validation error
          console.error('Registration error:', registrationError);
          // The registration handler will show its own error message
        }
      } else {
        console.log('Event code validation failed:', result);
        setValidationResult({
          isValid: false,
          message: result.message || "Invalid event code. Please check and try again."
        });
      }
    } catch (error) {
      console.error('Validation error:', error);
      setValidationResult({
        isValid: false,
        message: "Failed to validate event code. Please try again."
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Handle event registration with specific event code
  const handleRegisterForEventWithCode = async (code: string) => {
    console.log('Starting registration for event code:', code);
    setIsRegistering(true);
    const loadingToast = showLoading('Registering for event...');

    try {
      console.log('Calling registerForEvent API...');
      const response = await eventsAPI.registerForEvent(code);
      console.log('Registration API response:', response);
      
      if (response.success) {
        console.log('Registration successful');
        showSuccess(response.message);
        setValidationResult({
          isValid: true,
          message: response.message
        });
        // Refresh user data to update events
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        console.log('Registration failed:', response.message);
        showError(response.message);
        setValidationResult({
          isValid: false,
          message: response.message
        });
      }
    } catch (error: any) {
      console.error('Event registration error:', error);
      showError(error.message || 'Failed to register for event');
      setValidationResult({
        isValid: false,
        message: error.message || 'Failed to register for event'
      });
    } finally {
      setIsRegistering(false);
      loadingToast();
    }
  };

  // Handle leave event button click - show confirmation modal
  const handleLeaveEventClick = () => {
    setShowLeaveConfirmModal(true);
  };

  // Handle confirmed event unregistration
  const handleConfirmLeaveEvent = async () => {
    if (!currentEvent?.id) {
      showError('No event ID available for unregistration');
      setShowLeaveConfirmModal(false);
      return;
    }

    setIsUnregistering(true);
    const loadingToast = showLoading('Leaving event...');

    try {
      const response = await eventsAPI.unregisterFromEvent(currentEvent.id);
      
      if (response.success) {
        showSuccess(response.message);
        setShowLeaveConfirmModal(false);
        // Refresh user data to update events
        window.location.reload();
      } else {
        showError(response.message);
      }
    } catch (error: any) {
      console.error('Event unregistration error:', error);
      showError(error.message || 'Failed to leave event');
    } finally {
      setIsUnregistering(false);
      loadingToast();
    }
  };

  const handleStartChallenge = async (challengeId: string) => {
    try {
      await startChallenge(challengeId);
      showSuccess('Challenge started successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to start challenge');
    }
  };

  // Calculate days remaining
  const getDaysRemaining = (endDate: string) => {
    const days = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <StudentRouteGuard>
      <div className="min-h-screen bg-primary-bg flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Card */}
            <div className="bg-card-bg rounded-2xl p-8 shadow-lg mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-text-primary mb-2">
                    Welcome back, {authState.user?.name || 'user user'}!
                  </h1>
                  <p className="text-text-secondary mb-6">
                    Team: {authState.user?.current_team?.team_name || 'Not joined any yet'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  {isRegisteredForEvent && currentEvent && (
                    <button 
                      onClick={handleLeaveEventClick}
                      disabled={isUnregistering}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                    >
                      <UserMinus className="w-4 h-4" />
                      {isUnregistering ? 'Leaving...' : 'Leave Event'}
                    </button>
                  )}
                  <button 
                    onClick={handleCreateTeam}
                    disabled={!isRegisteredForEvent}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                      isRegisteredForEvent 
                        ? "bg-accent-color hover:bg-accent-dark text-white" 
                        : "bg-gray-500 text-gray-300 cursor-not-allowed"
                    }`}
                    title={!isRegisteredForEvent ? "You must be part of an event to create or join teams" : ""}
                  >
                    Create / Join Team
                  </button>
                  <button 
                    onClick={handleViewTeams}
                    disabled={!isRegisteredForEvent}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                      isRegisteredForEvent 
                        ? "bg-secondary-bg hover:bg-border-color text-text-primary" 
                        : "bg-gray-500 text-gray-300 cursor-not-allowed"
                    }`}
                    title={!isRegisteredForEvent ? "You must be part of an event to view teams" : ""}
                  >
                    View My Teams
                  </button>
                </div>
              </div>
            </div>

            {/* Conditional Content Based on Event Registration and Team Membership */}
            {!isRegisteredForEvent ? (
              // Not registered for any event - Show join event form
              <div className="bg-card-bg rounded-2xl p-6 shadow-lg">
                <div className="text-center py-8">
                  <UserPlus className="w-16 h-16 text-accent-color mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-accent-color mb-4">Join an Event</h3>
                  <p className="text-text-secondary mb-8">
                    Enter your event code to join and access challenges and competitions.
                  </p>
                  
                  {/* Event Code Input Form */}
                  <form onSubmit={handleEventCodeValidation} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                      <input
                        type="text"
                        value={eventCode}
                        onChange={(e) => setEventCode(e.target.value)}
                        placeholder="Enter event code (e.g., CTF-2024-001)"
                        className="flex-1 px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent"
                        disabled={isValidating || isRegistering}
                      />
                      <button
                        type="submit"
                        disabled={isValidating || isRegistering || !eventCode.trim()}
                        className="px-6 py-3 bg-accent-color text-white rounded-lg hover:bg-accent-dark transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isValidating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Validating...
                          </>
                        ) : isRegistering ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Joining...
                          </>
                        ) : (
                          'Join Event'
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Validation Result */}
                  {validationResult && (
                    <div className={`mt-6 p-4 rounded-lg max-w-md mx-auto ${
                      validationResult.isValid 
                        ? 'bg-green-900 bg-opacity-20 border border-green-500 text-green-400' 
                        : 'bg-red-900 bg-opacity-20 border border-red-500 text-red-400'
                    }`}>
                      <p className="text-sm font-medium">{validationResult.message}</p>
                    </div>
                  )}

                  {/* Help Text */}
                  <div className="mt-6 pt-4 border-t border-border-color">
                    <p className="text-text-secondary text-sm">
                      Don't have an event code? Contact your instructor or event organizer.
                    </p>
                  </div>
                </div>
              </div>
            ) : !currentEvent ? (
              // Registered but no active event
              <div className="bg-card-bg rounded-2xl p-6 shadow-lg">
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text-primary mb-2">No Active Events</h3>
                  <p className="text-text-secondary mb-6">
                    There are currently no active events. Challenges will be available once an event starts.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
                    <Calendar className="w-4 h-4" />
                    <span>Check back when an event is active</span>
                  </div>
                </div>
              </div>
            ) : !hasTeam ? (
              // Has active event but no team
              <div className="bg-card-bg rounded-2xl p-6 shadow-lg">
                <div className="text-center py-12">
                  <UserPlus className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text-primary mb-2">Join a Team First</h3>
                  <p className="text-text-secondary mb-6">
                    You need to be part of a team to participate in challenges.
                  </p>
                  <button 
                    onClick={handleCreateTeam}
                    className="bg-accent-color hover:bg-accent-dark text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    Create or Join Team
                  </button>
                </div>
              </div>
            ) : (
              // Has active event and team - Show event content
             <div className="space-y-8">
                {/* Current Event Details */}
              <div className="bg-card-bg rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="w-6 h-6 text-accent-color" />
                  <h2 className="text-xl font-semibold text-text-primary">Current Event</h2>
                    <span className="bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                      {currentEvent.name}
                    </span>
                </div>
                
                <div className="border border-border-color rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary">{currentEvent.name}</h3>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-text-secondary flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">Start:</span> {formatDate(currentEvent.starts_at)}
                          </p>
                          <p className="text-sm text-text-secondary flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">End:</span> {formatDate(currentEvent.ends_at)}
                          </p>
                        </div>
                        <p className="text-xs text-accent-color mt-2">Event Code: {currentEvent.event_code}</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-sm font-medium">Active</span>
                        <p className="text-xs text-text-secondary mt-1">
                          {getDaysRemaining(currentEvent.ends_at)} days remaining
                        </p>
                    </div>
                  </div>
                  
                    {/* Event Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-secondary-bg rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-accent-color">{progress.totalChallenges}</div>
                      <div className="text-sm text-text-secondary">Total Challenges</div>
                    </div>
                    <div className="bg-secondary-bg rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                          <CheckCircle className="w-5 h-5" />
                          {progress.completedChallenges}
                        </div>
                        <div className="text-sm text-text-secondary">Completed</div>
                      </div>
                      <div className="bg-secondary-bg rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
                          <PlayCircle className="w-5 h-5" />
                          {progress.inProgressChallenges}
                        </div>
                        <div className="text-sm text-text-secondary">In Progress</div>
                    </div>
                    <div className="bg-secondary-bg rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
                          <XCircle className="w-5 h-5" />
                          {progress.unsolvedChallenges}
                        </div>
                        <div className="text-sm text-text-secondary">Unsolved</div>
                    </div>
                  </div>
                </div>
              </div>

                {/* Challenges Grid */}
                {dataLoading ? (
                  <div className="bg-card-bg rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-accent-color animate-spin" />
                      <span className="ml-3 text-text-secondary">Loading challenges...</span>
                    </div>
                  </div>
                ) : dataError ? (
                  <div className="bg-card-bg rounded-2xl p-6 shadow-lg">
                    <div className="text-center py-12">
                      <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-text-primary mb-2">Error Loading Challenges</h3>
                      <p className="text-text-secondary mb-6">{dataError}</p>
                      <button
                        onClick={refetchData}
                        className="bg-accent-color hover:bg-accent-dark text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                ) : challenges.length === 0 ? (
                  <div className="bg-card-bg rounded-2xl p-6 shadow-lg">
                    <div className="text-center py-12">
                      <Trophy className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-text-primary mb-2">No Challenges Available</h3>
                      <p className="text-text-secondary">
                        Challenges will appear here once the event organizer adds them.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-card-bg rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <Trophy className="w-6 h-6 text-accent-color" />
                      <h2 className="text-xl font-semibold text-text-primary">Challenges</h2>
                      <span className="bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                        {currentEvent.name}
                      </span>
                    </div>
                    
                    {/* Challenges Grid - No ScrollView, automatic rows */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {challenges.map((challenge) => (
                        <EventChallengeCard
                          key={challenge.id}
                          challenge={challenge}
                          eventId={currentEvent.id}
                          onStart={handleStartChallenge}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Team Progress and Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Team Progress */}
                <div className="bg-card-bg rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy className="w-6 h-6 text-accent-color" />
                      <h2 className="text-xl font-semibold text-text-primary">Team Progress</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-secondary-bg rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-accent-color" />
                        <h3 className="font-medium text-text-primary">Total Points</h3>
                      </div>
                        <p className="text-2xl font-bold text-accent-color">
                          {progress.totalScore.toLocaleString()}
                        </p>
                    </div>
                    <div className="p-4 bg-secondary-bg rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-accent-color" />
                        <h3 className="font-medium text-text-primary">Challenges Solved</h3>
                      </div>
                        <p className="text-2xl font-bold text-accent-color">
                          {progress.completedChallenges}/{progress.totalChallenges}
                        </p>
                    </div>
                    <div className="p-4 bg-secondary-bg rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-accent-color" />
                        <h3 className="font-medium text-text-primary">Current Rank</h3>
                      </div>
                        <p className="text-2xl font-bold text-accent-color">
                          {progress.rank ? `#${progress.rank}` : 'N/A'}
                        </p>
                    </div>
                  </div>
                </div>

                  {/* Recent Activity */}
                <div className="bg-card-bg rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-accent-color" />
                    <h2 className="text-xl font-semibold text-text-primary">Recent Activity</h2>
                  </div>
                  <div className="space-y-3">
                      {challenges.filter(c => c.progress === 'completed').slice(0, 5).map((challenge, idx) => (
                        <div key={challenge.id} className="flex items-center space-x-3 p-3 bg-secondary-bg rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                            <p className="text-sm font-medium text-text-primary line-clamp-1">
                              Solved {challenge.title}
                            </p>
                            <p className="text-xs text-text-secondary">Challenge completed</p>
                      </div>
                          {challenge.score && (
                            <span className="text-xs text-green-600 font-medium">
                              +{challenge.score} pts
                            </span>
                          )}
                    </div>
                      ))}
                      {challenges.filter(c => c.progress === 'completed').length === 0 && (
                        <div className="text-center py-8">
                          <Clock className="w-12 h-12 text-text-secondary mx-auto mb-2 opacity-50" />
                          <p className="text-text-secondary text-sm">No activity yet</p>
                          <p className="text-text-secondary text-xs">Start solving challenges to see your progress!</p>
                      </div>
                      )}
                      </div>
                    </div>
                  </div>
                </div>
            )}
          </div>
        </main>
        <Footer />
        
        {/* Leave Event Confirmation Modal */}
        <ConfirmationModal
          isOpen={showLeaveConfirmModal}
          onClose={() => setShowLeaveConfirmModal(false)}
          onConfirm={handleConfirmLeaveEvent}
          title="Leave Event"
          message={`Are you sure you want to leave the event "${currentEvent?.name}"? This action will remove you from the event and you'll lose access to challenges and progress.`}
          confirmText="Leave Event"
          cancelText="Cancel"
          type="delete"
          isLoading={isUnregistering}
        />
      </div>
    </StudentRouteGuard>
  );
}
