/**
 * Custom hook for handling form errors from API responses
 */

import { useState, useCallback } from 'react';
import { APIError } from '@/lib/api/client';
import { FieldError } from '@/lib/utils/error-handler';

export interface FormErrorState {
  fieldErrors: FieldError[];
  generalError: string | null;
  hasFieldErrors: boolean;
}

export interface UseFormErrorsReturn {
  errors: FormErrorState;
  setError: (error: APIError | Error | string) => void;
  clearErrors: () => void;
  getFieldError: (fieldName: string) => string | undefined;
  hasFieldError: (fieldName: string) => boolean;
  getGeneralError: () => string | null;
}

/**
 * Custom hook for managing form errors from API responses
 * @returns Object with error state and utility functions
 */
export function useFormErrors(): UseFormErrorsReturn {
  const [errors, setErrors] = useState<FormErrorState>({
    fieldErrors: [],
    generalError: null,
    hasFieldErrors: false
  });

  const setError = useCallback((error: APIError | Error | string) => {
    if (typeof error === 'string') {
      setErrors({
        fieldErrors: [],
        generalError: error,
        hasFieldErrors: false
      });
      return;
    }

    if (error instanceof APIError) {
      setErrors({
        fieldErrors: error.getFieldErrors(),
        generalError: error.getGeneralError() || null,
        hasFieldErrors: error.isValidationError()
      });
      return;
    }

    // Handle generic Error objects
    setErrors({
      fieldErrors: [],
      generalError: error.message,
      hasFieldErrors: false
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({
      fieldErrors: [],
      generalError: null,
      hasFieldErrors: false
    });
  }, []);

  const getFieldError = useCallback((fieldName: string): string | undefined => {
    const fieldError = errors.fieldErrors.find(error => error.field === fieldName);
    return fieldError?.messages[0];
  }, [errors.fieldErrors]);

  const hasFieldError = useCallback((fieldName: string): boolean => {
    return errors.fieldErrors.some(error => error.field === fieldName);
  }, [errors.fieldErrors]);

  const getGeneralError = useCallback((): string | null => {
    return errors.generalError;
  }, [errors.generalError]);

  return {
    errors,
    setError,
    clearErrors,
    getFieldError,
    hasFieldError,
    getGeneralError
  };
}
