'use client';

import ChallengesContent from '../admin/components/ChallengesContent';

export default function TestChallengesPage() {
  return (
    <div className="min-h-screen bg-primary-bg text-text-primary">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-accent-color mb-2">Challenge Management (Test Mode)</h1>
          <p className="text-text-secondary">
            This is a test page that bypasses authentication for development purposes.
            <a href="/admin/challenges" className="text-accent-color underline ml-2">
              Go to main admin page
            </a>
          </p>
        </div>
        <ChallengesContent />
      </div>
    </div>
  );
}
