/**
 * Centralized Color System for CTF UI
 * 
 * This file defines all colors used throughout the application.
 * Use these constants instead of hardcoded color values to ensure consistency.
 */

// Base color palette based on the new design system
export const colors = {
  // Primary brand colors (Purple theme)
  primary: {
    50: '#f0e6ff',   // --text-primary
    100: '#e0d1ff',
    200: '#c2b0e6',  // --text-secondary
    300: '#a67cff',  // --accent-light
    400: '#8a4fff',  // --accent-color
    500: '#8a4fff',  // Main primary color (--accent-color)
    600: '#6b30e6',  // --accent-dark
    700: '#5a1fb8',
    800: '#4a2d7a',  // --border-color
    900: '#2d1b4e',  // --secondary-bg
    950: '#1a102b',  // --primary-bg
  },

  // Secondary colors (Card backgrounds)
  secondary: {
    50: '#f0e6ff',
    100: '#e0d1ff',
    200: '#c2b0e6',
    300: '#a67cff',
    400: '#8a4fff',
    500: '#35215a',  // --card-bg
    600: '#2d1b4e',  // --secondary-bg
    700: '#1a102b',  // --primary-bg
    800: '#0f0a1e',
    900: '#0a0514',
    950: '#05030a',
  },

  // Success colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#6fcf97',  // --success-color
    500: '#6fcf97',  // --success-color
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // Warning colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#f2c94c',  // --warning-color
    500: '#f2c94c',  // --warning-color
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // Error/Danger colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#eb5757',  // --danger-color
    600: '#eb5757',  // --danger-color
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // Admin colors
  admin: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ff6b6b',  // --admin-color
    600: '#ff6b6b',  // --admin-color
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // Neutral/Gray colors
  gray: {
    50: '#f0e6ff',   // --text-primary
    100: '#e0d1ff',
    200: '#c2b0e6',  // --text-secondary
    300: '#a67cff',
    400: '#8a4fff',
    500: '#4a2d7a',  // --border-color
    600: '#2d1b4e',  // --secondary-bg
    700: '#1a102b',  // --primary-bg
    800: '#0f0a1e',
    900: '#0a0514',
    950: '#05030a',
  },

  // Dark theme specific colors
  dark: {
    background: '#1a102b', // --primary-bg
    surface: '#2d1b4e',    // --secondary-bg
    surfaceHover: '#35215a', // --card-bg
    border: '#4a2d7a',     // --border-color
    borderLight: '#6b30e6', // --accent-dark
    text: {
      primary: '#f0e6ff',   // --text-primary
      secondary: '#c2b0e6', // --text-secondary
      muted: '#8a4fff',     // --accent-color
      disabled: '#4a2d7a',  // --border-color
    },
  },

  // Team colors for CTF teams (using new color scheme)
  team: {
    purple: '#8a4fff',  // --accent-color
    blue: '#6b30e6',    // --accent-dark
    green: '#6fcf97',   // --success-color
    yellow: '#f2c94c',  // --warning-color
    red: '#eb5757',     // --danger-color
    indigo: '#4a2d7a',  // --border-color
    pink: '#ff6b6b',    // --admin-color
    teal: '#a67cff',    // --accent-light
    orange: '#f2c94c',  // --warning-color
    cyan: '#c2b0e6',    // --text-secondary
  },

  // Challenge difficulty colors
  difficulty: {
    easy: '#6fcf97',    // --success-color
    medium: '#f2c94c', // --warning-color
    hard: '#eb5757',    // --danger-color
    expert: '#8a4fff',  // --accent-color
  },

  // Status colors
  status: {
    active: '#6fcf97',   // --success-color
    inactive: '#4a2d7a', // --border-color
    pending: '#f2c94c', // --warning-color
    completed: '#8a4fff', // --accent-color
    failed: '#eb5757',   // --danger-color
  },
} as const;

// Semantic color mappings for easy access
export const semanticColors = {
  // Background colors
  background: {
    primary: colors.dark.background,    // --primary-bg
    secondary: colors.dark.surface,     // --secondary-bg
    tertiary: colors.dark.surfaceHover, // --card-bg
  },

  // Text colors
  text: {
    primary: colors.dark.text.primary,   // --text-primary
    secondary: colors.dark.text.secondary, // --text-secondary
    muted: colors.dark.text.muted,       // --accent-color
    disabled: colors.dark.text.disabled, // --border-color
  },

  // Border colors
  border: {
    default: colors.dark.border,        // --border-color
    light: colors.dark.borderLight,     // --accent-dark
    primary: colors.primary[500],       // --accent-color
  },

  // Interactive colors
  interactive: {
    primary: colors.primary[500],       // --accent-color
    primaryHover: colors.primary[300],   // --accent-light
    primaryActive: colors.primary[600], // --accent-dark
    secondary: colors.secondary[500],   // --card-bg
    secondaryHover: colors.secondary[600], // --secondary-bg
  },

  // State colors
  state: {
    success: colors.success[500],       // --success-color
    warning: colors.warning[500],       // --warning-color
    error: colors.error[500],           // --danger-color
    info: colors.primary[500],          // --accent-color
    admin: colors.admin[500],           // --admin-color
  },
} as const;

// Utility function to get team color by index
export const getTeamColor = (index: number): string => {
  const teamColors = Object.values(colors.team);
  return teamColors[index % teamColors.length];
};

// Utility function to get difficulty color
export const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard' | 'expert'): string => {
  return colors.difficulty[difficulty];
};

// Utility function to get status color
export const getStatusColor = (status: keyof typeof colors.status): string => {
  return colors.status[status];
};

// Type definitions for better TypeScript support
export type ColorScale = keyof typeof colors.primary;
export type TeamColor = keyof typeof colors.team;
export type DifficultyLevel = keyof typeof colors.difficulty;
export type StatusType = keyof typeof colors.status;
