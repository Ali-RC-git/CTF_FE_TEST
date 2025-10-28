'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LanguageExample from '@/components/examples/LanguageExample';

export default function LanguageDemoPage() {


  return (
    <div className="min-h-screen bg-dark-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LanguageExample />
        </div>
      </main>
      <Footer />
    </div>
  );
}
