"use client";

import { useState } from "react";
import { useMemberstack } from "./MemberstackProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
                    <CardFooter>
                      <Button type="submit" className="w-full">
                        Sign In
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
                    <CardFooter>
                      <Button type="submit" className="w-full">
                        Create Account
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

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