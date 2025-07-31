"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, AlertCircle, Rocket, Key, Code, ExternalLink, Copy, Terminal } from "lucide-react";
import Link from "next/link";

export default function SetupPage() {
  const [configStatus, setConfigStatus] = useState<{
    hasEnvFile: boolean;
    hasPublicKey: boolean;
    hasSecretKey: boolean;
    isHealthy: boolean;
    loading: boolean;
    error?: string;
  }>({
    hasEnvFile: false,
    hasPublicKey: false,
    hasSecretKey: false,
    isHealthy: false,
    loading: true,
  });

  const [copied, setCopied] = useState<string | null>(null);
  const [browserWarning, setBrowserWarning] = useState<string | null>(null);

  useEffect(() => {
    checkBrowserCompatibility();
    checkConfiguration();
  }, []);

  function checkBrowserCompatibility() {
    // Check for modern browser features
    const issues = [];
    
    if (!window.fetch) {
      issues.push('Your browser does not support fetch API');
    }
    
    if (!window.AbortController) {
      issues.push('Your browser does not support AbortController');
    }
    
    if (!navigator.clipboard) {
      issues.push('Clipboard API not available (copy buttons may not work)');
    }
    
    if (issues.length > 0) {
      setBrowserWarning(`Browser compatibility issues detected: ${issues.join(', ')}. Please use a modern browser like Chrome, Firefox, Safari, or Edge.`);
    }
  }

  async function checkConfiguration() {
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      
      setConfigStatus({
        ...data,
        loading: false,
      });
    } catch (error) {
      setConfigStatus({
        hasEnvFile: false,
        hasPublicKey: false,
        hasSecretKey: false,
        isHealthy: false,
        loading: false,
        error: "Failed to check configuration status",
      });
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const isConfigured = configStatus.hasPublicKey && configStatus.hasSecretKey;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Rocket className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold">Welcome to Memberstack Boilerplate!</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Let&apos;s get your authentication system up and running in 60 seconds
          </p>
        </div>

        {configStatus.loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3">Checking configuration...</span>
              </div>
            </CardContent>
          </Card>
        ) : isConfigured ? (
          <Card className="border-green-500/50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <CheckCircle2 className="mr-2" />
                Configuration Complete!
              </CardTitle>
              <CardDescription>
                Your Memberstack integration is ready to use
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Next Steps</AlertTitle>
                  <AlertDescription>
                    <ul className="mt-2 space-y-1">
                      <li>• Return to the <Link href="/" className="underline">home page</Link> to see the auth demo</li>
                      <li>• Check out the <a href="/dashboard" className="underline">dashboard</a> (requires login)</li>
                      <li>• Read the implementation guide in <code className="text-sm">.claude/</code></li>
                    </ul>
                  </AlertDescription>
                </Alert>
                
                <div className="flex gap-2">
                  <Button asChild>
                    <Link href="/">Go to Home</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/dashboard">View Dashboard</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {browserWarning && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Browser Compatibility Warning</AlertTitle>
                <AlertDescription>{browserWarning}</AlertDescription>
              </Alert>
            )}
            
            <Tabs defaultValue="automatic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="automatic">Automatic Setup</TabsTrigger>
                <TabsTrigger value="manual">Manual Setup</TabsTrigger>
              </TabsList>
            
            <TabsContent value="automatic">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Terminal className="mr-2" />
                    Automatic Setup (Recommended)
                  </CardTitle>
                  <CardDescription>
                    Run our interactive setup wizard to configure everything automatically
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>One Command Setup</AlertTitle>
                      <AlertDescription>
                        Open your terminal in the project directory and run:
                      </AlertDescription>
                    </Alert>
                    
                    <div className="bg-secondary p-4 rounded-lg font-mono text-sm">
                      <div className="flex items-center justify-between">
                        <code>npm run setup</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard("npm run setup", "command")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {copied === "command" && (
                      <p className="text-sm text-green-600">Copied to clipboard!</p>
                    )}
                    
                    <div className="text-sm text-muted-foreground">
                      <p>The setup wizard will:</p>
                      <ul className="mt-2 space-y-1 ml-4">
                        <li>✓ Create your <code>.env.local</code> file</li>
                        <li>✓ Guide you through getting your Memberstack API keys</li>
                        <li>✓ Test your connection</li>
                        <li>✓ Configure your authentication plans</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="manual">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="mr-2" />
                    Manual Setup
                  </CardTitle>
                  <CardDescription>
                    Configure your Memberstack integration step by step
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Step 1 */}
                    <div>
                      <h3 className="font-semibold mb-2">1. Get your Memberstack API keys</h3>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href="https://app.memberstack.com" target="_blank" rel="noopener noreferrer">
                            Open Memberstack Dashboard
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                        <p className="text-sm text-muted-foreground">
                          Navigate to Settings → API Keys in your Memberstack app
                        </p>
                      </div>
                    </div>
                    
                    {/* Step 2 */}
                    <div>
                      <h3 className="font-semibold mb-2">2. Create <code>.env.local</code> file</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Create a file named <code>.env.local</code> in your project root with:
                      </p>
                      <div className="bg-secondary p-4 rounded-lg font-mono text-sm">
                        <div className="space-y-1">
                          <div># Memberstack Configuration</div>
                          <div>NEXT_PUBLIC_MEMBERSTACK_KEY=pk_your_public_key_here</div>
                          <div>MEMBERSTACK_SECRET_KEY=sk_your_secret_key_here</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() => copyToClipboard(
                            "# Memberstack Configuration\nNEXT_PUBLIC_MEMBERSTACK_KEY=pk_your_public_key_here\nMEMBERSTACK_SECRET_KEY=sk_your_secret_key_here",
                            "env"
                          )}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy template
                        </Button>
                      </div>
                      {copied === "env" && (
                        <p className="text-sm text-green-600 mt-2">Copied to clipboard!</p>
                      )}
                    </div>
                    
                    {/* Step 3 */}
                    <div>
                      <h3 className="font-semibold mb-2">3. Configure your plans (optional)</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        After setting up your environment variables, run:
                      </p>
                      <div className="bg-secondary p-4 rounded-lg font-mono text-sm">
                        <code>npm run setup:memberstack</code>
                      </div>
                    </div>
                    
                    {/* Status */}
                    <Alert variant={configStatus.error ? "destructive" : "default"}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Configuration Status</AlertTitle>
                      <AlertDescription>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center">
                            {configStatus.hasEnvFile ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 mr-2" />
                            )}
                            <span>.env.local file exists</span>
                          </div>
                          <div className="flex items-center">
                            {configStatus.hasPublicKey ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 mr-2" />
                            )}
                            <span>Public key configured</span>
                          </div>
                          <div className="flex items-center">
                            {configStatus.hasSecretKey ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 mr-2" />
                            )}
                            <span>Secret key configured</span>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                    
                    <Button onClick={checkConfiguration} variant="outline">
                      Refresh Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
        )}
        
        {/* Help section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="mr-2" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" size="sm" asChild>
                <a href="https://docs.memberstack.com" target="_blank" rel="noopener noreferrer">
                  Memberstack Docs
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/api/health" target="_blank">
                  View Health Check
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com/your-repo/issues" target="_blank" rel="noopener noreferrer">
                  Report Issue
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}