/**
 * Application constants
 * Centralized location for magic numbers and strings
 */

/**
 * Validation limits for form inputs
 */
export const VALIDATION_LIMITS = {
    NAME_MAX_LENGTH: 100,
    EMAIL_MAX_LENGTH: 254,
    MESSAGE_MAX_LENGTH: 5000,
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Animation durations (in seconds)
 */
export const ANIMATION_DURATION = {
    FAST: 0.2,
    NORMAL: 0.4,
    SLOW: 0.8,
    VERY_SLOW: 1.2,
} as const;

/**
 * Animation easing functions
 */
export const ANIMATION_EASING = {
    EASE_IN_OUT: [0.76, 0, 0.24, 1],
    EASE_OUT: [0.16, 1, 0.3, 1],
    EASE_IN: [0.87, 0, 0.13, 1],
} as const;

/**
 * Breakpoints for responsive design (in pixels)
 */
export const BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT = {
    CONTACT_FORM: {
        MAX_REQUESTS: 5,
        WINDOW_MS: 60 * 60 * 1000, // 1 hour
    },
} as const;

/**
 * Cache durations (in seconds)
 */
export const CACHE_DURATION = {
    STATIC_ASSETS: 31536000, // 1 year
    ARTICLES: 3600, // 1 hour
    API_RESPONSES: 300, // 5 minutes
} as const;

/**
 * Regular expressions for validation
 */
export const REGEX = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    URL: /^https?:\/\/.+/,
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_URL: 'Please enter a valid URL',
    TOO_LONG: (max: number) => `Maximum ${max} characters allowed`,
    RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
    EMAIL_SENT: 'Email sent successfully!',
    FORM_SUBMITTED: 'Form submitted successfully!',
} as const;

/**
 * Type exports for better type inference
 */
export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
export type AnimationDuration = typeof ANIMATION_DURATION[keyof typeof ANIMATION_DURATION];
export type Breakpoint = typeof BREAKPOINTS[keyof typeof BREAKPOINTS];
