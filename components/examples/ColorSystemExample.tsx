"use client";
import { getTeamColor, getDifficultyColor, getStatusColor } from "@/lib/colors";

/**
 * Example component demonstrating the centralized color system
 * This component shows how to use the various color utilities and semantic colors
 */
export const ColorSystemExample = () => {
  return (
    <div className="p-6 bg-dark-background text-text-primary min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-interactive-primary mb-2">
            Color System Examples
          </h1>
          <p className="text-text-secondary">
            Demonstrating the centralized color system implementation
          </p>
        </div>

        {/* Background Colors */}
        <section className="bg-dark-surface rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Background Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-dark-background p-4 rounded border border-border-default">
              <h3 className="text-text-primary font-medium">Primary Background</h3>
              <p className="text-text-secondary text-sm">bg-dark-background</p>
            </div>
            <div className="bg-dark-surface p-4 rounded border border-border-default">
              <h3 className="text-text-primary font-medium">Surface Background</h3>
              <p className="text-text-secondary text-sm">bg-dark-surface</p>
            </div>
            <div className="bg-dark-surface-hover p-4 rounded border border-border-default">
              <h3 className="text-text-primary font-medium">Surface Hover</h3>
              <p className="text-text-secondary text-sm">bg-dark-surface-hover</p>
            </div>
          </div>
        </section>

        {/* Interactive Elements */}
        <section className="bg-dark-surface rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Interactive Elements</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-interactive-primary text-white px-4 py-2 rounded-lg hover:bg-interactive-primary-hover transition">
              Primary Button
            </button>
            <button className="border border-interactive-primary text-interactive-primary px-4 py-2 rounded-lg hover:bg-interactive-primary/10 transition">
              Secondary Button
            </button>
            <button className="bg-interactive-secondary text-white px-4 py-2 rounded-lg hover:bg-interactive-secondary-hover transition">
              Secondary Action
            </button>
          </div>
        </section>

        {/* Team Colors */}
        <section className="bg-dark-surface rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Team Colors</h2>
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="text-center">
                <div 
                  className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-sm font-medium`}
                  style={{ backgroundColor: getTeamColor(i) }}
                >
                  {i + 1}
                </div>
                <p className="text-text-muted text-xs">Team {i + 1}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Difficulty Colors */}
        <section className="bg-dark-surface rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Difficulty Levels</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['easy', 'medium', 'hard', 'expert'] as const).map((difficulty) => (
              <div key={difficulty} className="text-center">
                <div 
                  className="w-16 h-16 rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: getDifficultyColor(difficulty) }}
                >
                  {difficulty.toUpperCase()}
                </div>
                <p className="text-text-muted text-sm capitalize">{difficulty}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Status Colors */}
        <section className="bg-dark-surface rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Status Indicators</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(['active', 'inactive', 'pending', 'completed', 'failed'] as const).map((status) => (
              <div key={status} className="text-center">
                <div 
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: getStatusColor(status) }}
                >
                  {status.charAt(0).toUpperCase()}
                </div>
                <p className="text-text-muted text-xs capitalize">{status}</p>
              </div>
            ))}
          </div>
        </section>

        {/* State Colors */}
        <section className="bg-dark-surface rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">State Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-state-success/20 border border-state-success p-4 rounded-lg">
              <h3 className="text-state-success font-medium">Success</h3>
              <p className="text-text-secondary text-sm">Operation completed successfully</p>
            </div>
            <div className="bg-state-warning/20 border border-state-warning p-4 rounded-lg">
              <h3 className="text-state-warning font-medium">Warning</h3>
              <p className="text-text-secondary text-sm">Please review before proceeding</p>
            </div>
            <div className="bg-state-error/20 border border-state-error p-4 rounded-lg">
              <h3 className="text-state-error font-medium">Error</h3>
              <p className="text-text-secondary text-sm">Something went wrong</p>
            </div>
            <div className="bg-state-info/20 border border-state-info p-4 rounded-lg">
              <h3 className="text-state-info font-medium">Info</h3>
              <p className="text-text-secondary text-sm">Additional information</p>
            </div>
          </div>
        </section>

        {/* Text Colors */}
        <section className="bg-dark-surface rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Text Colors</h2>
          <div className="space-y-3">
            <p className="text-text-primary text-lg">Primary Text - Main content and headings</p>
            <p className="text-text-secondary">Secondary Text - Supporting content and descriptions</p>
            <p className="text-text-muted">Muted Text - Less important information</p>
            <p className="text-text-disabled">Disabled Text - Inactive or unavailable content</p>
          </div>
        </section>

        {/* Form Elements */}
        <section className="bg-dark-surface rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Form Elements</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-text-primary text-sm font-medium mb-2">
                Sample Input
              </label>
              <input 
                type="text" 
                placeholder="Enter text here..."
                className="w-full p-3 rounded-lg bg-dark-surface border border-border-default focus:outline-none focus:ring-2 focus:ring-interactive-primary text-text-primary placeholder-text-muted"
              />
            </div>
            <div>
              <label className="block text-text-primary text-sm font-medium mb-2">
                Sample Select
              </label>
              <select className="w-full p-3 rounded-lg bg-dark-surface border border-border-default focus:outline-none focus:ring-2 focus:ring-interactive-primary text-text-primary">
                <option>Choose an option</option>
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
