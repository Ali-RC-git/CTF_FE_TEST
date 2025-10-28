import { useState, useCallback } from 'react';
import { APIError } from '@/lib/api';
import toast from 'react-hot-toast';

export interface FormErrors {
  [key: string]: string[];
}

export interface UseFormValidationReturn {
  errors: FormErrors;
  setErrors: (errors: FormErrors) => void;
  clearErrors: () => void;
  clearFieldError: (field: string) => void;
  handleApiError: (error: any) => void;
  hasErrors: boolean;
  getFieldError: (field: string) => string | null;
}

export function useFormValidation(): UseFormValidationReturn {
  const [errors, setErrors] = useState<FormErrors>({});

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const handleApiError = useCallback((error: any) => {
    if (error instanceof APIError) {
      // Handle API validation errors
      if (error.details && typeof error.details === 'object') {
        const formErrors: FormErrors = {};
        
        // Map backend field names to frontend field names
        const fieldMapping: { [key: string]: string } = {
          'first_name': 'first_name',
          'last_name': 'last_name',
          'email': 'email',
          'username': 'username',
          'password': 'password',
          'password_confirm': 'password_confirm',
          'role': 'role',
          'status': 'status',
          'institution': 'institution',
          'department': 'department',
          'team_id': 'team',
          'team_role': 'team_role'
        };

        Object.keys(error.details).forEach(backendField => {
          const frontendField = fieldMapping[backendField] || backendField;
          if (Array.isArray(error.details[backendField])) {
            // Improve error messages for better user experience
            const improvedErrors = error.details[backendField].map((errMsg: string) => {
              // Common error message improvements
              if (errMsg.includes('This field may not be blank')) {
                return `${frontendField.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} is required.`;
              }
              if (errMsg.includes('Enter a valid email address')) {
                return 'Please enter a valid email address.';
              }
              if (errMsg.includes('A user with that username already exists')) {
                return 'This username is already taken. Please choose a different one.';
              }
              if (errMsg.includes('A user with that email already exists')) {
                return 'This email address is already registered. Please use a different email.';
              }
              if (errMsg.includes('is not a valid choice')) {
                return `Please select a valid ${frontendField.replace('_', ' ')}.`;
              }
              if (errMsg.includes('Ensure this field has at least')) {
                return `Password does not meet the minimum requirements.`;
              }
              if (errMsg.includes('This password is too common')) {
                return 'This password is too common. Please choose a stronger password.';
              }
              if (errMsg.includes('This password is entirely numeric')) {
                return 'Password cannot be entirely numeric. Please include letters.';
              }
              if (errMsg.includes('Team is full')) {
                return 'The selected team is full. Please choose a different team.';
              }
              if (errMsg.includes('Team does not exist')) {
                return 'The selected team does not exist.';
              }
              if (errMsg.includes('Team is inactive')) {
                return 'The selected team is not active.';
              }
                  if (errMsg.includes('Only one leader per team')) {
                    return 'This team already has a leader. Please select "Member" role.';
                  }
                  if (errMsg.includes('duplicate key value violates unique constraint') && errMsg.includes('team_members')) {
                    return 'This user is already a member of the selected team.';
                  }
                  return errMsg;
            });
            formErrors[frontendField] = improvedErrors;
          }
        });

        setErrors(formErrors);
        
        // Show toast notifications for each field error
        Object.keys(formErrors).forEach(field => {
          formErrors[field].forEach(message => {
            toast.error(`${field.replace('_', ' ')}: ${message}`);
          });
        });
      } else {
        // Handle general API errors
        setErrors({ general: [error.message] });
        toast.error(error.message);
      }
    } else {
      // Handle other errors
      setErrors({ general: ['An unexpected error occurred. Please try again.'] });
      toast.error('An unexpected error occurred. Please try again.');
    }
  }, []);

  const hasErrors = Object.keys(errors).length > 0;

  const getFieldError = useCallback((field: string): string | null => {
    return errors[field]?.[0] || null;
  }, [errors]);

  return {
    errors,
    setErrors,
    clearErrors,
    clearFieldError,
    handleApiError,
    hasErrors,
    getFieldError
  };
}
