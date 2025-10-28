/**
 * API-related constants
 */

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// API response status
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
} as const;

// Request timeouts (in milliseconds)
export const REQUEST_TIMEOUTS = {
  DEFAULT: 10000, // 10 seconds
  UPLOAD: 30000, // 30 seconds
  DOWNLOAD: 60000, // 1 minute
  LONG_RUNNING: 300000, // 5 minutes
} as const;

// Retry configuration
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000, // 1 second
  MAX_DELAY: 10000, // 10 seconds
  BACKOFF_FACTOR: 2,
} as const;

// Cache configuration
export const CACHE_CONFIG = {
  DEFAULT_TTL: 300000, // 5 minutes
  USER_DATA_TTL: 600000, // 10 minutes
  SCOREBOARD_TTL: 30000, // 30 seconds
  CHALLENGES_TTL: 1800000, // 30 minutes
  STATIC_DATA_TTL: 3600000, // 1 hour
} as const;

// API versioning
export const API_VERSION = {
  V1: 'v1',
  CURRENT: 'v1',
} as const;

// Content types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT_PLAIN: 'text/plain',
  TEXT_HTML: 'text/html',
  TEXT_CSV: 'text/csv',
  APPLICATION_PDF: 'application/pdf',
  APPLICATION_ZIP: 'application/zip',
} as const;

// Request headers
export const REQUEST_HEADERS = {
  AUTHORIZATION: 'Authorization',
  CONTENT_TYPE: 'Content-Type',
  ACCEPT: 'Accept',
  USER_AGENT: 'User-Agent',
  X_API_KEY: 'X-API-Key',
  X_REQUEST_ID: 'X-Request-ID',
  X_CORRELATION_ID: 'X-Correlation-ID',
} as const;

// Response headers
export const RESPONSE_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  CACHE_CONTROL: 'Cache-Control',
  ETAG: 'ETag',
  LAST_MODIFIED: 'Last-Modified',
  X_TOTAL_COUNT: 'X-Total-Count',
  X_PAGE_COUNT: 'X-Page-Count',
  X_CURRENT_PAGE: 'X-Current-Page',
} as const;

// Error codes
export const ERROR_CODES = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',
  
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_OUT_OF_RANGE: 'VALIDATION_OUT_OF_RANGE',
  
  // Resource errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  
  // Challenge specific
  CHALLENGE_NOT_AVAILABLE: 'CHALLENGE_NOT_AVAILABLE',
  CHALLENGE_ALREADY_SOLVED: 'CHALLENGE_ALREADY_SOLVED',
  FLAG_INCORRECT: 'FLAG_INCORRECT',
  FLAG_ALREADY_SUBMITTED: 'FLAG_ALREADY_SUBMITTED',
  
  // Team specific
  TEAM_FULL: 'TEAM_FULL',
  TEAM_NOT_FOUND: 'TEAM_NOT_FOUND',
  ALREADY_IN_TEAM: 'ALREADY_IN_TEAM',
  NOT_TEAM_LEADER: 'NOT_TEAM_LEADER',
} as const;

// WebSocket events
export const WEBSOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  
  // Scoreboard events
  SCOREBOARD_UPDATE: 'scoreboard_update',
  TEAM_SCORE_UPDATE: 'team_score_update',
  
  // Challenge events
  CHALLENGE_SOLVED: 'challenge_solved',
  FLAG_SUBMITTED: 'flag_submitted',
  
  // Team events
  TEAM_JOINED: 'team_joined',
  TEAM_LEFT: 'team_left',
  TEAM_MEMBER_ADDED: 'team_member_added',
  TEAM_MEMBER_REMOVED: 'team_member_removed',
  
  // System events
  SYSTEM_MAINTENANCE: 'system_maintenance',
  SYSTEM_RESTORED: 'system_restored',
} as const;

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
  SORT_BY: 'created_at',
  SORT_ORDER: 'desc',
} as const;

// Sort orders
export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

// Filter operators
export const FILTER_OPERATORS = {
  EQUALS: 'eq',
  NOT_EQUALS: 'ne',
  GREATER_THAN: 'gt',
  GREATER_THAN_OR_EQUAL: 'gte',
  LESS_THAN: 'lt',
  LESS_THAN_OR_EQUAL: 'lte',
  LIKE: 'like',
  IN: 'in',
  NOT_IN: 'nin',
  EXISTS: 'exists',
  NOT_EXISTS: 'nexists',
} as const;
