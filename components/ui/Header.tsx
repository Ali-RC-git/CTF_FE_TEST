"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSelector } from "./LanguageSelector";

interface HeaderProps {
  showLoginButton?: boolean;
  showSignupButton?: boolean;
  showLanguageSelector?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  showLoginButton = true, 
  showSignupButton = true,
  showLanguageSelector = false
}) => {
  const { t } = useLanguage();

  return (
    <header className="py-4 border-b border-border-color w-full">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-text-primary">
            <div className="bg-accent-color w-8 h-8 rounded-full flex items-center justify-center text-white">C</div>
            <span>{t.header.logo}</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {showLanguageSelector && (
              <LanguageSelector />
            )}
            {showLoginButton && (
              <Link href="/login" className="inline-block py-2 px-4 border border-accent-color text-accent-color rounded-lg hover:bg-card-bg transition">
                {t.header.login}
              </Link>
            )}
            {showSignupButton && (
              <Link href="/signup" className="inline-block py-2 px-4 bg-accent-color text-white rounded-lg hover:bg-accent-dark transition">
                {t.header.signup}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};