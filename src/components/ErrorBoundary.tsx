"use client";

import { Component, ReactNode } from "react";
import { logError } from "@/lib/error-logger";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        // Log error with additional context
        logError(error, {
            componentStack: errorInfo.componentStack,
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
            url: typeof window !== "undefined" ? window.location.href : "unknown",
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
                        <div className="text-center px-4">
                            <h2 className="text-4xl font-heading font-bold mb-4">
                                Something went wrong
                            </h2>
                            <p className="text-white/60 mb-8">
                                {this.state.error?.message || "An unexpected error occurred"}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-accent text-white rounded-sm hover:bg-accent/80 transition-colors"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}
