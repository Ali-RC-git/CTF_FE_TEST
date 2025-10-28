"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ForgotPasswordEmail } from './components/ForgotPasswordEmail';
import { ResetPasswordForm } from './components/ResetPasswordForm';
import { useToast } from '@/lib/hooks/useToast';

type ForgotPasswordStep = 'email' | 'reset' | 'success';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<ForgotPasswordStep>('email');
  const [email, setEmail] = useState('');
  const router = useRouter();
  const { showSuccess } = useToast();

  const handleEmailSuccess = (userEmail: string) => {
    setEmail(userEmail);
    setStep('reset');
  };

  const handleResetSuccess = () => {
    setStep('success');
    showSuccess('Password reset successfully! You can now log in with your new password.');
    // Redirect to login after a short delay
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  };

  const handleBack = () => {
    if (step === 'reset') {
      setStep('email');
    } else {
      router.push('/login');
    }
  };

  const handleResendCode = () => {
    // This will be handled by the ResetPasswordForm component
  };

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

        {/* Content Card */}
        <div className="bg-card-bg rounded-xl p-4 sm:p-6 lg:p-8 border border-border-color shadow-2xl">
          {step === 'email' && (
            <ForgotPasswordEmail
              onSuccess={handleEmailSuccess}
              onBack={handleBack}
            />
          )}

          {step === 'reset' && (
            <ResetPasswordForm
              email={email}
              onSuccess={handleResetSuccess}
              onBack={handleBack}
              onResendCode={handleResendCode}
            />
          )}

          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">Password Reset Successful!</h2>
                <p className="text-text-secondary">
                  Your password has been reset successfully. You will be redirected to the login page shortly.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-color"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
