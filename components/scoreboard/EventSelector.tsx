'use client';

import { useEffect } from 'react';
import { useActiveEvents } from '@/lib/hooks/useScoreboard';

interface EventSelectorProps {
  selectedEventId: string | null;
  onEventSelect: (eventId: string) => void;
  placeholder?: string;
  className?: string;
}

export default function EventSelector({
  selectedEventId,
  onEventSelect,
  placeholder = "Select an event...",
  className = "",
  isAdminView = false
}: EventSelectorProps & { isAdminView?: boolean }) {
  const { events, loading, error, isAdmin } = useActiveEvents(isAdminView);

  // Auto-select first event if none selected and events are available
  useEffect(() => {
    if (!selectedEventId && events.length > 0) {
      onEventSelect(events[0].id);
    }
  }, [selectedEventId, events, onEventSelect]);

  if (error) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        Error loading events: {error}
      </div>
    );
  }

  if (loading) {
    return (
      <select disabled className={`w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-secondary ${className}`}>
        <option>Loading events...</option>
      </select>
    );
  }

  if (events.length === 0) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        No active events available
      </div>
    );
  }

  return (
    <select
      value={selectedEventId || ''}
      onChange={(e) => onEventSelect(e.target.value)}
      className={`w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color transition-colors ${className}`}
    >
      <option value="">{placeholder}</option>
      {events.map((event) => (
        <option key={event.id} value={event.id}>
          {event.eventName} ({event.eventCode})
          {event.totalTeams > 0 && ` - ${event.totalTeams} teams`}
          {event.hasScoreboard ? ' 📊' : ' ❌'}
          {event.isScoreboardFrozen ? ' 🧊' : ''}
          {!event.isActive && ' - INACTIVE'}
        </option>
      ))}
    </select>
  );
}
