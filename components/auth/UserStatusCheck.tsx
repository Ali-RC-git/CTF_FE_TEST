'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface EventData {
  event_id: string;
  event_code: string;
  event_name: string;
  event_description?: string;
  starts_at: string;
  ends_at: string;
  is_upcoming: boolean;
}

interface UserStatusCheckProps {
  onUserStatusCheck: (email: string) => void;
  onBack: () => void;
  isLoading: boolean;
  selectedEvent: EventData | null;
}

export default function UserStatusCheck({
  onUserStatusCheck,
  onBack,
  isLoading,
  selectedEvent
}: UserStatusCheckProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setError(null);
    onUserStatusCheck(email.trim());
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
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
          <span className="text-xl sm:text-2xl">🔍</span>
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-2">
          Check Your Status
        </h2>
        <p className="text-text-secondary text-xs sm:text-sm">
          {selectedEvent 
            ? `Enter your email to check if you're already registered for this event.`
            : 'Enter your email to check your account status.'
          }
        </p>
      </div>

      {/* Event Information Display */}
      {selectedEvent && (
        <div className="bg-accent-color bg-opacity-10 border border-accent-color rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-accent-color rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">🎯</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-accent-color mb-1">
                {selectedEvent.event_name}
              </h3>
              {selectedEvent.event_description && (
                <p className="text-text-secondary text-sm mb-2">
                  {selectedEvent.event_description}
                </p>
              )}
              <div className="text-text-secondary text-xs space-y-1">
                <p><strong>Event Code:</strong> {selectedEvent.event_code}</p>
                <p><strong>Starts:</strong> {formatDate(selectedEvent.starts_at)}</p>
                <p><strong>Status:</strong> {selectedEvent.is_upcoming ? 'Upcoming' : 'Active'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={handleEmailChange}
          error={error || undefined}
          placeholder="Enter your email address"
          disabled={isLoading}
        />

        <div className="space-y-3">
          <Button
            type="submit"
            disabled={!email.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? 'Checking...' : 'Check Status'}
          </Button>

          <Button
            type="button"
            onClick={onBack}
            className="w-full bg-secondary-bg text-text-primary hover:bg-secondary-bg/80 border border-border-color"
            disabled={isLoading}
          >
            Back
          </Button>
        </div>
      </form>

      {/* Help Text */}
      <div className="text-center mt-4">
        <p className="text-text-secondary text-xs">
          {selectedEvent 
            ? "If you're already registered, you'll be automatically logged in. If not, we'll guide you through the registration process."
            : "We'll check if you have an existing account or help you create a new one."
          }
        </p>
      </div>
    </div>
  );
}

