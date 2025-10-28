/**
 * Example component demonstrating the centralized error handling system
 * This shows how to handle different types of backend validation errors
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormErrors } from '@/lib/hooks/useFormErrors';
import { APIError } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import PasswordValidator from '@/components/auth/PasswordValidator';
import { Button } from '@/components/ui/Button';
import { createDynamicPasswordSchema } from '@/lib/utils/dynamic-validation';

// Example validation schema
const exampleSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: createDynamicPasswordSchema()
});

type ExampleFormData = z.infer<typeof exampleSchema>;

export default function ErrorHandlingExample() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ExampleFormData>({
    resolver: zodResolver(exampleSchema)
  });
  
  // Watch password field for validation
  const password = watch("password");
  
  const { setError, clearErrors, getFieldError, getGeneralError, errors: formErrors } = useFormErrors();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulate different types of backend errors
  const simulateBackendError = (errorType: 'validation' | 'network' | 'server') => {
    switch (errorType) {
      case 'validation':
        // Simulate the exact error format you provided
        const validationError = new APIError(
          'Validation failed',
          400,
          'validation_error',
          {
            email: ['User with this email already exists.'],
            username: ['User with this username already exists.'],
            password: [
              'This password is too common.',
              'This password is entirely numeric.'
            ]
          }
        );
        throw validationError;
        
      case 'network':
        throw new APIError('Network error', 0, 'network_error');
        
      case 'server':
        throw new APIError('Internal server error', 500, 'server_error');
        
      default:
        throw new Error('Unknown error');
    }
  };

  const onSubmit = async (data: ExampleFormData) => {
    setIsSubmitting(true);
    clearErrors();
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate different error scenarios
      const errorType = Math.random() > 0.5 ? 'validation' : 'network';
      simulateBackendError(errorType);
      
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestValidationError = () => {
    clearErrors();
    try {
      simulateBackendError('validation');
    } catch (error) {
      setError(error as Error);
    }
  };

  const handleTestNetworkError = () => {
    clearErrors();
    try {
      simulateBackendError('network');
    } catch (error) {
      setError(error as Error);
    }
  };

  const handleTestServerError = () => {
    clearErrors();
    try {
      simulateBackendError('server');
    } catch (error) {
      setError(error as Error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-secondary-bg rounded-lg">
      <h2 className="text-2xl font-bold text-text-primary mb-6">
        Error Handling Example
      </h2>
      
      <div className="space-y-6">
        {/* Test Buttons */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-text-primary">Test Different Error Types:</h3>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handleTestValidationError}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Test Validation Error
            </Button>
            <Button
              onClick={handleTestNetworkError}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Test Network Error
            </Button>
            <Button
              onClick={handleTestServerError}
              className="bg-red-600 hover:bg-red-700"
            >
              Test Server Error
            </Button>
          </div>
        </div>

        {/* General Error Display */}
        {getGeneralError() && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <strong>General Error:</strong> {getGeneralError()}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            {...register("email")}
            error={errors.email?.message || getFieldError("email")}
          />
          
          <Input
            label="Username"
            {...register("username")}
            error={errors.username?.message || getFieldError("username")}
          />
          
          <PasswordInput
            label="Password"
            {...register("password")}
            error={errors.password?.message || getFieldError("password")}
            autoComplete="current-password"
          />
          
          {/* Dynamic password validation */}
          <PasswordValidator 
            password={password || ''} 
            showValidation={true}
          />
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Form'}
          </Button>
        </form>

        {/* Error Details */}
        {formErrors.hasFieldErrors && (
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-md">
            <h4 className="font-semibold text-gray-800 mb-2">Field Errors:</h4>
            <ul className="space-y-1">
              {formErrors.fieldErrors.map((fieldError, index) => (
                <li key={index} className="text-sm text-gray-700">
                  <strong>{fieldError.field}:</strong> {fieldError.messages.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Debug Information */}
        <div className="bg-gray-100 p-4 rounded-md">
          <h4 className="font-semibold text-gray-800 mb-2">Debug Information:</h4>
          <pre className="text-xs text-gray-600 overflow-auto">
            {JSON.stringify(formErrors, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
