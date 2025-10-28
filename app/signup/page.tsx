"use client";
import SignUpForm from "./components/SignUpForm";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignupPage() {
  const { t } = useLanguage();
  
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
        
        {/* Registration Card */}
        <div className="bg-card-bg rounded-xl p-4 sm:p-6 lg:p-8 border border-border-color shadow-2xl">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}