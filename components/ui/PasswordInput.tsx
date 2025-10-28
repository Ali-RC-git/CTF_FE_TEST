'use client';

import { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import PasswordValidator from '@/components/auth/PasswordValidator';

interface PasswordInputProps {
  id?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  autoComplete?: string;
  showValidation?: boolean; // Whether to show password validation
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({
  id,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  className = '',
  autoComplete = 'current-password',
  showValidation = false,
  ...rest
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-xs sm:text-sm font-medium text-text-primary"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          value={showValidation ? password : undefined}
          onChange={showValidation ? (e) => setPassword(e.target.value) : undefined}
          {...rest}
          className={`
            w-full px-3 py-2 pr-10
            bg-secondary-bg border border-border-color rounded-lg
            text-text-primary placeholder-text-secondary
            focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
            text-sm sm:text-base
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
          `}
        />
        
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="
            absolute right-3 top-1/2 transform -translate-y-1/2
            text-text-secondary hover:text-text-primary
            focus:outline-none focus:text-text-primary
            transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          disabled={disabled}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff size={20} />
          ) : (
            <Eye size={20} />
          )}
        </button>
      </div>
      
      {error && (
        <p className="text-sm text-red-500 mt-1">
          {error}
        </p>
      )}
      
      {showValidation && (
        <PasswordValidator 
          password={password} 
          className="mt-2"
        />
      )}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
