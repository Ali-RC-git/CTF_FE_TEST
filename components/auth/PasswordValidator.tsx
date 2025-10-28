'use client';

import { useState, useEffect } from 'react';
import { useSystemSettingsSingleton } from '@/lib/hooks/useSystemSettingsSingleton';
import { PublicSettings } from '@/lib/api';

interface PasswordValidatorProps {
  password: string;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  showValidation?: boolean;
  className?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export default function PasswordValidator({ 
  password, 
  onValidationChange, 
  showValidation = true,
  className = '' 
}: PasswordValidatorProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: false, errors: [] });
  const { publicSettings, isLoading } = useSystemSettingsSingleton();

  // Validate password whenever it changes
  useEffect(() => {
    if (!publicSettings?.password_policy || isLoading) return;

    const result = validatePassword(password, publicSettings.password_policy);
    setValidationResult(result);
    
    if (onValidationChange) {
      onValidationChange(result.isValid, result.errors);
    }
  }, [password, publicSettings?.password_policy, isLoading, onValidationChange]);

  const validatePassword = (password: string, policy: PublicSettings['password_policy']): ValidationResult => {
    const errors: string[] = [];
    
    if (password.length < policy.min_length) {
      errors.push(`Password must be at least ${policy.min_length} characters long`);
    }
    
    if (policy.require_mixed_case) {
      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
    }
    
    if (policy.require_numbers) {
      if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
      }
    }
    
    if (policy.require_symbols) {
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  if (!showValidation || isLoading) {
    return null;
  }

  if (password.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Password strength indicator */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-secondary-bg rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              validationResult.isValid 
                ? 'bg-green-500' 
                : password.length >= (publicSettings?.password_policy?.min_length || 8) / 2
                ? 'bg-yellow-500' 
                : 'bg-red-500'
            }`}
            style={{ 
              width: `${Math.min(100, (password.length / (publicSettings?.password_policy?.min_length || 8)) * 100)}%` 
            }}
          />
        </div>
        <span className={`text-xs font-medium ${
          validationResult.isValid 
            ? 'text-green-500' 
            : password.length >= (publicSettings?.password_policy?.min_length || 8) / 2
            ? 'text-yellow-500' 
            : 'text-red-500'
        }`}>
          {validationResult.isValid ? 'Strong' : password.length >= (publicSettings?.password_policy?.min_length || 8) / 2 ? 'Medium' : 'Weak'}
        </span>
      </div>

      {/* Validation errors */}
      {validationResult.errors.length > 0 && (
        <div className="space-y-1">
          {validationResult.errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-red-500">
              <span className="text-red-500">✗</span>
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Success message */}
      {validationResult.isValid && (
        <div className="flex items-center gap-2 text-sm text-green-500">
          <span className="text-green-500">✓</span>
          <span>Password meets all requirements</span>
        </div>
      )}
    </div>
  );
}
