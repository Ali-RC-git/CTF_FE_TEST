'use client';

import { useState } from 'react';
import { eventsAPI } from '@/lib/api/events';

interface EventCodeValidationProps {
  onEventCodeValidated: (eventData: {
    event_id: string;
    event_code: string;
    event_name: string;
    event_description?: string;
    starts_at: string;
    ends_at: string;
    is_upcoming: boolean;
  }) => void;
  onSkip: () => void;
}

export default function EventCodeValidation({
  onEventCodeValidated,
  onSkip
}: EventCodeValidationProps) {
  const [eventCode, setEventCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validatedEvent, setValidatedEvent] = useState<any>(null);

  const handleValidateEventCode = async () => {
    if (!eventCode.trim()) {
      setError('Please enter an event code');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const response = await eventsAPI.validateEventCode(eventCode.trim());

      if (response.success && response.valid) {
        setValidatedEvent(response);
        onEventCodeValidated({
          event_id: response.event_id!,
          event_code: response.event_code!,
          event_name: response.event_name!,
          event_description: response.event_description,
          starts_at: response.starts_at!,
          ends_at: response.ends_at!,
          is_upcoming: response.is_upcoming!
        });
      } else {
        setError(response.message || 'Invalid event code');
      }
    } catch (error: any) {
      console.error('Event code validation failed:', error);
      setError(error.message || 'Failed to validate event code. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleValidateEventCode();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-md mx-auto bg-card-bg rounded-xl p-4 sm:p-6 border border-border-color shadow-lg">
      <div className="text-center mb-4 sm:mb-6">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent-color bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <span className="text-xl sm:text-2xl">🎯</span>
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-2">
          Join an Event
        </h2>
        <p className="text-text-secondary text-xs sm:text-sm">
          Enter an event code to register for a specific CTF event, or skip to create a general account.
        </p>
      </div>

      <div className="space-y-4">
        {/* Event Code Input */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Event Code
          </label>
          <input
            type="text"
            value={eventCode}
            onChange={(e) => {
              setEventCode(e.target.value.toUpperCase());
              setError(null);
            }}
            onKeyPress={handleKeyPress}
            placeholder="e.g., CRDF-ICS-2024-001"
            className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary font-mono text-center focus:outline-none focus:ring-2 focus:ring-accent-color"
            disabled={isValidating}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Validated Event Info */}
        {validatedEvent && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm">✓</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-800 mb-1">
                  {validatedEvent.event_name}
                </h3>
                {validatedEvent.event_description && (
                  <p className="text-green-700 text-sm mb-2">
                    {validatedEvent.event_description}
                  </p>
                )}
                <div className="text-green-700 text-xs space-y-1">
                  <p><strong>Code:</strong> {validatedEvent.event_code}</p>
                  <p><strong>Starts:</strong> {formatDate(validatedEvent.starts_at)}</p>
                  <p><strong>Ends:</strong> {formatDate(validatedEvent.ends_at)}</p>
                  <p><strong>Status:</strong> {validatedEvent.is_upcoming ? 'Upcoming' : 'Active'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleValidateEventCode}
            disabled={!eventCode.trim() || isValidating}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Validating...
              </>
            ) : (
              <>
                <span>🔍</span>
                Validate Event Code
              </>
            )}
          </button>

          <button
            onClick={onSkip}
            className="w-full btn-secondary"
            disabled={isValidating}
          >
            Skip - Create General Account
          </button>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-text-secondary text-xs">
            Don't have an event code? You can still create an account and join events later.
          </p>
        </div>
      </div>
    </div>
  );
}
