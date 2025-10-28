/**
 * UI-related constants
 */

// Animation durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
  VERY_SLOW: 500,
} as const;

// Z-index layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const;

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;

// Spacing scale (matching Tailwind CSS)
export const SPACING = {
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem',    // 256px
} as const;

// Border radius scale
export const BORDER_RADIUS = {
  NONE: '0px',
  SM: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  MD: '0.375rem',   // 6px
  LG: '0.5rem',     // 8px
  XL: '0.75rem',    // 12px
  '2XL': '1rem',    // 16px
  '3XL': '1.5rem',  // 24px
  FULL: '9999px',
} as const;

// Font sizes
export const FONT_SIZES = {
  XS: '0.75rem',    // 12px
  SM: '0.875rem',   // 14px
  BASE: '1rem',     // 16px
  LG: '1.125rem',   // 18px
  XL: '1.25rem',    // 20px
  '2XL': '1.5rem',  // 24px
  '3XL': '1.875rem', // 30px
  '4XL': '2.25rem', // 36px
  '5XL': '3rem',    // 48px
  '6XL': '3.75rem', // 60px
} as const;

// Font weights
export const FONT_WEIGHTS = {
  THIN: '100',
  EXTRALIGHT: '200',
  LIGHT: '300',
  NORMAL: '400',
  MEDIUM: '500',
  SEMIBOLD: '600',
  BOLD: '700',
  EXTRABOLD: '800',
  BLACK: '900',
} as const;

// Line heights
export const LINE_HEIGHTS = {
  NONE: '1',
  TIGHT: '1.25',
  SNUG: '1.375',
  NORMAL: '1.5',
  RELAXED: '1.625',
  LOOSE: '2',
} as const;

// Shadow presets
export const SHADOWS = {
  SM: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  MD: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  LG: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  XL: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2XL': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  INNER: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  NONE: '0 0 #0000',
} as const;

// Icon sizes
export const ICON_SIZES = {
  XS: '0.75rem',   // 12px
  SM: '0.875rem',  // 14px
  BASE: '1rem',    // 16px
  LG: '1.125rem',  // 18px
  XL: '1.25rem',   // 20px
  '2XL': '1.5rem', // 24px
  '3XL': '1.875rem', // 30px
  '4XL': '2.25rem', // 36px
} as const;

// Button variants
export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  OUTLINE: 'outline',
  GHOST: 'ghost',
  LINK: 'link',
  DESTRUCTIVE: 'destructive',
} as const;

// Button sizes
export const BUTTON_SIZES = {
  SM: 'sm',
  DEFAULT: 'default',
  LG: 'lg',
  XL: 'xl',
} as const;

// Input variants
export const INPUT_VARIANTS = {
  DEFAULT: 'default',
  FILLED: 'filled',
  OUTLINE: 'outline',
} as const;

// Input sizes
export const INPUT_SIZES = {
  SM: 'sm',
  DEFAULT: 'default',
  LG: 'lg',
} as const;

// Alert variants
export const ALERT_VARIANTS = {
  DEFAULT: 'default',
  DESTRUCTIVE: 'destructive',
  SUCCESS: 'success',
  WARNING: 'warning',
  INFO: 'info',
} as const;

// Toast positions
export const TOAST_POSITIONS = {
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center',
  BOTTOM_RIGHT: 'bottom-right',
} as const;

// Modal sizes
export const MODAL_SIZES = {
  SM: 'sm',
  DEFAULT: 'default',
  LG: 'lg',
  XL: 'xl',
  '2XL': '2xl',
  FULL: 'full',
} as const;

// Loading states
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;
