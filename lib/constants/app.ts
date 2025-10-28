/**
 * Application-level constants
 */

// Navigation configuration
export const NAVIGATION_ITEMS = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Courses', href: '/courses' },
  { name: 'Events', href: '/events' },
  { name: 'Scoreboard', href: '/scoreboard' },
  // { name: 'My Teams', href: '/teams' },
] as const;

// Application metadata
export const APP_CONFIG = {
  name: 'CRDF Global CTF Platform',
  version: '1.0.0',
  description: 'Capture the flag competitions and cybersecurity training delivery',
  supportEmail: 'support@crdfglobal.org',
  maxTeamSize: 4,
  minTeamSize: 1,
} as const;

// User roles
export const USER_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
} as const;

// Challenge statuses
export const CHALLENGE_STATUS = {
  SOLVED: 'Solved',
  IN_PROGRESS: 'In Progress',
  UNSOLVED: 'Unsolved',
  NOT_ATTEMPTED: 'Not attempted',
} as const;

// Challenge difficulties
export const CHALLENGE_DIFFICULTY = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
  EXPERT: 'Expert',
} as const;

// Challenge categories
export const CHALLENGE_CATEGORIES = {
  WEB: 'WEB',
  CRYPTO: 'CRYPTO',
  FORENSICS: 'FORENSICS',
  CLOUD: 'CLOUD',
  REVERSE: 'REVERSE',
  PWN: 'PWN',
} as const;

// Team member roles
export const TEAM_ROLES = {
  LEADER: 'leader',
  MEMBER: 'member',
} as const;

// Question statuses
export const QUESTION_STATUS = {
  NOT_ATTEMPTED: 'Not attempted',
  IN_PROGRESS: 'In Progress',
  SOLVED: 'Solved',
  FAILED: 'Failed',
} as const;

// Artifact types
export const ARTIFACT_TYPES = {
  FILE: 'file',
  LOG: 'log',
  WORDLIST: 'wordlist',
  NOTES: 'notes',
} as const;

// Course icons
export const COURSE_ICONS = {
  CYBERSECURITY: 'cybersecurity',
  WEB_SECURITY: 'web_security',
  NETWORK: 'network',
  FORENSICS: 'forensics',
} as const;

// Scoreboard highlights
export const SCOREBOARD_HIGHLIGHTS = {
  GOLD: 'gold',
  SILVER: 'silver',
  BRONZE: 'bronze',
  NONE: 'none',
} as const;

// Trend directions
export const TREND_DIRECTIONS = {
  UP: 'up',
  DOWN: 'down',
  STABLE: 'stable',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  LANGUAGE: 'ctf-language',
  THEME: 'ctf-theme',
  USER_PREFERENCES: 'ctf-user-preferences',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
  },
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE: '/api/users/update',
  },
  TEAMS: {
    LIST: '/api/teams',
    CREATE: '/api/teams/create',
    JOIN: '/api/teams/join',
    LEAVE: '/api/teams/leave',
  },
  CHALLENGES: {
    LIST: '/api/challenges',
    DETAIL: '/api/challenges/:id',
    SUBMIT: '/api/challenges/:id/submit',
  },
  SCOREBOARD: {
    LIVE: '/api/scoreboard/live',
    HISTORY: '/api/scoreboard/history',
  },
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const;

// Time formats
export const TIME_FORMATS = {
  DISPLAY: 'HH:mm:ss',
  DATE_DISPLAY: 'MMM DD, YYYY',
  DATETIME_DISPLAY: 'MMM DD, YYYY HH:mm',
} as const;

// Validation limits
// Note: Password validation is now dynamic and uses system settings
export const VALIDATION_LIMITS = {
  // MIN_PASSWORD_LENGTH: 8, // Now dynamic from public/settings/ API
  // MAX_PASSWORD_LENGTH: 128, // Now dynamic from public/settings/ API
  MIN_TEAM_NAME_LENGTH: 2,
  MAX_TEAM_NAME_LENGTH: 50,
  MIN_CHALLENGE_TITLE_LENGTH: 5,
  MAX_CHALLENGE_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
} as const;
