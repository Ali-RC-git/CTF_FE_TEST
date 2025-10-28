/**
 * Event utility functions
 */

export interface Event {
  id: string;
  event_code: string;
  name: string;
  description: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  is_upcoming: boolean;
  is_past: boolean;
}

export interface UserProfile {
  events: Event[];
  total_events: number;
}

// Extended interface for the actual profile structure from API
export interface UserProfileWithEvents {
  profile: {
    events: Event[];
    total_events: number;
  };
}

// Interface for the actual user structure with events at top level
export interface UserWithEvents {
  events: Event[];
  total_events: number;
}

/**
 * Check if user has any events (regardless of status)
 * @param userProfile - User profile data
 * @returns boolean - true if user has any events
 */
export function hasAnyEvents(userProfile: UserProfile | UserProfileWithEvents | UserWithEvents | null): boolean {
  if (!userProfile) {
    return false;
  }

  // Handle different data structures
  let events, total_events;
  
  if ('profile' in userProfile && userProfile.profile) {
    // Nested structure: { profile: { events: [], total_events: 1 } }
    events = userProfile.profile.events;
    total_events = userProfile.profile.total_events;
  } else if ('events' in userProfile) {
    // Direct structure: { events: [], total_events: 1 }
    events = userProfile.events;
    total_events = userProfile.total_events;
  } else {
    return false;
  }
  
  if (!events || events.length === 0) {
    return false;
  }

  return total_events > 0;
}

/**
 * Check if user has any ongoing events (event is currently active)
 * @param userProfile - User profile data
 * @returns boolean - true if user has ongoing events
 */
export function hasOngoingEvents(userProfile: UserProfile | UserProfileWithEvents | UserWithEvents | null): boolean {
  if (!userProfile) {
    return false;
  }

  // Handle different data structures
  let events;
  
  if ('profile' in userProfile && userProfile.profile) {
    // Nested structure: { profile: { events: [], total_events: 1 } }
    events = userProfile.profile.events;
  } else if ('events' in userProfile) {
    // Direct structure: { events: [], total_events: 1 }
    events = userProfile.events;
  } else {
    return false;
  }
  
  if (!events || events.length === 0) {
    return false;
  }

  const now = new Date();
  
  // Check if any event is currently ongoing based on timestamps
  return events.some(event => {
    const startTime = new Date(event.starts_at);
    const endTime = new Date(event.ends_at);
    return now >= startTime && now <= endTime;
  });
}

/**
 * Check if user has upcoming events (event hasn't started yet)
 * @param userProfile - User profile data
 * @returns boolean - true if user has upcoming events
 */
export function hasUpcomingEvents(userProfile: UserProfile | UserProfileWithEvents | UserWithEvents | null): boolean {
  if (!userProfile) {
    return false;
  }

  // Handle different data structures
  let events;
  
  if ('profile' in userProfile && userProfile.profile) {
    // Nested structure: { profile: { events: [], total_events: 1 } }
    events = userProfile.profile.events;
  } else if ('events' in userProfile) {
    // Direct structure: { events: [], total_events: 1 }
    events = userProfile.events;
  } else {
    return false;
  }
  
  if (!events || events.length === 0) {
    return false;
  }

  const now = new Date();
  
  // Check if any event is upcoming (not started yet)
  return events.some(event => {
    const startTime = new Date(event.starts_at);
    return now < startTime;
  });
}

