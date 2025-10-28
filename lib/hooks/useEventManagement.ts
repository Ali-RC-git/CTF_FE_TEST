/**
 * Custom hook for event management
 * Provides event-related operations and state management for admin functionality
 */

import { useState, useCallback } from 'react';
import { eventsAPI } from '@/lib/api/events';
import { APIError } from '@/lib/api/client';
import { EventData, Participant, EventStats, UpdateEventRequest } from '@/lib/api/events';

interface UseEventManagementState {
  events: EventData[];
  currentEvent: EventData | null;
  participants: Participant[];
  eventStats: EventStats | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UseEventManagementReturn extends UseEventManagementState {
  // Event operations
  createEvent: (data: {
    name: string;
    event_code: string;
    description: string;
    starts_at: string;
    ends_at: string;
    selectedChallenges?: string[];
  }) => Promise<{ message: string; event: EventData }>;
  updateEvent: (data: UpdateEventRequest) => Promise<{ message: string; event: EventData }>;
  deleteEvent: (eventId: string) => Promise<{ message: string }>;

  // Data fetching
  fetchEvents: (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    status?: 'active' | 'inactive' | 'upcoming' | 'past';
    ordering?: string;
  }) => Promise<void>;
  fetchEventData: () => Promise<void>;
  fetchEventStats: () => Promise<void>;
  fetchParticipants: () => Promise<void>;
  fetchEventParticipants: (eventId: string) => Promise<Participant[]>;

  // Event code operations
  generateEventCode: (eventData: {
    name: string;
    starts_at: string;
    ends_at: string;
    event_code?: string;
  }) => Promise<{ message: string; eventCode: string; event: EventData }>;
  generateCodePreview: (name: string) => Promise<{ 
    event_name: string; 
    preview_code: string; 
    message: string; 
  }>;
  validateEventCode: (eventCode: string) => Promise<{
    success: boolean;
    message: string;
    valid: boolean;
    event_id?: string;
    event_code?: string;
    event_name?: string;
    event_description?: string;
    starts_at?: string;
    ends_at?: string;
    is_upcoming?: boolean;
  }>;

  // Participant operations
  addParticipant: (participantData: Omit<Participant, 'id' | 'registrationDate'>) => Promise<Participant>;
  updateParticipantStatus: (participantId: string, status: Participant['status']) => Promise<Participant>;
  removeParticipant: (participantId: string) => Promise<{ message: string }>;

  // Export operations
  exportRegistrations: () => Promise<Blob>;

  // Utility functions
  clearError: () => void;
  refreshData: () => Promise<void>;
}

export function useEventManagement(): UseEventManagementReturn {
  const [state, setState] = useState<UseEventManagementState>({
    events: [],
    currentEvent: null,
    participants: [],
    eventStats: null,
    isLoading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Create event
  const createEvent = useCallback(async (data: {
    name: string;
    event_code: string;
    description: string;
    starts_at: string;
    ends_at: string;
    selectedChallenges?: string[];
  }): Promise<{ message: string; event: EventData }> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await eventsAPI.createEvent(data);
      
      // Refresh events list to get the new event
      await fetchEvents({ page: state.currentPage });
      
      // Map BackendEventData to EventData
      const mappedEvent: EventData = {
        id: result.event.id,
        eventCode: result.event.event_code,
        eventName: result.event.name,
        startDate: result.event.starts_at,
        endDate: result.event.ends_at,
        description: result.event.description || '',
        maxParticipants: 0, // Not available in BackendEventData
        registrationStatus: 'Open' as const,
        createdAt: result.event.created_at,
        updatedAt: result.event.updated_at || result.event.created_at,
        isActive: result.event.is_active || false,
        isUpcoming: result.event.is_upcoming || false,
        isPast: result.event.is_past || false,
        totalChallenges: result.event.total_challenges || 0
      };
      
      return {
        message: result.message,
        event: mappedEvent
      };
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to create event';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [state.currentPage]);

  // Update event
  const updateEvent = useCallback(async (data: UpdateEventRequest): Promise<{ message: string; event: EventData }> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await eventsAPI.updateEvent(data);
      
      // Update current event if it's the one being updated
      if (state.currentEvent) {
        setState(prev => ({
          ...prev,
          currentEvent: { ...prev.currentEvent!, ...result.event }
        }));
      }
      
      // Refresh events list
      await fetchEvents({ page: state.currentPage });
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to update event';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [state.currentEvent, state.currentPage]);

  // Delete event
  const deleteEvent = useCallback(async (eventId: string): Promise<{ message: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await eventsAPI.deleteEvent(eventId);
      
      // Remove from events list
      setState(prev => ({
        ...prev,
        events: prev.events.filter(event => event.id !== eventId)
      }));
      
      // Clear current event if it's the one being deleted
      if (state.currentEvent?.id === eventId) {
        setState(prev => ({ ...prev, currentEvent: null }));
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to delete event';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [state.currentEvent]);

  // Fetch events with pagination
  const fetchEvents = useCallback(async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    status?: 'active' | 'inactive' | 'upcoming' | 'past';
    ordering?: string;
  }): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await eventsAPI.getEventData();
      
      // Handle paginated response
      if (response.results) {
        const events: EventData[] = response.results.map(backendEvent => ({
          id: backendEvent.id,
          eventCode: backendEvent.event_code,
          eventName: backendEvent.name,
          description: backendEvent.description,
          startDate: backendEvent.starts_at,
          endDate: backendEvent.ends_at,
          maxParticipants: 500, // Default value
          registrationStatus: backendEvent.is_active ? 'Open' as const : 'Closed' as const,
          createdAt: backendEvent.created_at,
          updatedAt: backendEvent.updated_at || backendEvent.created_at,
          isActive: backendEvent.is_active,
          isUpcoming: backendEvent.is_upcoming,
          isPast: backendEvent.is_past,
          totalChallenges: backendEvent.total_challenges
        }));
        
        setState(prev => ({
          ...prev,
          events,
          totalCount: response.count || events.length,
          currentPage: params?.page || 1,
          hasNextPage: !!response.next,
          hasPreviousPage: !!response.previous
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to fetch events';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch current event data
  const fetchEventData = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await eventsAPI.getEventData();
      
      if (response.results && response.results.length > 0) {
        const event = response.results[0];
        const mappedEvent: EventData = {
          id: event.id,
          eventCode: event.event_code,
          eventName: event.name,
          description: event.description,
          startDate: event.starts_at,
          endDate: event.ends_at,
          maxParticipants: 500,
          registrationStatus: event.is_active ? 'Open' as const : 'Closed' as const,
          createdAt: event.created_at,
          updatedAt: event.updated_at || event.created_at,
          isActive: event.is_active,
          isUpcoming: event.is_upcoming,
          isPast: event.is_past,
          totalChallenges: event.total_challenges
        };
        
        setState(prev => ({ ...prev, currentEvent: mappedEvent }));
      }
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to fetch event data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch event statistics
  const fetchEventStats = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const stats = await eventsAPI.getEventStats();
      setState(prev => ({ ...prev, eventStats: stats }));
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to fetch event statistics';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch participants
  const fetchParticipants = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const participants = await eventsAPI.getParticipants();
      setState(prev => ({ ...prev, participants }));
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to fetch participants';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch participants for a specific event
  const fetchEventParticipants = useCallback(async (eventId: string): Promise<Participant[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await eventsAPI.getEventParticipants(eventId);
      
      // Map the API response to our Participant interface
      const participants: Participant[] = response.data.participants?.map(participant => ({
        id: participant.id,
        name: participant.user_name,
        email: participant.user_email,
        organization: '', // Not provided in API response
        registrationDate: participant.registered_at,
        status: participant.status === 'active' ? 'Confirmed' : 'Pending',
        teamId: '', // Not available in API response
        teamName: 'No Team' // Not available in API response
      })) || [];
      
      setState(prev => ({ ...prev, participants }));
      return participants;
    } catch (error) {
      // Return empty array instead of throwing error when no participants found
      // This allows the UI to handle the empty state gracefully
      setState(prev => ({ ...prev, participants: [] }));
      
      // Only throw error for actual API failures, not for "no participants" scenarios
      if (error instanceof APIError && error.status === 404) {
        // 404 means no participants found, return empty array
        return [];
      }
      
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to fetch event participants';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate event code
  const generateEventCode = useCallback(async (eventData: {
    name: string;
    starts_at: string;
    ends_at: string;
    event_code?: string;
  }): Promise<{ message: string; eventCode: string; event: EventData }> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await eventsAPI.generateEventCode(eventData);
      return result;
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to generate event code';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate code preview
  const generateCodePreview = useCallback(async (name: string): Promise<{ 
    event_name: string; 
    preview_code: string; 
    message: string; 
  }> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await eventsAPI.generateCodePreview(name);
      return result;
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to generate code preview';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Validate event code
  const validateEventCode = useCallback(async (eventCode: string): Promise<{
    success: boolean;
    message: string;
    valid: boolean;
    event_id?: string;
    event_code?: string;
    event_name?: string;
    event_description?: string;
    starts_at?: string;
    ends_at?: string;
    is_upcoming?: boolean;
  }> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await eventsAPI.validateEventCode(eventCode);
      return result;
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to validate event code';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add participant
  const addParticipant = useCallback(async (participantData: Omit<Participant, 'id' | 'registrationDate'>): Promise<Participant> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await eventsAPI.addParticipant(participantData);
      
      // Refresh participants list
      await fetchParticipants();
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to add participant';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchParticipants]);

  // Update participant status
  const updateParticipantStatus = useCallback(async (participantId: string, status: Participant['status']): Promise<Participant> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await eventsAPI.updateParticipantStatus(participantId, status);
      
      // Update participants list
      setState(prev => ({
        ...prev,
        participants: prev.participants.map(p => 
          p.id === participantId ? { ...p, status } : p
        )
      }));
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to update participant status';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove participant
  const removeParticipant = useCallback(async (participantId: string): Promise<{ message: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await eventsAPI.removeParticipant(participantId);
      
      // Remove from participants list
      setState(prev => ({
        ...prev,
        participants: prev.participants.filter(p => p.id !== participantId)
      }));
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to remove participant';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Export registrations
  const exportRegistrations = useCallback(async (): Promise<Blob> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await eventsAPI.exportRegistrations();
      return result;
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to export registrations';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchEvents({ page: state.currentPage }),
      fetchEventData(),
      fetchEventStats(),
      fetchParticipants()
    ]);
  }, [fetchEvents, fetchEventData, fetchEventStats, fetchParticipants, state.currentPage]);

  return {
    ...state,
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
    clearError,
    refreshData
  };
}
