/**
 * Network Error Boundary
 * 
 * Specialized error boundary for handling network and API-related errors.
 * Provides user-friendly feedback for connectivity issues and service failures.
 * 
 * Features:
 * - Detects network connectivity issues
 * - Provides offline/online status
 * - Retry mechanisms with exponential backoff
 * - User-friendly error messages
 */

"use client";

import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NetworkErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
  isOnline: boolean;
}

interface NetworkErrorBoundaryProps {
  children: React.ReactNode;
  maxRetries?: number;
  retryDelay?: number;
}

export class NetworkErrorBoundary extends React.Component<
  NetworkErrorBoundaryProps,
  NetworkErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: NetworkErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<NetworkErrorBoundaryState> {
    // Check if this is a network-related error
    const isNetworkError = 
      error.message?.includes('fetch') ||
      error.message?.includes('network') ||
      error.message?.includes('Failed to load') ||
      error.name === 'TypeError' && error.message?.includes('Failed to fetch');

    if (isNetworkError) {
      return {
        hasError: true,
        error,
      };
    }

    // Let other error boundaries handle non-network errors
    throw error;
  }

  componentDidMount() {
    // Add network status listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  componentWillUnmount() {
    // Clean up listeners and timeouts
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleOnline = () => {
    this.setState({ isOnline: true });
    
    // Auto-retry when coming back online
    if (this.state.hasError) {
      this.handleRetry();
    }
  };

  handleOffline = () => {
    this.setState({ isOnline: false });
  };

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    
    if (this.state.retryCount >= maxRetries) {
      return;
    }

    // Calculate exponential backoff delay
    const baseDelay = this.props.retryDelay || 1000;
    const delay = baseDelay * Math.pow(2, this.state.retryCount);

    this.setState({ 
      retryCount: this.state.retryCount + 1 
    });

    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
      });
    }, delay);
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      retryCount: 0,
    });
  };

  getErrorType(error: Error): 'offline' | 'timeout' | 'server' | 'unknown' {
    const message = error.message?.toLowerCase() || '';
    
    if (!this.state.isOnline) return 'offline';
    if (message.includes('timeout')) return 'timeout';
    if (message.includes('500') || message.includes('server')) return 'server';
    return 'unknown';
  }

  getErrorMessage(errorType: string): string {
    switch (errorType) {
      case 'offline':
        return 'You appear to be offline. Please check your internet connection.';
      case 'timeout':
        return 'The request took too long to complete. The server might be experiencing high traffic.';
      case 'server':
        return 'The server is experiencing issues. Please try again in a few moments.';
      default:
        return 'A network error occurred. Please check your connection and try again.';
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const { maxRetries = 3 } = this.props;
      const errorType = this.getErrorType(this.state.error);
      const canRetry = this.state.retryCount < maxRetries;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
                {this.state.isOnline ? (
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                ) : (
                  <WifiOff className="w-6 h-6 text-orange-600" />
                )}
              </div>
              <CardTitle className="text-xl">Connection Issue</CardTitle>
              <CardDescription>
                {this.getErrorMessage(errorType)}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Connection Status */}
              <div className="flex items-center justify-center gap-2">
                <Badge variant={this.state.isOnline ? "default" : "destructive"}>
                  {this.state.isOnline ? (
                    <><Wifi className="w-3 h-3 mr-1" /> Online</>
                  ) : (
                    <><WifiOff className="w-3 h-3 mr-1" /> Offline</>
                  )}
                </Badge>
              </div>

              {/* Retry Information */}
              {this.state.retryCount > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Retry Attempt</AlertTitle>
                  <AlertDescription>
                    Attempt {this.state.retryCount} of {maxRetries}
                    {this.state.retryCount >= maxRetries && 
                      " - Maximum retries reached"
                    }
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === "development" && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground mb-2">
                    Technical Details (Development Only)
                  </summary>
                  <div className="bg-muted p-3 rounded-md text-xs font-mono">
                    <div><strong>Error:</strong> {this.state.error.name}</div>
                    <div><strong>Message:</strong> {this.state.error.message}</div>
                    <div><strong>Type:</strong> {errorType}</div>
                    <div><strong>Online:</strong> {this.state.isOnline ? 'Yes' : 'No'}</div>
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                {canRetry ? (
                  <Button 
                    onClick={this.handleRetry} 
                    className="flex-1"
                    disabled={!this.state.isOnline}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry ({this.state.retryCount + 1}/{maxRetries})
                  </Button>
                ) : (
                  <Button 
                    onClick={this.handleReset} 
                    className="flex-1"
                    variant="outline"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Start Over
                  </Button>
                )}
                
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="flex-1"
                >
                  Go Home
                </Button>
              </div>

              {/* Helpful Tips */}
              <div className="text-center pt-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Things to try:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Check your internet connection</li>
                  <li>• Try refreshing the page</li>
                  <li>• Wait a moment and try again</li>
                  {!this.state.isOnline && (
                    <li>• Make sure you're connected to Wi-Fi or cellular data</li>
                  )}
                </ul>
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
 * Hook for handling network errors in components
 */
export function useNetworkErrorHandler() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const handleNetworkError = async (
    operation: () => Promise<any>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<any> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (!isOnline && attempt > 0) {
          throw new Error('Device is offline');
        }
        
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) break;
        
        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  };

  return {
    isOnline,
    handleNetworkError,
  };
}