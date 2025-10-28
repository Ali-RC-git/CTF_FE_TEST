"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/lib/hooks/useToast";
import VerificationScreen from "@/app/signup/components/VerificationScreen";

export default function OTPVerificationScreenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();
  
  const [email, setEmail] = useState('');
  const [eventCode, setEventCode] = useState('');

  // Get email and eventCode from URL parameters
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const eventCodeParam = searchParams.get('eventCode');
    
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // If no email, redirect back to signup
      router.push('/signup');
    }
    
    if (eventCodeParam) {
      setEventCode(eventCodeParam);
    }
  }, [searchParams, router]);

  // Handle successful verification
  const handleVerificationSuccess = () => {
    showSuccess('Email verified successfully! You can now log in.');
    
    // Redirect to login page with event code if available
    const loginUrl = eventCode ? `/login?eventCode=${eventCode}` : '/login';
    router.push(loginUrl);
  };

  // Handle back to signup
  const handleBack = () => {
    const signupUrl = eventCode ? `/signup?eventCode=${eventCode}` : '/signup';
    router.push(signupUrl);
  };

  // Handle resend verification code
  const handleResendCode = async () => {
    if (!email) return;
    
    try {
      // Here you would typically make an API call to resend the verification code
      showSuccess('Verification code sent successfully!');
    } catch (error) {
      console.error('Failed to send verification code:', error);
      showError('Failed to send verification code. Please try again.');
    }
  };

  // Show loading if email is not yet loaded
  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-color mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-bg to-secondary-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <VerificationScreen
          email={email}
          onVerificationSuccess={handleVerificationSuccess}
          onBack={handleBack}
          onResendCode={handleResendCode}
          eventCode={eventCode}
        />
      </div>
    </div>
  );
}
