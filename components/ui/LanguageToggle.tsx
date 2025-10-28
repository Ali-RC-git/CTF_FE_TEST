"use client";
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Language } from '@/lib/i18n/translations';

export const LanguageToggle: React.FC = () => {
  const { language, changeLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 rounded ${language === 'en' ? 'bg-interactive-primary text-white' : 'text-text-muted hover:text-interactive-primary'}`}
      >
        {t.languageToggle.en}
      </button>
      <span className="text-text-muted">|</span>
      <button
        onClick={() => changeLanguage('es')}
        className={`px-2 py-1 rounded ${language === 'es' ? 'bg-interactive-primary text-white' : 'text-text-muted hover:text-interactive-primary'}`}
      >
        {t.languageToggle.es}
      </button>
    </div>
  );
};