"use client";

import { useState } from "react";
import { useMemberstack } from "./MemberstackProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Google icon component with proper colors
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" className="mr-2">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default function AuthDemo() {
  const { memberstack, member, isLoading } = useMemberstack();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!memberstack) return;

    try {
      const result = await memberstack.loginMemberEmailPassword({
        email,
        password,
      });
      setSuccess("Login successful!");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!memberstack) return;

    try {
      const result = await memberstack.signupMemberEmailPassword({
        email,
        password,
      });
      setSuccess("Signup successful! You are now logged in.");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    }
  };

  const handleLogout = async () => {
    if (!memberstack) return;
    
    try {
      await memberstack.logout();
      setSuccess("Logout successful!");
      setError("");
    } catch (err: any) {
      setError(err.message || "Logout failed");
    }
  };

  const openLoginModal = async () => {
    if (!memberstack) return;
    try {
      await memberstack.openModal("LOGIN");
    } catch (err: any) {
      setError(err.message || "Failed to open modal");
    }
  };

  const openSignupModal = async () => {
    if (!memberstack) return;
    try {
      await memberstack.openModal("SIGNUP");
    } catch (err: any) {
      setError(err.message || "Failed to open modal");
    }
  };

  const handleGoogleLogin = async () => {
    if (!memberstack) return;
    setError("");
    setSuccess("");

    try {
      await memberstack.loginWithProvider({
        provider: "google",
        allowSignup: true
      });
      // Note: This will redirect to Google, so code after this won't execute
    } catch (err: any) {
      setError(err.message || "Google login failed");
    }
  };

  const handleGoogleSignup = async () => {
    if (!memberstack) return;
    setError("");
    setSuccess("");

    try {
      await memberstack.signupWithProvider({
        provider: "google",
        allowLogin: true
      });
      // Note: This will redirect to Google, so code after this won't execute
    } catch (err: any) {
      setError(err.message || "Google signup failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg mx-auto px-4 py-16 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Memberstack Demo</h1>
          <p className="text-muted-foreground">Authentication with shadcn/ui</p>
        </div>

        {/* Current User Status */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {member ? (
              <>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Logged in as</p>
                  <p className="text-sm text-muted-foreground">{member.auth.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Member ID</p>
                  <p className="text-sm text-muted-foreground font-mono">{member.id}</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">You are not logged in</p>
            )}
          </CardContent>
          {member && (
            <CardFooter className="pt-4">
              <Button 
                onClick={handleLogout} 
                variant="outline"
                className="w-full"
              >
                Sign Out
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Auth Forms */}
        {!member && (
          <div className="space-y-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="mt-0">
                <Card>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                      Enter your email and password to access your account
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex-col space-y-4">
                      <Button type="submit" className="w-full">
                        Sign In
                      </Button>
                      <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">
                            Or
                          </span>
                        </div>
                      </div>
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={handleGoogleLogin}
                        className="w-full"
                      >
                        <GoogleIcon />
                        Continue with Google
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              
              <TabsContent value="signup" className="mt-0">
                <Card>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Sign Up</CardTitle>
                    <CardDescription>
                      Create an account to get started
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSignup}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex-col space-y-4">
                      <Button type="submit" className="w-full">
                        Create Account
                      </Button>
                      <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">
                            Or
                          </span>
                        </div>
                      </div>
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={handleGoogleSignup}
                        className="w-full"
                      >
                        <GoogleIcon />
                        Continue with Google
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Modal Options */}
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">Memberstack Modals</CardTitle>
                <CardDescription>
                  Use pre-built authentication modals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <Button 
                    onClick={openLoginModal} 
                    variant="outline"
                    className="w-full"
                  >
                    Open Login Modal
                  </Button>
                  <Button 
                    onClick={openSignupModal} 
                    variant="outline"
                    className="w-full"
                  >
                    Open Signup Modal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alerts - Fixed positioning */}
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}