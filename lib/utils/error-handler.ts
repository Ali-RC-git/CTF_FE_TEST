/**
 * Centralized Error Handling Utility
 * 
 * This module provides utilities for handling backend validation errors
 * and transforming them into user-friendly error messages.
 */

export interface BackendValidationError {
  [field: string]: string[];
}

export interface FieldError {
  field: string;
  messages: string[];
}

export interface ProcessedError {
  fieldErrors: FieldError[];
  generalError?: string;
  hasFieldErrors: boolean;
}

/**
 * Processes backend validation errors into a structured format
 * @param error - The error response from the backend
 * @returns Processed error with field-specific and general errors
 */
export function processBackendError(error: any): ProcessedError {
  // Handle different error response formats
  if (typeof error === 'string') {
    return {
      fieldErrors: [],
      generalError: error,
      hasFieldErrors: false
    };
  }

  // Handle validation errors (field-specific)
  if (error && typeof error === 'object') {
    const fieldErrors: FieldError[] = [];
    let generalError: string | undefined;

    // Check if it's a validation error object
    if (isValidationError(error)) {
      Object.entries(error).forEach(([field, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          fieldErrors.push({
            field,
            messages: messages.map(msg => formatErrorMessage(field, msg))
          });
        }
      });

      return {
        fieldErrors,
        generalError,
        hasFieldErrors: fieldErrors.length > 0
      };
    }

    // Handle other error formats
    if (error.message) {
      generalError = error.message;
    } else if (error.detail) {
      generalError = error.detail;
    } else if (error.error) {
      generalError = error.error;
    } else {
      generalError = 'An unexpected error occurred';
    }

    return {
      fieldErrors: [],
      generalError: generalError,
      hasFieldErrors: false
    };
  }

  return {
    fieldErrors: [],
    generalError: 'An unexpected error occurred',
    hasFieldErrors: false
  };
}

/**
 * Checks if the error is a validation error object
 * @param error - The error object to check
 * @returns True if it's a validation error
 */
function isValidationError(error: any): error is BackendValidationError {
  if (!error || typeof error !== 'object') {
    return false;
  }

  // Check if all values are arrays of strings (validation error format)
  return Object.values(error).every(value => 
    Array.isArray(value) && value.every(item => typeof item === 'string')
  );
}

/**
 * Formats error messages to be more user-friendly
 * @param field - The field name
 * @param message - The error message
 * @returns Formatted error message
 */
function formatErrorMessage(field: string, message: string): string {
  // Convert field names to user-friendly labels
  const fieldLabels: Record<string, string> = {
    email: 'Email address',
    username: 'Username',
    password: 'Password',
    password_confirm: 'Confirm password',
    first_name: 'First name',
    last_name: 'Last name',
    institution: 'Institution',
    department: 'Department',
    team_name: 'Team name',
    team_code: 'Team code',
    description: 'Description'
  };

  const fieldLabel = fieldLabels[field] || field.replace(/_/g, ' ');

  // Format common error messages
  const formattedMessage = message
    .replace(/This field is required\./g, `${fieldLabel} is required.`)
    .replace(/This field cannot be blank\./g, `${fieldLabel} cannot be blank.`)
    .replace(/Enter a valid email address\./g, 'Please enter a valid email address.')
    .replace(/This password is too common\./g, 'This password is too common. Please choose a stronger password.')
    .replace(/This password is entirely numeric\./g, 'Password cannot be entirely numeric.')
    .replace(/This password is too short\./g, 'Password is too short.')
    .replace(/This password is too similar to your other personal information\./g, 'Password is too similar to your personal information.')
    .replace(/The two password fields didn't match\./g, 'Passwords do not match.')
    .replace(/User with this email already exists\./g, 'An account with this email address already exists.')
    .replace(/User with this username already exists\./g, 'This username is already taken.')
    .replace(/Team with this name already exists\./g, 'A team with this name already exists.')
    .replace(/Invalid team code\./g, 'The team code you entered is invalid.')
    .replace(/You are already a member of this team\./g, 'You are already a member of this team.')
    .replace(/Team is full\./g, 'This team is full and cannot accept new members.');

  return formattedMessage;
}

/**
 * Gets the first error message for a specific field
 * @param fieldErrors - Array of field errors
 * @param fieldName - The field name to get error for
 * @returns The first error message for the field, or undefined
 */
export function getFieldError(fieldErrors: FieldError[], fieldName: string): string | undefined {
  const fieldError = fieldErrors.find(error => error.field === fieldName);
  return fieldError?.messages[0];
}

/**
 * Gets all error messages for a specific field
 * @param fieldErrors - Array of field errors
 * @param fieldName - The field name to get errors for
 * @returns Array of error messages for the field
 */
export function getFieldErrors(fieldErrors: FieldError[], fieldName: string): string[] {
  const fieldError = fieldErrors.find(error => error.field === fieldName);
  return fieldError?.messages || [];
}

/**
 * Checks if a specific field has errors
 * @param fieldErrors - Array of field errors
 * @param fieldName - The field name to check
 * @returns True if the field has errors
 */
export function hasFieldError(fieldErrors: FieldError[], fieldName: string): boolean {
  return fieldErrors.some(error => error.field === fieldName);
}

/**
 * Creates a user-friendly error message from field errors
 * @param fieldErrors - Array of field errors
 * @returns Formatted error message
 */
export function createErrorMessage(fieldErrors: FieldError[]): string {
  if (fieldErrors.length === 0) {
    return '';
  }

  if (fieldErrors.length === 1) {
    return fieldErrors[0].messages[0];
  }

  const fieldNames = fieldErrors.map(error => error.field).join(', ');
  return `Please fix the following fields: ${fieldNames}`;
}

/**
 * Error types for different scenarios
 */
export enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

/**
 * Determines the error type based on the error response
 * @param error - The error response
 * @returns The error type
 */
export function getErrorType(error: any): ErrorType {
  if (typeof error === 'string') {
    return ErrorType.UNKNOWN;
  }

  if (error && typeof error === 'object') {
    // Check for validation errors
    if (isValidationError(error)) {
      return ErrorType.VALIDATION;
    }

    // Check for HTTP status codes
    if (error.status) {
      switch (error.status) {
        case 400:
          return ErrorType.VALIDATION;
        case 401:
          return ErrorType.AUTHENTICATION;
        case 403:
          return ErrorType.AUTHORIZATION;
        case 404:
          return ErrorType.NOT_FOUND;
        case 500:
        case 502:
        case 503:
          return ErrorType.SERVER;
        default:
          return ErrorType.UNKNOWN;
      }
    }

    // Check for network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return ErrorType.NETWORK;
    }
  }

  return ErrorType.UNKNOWN;
}

/**
 * Gets a user-friendly error message based on error type
 * @param errorType - The type of error
 * @returns User-friendly error message
 */
export function getErrorMessageByType(errorType: ErrorType): string {
  switch (errorType) {
    case ErrorType.VALIDATION:
      return 'Please check your input and try again.';
    case ErrorType.NETWORK:
      return 'Network error. Please check your connection and try again.';
    case ErrorType.AUTHENTICATION:
      return 'Authentication failed. Please log in again.';
    case ErrorType.AUTHORIZATION:
      return 'You do not have permission to perform this action.';
    case ErrorType.NOT_FOUND:
      return 'The requested resource was not found.';
    case ErrorType.SERVER:
      return 'Server error. Please try again later.';
    case ErrorType.UNKNOWN:
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}
