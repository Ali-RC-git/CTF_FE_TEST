import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { AuthProvider } from "@/lib/context/AuthContext";
import AuthLoader from "@/components/auth/AuthLoader";
import AuthErrorBoundary from "@/components/auth/AuthErrorBoundary";
import { ToastProvider } from "@/components/providers/ToastProvider";
import SessionManager from "@/components/auth/SessionManager";

export const metadata: Metadata = { 
  title: "CRDF Global | Cybersecurity Training Platform", 
  description: "Cybersecurity Training Platform" 
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-primary-bg text-text-primary min-h-screen">
        <AuthErrorBoundary>
          <AuthProvider>
            <AuthLoader>
              <LanguageProvider>
                <SessionManager />
                {children}
                <ToastProvider />
              </LanguageProvider>
            </AuthLoader>
          </AuthProvider>
        </AuthErrorBoundary>
      </body>
    </html>
  );
}