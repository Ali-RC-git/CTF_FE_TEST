"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";
import { authAPI } from "@/lib/api/auth";
import { APIError } from "@/lib/api/client";
import VerificationScreen from "@/app/signup/components/VerificationScreen";

export default function OTPVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();
  
  const [email, setEmail] = useState('');
  const [eventCode, setEventCode] = useState('');
  const [isResending, setIsResending] = useState(false);

  // Get email and eventCode from URL parameters
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const eventCodeParam = searchParams.get('eventCode');
    
    if (emailParam) {
      setEmail(emailParam);
      // Show welcome message when arriving from registration
      showSuccess('Account created successfully! Please enter your verification code or click "Resend OTP" if you haven\'t received it.');
    } else {
      // If no email, redirect back to signup
      router.push('/signup');
    }
    
    if (eventCodeParam) {
      setEventCode(eventCodeParam);
    }
  }, [searchParams, router, showSuccess]);

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
    
    setIsResending(true);
    
    try {
      const response = await authAPI.resendOTP({
        email: email
      });

      if (response.success) {
        showSuccess('Verification code sent successfully!', { duration: 6000 });
      } else {
        // Handle specific error cases
        if (response.message.includes('already verified')) {
          showError('Your account is already verified. You can now log in.', { duration: 8000 });
          // Redirect to login after showing the message
          setTimeout(() => {
            const loginUrl = eventCode ? `/login?eventCode=${eventCode}` : '/login';
            router.push(loginUrl);
          }, 3000);
        } else if (response.message.includes('not found')) {
          showError('No account found with this email address. Please check your email or sign up again.', { duration: 8000 });
        } else {
          showError(response.message || 'Failed to send verification code', { duration: 6000 });
        }
      }
    } catch (error) {
      console.error('Failed to send verification code:', error);
      
      // Handle API errors with specific messages
      if (error instanceof APIError) {
        if (error.message.includes('already verified')) {
          showError('Your account is already verified. You can now log in.', { duration: 8000 });
          setTimeout(() => {
            const loginUrl = eventCode ? `/login?eventCode=${eventCode}` : '/login';
            router.push(loginUrl);
          }, 3000);
        } else if (error.message.includes('not found')) {
          showError('No account found with this email address. Please check your email or sign up again.', { duration: 8000 });
        } else {
          showError(error.message, { duration: 6000 });
        }
      } else {
        showError('Failed to send verification code. Please try again.', { duration: 6000 });
      }
    } finally {
      setIsResending(false);
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
    <div className="min-h-screen bg-primary-bg text-text-primary flex items-center justify-center py-4 px-4 sm:py-10 sm:px-5">
      <div className="w-full max-w-lg lg:max-w-xl mx-auto">

        {/* Logo Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center text-2xl sm:text-3xl font-bold text-text-primary mb-2 sm:mb-3 hover:opacity-80 transition-opacity duration-200">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-accent-dark to-accent-color rounded-xl flex items-center justify-center mr-3 sm:mr-4 font-bold text-xl sm:text-2xl text-white">
              C
            </div>
            <span className="hidden xs:inline">CRDF Global</span>
            <span className="xs:hidden">CRDF</span>
          </Link>
          <p className="text-text-secondary text-base sm:text-lg">Cybersecurity Training Platform</p>
        </div>
        
        {/* Verification Card */}
        <div className="bg-card-bg rounded-xl p-4 sm:p-6 lg:p-8 border border-border-color shadow-2xl">
          <VerificationScreen
            email={email}
            onVerificationSuccess={handleVerificationSuccess}
            onBack={handleBack}
            onResendCode={handleResendCode}
            eventCode={eventCode}
          />
        </div>
      </div>
    </div>
  );
}
