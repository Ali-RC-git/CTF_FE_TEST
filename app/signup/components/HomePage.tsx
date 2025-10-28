"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Header } from "@/components/ui/Header";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { eventsAPI } from "@/lib/api/events";

const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const [eventCode, setEventCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    eventData?: any;
  } | null>(null);

  const handleEventCodeValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventCode.trim()) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await eventsAPI.validateEventCode(eventCode.trim());
      
      if (result.success && result.valid) {
        // Redirect immediately to signup with event code
        router.push(`/signup?eventCode=${encodeURIComponent(eventCode.trim())}`);
      } else {
        setValidationResult({
          isValid: false,
          message: result.message || "Invalid event code. Please check and try again."
        });
      }
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: "Failed to validate event code. Please try again."
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-primary-bg text-text-primary">
      {/* Header */}
      <Header showLanguageSelector={true} />

      {/* Hero Section */}
      <section className="py-20 flex-grow">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-accent-color mb-6">
              {t.hero.title}
            </h1>
            <p className="text-lg text-text-secondary mb-8">
              {t.hero.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="inline-block py-3 px-6 bg-accent-color text-white rounded-lg hover:bg-accent-dark transition font-semibold">
                {t.hero.getStarted}
              </Link>
              <Link href="/about" className="inline-block py-3 px-6 border border-accent-color text-accent-color rounded-lg hover:bg-card-bg transition font-semibold">
                {t.hero.learnMore}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Event Code Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="bg-secondary-bg rounded-lg p-8 max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-accent-color mb-4">{t.eventCode.title}</h2>
            <p className="text-text-secondary mb-6">
              {t.eventCode.description}
            </p>
            
            {/* Event Code Input Form */}
            <form onSubmit={handleEventCodeValidation} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="text"
                  value={eventCode}
                  onChange={(e) => setEventCode(e.target.value)}
                  placeholder={t.eventCode.placeholder}
                  className="flex-1 px-4 py-3 bg-primary-bg border border-border-color rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent"
                  disabled={isValidating}
                />
                <button
                  type="submit"
                  disabled={isValidating || !eventCode.trim()}
                  className="px-6 py-3 bg-accent-color text-white rounded-lg hover:bg-accent-dark transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isValidating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t.eventCode.validating}
                    </>
                  ) : (
                    t.eventCode.signup
                  )}
                </button>
              </div>
            </form>

            {/* Validation Result */}
            {validationResult && (
              <div className={`mt-4 p-4 rounded-lg ${
                validationResult.isValid 
                  ? 'bg-green-900 bg-opacity-20 border border-green-500 text-green-400' 
                  : 'bg-red-900 bg-opacity-20 border border-red-500 text-red-400'
              }`}>
                <p className="text-sm font-medium">{validationResult.message}</p>
                {validationResult.isValid && validationResult.eventData && (
                  <div className="mt-2 text-xs text-text-secondary">
                    <p><strong>Event:</strong> {validationResult.eventData.event_name}</p>
                    {validationResult.eventData.event_description && (
                      <p><strong>Description:</strong> {validationResult.eventData.event_description}</p>
                    )}
                    <p><strong>Status:</strong> {validationResult.eventData.is_upcoming ? 'Upcoming' : 'Active'}</p>
                  </div>
                )}
              </div>
            )}

            {/* Fallback Link */}
            <div className="mt-6 pt-4 border-t border-border-color">
              <p className="text-text-secondary text-sm mb-3">{t.eventCode.noCode}</p>
              <Link href="/signup" className="inline-block py-2 px-4 text-accent-color hover:text-accent-dark transition font-medium text-sm">
                {t.eventCode.createAccount}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border-color">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            <Link href="/about" className="text-text-secondary hover:text-accent-color transition">{t.footer.aboutUs}</Link>
            <Link href="/contact" className="text-text-secondary hover:text-accent-color transition">{t.footer.contact}</Link>
            <Link href="/privacy" className="text-text-secondary hover:text-accent-color transition">{t.footer.privacyPolicy}</Link>
            <Link href="/terms" className="text-text-secondary hover:text-accent-color transition">{t.footer.termsOfService}</Link>
            <Link href="/faqs" className="text-text-secondary hover:text-accent-color transition">{t.footer.faqs}</Link>
          </div>
          <p className="text-center text-text-secondary text-sm">{t.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;