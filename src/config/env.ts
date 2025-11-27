/**
 * Environment variables configuration
 * Validates and exports environment variables with type safety
 */

function getEnvVar(key: string, fallback?: string): string {
    const value = process.env[key] || fallback;
    if (!value) {
        console.warn(`Missing environment variable: ${key}`);
    }
    return value || "";
}

export const env = {
    // Public environment variables (safe to expose to client)
    siteUrl:
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://high-end-portfolio.1229773363.workers.dev",
    siteName: process.env.NEXT_PUBLIC_SITE_NAME || "Akiwayne's Portfolio",

    // Server-only environment variables (never exposed to client)
    resendApiKey: getEnvVar("RESEND_API_KEY"),

    // Environment detection
    isDev: process.env.NODE_ENV === "development",
    isProd: process.env.NODE_ENV === "production",
    isTest: process.env.NODE_ENV === "test",
} as const;

// Type-safe environment variable access
export type Env = typeof env;

// Validate required environment variables (call this at app startup)
export function validateEnv(): void {
    const requiredVars: (keyof typeof env)[] = [];

    // Only validate in production
    if (env.isProd) {
        // Add required production env vars here
        // Example: requiredVars.push('resendApiKey');
    }

    const missing = requiredVars.filter((key) => !env[key]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(", ")}`
        );
    }
}
