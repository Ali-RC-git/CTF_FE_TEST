'use client';

import { useState, useEffect } from 'react';
import { otpAPI, VerifyOTPResponse } from '@/lib/api/otp';

interface OTPVerificationProps {
  email: string;
  onOTPVerified: (otpId: string) => void;
  onResendOTP: () => void;
  onBack: () => void;
  isResending?: boolean;
}

export default function OTPVerification({
  email,
  onOTPVerified,
  onResendOTP,
  onBack,
  isResending = false
}: OTPVerificationProps) {
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Auto-focus on OTP input
  useEffect(() => {
    const otpInput = document.getElementById('otp-input');
    if (otpInput) {
      otpInput.focus();
    }
  }, []);

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only digits, max 6
    setOtpCode(value);
    setError(null);
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP code');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await otpAPI.verifyOTP({
        email,
        otp_code: otpCode
      });

      if (response.success) {
        onOTPVerified(response.data.otp_id);
      } else {
        setError(response.message || 'Invalid OTP code');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setCanResend(false);
    setTimeLeft(300); // Reset timer
    setOtpCode('');
    setError(null);
    onResendOTP();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto bg-card-bg rounded-xl p-4 sm:p-6 border border-border-color shadow-lg">
      <div className="text-center mb-4 sm:mb-6">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent-color bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <span className="text-xl sm:text-2xl">📧</span>
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-2">
          Verify Your Email
        </h2>
        <p className="text-text-secondary text-xs sm:text-sm">
          We've sent a 6-digit verification code to
        </p>
        <p className="text-accent-color font-medium text-sm sm:text-base">{email}</p>
      </div>

      <div className="space-y-4">
        {/* OTP Input */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Enter Verification Code
          </label>
          <input
            id="otp-input"
            type="text"
            value={otpCode}
            onChange={handleOTPChange}
            placeholder="000000"
            className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-accent-color"
            maxLength={6}
            disabled={isVerifying}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Timer */}
        <div className="text-center">
          {timeLeft > 0 ? (
            <p className="text-text-secondary text-sm">
              Code expires in <span className="text-accent-color font-medium">{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <p className="text-text-secondary text-sm">
              Code has expired
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleVerifyOTP}
            disabled={otpCode.length !== 6 || isVerifying}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Verifying...
              </>
            ) : (
              <>
                <span>✓</span>
                Verify Code
              </>
            )}
          </button>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 btn-secondary"
              disabled={isVerifying}
            >
              Back
            </button>
            <button
              onClick={handleResendOTP}
              disabled={!canResend || isResending}
              className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? 'Sending...' : 'Resend Code'}
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-text-secondary text-xs">
            Didn't receive the code? Check your spam folder or{' '}
            <button
              onClick={handleResendOTP}
              disabled={!canResend || isResending}
              className="text-accent-color hover:text-accent-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              resend
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
