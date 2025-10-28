"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { backendSignupSchema, BackendSignupData } from "@/lib/validation";
import { useAuth } from "@/lib/context/AuthContext";
import { APIError } from "@/lib/api";
import { useFormErrors } from "@/lib/hooks/useFormErrors";
import { useToast } from "@/lib/hooks/useToast";
import { authAPI } from "@/lib/api/auth";
import { Input } from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import PasswordValidator from "@/components/auth/PasswordValidator";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function SignUpForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register: registerUser } = useAuth();
  const { showSuccess, showError, showLoading } = useToast();
  const { setError: setFormError, clearErrors, getFieldError } = useFormErrors();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventCode, setEventCode] = useState('');

  // Get event code from URL parameters
  useEffect(() => {
    const eventCodeParam = searchParams.get('eventCode');
    if (eventCodeParam) {
      setEventCode(eventCodeParam);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError
  } = useForm({
    resolver: zodResolver(backendSignupSchema)
  });

  const formValues = watch();


  // Handle form submission
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    clearErrors();
    const loadingToast = showLoading('Creating account...');

    try {
      // Prepare registration data
      const registrationData = {
        email: data.email,
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
        password_confirm: data.password_confirm,
        institution: data.institution,
        department: data.department,
        ...(eventCode.trim() && { event_code: eventCode.trim() })
      };

      // Use unified registration API
      const response = await registerUser(registrationData);

      // Debug: Log the response to see what we're getting
      console.log('Registration response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));

      // Determine success message based on event registration and verification email
      const hasEventRegistration = response.event_registration;
      const verificationSent = response.verification_email_sent;
      
      // Debug: Log the verification status
      console.log('verification_email_sent:', verificationSent);
      console.log('hasEventRegistration:', hasEventRegistration);
      
      // Always redirect to OTP verification after successful registration
      // User can use "Resend OTP" button if verification email wasn't sent
      loadingToast(); // Dismiss loading toast first
      
      const otpUrl = eventCode 
        ? `/otp-verification?email=${encodeURIComponent(data.email)}&eventCode=${encodeURIComponent(eventCode)}`
        : `/otp-verification?email=${encodeURIComponent(data.email)}`;
      
      router.push(otpUrl);
    } catch (error) {
      console.error('Registration failed:', error);
      
      if (error instanceof APIError) {
        // Dismiss loading toast first
        loadingToast();
        
        // Handle timeout errors specifically (email service related)
        if (error.message.includes('timeout') || error.message.includes('timed out')) {
          showError('Registration is taking longer than expected due to email service processing. Your account may have been created successfully. Please check your email for verification instructions or try logging in.', { duration: 8000 });
          
          // Redirect to login page after timeout
          setTimeout(() => {
            const loginUrl = eventCode ? `/login?eventCode=${eventCode}` : '/login';
            router.push(loginUrl);
          }, 3000);
        } else if (error.details && error.details.detail) {
          // Handle field validation errors in format: { "field": ["error1", "error2"] }
          if (typeof error.details.detail === 'object' && !Array.isArray(error.details.detail)) {
            const fieldErrors = error.details.detail;
            let hasFieldErrors = false;
            
            // Check if it's field validation errors (object with field names as keys)
            Object.keys(fieldErrors).forEach(fieldName => {
              if (Array.isArray(fieldErrors[fieldName])) {
                hasFieldErrors = true;
                // Set field-specific errors
                fieldErrors[fieldName].forEach((message: string) => {
                  setError(fieldName as keyof BackendSignupData, { 
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
                showError(message);
              });
            } else if (typeof fieldErrors === 'string') {
              // Handle simple string error
              showError(fieldErrors);
            } else {
              // Handle other detail formats
              showError(error.message);
            }
          } else if (Array.isArray(error.details.detail)) {
            // Handle array of errors
            error.details.detail.forEach((message: string) => {
              showError(message);
            });
          } else if (typeof error.details.detail === 'string') {
            // Handle simple string error
            showError(error.details.detail);
          } else {
            // Handle other detail formats
            showError(error.message);
          }
        } else {
          // Handle standard field errors
          setFormError(error);
        }
      } else {
        // Dismiss loading toast first
        loadingToast();
        
        // Handle network or other errors
        if (error instanceof Error && error.message.includes('timeout')) {
          showError('Registration is taking longer than expected. Your account may have been created successfully. Please check your email or try logging in.', { duration: 8000 });
          
          // Redirect to login page after timeout
          setTimeout(() => {
            const loginUrl = eventCode ? `/login?eventCode=${eventCode}` : '/login';
            router.push(loginUrl);
          }, 3000);
        } else {
          showError(error instanceof Error ? error.message : 'Registration failed. Please try again.', { duration: 6000 });
        }
      }
    } finally {
      // setIsSubmitting(false);
    }
  };


  // Registration form
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
      {eventCode.trim() && (
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            : eventCode.trim() 
              ? 'Create Account & Join Event' 
              : 'Create Account'
          }
        </Button>
      </form>
      
      {/* Footer Links */}
        <div className="text-center text-text-secondary text-xs sm:text-sm space-y-2">
          <p>Already have an account? <a href={eventCode ? `/login?eventCode=${eventCode}` : '/login'} className="text-accent-light hover:text-accent-color transition-colors">Sign in here</a></p>
          <p>By creating an account, you agree to our <a href="#" className="text-accent-light hover:text-accent-color transition-colors">Terms of Service</a> and <a href="#" className="text-accent-light hover:text-accent-color transition-colors">Privacy Policy</a>.</p>
          <p>
            <a href="/" className="text-text-secondary hover:text-text-primary transition-colors">Back to Home</a>
          </p>
        </div>
    </div>
  );
}
