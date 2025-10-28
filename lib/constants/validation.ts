/**
 * Validation constants and patterns
 */

// Regular expressions for validation
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  TEAM_NAME: /^[a-zA-Z0-9\s_-]{2,50}$/,
  PHONE: /^\+?[\d\s-()]{10,}$/,
  URL: /^https?:\/\/.+/,
  FLAG_FORMAT: /^[a-zA-Z0-9_{}]+$/,
  IP_ADDRESS: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
} as const;

// Error messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_WEAK: 'Password must contain at least 8 characters with uppercase, lowercase, number, and special character',
  PASSWORD_MISMATCH: 'Passwords do not match',
  USERNAME_INVALID: 'Username must be 3-20 characters and contain only letters, numbers, hyphens, and underscores',
  TEAM_NAME_INVALID: 'Team name must be 2-50 characters and contain only letters, numbers, spaces, hyphens, and underscores',
  PHONE_INVALID: 'Please enter a valid phone number',
  URL_INVALID: 'Please enter a valid URL',
  FLAG_FORMAT_INVALID: 'Flag format is invalid',
  IP_INVALID: 'Please enter a valid IP address',
  HEX_COLOR_INVALID: 'Please enter a valid hex color code',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must be no more than ${max} characters`,
  MIN_VALUE: (min: number) => `Must be at least ${min}`,
  MAX_VALUE: (max: number) => `Must be no more than ${max}`,
  RANGE: (min: number, max: number) => `Must be between ${min} and ${max}`,
} as const;

// Form field constraints
export const FORM_CONSTRAINTS = {
  USER: {
    FIRST_NAME: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 50,
    },
    LAST_NAME: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 50,
    },
    EMAIL: {
      MAX_LENGTH: 255,
    },
    PASSWORD: {
      MIN_LENGTH: 8,
      MAX_LENGTH: 128,
    },
    ORGANIZATION: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 100,
    },
  },
  TEAM: {
    NAME: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 50,
    },
    DESCRIPTION: {
      MAX_LENGTH: 500,
    },
    MAX_SIZE: 4,
    MIN_SIZE: 1,
  },
  CHALLENGE: {
    TITLE: {
      MIN_LENGTH: 5,
      MAX_LENGTH: 100,
    },
    DESCRIPTION: {
      MAX_LENGTH: 1000,
    },
    POINTS: {
      MIN: 1,
      MAX: 1000,
    },
  },
  QUESTION: {
    TITLE: {
      MIN_LENGTH: 5,
      MAX_LENGTH: 200,
    },
    DESCRIPTION: {
      MAX_LENGTH: 1000,
    },
    INSTRUCTIONS: {
      MAX_ITEMS: 10,
      MAX_LENGTH_PER_ITEM: 500,
    },
  },
} as const;

// File upload constraints
export const FILE_CONSTRAINTS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'text/plain', 'application/msword'],
    ARCHIVES: ['application/zip', 'application/x-rar-compressed'],
    CODE: ['text/plain', 'application/json', 'text/xml'],
  },
  MAX_FILES_PER_UPLOAD: 5,
} as const;

// Rate limiting
export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: {
    MAX_ATTEMPTS: 5,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  },
  PASSWORD_RESET: {
    MAX_REQUESTS: 3,
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
  },
  API_REQUESTS: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  },
  FLAG_SUBMISSIONS: {
    MAX_ATTEMPTS: 10,
    WINDOW_MS: 60 * 1000, // 1 minute
  },
} as const;

// Challenge constraints
export const CHALLENGE_CONSTRAINTS = {
  MAX_QUESTIONS: 20,
  MAX_ARTIFACTS: 10,
  MAX_TOOLS: 10,
  MAX_CONTEXT_NOTES: 5,
  ESTIMATED_TIME: {
    MIN: 5, // minutes
    MAX: 480, // 8 hours
  },
} as const;

// Team constraints
export const TEAM_CONSTRAINTS = {
  MAX_MEMBERS: 4,
  MIN_MEMBERS: 1,
  MAX_TEAMS_PER_USER: 1,
  MAX_PENDING_INVITES: 5,
} as const;

// Scoreboard constraints
export const SCOREBOARD_CONSTRAINTS = {
  MAX_ENTRIES_DISPLAYED: 100,
  UPDATE_INTERVAL_MS: 5000, // 5 seconds
  CACHE_DURATION_MS: 30 * 1000, // 30 seconds
} as const;
