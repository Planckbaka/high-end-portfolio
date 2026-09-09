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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
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
          <div className="site-shell page-heading page-bottom">
            <div className="">
              <h2 className="font-heading mb-4 text-4xl font-bold">Something went wrong</h2>
              <p className="text-muted-foreground mb-8">
                The page couldn’t finish loading. Please reload to try again.
              </p>
              <button onClick={() => window.location.reload()} className="button primary">
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
