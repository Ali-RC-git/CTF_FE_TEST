 "use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { authAPI } from "@/lib/api/auth";
import { useToast } from "@/lib/hooks/useToast";

interface VerificationScreenProps {
  email: string;
  onVerificationSuccess: () => void;
  onBack: () => void;
  onResendCode: () => void;
  eventCode?: string;
}

export default function VerificationScreen({
  email,
  onVerificationSuccess,
  onBack,
  onResendCode,
  eventCode
}: VerificationScreenProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) return;
    
    setIsVerifying(true);
    
    try {
      // Call the real API to verify the OTP code
      const response = await authAPI.verifyAccount({
        email: email,
        otp_code: verificationCode
      });

      if (response.success) {
        showSuccess(response.message || 'Account verified successfully! You can now login.');
        onVerificationSuccess();
      } else {
        showError(response.message || 'Verification failed. Please check your code and try again.');
      }
    } catch (error) {
      console.error('Verification failed:', error);
      showError('Verification failed. Please check your code and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCodeChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(numericValue);
    
    // Auto-submit when 6 digits are entered
    if (numericValue.length === 6) {
      handleVerifyCode();
    }
  };

  const handleResend = () => {
    setVerificationCode('');
    onResendCode();
  };

  const handleBlockClick = () => {
    // Focus the hidden input when blocks are clicked
    const hiddenInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (hiddenInput) {
      hiddenInput.focus();
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent-color bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl sm:text-3xl">📧</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-accent-dark to-accent-color bg-clip-text text-transparent mb-3">
          Verify Your Email
        </h1>
        <p className="text-text-secondary text-sm sm:text-base">
          Enter the 6-digit verification code sent to
        </p>
        <p className="text-accent-color font-semibold text-base sm:text-lg mt-2">
          {email}
        </p>
        <p className="text-text-secondary text-xs mt-2">
          Didn't receive the code? Click "Resend OTP" below
        </p>
      </div>

      {/* Event Code Info */}
      {eventCode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-blue-800 text-sm">
              You'll be registered for the event after verification
            </p>
          </div>
        </div>
      )}

      {/* OTP Input Section */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-3 text-center">
            Enter the 6-digit code from your email
          </label>
          
          {/* OTP Input */}
          <div className="flex justify-center space-x-2 sm:space-x-3" onClick={handleBlockClick}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={`
                  w-12 h-14 sm:w-14 sm:h-16 border-2 rounded-lg flex items-center justify-center
                  text-xl sm:text-2xl font-mono font-bold cursor-pointer
            
                  ${index === verificationCode.length ? 'ring-2 ring-accent-color ring-opacity-50' : ''}
                  transition-all duration-200 hover:border-accent-color hover:border-opacity-50
                `}
              >
                {verificationCode[index] || ''}
              </div>
            ))}
          </div>
          
          {/* Hidden Input for actual typing */}
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="absolute opacity-0 w-0 h-0 pointer-events-none"
            autoFocus
            maxLength={6}
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={handleVerifyCode}
            disabled={verificationCode.length !== 6 || isVerifying}
            className="w-full py-3 text-base font-semibold"
          >
            {isVerifying ? 'Verifying...' : 'Verify Code'}
          </Button>

          <div className="flex gap-3">
            <Button
              onClick={onBack}
              className="flex-1 py-2.5 bg-secondary-bg text-text-primary border border-border-color hover:bg-secondary-bg/80"
              disabled={isVerifying}
            >
              Back
            </Button>
            <Button
              onClick={handleResend}
              className="flex-1 py-2.5 bg-secondary-bg text-text-primary border border-border-color hover:bg-secondary-bg/80"
              disabled={isVerifying}
            >
              Resend Code
            </Button>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center space-y-2">
          <p className="text-text-secondary text-xs">
            Didn't receive the email? Check your spam folder or click "Resend Code"
          </p>
          <p className="text-text-muted text-xs">
            Code expires in 15 minutes
          </p>
        </div>
      </div>

      {/* Keyboard Hints */}
      <div className="bg-secondary-bg rounded-lg p-4 border border-border-color">
        <h3 className="text-sm font-medium text-text-secondary mb-2">Quick Tips:</h3>
        <ul className="text-xs text-text-secondary space-y-1">
          <li>• The code was sent to your email inbox</li>
          <li>• Check spam folder if you don't see it</li>
          <li>• You can type or paste the 6-digit code</li>
          <li>• Code will auto-verify when all 6 digits are entered</li>
        </ul>
      </div>
    </div>
  );
}