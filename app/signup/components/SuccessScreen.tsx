// components/auth/SuccessScreen.tsx
import { Button } from "@/components/ui/Button";

type SuccessScreenProps = {
  registrationData: {
    email: string;
    event_registration?: {
      event_name: string;
      event_code: string;
    };
    verificationEmailSent: boolean;
  };
  eventCode: string;
  onBack: () => void;
  onLogin: () => void;
  verificationEmailSent: boolean;
  onResendVerification: () => void;
  isResending: boolean;
};

export default function SuccessScreen({ 
  registrationData, 
  eventCode, 
  onBack, 
  onLogin,
  verificationEmailSent,
  onResendVerification,
  isResending
}: SuccessScreenProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-accent-dark to-accent-color bg-clip-text text-transparent mb-2">
            Account Created Successfully!
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm">
            Please verify your email address to complete your registration
          </p>
        </div>

        {/* Success Message */}
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl">✅</span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-2">
              Check Your Email
            </h2>
            <p className="text-text-secondary text-xs sm:text-sm">
              {verificationEmailSent 
                ? `A verification email has been sent to ${registrationData.email}. Please check your inbox and click the verification link to activate your account.`
                : `Your account has been created successfully. A verification email will be sent to ${registrationData.email} shortly.`
              }
            </p>
            
            {registrationData.event_registration && (
              <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Event Registration:</strong> You have been successfully registered for <strong>{registrationData.event_registration.event_name}</strong> ({registrationData.event_registration.event_code})
                </p>
              </div>
            )}
          </div>

          <div className="bg-accent-color bg-opacity-10 border border-accent-color rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span className="text-accent-color text-lg">💡</span>
              </div>
              <div className="text-sm text-text-secondary">
                <p className="font-medium text-text-primary mb-1">Didn't receive the email?</p>
                <p>Check your spam folder or click the button below to resend the verification email.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onResendVerification}
              disabled={isResending}
              className="w-full"
            >
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </Button>

            <Button
              onClick={onBack}
              className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Back to Registration
            </Button>
          </div>
        </div>
        
        {/* Footer Links */}
        <div className="text-center text-text-secondary text-xs sm:text-sm">
          <p>Already have an account? <a href={eventCode ? `/login?eventCode=${eventCode}` : '/login'} className="text-accent-light hover:text-accent-color transition-colors">Sign in here</a></p>
        </div>
      </div>
 
  );
}