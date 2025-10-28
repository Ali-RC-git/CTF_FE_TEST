/**
 * Main constants file - Re-exports all constants from organized modules
 * 
 * This file provides a single entry point for all application constants.
 * Individual constant files are organized by category for better maintainability.
 */

// Re-export all constants from organized modules
export * from './constants/app';
export * from './constants/ui';
export * from './constants/api';
export * from './constants/validation';
export * from './constants/mock-data';

// Legacy constants for backward compatibility - DEPRECATED
export const DIFFICULTY_COLORS = {
  Easy: 'bg-success-color',
  Medium: 'bg-warning-color',
  Hard: 'bg-danger-color',
  Expert: 'bg-accent-color',
} as const;

export const COLORS = {
  primary: '#1A1A2E',
  secondary: '#6A0DAD',
  accent: '#8B5CF6',
  text: '#FFFFFF',
} as const;
