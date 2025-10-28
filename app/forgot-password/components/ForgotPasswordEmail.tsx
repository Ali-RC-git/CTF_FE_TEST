"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authAPI } from '@/lib/api/auth';
import { APIError } from '@/lib/api/client';
import { useToast } from '@/lib/hooks/useToast';
import { useFormErrors } from '@/lib/hooks/useFormErrors';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordEmailProps {
  onSuccess: (email: string) => void;
  onBack: () => void;
}

export function ForgotPasswordEmail({ onSuccess, onBack }: ForgotPasswordEmailProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();
  const { setError: setFormError } = useFormErrors();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.forgotPassword({
        email: data.email,
      });

      if (response.success) {
        showSuccess(response.message || 'Password reset OTP sent to your email address.');
        onSuccess(data.email);
      } else {
        showError(response.message || 'Failed to send password reset OTP.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error instanceof APIError) {
        // Handle field validation errors in format: { "field": ["error1", "error2"] }
        if (error.details && error.details.detail) {
          if (typeof error.details.detail === 'object' && !Array.isArray(error.details.detail)) {
            const fieldErrors = error.details.detail;
            let hasFieldErrors = false;
            
            // Check if it's field validation errors (object with field names as keys)
            Object.keys(fieldErrors).forEach(fieldName => {
              if (Array.isArray(fieldErrors[fieldName])) {
                hasFieldErrors = true;
                // Set field-specific errors
                fieldErrors[fieldName].forEach((message: string) => {
                  setError(fieldName as keyof ForgotPasswordFormData, { 
                    type: 'manual',
                    message 
                  });
                });
              }
            });
            
            if (hasFieldErrors) {
              // Show a general message about validation errors
              showError('Please correct the errors below and try again.', { duration: 6000 });
            } else if (fieldErrors.non_field_errors && Array.isArray(fieldErrors.non_field_errors)) {
              // Handle non_field_errors
              fieldErrors.non_field_errors.forEach((message: string) => {
                showError(message, { duration: 6000 });
              });
            } else if (typeof fieldErrors === 'string') {
              // Handle simple string error
              showError(fieldErrors, { duration: 6000 });
            } else {
              // Handle other detail formats
              showError(error.message, { duration: 6000 });
            }
          } else if (Array.isArray(error.details.detail)) {
            // Handle array of errors
            error.details.detail.forEach((message: string) => {
              showError(message, { duration: 6000 });
            });
          } else if (typeof error.details.detail === 'string') {
            // Handle simple string error
            showError(error.details.detail, { duration: 6000 });
          } else {
            // Handle other detail formats
            showError(error.message, { duration: 6000 });
          }
        } else if (error.details && typeof error.details === 'object' && 'errors' in error.details) {
          // Handle legacy field-specific errors format
          Object.entries(error.details.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              setError(field as keyof ForgotPasswordFormData, { 
                type: 'manual',
                message: messages[0] 
              });
            }
          });
          showError('Please correct the errors below and try again.', { duration: 6000 });
        } else {
          showError(error.message || 'Failed to send password reset OTP.', { duration: 6000 });
        }
      } else {
        showError('An unexpected error occurred. Please try again.', { duration: 6000 });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Forgot Password?</h2>
        <p className="text-text-secondary">
          Enter your email address and we'll send you a code to reset your password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-text-primary">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            placeholder="Enter your email address"
            className="w-full p-3 rounded-lg bg-secondary-bg border border-border-color text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent-color text-white py-3 px-4 rounded-lg font-medium hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent-color focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send Reset Code'}
          </button>

          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="w-full text-text-secondary hover:text-text-primary py-2 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-accent-color focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}
