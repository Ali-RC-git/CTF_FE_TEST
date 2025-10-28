'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LanguageExample() {
  const { language, t, changeLanguage } = useLanguage();

  return (
    <div className="bg-dark-surface rounded-lg p-6 mb-8">
      <h2 className="text-text-primary text-2xl font-semibold mb-6">
        Language System Demo
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language Toggle */}
        <div className="bg-dark-background rounded-lg p-4">
          <h3 className="text-text-primary text-lg font-medium mb-4">
            Language Toggle
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeLanguage('en')}
              className={`px-3 py-2 rounded transition-colors duration-200 ${
                language === 'en' 
                  ? 'bg-interactive-primary text-white' 
                  : 'text-text-muted hover:text-interactive-primary'
              }`}
            >
              {t.languageToggle.en}
            </button>
            <span className="text-text-muted">|</span>
            <button
              onClick={() => changeLanguage('es')}
              className={`px-3 py-2 rounded transition-colors duration-200 ${
                language === 'es' 
                  ? 'bg-interactive-primary text-white' 
                  : 'text-text-muted hover:text-interactive-primary'
              }`}
            >
              {t.languageToggle.es}
            </button>
          </div>
        </div>

        {/* Current Language Display */}
        <div className="bg-dark-background rounded-lg p-4">
          <h3 className="text-text-primary text-lg font-medium mb-4">
            Current Language
          </h3>
          <p className="text-text-secondary">
            Selected: <span className="text-interactive-primary font-medium">{language.toUpperCase()}</span>
          </p>
        </div>
      </div>

      {/* Translation Examples */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-dark-background rounded-lg p-4">
          <h4 className="text-text-primary font-medium mb-2">Navigation</h4>
          <ul className="space-y-1 text-sm">
            <li className="text-text-secondary">{t.navigation.dashboard}</li>
            <li className="text-text-secondary">{t.navigation.events}</li>
            <li className="text-text-secondary">{t.navigation.teams}</li>
            <li className="text-text-secondary">{t.navigation.scoreboard}</li>
          </ul>
        </div>

        <div className="bg-dark-background rounded-lg p-4">
          <h4 className="text-text-primary font-medium mb-2">Dashboard</h4>
          <ul className="space-y-1 text-sm">
            <li className="text-text-secondary">{t.dashboard.welcomeBack}</li>
            <li className="text-text-secondary">{t.dashboard.points}</li>
            <li className="text-text-secondary">{t.dashboard.challengesSolved}</li>
            <li className="text-text-secondary">{t.dashboard.rank}</li>
          </ul>
        </div>

        <div className="bg-dark-background rounded-lg p-4">
          <h4 className="text-text-primary font-medium mb-2">Challenges</h4>
          <ul className="space-y-1 text-sm">
            <li className="text-text-secondary">{t.challenges.startChallenge}</li>
            <li className="text-text-secondary">{t.challenges.continueChallenge}</li>
            <li className="text-text-secondary">{t.challenges.getHint}</li>
            <li className="text-text-secondary">{t.challenges.vmAvailable}</li>
          </ul>
        </div>

        <div className="bg-dark-background rounded-lg p-4">
          <h4 className="text-text-primary font-medium mb-2">Difficulty Levels</h4>
          <ul className="space-y-1 text-sm">
            <li className="text-text-secondary">{t.challenges.easy}</li>
            <li className="text-text-secondary">{t.challenges.medium}</li>
            <li className="text-text-secondary">{t.challenges.hard}</li>
            <li className="text-text-secondary">{t.challenges.expert}</li>
          </ul>
        </div>

        <div className="bg-dark-background rounded-lg p-4">
          <h4 className="text-text-primary font-medium mb-2">Status</h4>
          <ul className="space-y-1 text-sm">
            <li className="text-text-secondary">{t.challenges.solved}</li>
            <li className="text-text-secondary">{t.challenges.inProgress}</li>
            <li className="text-text-secondary">{t.challenges.unsolved}</li>
          </ul>
        </div>

        <div className="bg-dark-background rounded-lg p-4">
          <h4 className="text-text-primary font-medium mb-2">Common Actions</h4>
          <ul className="space-y-1 text-sm">
            <li className="text-text-secondary">{t.common.save}</li>
            <li className="text-text-secondary">{t.common.cancel}</li>
            <li className="text-text-secondary">{t.common.edit}</li>
            <li className="text-text-secondary">{t.common.delete}</li>
          </ul>
        </div>
      </div>

      {/* Team Page Examples */}
      <div className="mt-6 bg-dark-background rounded-lg p-4">
        <h4 className="text-text-primary font-medium mb-4">Team Management</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-text-secondary text-sm font-medium mb-2">Create Team</h5>
            <ul className="space-y-1 text-sm text-text-muted">
              <li>{t.teamPage.createTeam.title}</li>
              <li>{t.teamPage.createTeam.teamName}</li>
              <li>{t.teamPage.createTeam.description}</li>
              <li>{t.teamPage.createTeam.visibility}</li>
            </ul>
          </div>
          <div>
            <h5 className="text-text-secondary text-sm font-medium mb-2">Join Team</h5>
            <ul className="space-y-1 text-sm text-text-muted">
              <li>{t.teamPage.joinTeam.title}</li>
              <li>{t.teamPage.joinTeam.searchPlaceholder}</li>
              <li>{t.teamPage.joinTeam.requestJoin}</li>
              <li>{t.teamPage.joinTeam.enterCode}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Authentication Examples */}
      <div className="mt-6 bg-dark-background rounded-lg p-4">
        <h4 className="text-text-primary font-medium mb-4">Authentication</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-text-secondary text-sm font-medium mb-2">Login</h5>
            <ul className="space-y-1 text-sm text-text-muted">
              <li>{t.loginPage.title}</li>
              <li>{t.loginPage.email}</li>
              <li>{t.loginPage.password}</li>
              <li>{t.loginPage.forgotPassword}</li>
            </ul>
          </div>
          <div>
            <h5 className="text-text-secondary text-sm font-medium mb-2">Signup</h5>
            <ul className="space-y-1 text-sm text-text-muted">
              <li>{t.signupPage.title}</li>
              <li>{t.signupPage.firstName}</li>
              <li>{t.signupPage.lastName}</li>
              <li>{t.signupPage.organization}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
