/**
 * Error logging utility
 * Centralized error tracking and logging
 */

interface ErrorContext {
    componentStack?: string;
    userAgent?: string;
    url?: string;
    [key: string]: any;
}

/**
 * Log errors to console in development, and to external service in production
 */
export const logError = (error: Error, context?: ErrorContext): void => {
    const errorDetails = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        timestamp: new Date().toISOString(),
        ...context,
    };

    if (process.env.NODE_ENV === "production") {
        // In production, you would send to an error tracking service
        // Example: Sentry, LogRocket, DataDog, etc.
        console.error("Error logged:", errorDetails);

        // TODO: Integrate with error tracking service
        // Example:
        // Sentry.captureException(error, { contexts: { custom: context } });
    } else {
        // Development: detailed console logging
        console.error("Development Error:", errorDetails);
    }
};

/**
 * Log warning messages
 */
export const logWarning = (message: string, context?: Record<string, any>): void => {
    const warningDetails = {
        message,
        timestamp: new Date().toISOString(),
        ...context,
    };

    if (process.env.NODE_ENV === "production") {
        console.warn("Warning:", warningDetails);
    } else {
        console.warn("Development Warning:", warningDetails);
    }
};
