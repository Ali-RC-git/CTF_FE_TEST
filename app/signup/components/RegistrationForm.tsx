"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { backendSignupSchema } from "@/lib/validation";
import { useFormErrors } from "@/lib/hooks/useFormErrors";
import { Input } from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import PasswordValidator from "@/components/auth/PasswordValidator";
import { Button } from "@/components/ui/Button";

type RegistrationFormProps = {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  eventCode?: string;
};

export default function RegistrationForm({ onSubmit, isSubmitting, eventCode }: RegistrationFormProps) {
  const { setError, clearErrors, getFieldError } = useFormErrors();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(backendSignupSchema)
  });

  const formValues = watch();

  // Handle form submission - just call the parent's onSubmit
  const handleFormSubmit = (data: any) => {
    clearErrors();
    onSubmit(data);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-accent-dark to-accent-color bg-clip-text text-transparent mb-2">
          Complete Your Registration
        </h1>
        <p className="text-text-secondary text-xs sm:text-sm">
          Fill in your details to create your account
        </p>
      </div>

      {/* Event Code Information */}
      {eventCode?.trim() && (
        <div className="bg-accent-color/10 border border-accent-color/20 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent-color rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-accent-color font-semibold text-sm mb-1">Joining Event</h3>
              <p className="text-text-primary text-sm">
                You will be automatically registered for event: <span className="font-mono font-semibold text-accent-color">{eventCode}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          {...register('email')}
          error={errors.email?.message || getFieldError('email')}
          placeholder="Enter your email address"
        />

        <Input
          label="Username"
          {...register('username')}
          error={errors.username?.message || getFieldError('username')}
          placeholder="Choose a username"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Input
            label="First Name"
            {...register('first_name')}
            error={errors.first_name?.message || getFieldError('first_name')}
            placeholder="First name"
          />
          <Input
            label="Last Name"
            {...register('last_name')}
            error={errors.last_name?.message || getFieldError('last_name')}
            placeholder="Last name"
          />
        </div>

        <PasswordInput
          label="Password"
          {...register('password')}
          error={errors.password?.message || getFieldError('password')}
          autoComplete="new-password"
        />

        <PasswordValidator
          password={formValues.password || ''}
          showValidation={true}
        />

        <PasswordInput
          label="Confirm Password"
          {...register('password_confirm')}
          error={errors.password_confirm?.message || getFieldError('password_confirm')}
          autoComplete="new-password"
        />

        <Input
          label="Institution (Optional)"
          {...register('institution')}
          error={errors.institution?.message || getFieldError('institution')}
          placeholder="Your institution or organization"
        />

        <Input
          label="Department (Optional)"
          {...register('department')}
          error={errors.department?.message || getFieldError('department')}
          placeholder="Your department or field"
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting 
            ? 'Creating Account...' 
            : eventCode?.trim()
              ? 'Create Account & Join Event'
              : 'Create Account'
          }
        </Button>
      </form>
      
      {/* Footer Links */}
      <div className="text-center text-text-secondary text-xs sm:text-sm">
        <p>Already have an account? <a href={eventCode ? `/login?eventCode=${eventCode}` : '/login'} className="text-accent-light hover:text-accent-color transition-colors">Sign in here</a></p>
        <p className="mt-2">By creating an account, you agree to our <a href="#" className="text-accent-light hover:text-accent-color transition-colors">Terms of Service</a> and <a href="#" className="text-accent-light hover:text-accent-color transition-colors">Privacy Policy</a>.</p>
      </div>
    </div>
  );
}
