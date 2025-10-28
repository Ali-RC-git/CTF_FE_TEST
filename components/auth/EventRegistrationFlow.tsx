'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/hooks/useToast';
import { useFormErrors } from '@/lib/hooks/useFormErrors';
import { APIError } from '@/lib/api';
import { eventRegistrationAPI } from '@/lib/api/event-registration';
import { otpAPI } from '@/lib/api/otp';
import { authAPI } from '@/lib/api/auth';
import EventCodeValidation from './EventCodeValidation';
import OTPVerification from './OTPVerification';
import UserStatusCheck from './UserStatusCheck';
import { Input } from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import PasswordValidator from './PasswordValidator';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Types for the registration flow
interface EventData {
  event_id: string;
  event_code: string;
  event_name: string;
  event_description?: string;
  starts_at: string;
  ends_at: string;
  is_upcoming: boolean;
}

interface UserStatusResponse {
  user_exists: boolean;
  user_id?: string;
  user_email?: string;
  user_name?: string;
  user_status?: 'active' | 'pending' | 'inactive';
  event_name?: string;
  event_code?: string;
  registration_id?: string;
  registered_at?: string;
  event_description?: string;
  starts_at?: string;
  ends_at?: string;
  requires_registration?: boolean;
}

interface RegistrationFormData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  institution?: string;
  department?: string;
}

type FlowStep = 'event-code' | 'login-signup' | 'user-check' | 'otp-send' | 'otp-verify' | 'registration' | 'complete';

export default function EventRegistrationFlow() {
  const { t } = useLanguage();
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const { showSuccess, showError, showLoading } = useToast();
  const { setError: setFormError, clearErrors, getFieldError } = useFormErrors();
  
  // Form for field-specific errors
  const { setError } = useForm<RegistrationFormData>();

  // Flow state
  const [currentStep, setCurrentStep] = useState<FlowStep>('event-code');
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatusResponse | null>(null);
  const [verifiedOTPId, setVerifiedOTPId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    institution: '',
    department: ''
  });

  // Handle event code validation
  const handleEventCodeValidated = (eventData: EventData) => {
    setSelectedEvent(eventData);
    setCurrentStep('login-signup');
  };

  // Handle skip event code
  const handleSkipEventCode = () => {
    setSelectedEvent(null);
    setCurrentStep('user-check');
  };

  // Handle signup choice
  const handleChooseSignup = () => {
    setCurrentStep('user-check');
  };

  // Handle login with event code
  const handleLoginWithEventCode = async (email: string, password: string) => {
    setIsLoading(true);
    clearErrors();

    try {
      const response = await authAPI.loginWithEvent({
        email: email,
        password: password,
        event_code: selectedEvent!.event_code
      });

      if (response.success && response.data) {
        // Store tokens in auth context
        const { tokens, user, event_registration } = response.data;
        
        // Update auth context with tokens and user data
        // Note: You may need to update your AuthContext to handle this
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        
        showSuccess(`Welcome back! You're now registered for ${event_registration.event_name}`);
        
        // Set user status for completion screen
        setUserStatus({
          user_exists: true,
          user_id: user.id,
          user_email: user.email,
          user_name: `${user.first_name} ${user.last_name}`,
          user_status: 'active',
          event_name: event_registration.event_name,
          event_code: event_registration.event_code,
          registration_id: event_registration.registration_id,
          registered_at: event_registration.registered_at
        });
        
        setCurrentStep('complete');
      } else {
        // Handle different error cases
        if (response.user_status === 'pending') {
          showError('Account is pending verification. Please check your email and verify your account.');
        } else {
          showError(response.message || 'Login failed. Please check your credentials and try again.');
        }
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      showError('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check user status and register existing user to event
  const handleUserStatusCheck = async (email: string) => {
    setIsLoading(true);
    clearErrors();

    try {
      // Update form data with email
      setFormData(prev => ({ ...prev, email }));

      if (selectedEvent) {
        // Check if user exists and register to event
        const response = await eventRegistrationAPI.checkUserStatusAndRegister({
          event_code: selectedEvent.event_code,
          email: email
        });

        if (response.success) {
          setUserStatus(response.data);

          if (response.data.user_exists) {
            // User exists and is registered
            showSuccess(`Welcome back! You're now registered for ${response.data.event_name}`);
            setCurrentStep('complete');
          } else {
            // User doesn't exist, proceed to registration (skip OTP for event registration)
            if (selectedEvent) {
              setCurrentStep('registration');
            } else {
              setCurrentStep('otp-send');
            }
          }
        } else {
          // Handle business logic errors (success: false)
          console.log('Business logic error:', response.message);
          if (response.message === "You are already registered for this event") {
            showError("You are already registered for this event");
          } else {
            showError(response.message || 'Failed to check user status');
          }
        }
      } else {
        // No event selected, proceed to OTP flow
        setCurrentStep('otp-send');
      }
    } catch (error: any) {
      console.error('User status check failed:', error);
      console.log('Error details:', {
        message: error?.message,
        response: error?.response,
        details: error?.details,
        processedError: error?.processedError
      });
      
      // Handle API errors that might be thrown as exceptions
      let errorMessage = '';
      
      if (error instanceof APIError) {
        // Handle APIError from the client - check details first
        if (error.details?.message) {
          errorMessage = error.details.message;
        } else if (error.processedError?.generalError) {
          errorMessage = error.processedError.generalError;
        } else {
          errorMessage = error.message;
        }
        console.log('APIError message:', errorMessage);
      } else if (error?.response?.data?.message) {
        // Handle axios-style errors
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.detail) {
        // Handle Django-style errors
        errorMessage = error.response.data.detail;
      } else if (error?.message) {
        // Handle generic errors
        errorMessage = error.message;
      } else {
        errorMessage = 'Failed to check user status. Please try again.';
      }
      
      console.log('Final error message:', errorMessage);
      
      // Check for specific error messages
      if (errorMessage === "You are already registered for this event") {
        showError("You are already registered for this event");
      } else {
        showError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Send OTP for email verification
  const handleSendOTP = async () => {
    setIsLoading(true);
    clearErrors();

    try {
      const response = await otpAPI.sendOTP({
        email: formData.email
      });

      if (response.success) {
        showSuccess('Verification code sent to your email!');
        setCurrentStep('otp-verify');
      } else {
        showError(response.message || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Failed to send OTP:', error);
      showError('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleOTPVerified = async (otpId: string) => {
    setVerifiedOTPId(otpId);
    setCurrentStep('registration');
  };

  // Handle OTP resend
  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      await handleSendOTP();
    } finally {
      setIsLoading(false);
    }
  };

  // Complete user registration
  const handleCompleteRegistration = async () => {
    setIsLoading(true);
    clearErrors();
    const loadingToast = showLoading('Creating account...');

    try {
      if (selectedEvent) {
        // Register user with event code using new API (no OTP required)
        const response = await authAPI.registerWithEvent({
          email: formData.email,
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
          password: formData.password,
          password_confirm: formData.password_confirm,
          institution: formData.institution,
          department: formData.department,
          event_code: selectedEvent.event_code
        });

        if (response.success && response.data) {
          showSuccess('Account created successfully and registered for event! Please check your email to verify your account.');
          loadingToast();
          
          // Set user status for completion screen
          setUserStatus({
            user_exists: true,
            user_id: response.data.user_id,
            user_email: response.data.email,
            user_name: `${formData.first_name} ${formData.last_name}`,
            user_status: response.data.status as "active" | "pending" | "inactive",
            event_name: response.data.event_registration.event_name,
            event_code: response.data.event_registration.event_code,
            registration_id: response.data.event_registration.registration_id,
            registered_at: response.data.event_registration.registered_at
          });
          
          setCurrentStep('complete');
        } else {
          throw new Error(response.message || 'Registration failed');
        }
      } else {
        // Standard registration without event (keep existing flow)
        const user = await registerUser({
          email: formData.email,
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
          password: formData.password,
          password_confirm: formData.password_confirm,
          otp_id: verifiedOTPId!,
          role: 'user',
          institution: formData.institution,
          department: formData.department
        });

        showSuccess('Account created successfully!');
        loadingToast();
        setCurrentStep('complete');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      
      if (error instanceof APIError) {
        const fieldErrors = error.getFieldErrors();
        fieldErrors.forEach(fieldError => {
          setError(fieldError.field as keyof RegistrationFormData, { 
            type: 'manual',
            message: fieldError.messages[0] 
          });
        });
        fieldErrors.forEach(fieldError => {
          fieldError.messages.forEach(message => {
            showError(`${fieldError.field.replace('_', ' ')}: ${message}`);
          });
        });
      } else {
        showError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
      }
      
      loadingToast();
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field: keyof RegistrationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearErrors();
  };

  // Navigation handlers
  const handleBackToEventCode = () => {
    setCurrentStep('event-code');
    setSelectedEvent(null);
    setUserStatus(null);
    setVerifiedOTPId(null);
  };

  const handleBackToUserCheck = () => {
    setCurrentStep('user-check');
    setVerifiedOTPId(null);
  };

  const handleBackToOTPSend = () => {
    setCurrentStep('otp-send');
    setVerifiedOTPId(null);
  };

  // Get step progress
  const getStepProgress = () => {
    const steps = ['event-code', 'login-signup', 'user-check', 'otp-send', 'otp-verify', 'registration', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    return {
      current: currentIndex + 1,
      total: steps.length,
      percentage: ((currentIndex + 1) / steps.length) * 100
    };
  };

  // Get progress info
  const progress = getStepProgress();

  // Render different steps
  switch (currentStep) {
    case 'event-code':
      return (
        <div className="space-y-4">
          {/* Progress Indicator */}
          <div className="bg-secondary-bg rounded-lg p-4">
            <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
              <span>Step {progress.current} of {progress.total}</span>
              <span>{Math.round(progress.percentage)}% Complete</span>
            </div>
            <div className="w-full bg-border-color rounded-full h-2">
              <div 
                className="bg-accent-color h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>
          
          <EventCodeValidation
            onEventCodeValidated={handleEventCodeValidated}
            onSkip={handleSkipEventCode}
          />
        </div>
      );

    case 'login-signup':
      return (
        <div className="space-y-4">
          {/* Progress Indicator */}
          <div className="bg-secondary-bg rounded-lg p-4">
            <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
              <span>Step {progress.current} of {progress.total}</span>
              <span>{Math.round(progress.percentage)}% Complete</span>
            </div>
            <div className="w-full bg-border-color rounded-full h-2">
              <div 
                className="bg-accent-color h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="max-w-md mx-auto bg-card-bg rounded-xl p-4 sm:p-6 border border-border-color shadow-lg">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent-color bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">🎯</span>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-2">
                Join Event
              </h2>
              <p className="text-text-secondary text-xs sm:text-sm mb-4">
                You're joining: <strong className="text-accent-color">{selectedEvent?.event_name}</strong>
              </p>
            </div>

            <div className="space-y-4">
              {/* Login Section */}
              <div className="bg-secondary-bg rounded-lg p-4">
                <h3 className="font-semibold text-text-primary mb-3 text-center">Have an account?</h3>
                <div className="space-y-3">
                  <Input
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={getFieldError('email')}
                    placeholder="Enter your email"
                  />

                  <Input
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    error={getFieldError('password')}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />

                  <Button
                    onClick={() => handleLoginWithEventCode(formData.email, formData.password)}
                    disabled={!formData.email.trim() || !formData.password.trim() || isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Logging in...' : 'Login & Join Event'}
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center">
                <div className="flex-1 border-t border-border-color"></div>
                <span className="px-3 text-text-secondary text-sm">or</span>
                <div className="flex-1 border-t border-border-color"></div>
              </div>

              {/* Signup Section */}
              <div className="bg-secondary-bg rounded-lg p-4">
                <h3 className="font-semibold text-text-primary mb-3 text-center">New to our platform?</h3>
                <p className="text-text-secondary text-sm text-center mb-4">
                  Create a new account to join this event
                </p>
                <Button
                  onClick={handleChooseSignup}
                  className="w-full bg-secondary-bg text-text-primary hover:bg-secondary-bg/80 border border-border-color"
                  disabled={isLoading}
                >
                  Create Account & Join Event
                </Button>
              </div>

              <div className="text-center">
                <button
                  onClick={handleBackToEventCode}
                  className="text-text-secondary hover:text-accent-color transition-colors text-sm"
                  disabled={isLoading}
                >
                  ← Back to event code
                </button>
              </div>
            </div>
          </div>
        </div>
      );

    case 'user-check':
      return (
        <div className="space-y-4">
          {/* Progress Indicator */}
          <div className="bg-secondary-bg rounded-lg p-4">
            <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
              <span>Step {progress.current} of {progress.total}</span>
              <span>{Math.round(progress.percentage)}% Complete</span>
            </div>
            <div className="w-full bg-border-color rounded-full h-2">
              <div 
                className="bg-accent-color h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>
          
          <UserStatusCheck
            onUserStatusCheck={handleUserStatusCheck}
            onBack={handleBackToEventCode}
            isLoading={isLoading}
            selectedEvent={selectedEvent}
          />
        </div>
      );

    case 'otp-send':
      return (
        <div className="space-y-4">
          {/* Progress Indicator */}
          <div className="bg-secondary-bg rounded-lg p-4">
            <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
              <span>Step {progress.current} of {progress.total}</span>
              <span>{Math.round(progress.percentage)}% Complete</span>
            </div>
            <div className="w-full bg-border-color rounded-full h-2">
              <div 
                className="bg-accent-color h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="max-w-md mx-auto bg-card-bg rounded-xl p-4 sm:p-6 border border-border-color shadow-lg">
          <div className="text-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent-color bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl">📧</span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-2">
              Verify Your Email
            </h2>
            <p className="text-text-secondary text-xs sm:text-sm">
              We'll send a verification code to your email address to secure your account.
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={getFieldError('email')}
              placeholder="Enter your email address"
            />

            <div className="space-y-3">
              <Button
                onClick={handleSendOTP}
                disabled={!formData.email.trim() || isLoading}
                className="w-full"
              >
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </Button>

              <Button
                onClick={handleBackToUserCheck}
                className="w-full bg-secondary-bg text-text-primary hover:bg-secondary-bg/80 border border-border-color"
                disabled={isLoading}
              >
                Back
              </Button>
            </div>
          </div>
        </div>
        </div>
      );

    case 'otp-verify':
      return (
        <div className="space-y-4">
          {/* Progress Indicator */}
          <div className="bg-secondary-bg rounded-lg p-4">
            <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
              <span>Step {progress.current} of {progress.total}</span>
              <span>{Math.round(progress.percentage)}% Complete</span>
            </div>
            <div className="w-full bg-border-color rounded-full h-2">
              <div 
                className="bg-accent-color h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>
          
          <OTPVerification
            email={formData.email}
            onOTPVerified={handleOTPVerified}
            onResendOTP={handleResendOTP}
            onBack={handleBackToOTPSend}
            isResending={isLoading}
          />
        </div>
      );

    case 'registration':
      return (
        <div className="space-y-4">
          {/* Progress Indicator */}
          <div className="bg-secondary-bg rounded-lg p-4">
            <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
              <span>Step {progress.current} of {progress.total}</span>
              <span>{Math.round(progress.percentage)}% Complete</span>
            </div>
            <div className="w-full bg-border-color rounded-full h-2">
              <div 
                className="bg-accent-color h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="max-w-md mx-auto bg-card-bg rounded-xl p-4 sm:p-6 border border-border-color shadow-lg">
          <div className="text-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent-color bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl">👤</span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-2">
              {selectedEvent ? 'Complete Your Registration' : 'Complete Your Registration'}
            </h2>
            <p className="text-text-secondary text-xs sm:text-sm">
              {selectedEvent 
                ? 'Fill in your details to create your account and join the event.'
                : 'Fill in your details to create your account.'
              }
            </p>
          </div>

          {/* Event Information Display */}
          {selectedEvent && (
            <div className="bg-accent-color bg-opacity-10 border border-accent-color rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-accent-color rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">🎯</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-accent-color mb-1">
                    Joining: {selectedEvent.event_name}
                  </h3>
                  {selectedEvent.event_description && (
                    <p className="text-text-secondary text-sm mb-2">
                      {selectedEvent.event_description}
                    </p>
                  )}
                  <div className="text-text-secondary text-xs space-y-1">
                    <p><strong>Event Code:</strong> {selectedEvent.event_code}</p>
                    <p><strong>Starts:</strong> {new Date(selectedEvent.starts_at).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> {selectedEvent.is_upcoming ? 'Upcoming' : 'Active'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              error={getFieldError('username')}
              placeholder="Choose a username"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input
                label="First Name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                error={getFieldError('first_name')}
                placeholder="First name"
              />
              <Input
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                error={getFieldError('last_name')}
                placeholder="Last name"
              />
            </div>

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={getFieldError('password')}
              placeholder="Enter your password"
              autoComplete="new-password"
            />

            <PasswordValidator
              password={formData.password}
              showValidation={true}
            />

            <Input
              label="Confirm Password"
              type="password"
              value={formData.password_confirm}
              onChange={(e) => handleInputChange('password_confirm', e.target.value)}
              error={getFieldError('password_confirm')}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />

            <Input
              label="Institution (Optional)"
              value={formData.institution || ''}
              onChange={(e) => handleInputChange('institution', e.target.value)}
              error={getFieldError('institution')}
              placeholder="Your institution or organization"
            />

            <Input
              label="Department (Optional)"
              value={formData.department || ''}
              onChange={(e) => handleInputChange('department', e.target.value)}
              error={getFieldError('department')}
              placeholder="Your department or field"
            />

            <div className="space-y-3">
              <Button
                onClick={handleCompleteRegistration}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Creating Account...' : selectedEvent ? 'Join Event & Create Account' : 'Create Account'}
              </Button>

              <Button
                onClick={selectedEvent ? handleBackToUserCheck : handleBackToOTPSend}
                className="w-full bg-secondary-bg text-text-primary hover:bg-secondary-bg/80 border border-border-color"
                disabled={isLoading}
              >
                Back
              </Button>
            </div>
          </div>
        </div>
        </div>
      );

    case 'complete':
      return (
        <div className="space-y-4">
          {/* Progress Indicator */}
          <div className="bg-secondary-bg rounded-lg p-4">
            <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
              <span>Step {progress.current} of {progress.total}</span>
              <span>{Math.round(progress.percentage)}% Complete</span>
            </div>
            <div className="w-full bg-border-color rounded-full h-2">
              <div 
                className="bg-accent-color h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="max-w-md mx-auto bg-card-bg rounded-xl p-4 sm:p-6 border border-border-color shadow-lg">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl">✅</span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-2">
              Registration Complete!
            </h2>
            <p className="text-text-secondary text-xs sm:text-sm mb-4 sm:mb-6">
              {userStatus?.user_exists 
                ? `Welcome back! You're now registered for ${userStatus.event_name}.`
                : selectedEvent 
                  ? `Your account has been created and you're registered for ${selectedEvent.event_name}.`
                  : 'Your account has been created successfully!'
              }
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
        </div>
      );

    default:
      return null;
  }
}
