/**
 * Client-Side Route Protection Component
 * 
 * This component handles detailed authentication and authorization checks
 * on the client side, including plan-based access control. It works in
 * conjunction with the simplified middleware to provide comprehensive
 * route protection.
 * 
 * Features:
 * - Detailed plan and permission checking
 * - Loading states during auth verification
 * - Graceful handling of access denied scenarios
 * - Automatic redirects for unauthorized users
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, Shield, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMemberstack } from "@/app/components/MemberstackProvider";
import { useAuthConfig } from "@/contexts/AuthConfigContext";

interface ClientSideProtectionProps {
  children: React.ReactNode;
  requiredPlans?: string[];
  requiredPermissions?: string[];
  requiredFeatures?: string[];
  fallbackUrl?: string;
}

export function ClientSideProtection({
  children,
  requiredPlans,
  requiredPermissions,
  requiredFeatures,
  fallbackUrl = "/"
}: ClientSideProtectionProps) {
  const { member, isLoading } = useMemberstack();
  const { hasRouteAccess } = useAuthConfig();
  const router = useRouter();
  const pathname = usePathname();
  const [accessCheck, setAccessCheck] = useState<{
    hasAccess: boolean;
    reason?: string;
    suggestedAction?: string;
  } | null>(null);

  useEffect(() => {
    // Skip check while loading
    if (isLoading) return;

    // Perform access check
    const access = hasRouteAccess(member, pathname);
    setAccessCheck(access);

    // If access is denied and we have a fallback URL, redirect after a delay
    if (!access.hasAccess && fallbackUrl) {
      const timer = setTimeout(() => {
        router.push(fallbackUrl);
      }, 3000); // 3 second delay to show the message

      return () => clearTimeout(timer);
    }
  }, [member, isLoading, pathname, hasRouteAccess, router, fallbackUrl]);

  // Show loading state while checking authentication
  if (isLoading || accessCheck === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div className="text-center">
            <h3 className="font-medium">Verifying access...</h3>
            <p className="text-sm text-muted-foreground">
              Checking your authentication and permissions
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied screen
  if (!accessCheck.hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {accessCheck.reason || "Insufficient permissions"}
              </AlertDescription>
            </Alert>

            {accessCheck.suggestedAction && (
              <div className="text-sm text-muted-foreground text-center">
                {accessCheck.suggestedAction}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => router.push("/pricing")} 
                className="flex-1"
              >
                View Plans
              </Button>
              <Button 
                onClick={() => router.push("/")}
                variant="outline"
                className="flex-1"
              >
                Go Back
              </Button>
            </div>

            {fallbackUrl && (
              <div className="text-center text-sm text-muted-foreground">
                Redirecting in 3 seconds...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Access granted - render children
  return <>{children}</>;
}

/**
 * Higher-order component version for easier usage
 */
export function withClientSideProtection<P extends object>(
  Component: React.ComponentType<P>,
  protectionConfig?: Omit<ClientSideProtectionProps, 'children'>
) {
  const ProtectedComponent = (props: P) => (
    <ClientSideProtection {...protectionConfig}>
      <Component {...props} />
    </ClientSideProtection>
  );

  ProtectedComponent.displayName = `withClientSideProtection(${Component.displayName || Component.name})`;
  
  return ProtectedComponent;
}