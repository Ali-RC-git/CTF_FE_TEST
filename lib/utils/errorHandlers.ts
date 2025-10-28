import { APIError } from '@/lib/api';

export interface ErrorHandlerOptions {
  showError: (message: string) => void;
  fallbackMessage?: string;
}

/**
 * Handles team creation errors dynamically
 * @param error - The error object
 * @param options - Error handling options
 */
export function handleTeamCreationError(error: any, options: ErrorHandlerOptions) {
  const { showError, fallbackMessage = 'Failed to create team. Please try again.' } = options;

  if (error instanceof APIError) {
    // Handle specific field errors dynamically
    if (error.details) {
      // Handle event_code errors
      if (error.details.event_code && Array.isArray(error.details.event_code)) {
        const eventCodeError = error.details.event_code[0];
        if (eventCodeError.includes('Invalid event code')) {
          showError('Invalid event code. Please check the event code and try again.');
        } else if (eventCodeError.includes('Cannot create team for an event that has already started')) {
          showError('Cannot create team for an event that has already started. Please check the event schedule.');
        } else if (eventCodeError.includes('Event not found')) {
          showError('Event not found. Please check the event code and try again.');
        } else if (eventCodeError.includes('Event registration closed')) {
          showError('Event registration is closed. Please check the event schedule.');
        } else {
          // Show the actual error message from the server
          showError(eventCodeError);
        }
        return;
      }

      // Handle team name errors
      if (error.details.name && Array.isArray(error.details.name)) {
        showError(error.details.name[0]);
        return;
      }

      // Handle description errors
      if (error.details.description && Array.isArray(error.details.description)) {
        showError(error.details.description[0]);
        return;
      }

      // Handle max_size errors
      if (error.details.max_size && Array.isArray(error.details.max_size)) {
        showError(error.details.max_size[0]);
        return;
      }

      // Handle min_size errors
      if (error.details.min_size && Array.isArray(error.details.min_size)) {
        showError(error.details.min_size[0]);
        return;
      }

      // Handle is_invite_only errors
      if (error.details.is_invite_only && Array.isArray(error.details.is_invite_only)) {
        showError(error.details.is_invite_only[0]);
        return;
      }
    }

    // Handle HTTP status errors
    if (error.status === 404) {
      showError('Team creation endpoint not found. Please check if the backend server is running and the API URL is correct.');
    } else if (error.status === 500) {
      showError('Server error occurred while creating team. Please try again.');
    } else if (error.status === 401) {
      showError('Authentication failed. Please log in again.');
    } else if (error.status === 403) {
      showError('You do not have permission to create teams.');
    } else if (error.status === 0 || error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
      showError('Unable to connect to the server. Please ensure the backend server is running on http://127.0.0.1:8000');
    } else {
      showError(error.message || fallbackMessage);
    }
  } else {
    showError(fallbackMessage);
  }
}

/**
 * Handles generic API errors dynamically
 * @param error - The error object
 * @param options - Error handling options
 */
export function handleAPIError(error: any, options: ErrorHandlerOptions) {
  const { showError, fallbackMessage = 'An error occurred. Please try again.' } = options;

  if (error instanceof APIError) {
    // Handle specific field errors dynamically
    if (error.details) {
      // Get the first error from any field
      const errorFields = Object.keys(error.details);
      for (const field of errorFields) {
        if (error.details[field] && Array.isArray(error.details[field])) {
          showError(error.details[field][0]);
          return;
        }
      }
    }

    // Handle HTTP status errors
    if (error.status === 404) {
      showError('Resource not found. Please check your request and try again.');
    } else if (error.status === 500) {
      showError('Server error occurred. Please try again.');
    } else if (error.status === 401) {
      showError('Authentication failed. Please log in again.');
    } else if (error.status === 403) {
      showError('You do not have permission to perform this action.');
    } else if (error.status === 0 || error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
      showError('Unable to connect to the server. Please check your internet connection.');
    } else {
      showError(error.message || fallbackMessage);
    }
  } else {
    showError(fallbackMessage);
  }
}
