import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-dark-background border-t border-border-default py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <Link href="/" className="flex items-center mb-4 hover:opacity-80 transition-opacity duration-200">
            <div className="w-8 h-8 bg-interactive-primary rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-text-primary text-xl font-semibold">CRDF Global</span>
          </Link>
          
          {/* Copyright and Mission */}
          <p className="text-text-secondary text-sm">
            Cybersecurity Training Platform © 2023 | Empowering the next generation of cybersecurity professionals
          </p>
        </div>
      </div>
    </footer>
  );
}
