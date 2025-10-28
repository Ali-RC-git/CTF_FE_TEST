"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export const LanguageSelector: React.FC = () => {
  const { language, changeLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: t.languageToggle.en },
    { code: 'es', name: t.languageToggle.es }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (langCode: 'en' | 'es') => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-text-secondary text-sm">Language:</span>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-secondary-bg rounded-lg text-sm font-medium text-text-primary hover:bg-accent-color hover:text-white transition-colors duration-200 min-w-[100px] justify-between"
        >
          <span>{currentLanguage?.name}</span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-full bg-secondary-bg rounded-lg shadow-lg border border-border-color z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code as 'en' | 'es')}
                className={`w-full px-3 py-2 text-left text-sm font-medium transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                  language === lang.code
                    ? 'bg-accent-color text-white'
                    : 'text-text-primary hover:bg-accent-color hover:text-white'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
