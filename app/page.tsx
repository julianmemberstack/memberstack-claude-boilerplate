"use client";

import { useEffect, useState } from "react";
import AuthDemo from "./components/AuthDemo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Rocket, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Home() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if the app is configured
    checkConfiguration();
  }, []);

  async function checkConfiguration() {
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      setIsConfigured(data.isHealthy);
    } catch (error) {
      setIsConfigured(false);
    } finally {
      setIsLoading(false);
    }
  }

  // If still loading, show a simple loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not configured, show welcome screen
  if (isConfigured === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Rocket className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl">Welcome to Memberstack Boilerplate!</CardTitle>
            <CardDescription className="text-lg mt-2">
              Let&apos;s get your authentication system set up in 60 seconds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Quick Setup Required</AlertTitle>
              <AlertDescription className="mt-2">
                Your Memberstack integration isn&apos;t configured yet. Don&apos;t worry, it only takes a minute!
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div className="p-4 bg-secondary rounded-lg">
                <h3 className="font-semibold mb-2">Option 1: Automatic Setup (Recommended)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Run our interactive setup wizard in your terminal:
                </p>
                <code className="bg-background px-3 py-1 rounded text-sm font-mono">
                  npm run setup
                </code>
              </div>
              
              <div className="p-4 bg-secondary rounded-lg">
                <h3 className="font-semibold mb-2">Option 2: Manual Setup</h3>
                <p className="text-sm text-muted-foreground">
                  Configure your Memberstack keys manually through our setup page.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button asChild>
                <a href="/setup">Go to Setup Page</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://app.memberstack.com" target="_blank" rel="noopener noreferrer">
                  Open Memberstack
                </a>
              </Button>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Don&apos;t have a Memberstack account?</p>
              <a href="https://memberstack.com" target="_blank" rel="noopener noreferrer" className="underline">
                Sign up for free at memberstack.com
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If configured, show the normal auth demo
  return <AuthDemo />;
}