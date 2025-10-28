'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/context/AuthContext';
import { EventData, Participant, EventStats } from '@/lib/api';
import { useChallengeManagement } from '@/lib/hooks/useChallengeManagement';
import { useEventManagement } from '@/lib/hooks/useEventManagement';
import { ChallengeResponse } from '@/lib/services/challengeService';
import { useToast } from '@/lib/hooks/useToast';

// Use ChallengeResponse as Challenge type for compatibility
type Challenge = ChallengeResponse;

export default function EventRegistrationPage() {
  const { t } = useLanguage();
  const { authState } = useAuth();
  const { showSuccess, showError } = useToast();
  const { 
    fetchChallenges: fetchChallengesFromHook,
    challenges: hookChallenges,
    isLoading: hookIsLoadingChallenges,
    totalCount: hookTotalChallenges,
    currentPage: hookCurrentPage,
    hasNextPage: hookHasNextPage,
    hasPreviousPage: hookHasPreviousPage
  } = useChallengeManagement();
  const {
    events: hookEvents,
    currentEvent: hookCurrentEvent,
    participants: hookParticipants,
    eventStats: hookEventStats,
    isLoading: hookIsLoadingEvents,
    error: hookEventError,
    totalCount: hookTotalEvents,
    currentPage: hookCurrentEventPage,
    hasNextPage: hookHasNextEventPage,
    hasPreviousPage: hookHasPreviousEventPage,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchEvents,
    fetchEventData,
    fetchEventStats,
    fetchParticipants,
    fetchEventParticipants,
    generateEventCode,
    generateCodePreview,
    validateEventCode,
    addParticipant,
    updateParticipantStatus,
    removeParticipant,
    exportRegistrations,
    clearError: clearEventError,
    refreshData: refreshEventData
  } = useEventManagement();
  const [isSaving, setIsSaving] = useState(false);
  
  // Challenge selection state
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const challengesPerPage = 10;
  
  // Events list state
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  
  // Search and Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'all' | 'active' | 'upcoming' | 'past'>('all');
  
  // Code generation state
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [codePreviewError, setCodePreviewError] = useState<string | null>(null);
  
  // Date validation state
  const [dateValidationError, setDateValidationError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    eventCode: '',
    startDate: '',
    endDate: '',
    maxParticipants: 500,
    registrationStatus: 'Open'
  });

  // Ref for scrolling to form
  const eventFormRef = useRef<HTMLDivElement>(null);

  // Helper function to convert ISO datetime to datetime-local format
  const formatDateTimeLocal = (isoString: string): string => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      // Format: YYYY-MM-DDTHH:MM
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Validate dates
  const validateDates = (startDate: string, endDate: string): string | null => {
    if (!startDate || !endDate) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Invalid date format';
    }
    
    if (end <= start) {
      return 'End date must be after start date';
    }
    
    return null;
  };

  // Generate preview for event code
  const generateEventCodePreviewFromHook = async (eventName: string) => {
    if (!eventName || !eventName.trim()) {
      setCodePreviewError('Event name is required to generate code');
      return;
    }
    
    try {
      setIsGeneratingCode(true);
      setCodePreviewError(null);
      
      const result = await generateCodePreview(eventName);
      setFormData(prev => ({ ...prev, eventCode: result.preview_code }));
    } catch (error) {
      setCodePreviewError('Failed to generate event code');
      console.error('Error generating event code:', error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Fetch challenges with pagination
  const fetchChallengesData = async (page: number = 1) => {
    try {
      await fetchChallengesFromHook({ 
        page, 
        page_size: challengesPerPage 
      });
    } catch (error) {
      console.error('Error fetching challenges:', error);
      showError('Failed to load challenges');
    }
  };

  // Sort challenges to show selected ones first
  const getSortedChallenges = () => {
    if (!hookChallenges || selectedChallenges.length === 0) {
      return hookChallenges || [];
    }

    const selected = hookChallenges.filter(c => selectedChallenges.includes(c.id));
    const notSelected = hookChallenges.filter(c => !selectedChallenges.includes(c.id));
    return [...selected, ...notSelected];
  };

  // Filter and sort events
  const getFilteredAndSortedEvents = () => {
    if (!hookEvents) return [];

    let filtered = hookEvents.filter(event => {
      // Filter by search query (event name)
      if (searchQuery && !event.eventName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by status based on sortBy selection
      if (sortBy === 'all') {
        // Show only Active and Upcoming events by default
        return event.isActive || event.isUpcoming;
      } else if (sortBy === 'active') {
        return event.isActive;
      } else if (sortBy === 'upcoming') {
        return event.isUpcoming;
      } else if (sortBy === 'past') {
        // Show only Past events when Past is selected
        return event.isPast;
      }
      
      return false;
    });

    return filtered;
  };

  useEffect(() => {
    if (authState.isAuthenticated) {
      fetchEvents({ page: 1 });
      fetchChallengesData();
    }
  }, [authState.isAuthenticated]);

  // Generate new event code for existing event
  const handleGenerateEventCode = async () => {
    try {
      if (!hookCurrentEvent) {
        showError('No event data available to generate code for');
        return;
      }

      const eventPayload = {
        name: hookCurrentEvent.eventName,
        starts_at: hookCurrentEvent.startDate,
        ends_at: hookCurrentEvent.endDate,
        event_code: undefined // Let the backend generate a new code
      };

      const data = await generateEventCode(eventPayload);
      
      // The hook will handle updating the current event data
      
      // If we're editing an event, update the editing event as well
      if (editingEvent) {
        setEditingEvent(prev => prev ? { ...prev, eventCode: data.eventCode } : null);
      }
      
      showSuccess(`New event code generated: ${data.eventCode}`);
    } catch (error) {
      console.error('Error generating event code:', error);
      showError('Failed to generate event code');
    }
  };

  // Handle challenge selection
  const handleChallengeToggle = (challengeId: string) => {
    setSelectedChallenges(prev => 
      prev.includes(challengeId) 
        ? prev.filter(id => id !== challengeId)
        : [...prev, challengeId]
    );
  };

  // Select all challenges
  const handleSelectAllChallenges = () => {
    setSelectedChallenges(hookChallenges?.map(c => c.id) || []);
  };

  // Deselect all challenges
  const handleDeselectAllChallenges = () => {
    setSelectedChallenges([]);
  };

  // Handle edit event
  const handleEditEvent = async (event: EventData) => {
    try {
      // Fetch the full event details including challenges
      const response = await fetch(`/api/events/${event.id}/`);
      if (!response.ok) {
        throw new Error('Failed to fetch event details');
      }
      
      const data = await response.json();
      const fullEvent = data.event || event;
      
      setEditingEvent(fullEvent);
      setFormData({
        eventName: fullEvent.eventName,
        description: fullEvent.description || '',
        eventCode: fullEvent.eventCode,
        startDate: formatDateTimeLocal(fullEvent.startDate),
        endDate: formatDateTimeLocal(fullEvent.endDate),
        maxParticipants: fullEvent.maxParticipants,
        registrationStatus: fullEvent.registrationStatus
      });
      
      // Set selected challenges from the event
      console.log('Setting selected challenges:', fullEvent.selectedChallenges);
      setSelectedChallenges(fullEvent.selectedChallenges || []);
      setShowEventForm(true);

      // Scroll to form after a short delay to ensure it's rendered
      setTimeout(() => {
        eventFormRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    } catch (error) {
      console.error('Error loading event for editing:', error);
      showError('Failed to load event details');
    }
  };

  // Handle delete event
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteEvent(eventId);
      
      showSuccess('Event deleted successfully!');
      
      // Refresh events list
      await fetchEvents({ page: hookCurrentEventPage });
      
      // If we're editing this event, reset the form
      if (editingEvent && editingEvent.id === eventId) {
        setEditingEvent(null);
        setShowEventForm(false);
        setFormData({
          eventName: '',
          description: '',
          eventCode: '',
          startDate: '',
          endDate: '',
          maxParticipants: 500,
          registrationStatus: 'Open'
        });
        setSelectedChallenges([]);
        setDateValidationError(null);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      showError('Failed to delete event');
    }
  };

  // Handle event selection
  const handleSelectEvent = async (event: EventData) => {
    setSelectedEvent(event);
    setEditingEvent(null);
    setShowEventForm(false);
    
    // Update form data with selected event
    setFormData({
      eventName: event.eventName,
      description: event.description || '',
      eventCode: event.eventCode,
      startDate: event.startDate,
      endDate: event.endDate,
      maxParticipants: event.maxParticipants,
      registrationStatus: event.registrationStatus
    });
    
    // The hook will handle setting the event data
    setSelectedChallenges(event.selectedChallenges || []);
    
    // Fetch participants for the selected event
    try {
      const participants = await fetchEventParticipants(event.id);
      if (!participants || participants.length === 0) {
        showSuccess('No Participants available for the Event');
      }
    } catch (error) {
      console.error('Error fetching event participants:', error);
      // Don't show error, just show info message
      showSuccess('No Participants available for the Event');
    }
    
    // Clear errors
    setCodePreviewError(null);
    setDateValidationError(null);
  };

  // Handle create new event
  const handleCreateNewEvent = async () => {
    try {
      // Generate event code first using the API
      const response = await fetch('/api/events/?action=generate-code', {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate event code');
      }
      
      const data = await response.json();
      
      setEditingEvent(null);
      setShowEventForm(true);
      setFormData({
        eventName: '',
        description: '',
        eventCode: data.eventCode,
        startDate: '',
        endDate: '',
        maxParticipants: 500,
        registrationStatus: 'Open'
      });
      setSelectedChallenges([]);
      setDateValidationError(null);
      setCodePreviewError(null);

      // Scroll to form after a short delay to ensure it's rendered
      setTimeout(() => {
        eventFormRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    } catch (error) {
      console.error('Error generating event code:', error);
      showError('Failed to generate event code');
    }
  };

  // Save event settings
  const handleSaveEventSettings = async () => {
    try {
      setIsSaving(true);
      
      // Validate required fields
      if (!formData.eventName.trim()) {
        showError('Event name is required');
        return;
      }
      if (!formData.eventCode.trim()) {
        showError('Event code is required');
        return;
      }
      if (!formData.startDate) {
        showError('Start date is required');
        return;
      }
      if (!formData.endDate) {
        showError('End date is required');
        return;
      }
      
      // Validate dates
      const dateError = validateDates(formData.startDate, formData.endDate);
      if (dateError) {
        showError(dateError);
        return;
      }
      
      let data;
      if (editingEvent) {
        // Update existing event
        const eventPayload = {
          id: editingEvent.id,
          ...formData,
          selectedChallenges: selectedChallenges,
          eventCode: editingEvent.eventCode,
          registrationStatus: formData.registrationStatus as 'Open' | 'Closed' | 'Invite Only'
        };
        data = await updateEvent(eventPayload);
      } else {
        // Create new event
        const eventPayload = {
          name: formData.eventName,
          event_code: formData.eventCode,
          description: formData.description,
          starts_at: formData.startDate,
          ends_at: formData.endDate,
          selectedChallenges: selectedChallenges
        };
        data = await createEvent(eventPayload);
      }
      
      showSuccess(`${editingEvent ? 'Event updated' : 'Event created'} successfully! ${selectedChallenges.length} challenges mapped to the event.`);
      
      // Refresh events list
      await fetchEvents({ page: hookCurrentEventPage });
      
      // Reset form
      setEditingEvent(null);
      setShowEventForm(false);
    } catch (error) {
      console.error('Error saving event settings:', error);
      showError('Failed to save event settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Export registrations
  const handleExportRegistrations = async () => {
    try {
      const blob = await exportRegistrations();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event-registrations-${hookCurrentEvent?.eventCode || 'export'}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting registrations:', error);
      showError('Failed to export registrations');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Group participants by team
  const getGroupedParticipants = () => {
    if (!hookParticipants || hookParticipants.length === 0) {
      return {};
    }

    const grouped: { [teamName: string]: Participant[] } = {};
    
    hookParticipants.forEach(participant => {
      const teamName = participant.teamName || 'No Team';
      if (!grouped[teamName]) {
        grouped[teamName] = [];
      }
      grouped[teamName].push(participant);
    });

    return grouped;
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500 bg-opacity-20 text-green-500';
      case 'pending':
        return 'bg-yellow-500 bg-opacity-20 text-yellow-500';
      case 'cancelled':
        return 'bg-red-500 bg-opacity-20 text-red-500';
      default:
        return 'bg-gray-500 bg-opacity-20 text-gray-500';
    }
  };

  // Copy event code to clipboard
  const handleCopyEventCode = async (eventCode: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click event
    try {
      await navigator.clipboard.writeText(eventCode);
      showSuccess(`Event code "${eventCode}" copied to clipboard!`);
    } catch (error) {
      console.error('Failed to copy event code:', error);
      showError('Failed to copy event code');
    }
  };

  // Handle event name click to show participants
  const handleEventNameClick = async (event: EventData, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click event
    await handleSelectEvent(event);
  };

  if (hookIsLoadingEvents || !authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-color mx-auto mb-4"></div>
          <p className="text-text-secondary">
            {!authState.isAuthenticated ? 'Checking authentication...' : 'Loading event data...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-dark to-accent-color bg-clip-text text-transparent">
          Event Registration
        </h1>
        <div className="flex gap-4">
          <button
            onClick={handleCreateNewEvent}
            className="btn-primary flex items-center gap-2"
          >
            <span>➕</span>
            Create New Event
          </button>
          <button
            onClick={handleExportRegistrations}
            className="btn-secondary flex items-center gap-2"
          >
            <span>📥</span>
            Export Registrations
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-accent-light flex items-center gap-2">
            <span>📅</span>
            All Events
          </h2>
          <div className="text-sm text-text-secondary">
            Showing {getFilteredAndSortedEvents().length} of {hookTotalEvents || 0} events
          </div>
        </div>
        
        {/* Search and Sort Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Search by Event Name */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Search by Event Name
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter event name..."
              className="w-full px-4 py-2 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
            />
          </div>
          
          {/* Sort by Status */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Filter by Status
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'all' | 'active' | 'upcoming' | 'past')}
              className="w-full px-4 py-2 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
            >
              <option value="all">Active & Upcoming</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>
        </div>
        
        {hookIsLoadingEvents ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-color"></div>
            <span className="ml-2 text-text-secondary">Loading events...</span>
          </div>
        ) : getFilteredAndSortedEvents().length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            {searchQuery || sortBy !== 'all' ? 'No events match your search criteria.' : 'No events found. Create your first event to get started.'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-card-bg z-10">
                <tr>
                  <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Event Name</th>
                  <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Event Code</th>
                  <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Start Date</th>
                  <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">End Date</th>
                  <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Status</th>
                  <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Challenges</th>
                  <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Max Participants</th>
                  <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredAndSortedEvents().map((event) => (
                  <tr 
                    key={event?.id || 'unknown'} 
                    className={`hover:bg-secondary-bg cursor-pointer transition-colors ${
                      selectedEvent?.id === event?.id ? 'bg-accent-color bg-opacity-10 border-l-4 border-accent-color' : ''
                    }`}
                  >
                    <td 
                      className="py-3 px-4 border-b border-border-color text-text-primary font-medium cursor-pointer hover:text-accent-color transition-colors"
                      onClick={(e) => event && handleEventNameClick(event, e)}
                      title="Click to view participants"
                    >
                      {event?.eventName || 'Unknown Event'}
                    </td>
                    <td 
                      className="py-3 px-4 border-b border-border-color text-text-primary font-mono text-sm cursor-pointer hover:text-accent-color transition-colors"
                      onClick={(e) => event?.eventCode && handleCopyEventCode(event.eventCode, e)}
                      title="Click to copy event code"
                    >
                      {event?.eventCode || 'N/A'}
                    </td>
                    <td className="py-3 px-4 border-b border-border-color text-text-primary text-sm">
                      {event?.startDate ? new Date(event.startDate).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      }) : 'N/A'}
                    </td>
                    <td className="py-3 px-4 border-b border-border-color text-text-primary text-sm">
                      {event?.endDate ? new Date(event.endDate).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      }) : 'N/A'}
                    </td>
                    <td className="py-3 px-4 border-b border-border-color">
                      <div className="flex flex-col gap-1">
                        {event?.isActive && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-green-500 bg-opacity-20 text-green-500 border border-green-500 inline-block w-fit">
                            🟢 Active
                          </span>
                        )}
                        {event?.isUpcoming && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500 bg-opacity-20 text-blue-400 border border-blue-500 inline-block w-fit">
                            📅 Upcoming
                          </span>
                        )}
                        {event?.isPast && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-500 bg-opacity-20 text-gray-400 border border-gray-500 inline-block w-fit">
                            ⏱️ Past
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b border-border-color text-text-primary text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="text-accent-color font-medium">
                          {event?.totalChallenges || 0} Total
                        </span>
                        <span className="text-text-secondary text-xs">
                          {event?.publishedChallenges || 0} Published
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b border-border-color text-text-primary text-sm">
                      {event?.maxParticipants || 0}
                    </td>
                    <td className="py-3 px-4 border-b border-border-color">
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => event && handleEditEvent(event)}
                          className="text-accent-color hover:text-accent-dark transition-colors text-sm font-medium"
                          title="Edit Event"
                          disabled={!event}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => event?.id && handleDeleteEvent(event.id)}
                          className="text-danger-color hover:text-red-600 transition-colors text-sm font-medium"
                          title="Delete Event"
                          disabled={!event?.id}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {hookTotalEvents > 0 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-border-color">
              <div className="text-sm text-text-secondary">
                Page {hookCurrentEventPage}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchEvents({ page: hookCurrentEventPage - 1 })}
                  disabled={!hookHasPreviousEventPage || hookIsLoadingEvents}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    hookHasPreviousEventPage && !hookIsLoadingEvents
                      ? 'bg-accent-color text-white hover:bg-accent-dark'
                      : 'bg-secondary-bg text-text-secondary cursor-not-allowed'
                  }`}
                >
                  ← Previous
                </button>
                <button
                  onClick={() => fetchEvents({ page: hookCurrentEventPage + 1 })}
                  disabled={!hookHasNextEventPage || hookIsLoadingEvents}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    hookHasNextEventPage && !hookIsLoadingEvents
                      ? 'bg-accent-color text-white hover:bg-accent-dark'
                      : 'bg-secondary-bg text-text-secondary cursor-not-allowed'
                  }`}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
          </>
        )}
      </div>

      {/* Event Registration Management Card - Only show when editing/creating */}
      {showEventForm && (
        <div ref={eventFormRef} className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-accent-light flex items-center gap-2">
            <span>📝</span>
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </h2>
          {editingEvent && (
            <span className="px-3 py-1 bg-blue-500 bg-opacity-20 text-blue-400 border border-blue-500 rounded-md text-sm font-medium">
              Editing: {editingEvent.eventName}
            </span>
          )}
        </div>
        
        <div className="space-y-6">
          {/* Current Event Code - Show when event is selected or editing */}
          {(selectedEvent || editingEvent) && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Current Event Code
              </label>
              <div className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary font-mono text-lg text-center tracking-wider">
                {editingEvent?.eventCode || selectedEvent?.eventCode || formData.eventCode || 'Loading...'}
              </div>
              <p className="mt-2 text-sm text-text-secondary">
                Share this code with participants to allow them to register for the current event.
              </p>
            </div>
          )}

          {/* Event Name */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Event Name *
            </label>
            <input
              type="text"
              value={formData.eventName}
              onChange={(e) => {
                setFormData({ ...formData, eventName: e.target.value });
              }}
              readOnly={!!(selectedEvent && !editingEvent)}
              className={`w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color ${
                selectedEvent && !editingEvent ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="Enter event name"
            />
          </div>

          {/* Event Description */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              readOnly={!!(selectedEvent && !editingEvent)}
              className={`w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color ${
                selectedEvent && !editingEvent ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="Enter event description"
              rows={3}
            />
          </div>

          {/* Event Code - Only show when creating new event */}
          {!editingEvent && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Event Code *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.eventCode}
                  onChange={(e) => setFormData({ ...formData, eventCode: e.target.value })}
                  className="flex-1 px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-accent-color"
                  placeholder="Event code will be generated automatically"
                />
                <button
                  type="button"
                  onClick={() => generateEventCodePreviewFromHook(formData.eventName)}
                  disabled={!formData.eventName.trim() || isGeneratingCode}
                  className="px-4 py-3 bg-accent-color text-white rounded-lg hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isGeneratingCode ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <span>🔄</span>
                      Regenerate
                    </>
                  )}
                </button>
              </div>
              {codePreviewError && (
                <p className="mt-2 text-sm text-red-500">{codePreviewError}</p>
              )}
              <p className="mt-2 text-sm text-text-secondary">
                Event code is generated automatically based on the event name. You can edit it if needed.
              </p>
            </div>
          )}

          {/* Start and End Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Start Date *
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => {
                  const newStartDate = e.target.value;
                  setFormData({ ...formData, startDate: newStartDate });
                  
                  // Validate dates in real-time
                  const error = validateDates(newStartDate, formData.endDate);
                  setDateValidationError(error);
                }}
                className={`w-full px-4 py-3 bg-secondary-bg border rounded-lg text-text-primary focus:outline-none focus:ring-2 ${
                  dateValidationError ? 'border-red-500 focus:ring-red-500' : 'border-border-color focus:ring-accent-color'
                }`}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                End Date *
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => {
                  const newEndDate = e.target.value;
                  setFormData({ ...formData, endDate: newEndDate });
                  
                  // Validate dates in real-time
                  const error = validateDates(formData.startDate, newEndDate);
                  setDateValidationError(error);
                }}
                className={`w-full px-4 py-3 bg-secondary-bg border rounded-lg text-text-primary focus:outline-none focus:ring-2 ${
                  dateValidationError ? 'border-red-500 focus:ring-red-500' : 'border-border-color focus:ring-accent-color'
                }`}
                required
              />
            </div>
          </div>

          {/* Date Validation Error */}
          {dateValidationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                <p className="text-red-700 text-sm font-medium">{dateValidationError}</p>
              </div>
            </div>
          )}

          {/* Maximum Participants */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Maximum Participants
            </label>
            <input
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
              min="1"
              className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
            />
          </div>

          {/* Registration Status */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Registration Status
            </label>
            <select
              value={formData.registrationStatus}
              onChange={(e) => setFormData({ ...formData, registrationStatus: e.target.value })}
              className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
            >
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Invite Only">Invite Only</option>
            </select>
          </div>

          {/* Challenge Selection */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-text-secondary">
                Select Challenges for this Event
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllChallenges}
                  className="text-sm text-accent-color hover:text-accent-dark transition-colors"
                >
                  Select All
                </button>
                <span className="text-text-secondary">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAllChallenges}
                  className="text-sm text-accent-color hover:text-accent-dark transition-colors"
                >
                  Deselect All
                </button>
              </div>
            </div>
            
            <div className="bg-secondary-bg border border-border-color rounded-lg p-4 max-h-96 overflow-y-auto">
              {hookIsLoadingChallenges ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-color"></div>
                  <span className="ml-2 text-text-secondary">Loading challenges...</span>
                </div>
              ) : (hookChallenges?.length || 0) === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  No challenges available
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Show section header if there are selected challenges */}
                  {selectedChallenges.length > 0 && (
                    <div className="text-xs font-semibold text-accent-color uppercase tracking-wide mb-2">
                      Selected Challenges ({selectedChallenges.length})
                    </div>
                  )}
                  {getSortedChallenges().map((challenge, index) => {
                    const isSelected = selectedChallenges.includes(challenge.id);
                    const isFirstUnselected = !isSelected && index > 0 && selectedChallenges.includes(getSortedChallenges()[index - 1].id);
                    
                    return (
                      <div key={challenge.id}>
                        {/* Show separator between selected and unselected */}
                        {isFirstUnselected && (
                          <div className="flex items-center gap-2 my-4">
                            <div className="flex-1 h-px bg-border-color"></div>
                            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                              Available Challenges
                            </span>
                            <div className="flex-1 h-px bg-border-color"></div>
                          </div>
                        )}
                        <div className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-accent-color bg-opacity-10 border-accent-color hover:bg-opacity-20'
                            : 'bg-card-bg border-border-color hover:bg-primary-bg'
                        }`}>
                      <input
                        type="checkbox"
                        id={`challenge-${challenge.id}`}
                        checked={selectedChallenges.includes(challenge.id)}
                        onChange={() => handleChallengeToggle(challenge.id)}
                        className="mt-1 h-4 w-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color focus:ring-2"
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={`challenge-${challenge.id}`}
                          className="block cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-text-primary truncate">
                              {challenge.title}
                            </h4>
                            <span className="text-xs px-2 py-1 bg-accent-color text-white rounded">
                              {challenge.points} pts
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              challenge.difficulty.toLowerCase() === 'easy' ? 'bg-green-500 text-white' :
                              challenge.difficulty.toLowerCase() === 'medium' ? 'bg-yellow-500 text-white' :
                              challenge.difficulty.toLowerCase() === 'hard' ? 'bg-red-500 text-white' :
                              'bg-purple-500 text-white'
                            }`}>
                              {challenge.difficulty}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary line-clamp-2">
                            {challenge.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                            <span>Category: {challenge.category}</span>
                            <span>Status: {challenge.status}</span>
                          </div>
                        </label>
                      </div>
                    </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Challenge Pagination Controls */}
            {!hookIsLoadingChallenges && (hookChallenges?.length || 0) > 0 && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-border-color">
                <div className="text-sm text-text-secondary">
                  Page {hookCurrentPage} of {Math.ceil(hookTotalChallenges / challengesPerPage)} • {hookTotalChallenges} total challenges
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchChallengesData(hookCurrentPage - 1)}
                    disabled={!hookHasPreviousPage || hookIsLoadingChallenges}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      hookHasPreviousPage && !hookIsLoadingChallenges
                        ? 'bg-accent-color text-white hover:bg-accent-dark'
                        : 'bg-secondary-bg text-text-secondary cursor-not-allowed'
                    }`}
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => fetchChallengesData(hookCurrentPage + 1)}
                    disabled={!hookHasNextPage || hookIsLoadingChallenges}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      hookHasNextPage && !hookIsLoadingChallenges
                        ? 'bg-accent-color text-white hover:bg-accent-dark'
                        : 'bg-secondary-bg text-text-secondary cursor-not-allowed'
                    }`}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
            
            {selectedChallenges.length > 0 && (
              <div className="mt-2 text-sm text-accent-color">
                {selectedChallenges.length} challenge{selectedChallenges.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            {selectedEvent && !editingEvent ? (
              // View mode - show Edit button
              <button
                onClick={() => setEditingEvent(selectedEvent)}
                className="btn-primary flex items-center gap-2"
              >
                <span>✏️</span>
                Edit Event
              </button>
            ) : (
              // Edit/Create mode - show Cancel and Save buttons
              <>
                <button
                  onClick={() => {
                    if (selectedEvent) {
                      setEditingEvent(null);
                      handleSelectEvent(selectedEvent);
                    } else {
                      setShowEventForm(false);
                    }
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEventSettings}
                  disabled={isSaving}
                  className="btn-primary flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      Save Event Settings
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Registered Participants Card - Only show when an event is selected (not when creating/editing) */}
      {selectedEvent && !showEventForm && (
        <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
        <h2 className="text-lg font-semibold text-accent-light mb-6 flex items-center gap-2">
          <span>👥</span>
          Registered Participants for {selectedEvent.eventName}
          {hookEventStats && (
            <span className="text-sm text-text-secondary font-normal">
              ({hookEventStats.totalParticipants} total, {hookEventStats.confirmedParticipants} confirmed, {hookEventStats.pendingParticipants} pending)
            </span>
          )}
        </h2>
        
        <div className="overflow-x-auto" style={{ height: '400px', overflowY: 'auto' }}>
          {(hookParticipants?.length || 0) === 0 ? (
            <div className="text-center py-8 text-text-secondary">No participants registered yet.</div>
          ) : (
            Object.entries(getGroupedParticipants()).map(([teamName, participants]) => (
              <div key={teamName} className="mb-6">
                {/* Team Header */}
                <div className="bg-accent-color bg-opacity-10 border-l-4 border-accent-color px-4 py-2 mb-2">
                  <h3 className="text-lg font-semibold text-accent-color flex items-center gap-2">
                    <span>👥</span>
                    {teamName}
                    <span className="text-sm text-text-secondary font-normal">
                      ({participants.length} member{participants.length !== 1 ? 's' : ''})
                    </span>
                  </h3>
                </div>
                
                {/* Team Participants Table */}
                <table className="w-full border-collapse mb-4">
                  <thead className="bg-secondary-bg">
                    <tr>
                      <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Name</th>
                      <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Email</th>
                      <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Registration Date</th>
                      <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Status</th>
                      <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map(participant => (
                      <tr key={participant.id} className="hover:bg-secondary-bg">
                        <td className="py-3 px-4 border-b border-border-color text-text-primary font-medium">
                          {participant.name}
                        </td>
                        <td className="py-3 px-4 border-b border-border-color text-text-primary">
                          {participant.email}
                        </td>
                        <td className="py-3 px-4 border-b border-border-color text-text-primary">
                          {formatDate(participant.registrationDate)}
                        </td>
                        <td className="py-3 px-4 border-b border-border-color">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadgeColor(participant.status)}`}>
                            {participant.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 border-b border-border-color">
                          <div className="flex gap-2">
                            <button className="p-1.5 text-text-secondary hover:text-accent-color transition-colors" title="View Details">
                              👁️
                            </button>
                            <button className="p-1.5 text-text-secondary hover:text-danger-color transition-colors" title="Remove">
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      </div>
      )}
    </div>
  );
}
