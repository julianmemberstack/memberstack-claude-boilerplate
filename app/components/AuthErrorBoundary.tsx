/**
 * Authentication Error Boundary
 * 
 * Catches and handles authentication-related errors gracefully.
 * Provides fallback UI and error reporting for auth failures.
 * 
 * Features:
 * - Catches auth SDK initialization errors
 * - Provides user-friendly error messages
 * - Offers recovery actions (retry, login)
 * - Logs errors in development mode
 */

"use client";

import React from "react";
import { AlertTriangle, RefreshCw, LogIn } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class AuthErrorBoundary extends React.Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AuthErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error("Authentication Error Boundary caught an error:", error);
    console.error("Error Info:", errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Optional: Send error to logging service
    if (process.env.NODE_ENV === "production") {
      // logErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    // Reset error state and try again
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Force page reload as last resort
    window.location.reload();
  };

  handleLoginRedirect = () => {
    // Redirect to login page
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      // Check if custom fallback component is provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error!} 
            retry={this.handleRetry} 
          />
        );
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Authentication Error</CardTitle>
              <CardDescription>
                Something went wrong with the authentication system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription className="mt-2">
                  {this.state.error?.message || "An unknown authentication error occurred"}
                </AlertDescription>
              </Alert>

              {/* Development-only error details */}
              {process.env.NODE_ENV === "development" && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground mb-2">
                    Technical Details (Development Only)
                  </summary>
                  <div className="bg-muted p-3 rounded-md text-xs font-mono overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error?.name}
                    </div>
                    <div className="mb-2">
                      <strong>Message:</strong> {this.state.error?.message}
                    </div>
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {this.state.error?.stack}
                      </pre>
                    </div>
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {this.state.errorInfo?.componentStack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={this.handleRetry} 
                  className="flex-1"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={this.handleLoginRedirect}
                  className="flex-1"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Go to Login
                </Button>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  If this problem persists, please contact support.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook version of the error boundary for easier integration
 */
export function useAuthErrorHandler() {
  const handleAuthError = (error: Error, context?: string) => {
    console.error(`Auth Error${context ? ` in ${context}` : ""}:`, error);
    
    // Optional: Show toast notification
    // toast.error(`Authentication failed: ${error.message}`);
    
    // Optional: Track error in analytics
    // trackError("auth_error", { error: error.message, context });
  };

  return { handleAuthError };
}

/**
 * HOC version for wrapping components
 */
export function withAuthErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallbackComponent?: React.ComponentType<{ error: Error; retry: () => void }>
) {
  const WrappedComponent = (props: P) => (
    <AuthErrorBoundary fallback={fallbackComponent}>
      <Component {...props} />
    </AuthErrorBoundary>
  );

  WrappedComponent.displayName = `withAuthErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}