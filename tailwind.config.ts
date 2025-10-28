import type { Config } from "tailwindcss";
import { colors, semanticColors } from "./lib/colors";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: colors.primary,
        
        // Secondary colors
        secondary: colors.secondary,
        
        // State colors
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        
        // Neutral colors
        gray: colors.gray,
        
        // Dark theme colors
        dark: {
          background: colors.dark.background,
          surface: colors.dark.surface,
          'surface-hover': colors.dark.surfaceHover,
          border: colors.dark.border,
          'border-light': colors.dark.borderLight,
          text: colors.dark.text,
        },
        
        // Team colors
        team: colors.team,
        
        // Difficulty colors
        difficulty: colors.difficulty,
        
        // Status colors
        status: colors.status,
        
        // Semantic colors for easy access
        background: semanticColors.background,
        text: semanticColors.text,
        border: semanticColors.border,
        interactive: semanticColors.interactive,
        state: semanticColors.state,
        
        // CSS Variable colors for direct usage
        'primary-bg': 'var(--primary-bg)',
        'secondary-bg': 'var(--secondary-bg)',
        'accent-color': 'var(--accent-color)',
        'accent-light': 'var(--accent-light)',
        'accent-dark': 'var(--accent-dark)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'border-color': 'var(--border-color)',
        'card-bg': 'var(--card-bg)',
        'success-color': 'var(--success-color)',
        'warning-color': 'var(--warning-color)',
        'danger-color': 'var(--danger-color)',
        'admin-color': 'var(--admin-color)',
      }
    }
  },
  plugins: [],
};
export default config;
