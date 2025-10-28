"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/lib/context/AuthContext";
import { loginSchema, LoginData } from "@/lib/validation";
import { APIError } from "@/lib/api";
import { useFormErrors } from "@/lib/hooks/useFormErrors";
import { useToast } from "@/lib/hooks/useToast";
import Link from "next/link";

export default function LoginForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error } = useAuth();
  const { showSuccess, showError, showLoading } = useToast();
  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginData>({
    resolver: zodResolver(loginSchema)
  });
  const { setError: setFormError, clearErrors, getFieldError, getGeneralError } = useFormErrors();
  
  const [eventCode, setEventCode] = useState('');

  // Get event code from URL parameters
  useEffect(() => {
    const eventCodeParam = searchParams.get('eventCode');
    if (eventCodeParam) {
      setEventCode(eventCodeParam);
    }
  }, [searchParams]);
  
  const onSubmit = async (data: LoginData) => {
    clearErrors();
    const loadingToast = showLoading('Logging in...');
    
    try {
      // Prepare login data with optional event code
      const loginData = {
        email: data.email,
        password: data.password,
        ...(eventCode.trim() && { event_code: eventCode.trim() })
      };

      const user = await login(loginData.email, loginData.password, loginData.event_code);
      console.log('Login successful, user data:', user);
      
      // Determine success message based on event registration
      const hasEventRegistration = user.event_registration;
      const successMessage = hasEventRegistration 
        ? `Login successful and registered for ${user.event_registration.event_name}!`
        : 'Login successful!';
      
      showSuccess(successMessage);
      loadingToast();
      
      // Redirect based on user role after successful login
      if (user.role === 'admin') {
        console.log('Admin user, redirecting to /admin');
        router.push('/admin');
      } else {
        console.log('Regular user, redirecting to /dashboard');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
      
      // Handle backend validation errors
      if (error instanceof APIError) {
        // Check for specific error response formats
        if (error.details && error.details.detail) {
          // Handle nested non_field_errors format
          if (error.details.detail.non_field_errors && Array.isArray(error.details.detail.non_field_errors)) {
            error.details.detail.non_field_errors.forEach((message: string) => {
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
          const fieldErrors = error.getFieldErrors();
          
          // Set field-specific errors
          fieldErrors.forEach(fieldError => {
            setError(fieldError.field as keyof LoginData, { 
              type: 'manual',
              message: fieldError.messages[0] 
            });
          });
          
          // Show toast notifications for each field error
          fieldErrors.forEach(fieldError => {
            fieldError.messages.forEach(message => {
              showError(`${fieldError.field.replace('_', ' ')}: ${message}`);
            });
          });
          
          // Show general error if no field errors
          if (fieldErrors.length === 0) {
            showError(error.message);
          }
        }
      } else {
        showError(error instanceof Error ? error.message : 'Login failed. Please try again.');
      }
      
      loadingToast();
    }
  };
  
  return (
    <div className="space-y-4 sm:space-y-5">
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        <Input
        label="Email Address"
        type="email"
        {...register("email")}
        error={errors.email?.message || getFieldError("email")}
      />
      
      <div className="space-y-2">
        <PasswordInput
          label="Password"
          {...register("password")}
          error={errors.password?.message || getFieldError("password")}
          autoComplete="current-password"
        />
        <div className="text-right">
          <Link href="/forgot-password" className="text-xs sm:text-sm text-accent-light hover:text-accent-color transition-colors">
            Forgot Password?
          </Link>
        </div>
      </div>
      
      <Button type="submit" disabled={isLoading} className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-semibold">
        {isLoading 
          ? "Signing In..." 
          : eventCode.trim() 
            ? "Sign In & Join Event" 
            : "Sign In"
        }
      </Button>
      
        <div className="text-center text-xs sm:text-sm text-text-secondary pt-3 sm:pt-4 space-y-2">
          <div>
            <Link href="/forgot-password" className="text-accent-light hover:text-accent-color transition-colors">
              Forgot your password?
            </Link>
          </div>
          <div>
            <span>Don't have an account? </span>
            <Link href={eventCode ? `/signup?eventCode=${eventCode}` : '/signup'} className="text-accent-light hover:text-accent-color transition-colors">
              Sign up here
            </Link>
          </div>
          <div>
            <Link href="/" className="text-text-secondary hover:text-text-primary transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}