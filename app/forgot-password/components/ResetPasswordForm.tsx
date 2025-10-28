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
const resetPasswordSchema = z.object({
  otp_code: z.string().min(6, 'OTP code must be 6 digits').max(6, 'OTP code must be 6 digits'),
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
  onResendCode: () => void;
}

export function ResetPasswordForm({ email, onSuccess, onBack, onResendCode }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { showSuccess, showError } = useToast();
  const { setError: setFormError } = useFormErrors();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const newPassword = watch('new_password');

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.resetPassword({
        email,
        otp_code: data.otp_code,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      });

      if (response.success) {
        showSuccess(response.message || 'Password has been reset successfully.');
        onSuccess();
      } else {
        showError(response.message || 'Failed to reset password.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      
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
                  setError(fieldName as keyof ResetPasswordFormData, { 
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
              setError(field as keyof ResetPasswordFormData, { 
                type: 'manual',
                message: messages[0] 
              });
            }
          });
          showError('Please correct the errors below and try again.', { duration: 6000 });
        } else {
          showError(error.message || 'Failed to reset password.', { duration: 6000 });
        }
      } else {
        showError('An unexpected error occurred. Please try again.', { duration: 6000 });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      const response = await authAPI.forgotPassword({ email });
      if (response.success) {
        showSuccess('New OTP code sent to your email address.', { duration: 6000 });
      } else {
        showError(response.message || 'Failed to resend OTP code.', { duration: 6000 });
      }
    } catch (error) {
      console.error('Resend code error:', error);
      
      if (error instanceof APIError) {
        // Handle field validation errors in format: { "field": ["error1", "error2"] }
        if (error.details && error.details.detail) {
          if (typeof error.details.detail === 'object' && !Array.isArray(error.details.detail)) {
            const fieldErrors = error.details.detail;
            
            // Check if it's field validation errors (object with field names as keys)
            Object.keys(fieldErrors).forEach(fieldName => {
              if (Array.isArray(fieldErrors[fieldName])) {
                // Set field-specific errors
                fieldErrors[fieldName].forEach((message: string) => {
                  setError(fieldName as keyof ResetPasswordFormData, { 
                    type: 'manual',
                    message 
                  });
                });
              }
            });
            
            // Show general message about validation errors
            showError('Please correct the errors below and try again.', { duration: 6000 });
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
        } else {
          showError(error.message || 'Failed to resend OTP code.', { duration: 6000 });
        }
      } else {
        showError('Failed to resend OTP code. Please try again.', { duration: 6000 });
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Reset Password</h2>
        <p className="text-text-secondary">
          Enter the OTP code sent to <span className="font-medium text-text-primary">{email}</span> and your new password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* OTP Code */}
        <div className="space-y-2">
          <label htmlFor="otp_code" className="text-sm font-medium text-text-primary">
            OTP Code
          </label>
          <input
            id="otp_code"
            type="text"
            {...register('otp_code')}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="w-full p-3 rounded-lg bg-secondary-bg border border-border-color text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent text-center text-lg tracking-widest"
            disabled={isLoading}
          />
          {errors.otp_code && (
            <p className="text-sm text-red-500">{errors.otp_code.message}</p>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label htmlFor="new_password" className="text-sm font-medium text-text-primary">
            New Password
          </label>
          <input
            id="new_password"
            type="password"
            {...register('new_password')}
            placeholder="Enter new password"
            className="w-full p-3 rounded-lg bg-secondary-bg border border-border-color text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent"
            disabled={isLoading}
          />
          {errors.new_password && (
            <p className="text-sm text-red-500">{errors.new_password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label htmlFor="confirm_password" className="text-sm font-medium text-text-primary">
            Confirm Password
          </label>
          <input
            id="confirm_password"
            type="password"
            {...register('confirm_password')}
            placeholder="Confirm new password"
            className="w-full p-3 rounded-lg bg-secondary-bg border border-border-color text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent"
            disabled={isLoading}
          />
          {errors.confirm_password && (
            <p className="text-sm text-red-500">{errors.confirm_password.message}</p>
          )}
        </div>

        {/* Resend Code */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isResending || isLoading}
            className="text-sm text-accent-color hover:text-accent-dark font-medium focus:outline-none focus:ring-2 focus:ring-accent-color focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isResending ? 'Sending...' : "Didn't receive the code? Resend"}
          </button>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent-color text-white py-3 px-4 rounded-lg font-medium hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent-color focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>

          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="w-full text-text-secondary hover:text-text-primary py-2 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-accent-color focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Back to Email
          </button>
        </div>
      </form>
    </div>
  );
}