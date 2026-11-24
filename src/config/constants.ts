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
    BAD_REQUEST: 400,
    FORBIDDEN: 403,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    GATEWAY_TIMEOUT: 504,
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
 * Regular expressions for validation
 */
export const REGEX = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
    RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
} as const;
