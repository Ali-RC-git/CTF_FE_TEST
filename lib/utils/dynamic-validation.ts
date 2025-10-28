/**
 * Dynamic validation utilities that use system settings
 */

import { z } from 'zod';
import { useSystemSettingsSingleton } from '@/lib/hooks/useSystemSettingsSingleton';

/**
 * Creates a dynamic password validation schema based on current system settings
 */
export function createDynamicPasswordSchema() {
  return z.string().refine((password) => {
    // This will be validated by the PasswordValidator component
    // We just need basic non-empty validation here
    return password.length > 0;
  }, {
    message: "Password is required"
  });
}

/**
 * Creates a dynamic password confirmation schema
 */
export function createDynamicPasswordConfirmSchema() {
  return z.string().refine((password) => {
    return password.length > 0;
  }, {
    message: "Password confirmation is required"
  });
}

/**
 * Validates password against current system settings
 * This is used by the PasswordValidator component
 */
export function validatePasswordAgainstPolicy(
  password: string, 
  policy: {
    min_length: number;
    require_mixed_case: boolean;
    require_numbers: boolean;
    require_symbols: boolean;
  }
): { isValid: boolean; errors: string[] } {
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
}
