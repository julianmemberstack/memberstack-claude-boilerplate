/**
 * Development Authentication Debug Component
 * 
 * This component provides detailed debugging information about the current
 * authentication state, user plans, permissions, and access control decisions.
 * Only renders in development mode for security.
 * 
 * Features:
 * - Real-time auth state display
 * - Plan and permission information
 * - Route access testing
 * - Feature access checking
 * - Error boundary for debugging
 */

"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Bug, User, Shield, Key, Route } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useMemberstack } from "./MemberstackProvider";
import { useAuthConfig } from "@/contexts/AuthConfigContext";

export default function DevAuthDebug() {
  const { member, memberstack, isLoading } = useMemberstack();
  const { 
    getAccessDebugInfo, 
    hasRouteAccess, 
    hasFeatureAccess,
    getActivePlans,
    getMemberFeatures,
    getMemberPermissions
  } = useAuthConfig();

  const [testRoute, setTestRoute] = useState("/dashboard");
  const [testFeature, setTestFeature] = useState("advanced-analytics");
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show in development mode
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  // Get debug information
  const debugInfo = getAccessDebugInfo(member, testRoute);
  const routeAccess = hasRouteAccess(member, testRoute);
  const featureAccess = hasFeatureAccess(member, testFeature);
  const activePlans = getActivePlans(member);
  const memberFeatures = getMemberFeatures(member);
  const memberPermissions = getMemberPermissions(member);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 shadow-lg">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer py-3 px-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Bug className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm text-yellow-800 dark:text-yellow-200 truncate">
                      Auth Debug
                    </CardTitle>
                    <CardDescription className="text-xs text-yellow-700 dark:text-yellow-300 truncate">
                      Development Mode Only
                    </CardDescription>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-yellow-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="space-y-4 text-xs pt-0 px-4 pb-4">
              {/* Auth State */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  <span className="font-medium">Auth State</span>
                </div>
                <div className="pl-5 space-y-1">
                  <div>Loading: <Badge variant={isLoading ? "default" : "secondary"}>{isLoading.toString()}</Badge></div>
                  <div>Authenticated: <Badge variant={member ? "default" : "destructive"}>{!!member ? "true" : "false"}</Badge></div>
                  {member && (
                    <>
                      <div>Email: <code className="text-xs bg-muted px-1 rounded">{member.auth?.email}</code></div>
                      <div>ID: <code className="text-xs bg-muted px-1 rounded">{member.id}</code></div>
                    </>
                  )}
                </div>
              </div>

              {/* Plans */}
              {member && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    <span className="font-medium">Plans</span>
                  </div>
                  <div className="pl-5 space-y-1">
                    {activePlans.length > 0 ? (
                      activePlans.map((plan) => (
                        <Badge key={plan.id} variant="outline" className="text-xs">
                          {plan.name} (Priority: {plan.priority})
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">No active plans</span>
                    )}
                  </div>
                </div>
              )}

              {/* Features & Permissions */}
              {member && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-3 h-3" />
                    <span className="font-medium">Access</span>
                  </div>
                  <div className="pl-5 space-y-2">
                    <div>
                      <div className="font-medium text-xs mb-1">Features ({memberFeatures.length})</div>
                      <div className="flex flex-wrap gap-1">
                        {memberFeatures.slice(0, 3).map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {memberFeatures.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{memberFeatures.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-xs mb-1">Permissions</div>
                      <div className="flex flex-wrap gap-1">
                        {memberPermissions.map((permission) => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Route Testing */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Route className="w-3 h-3" />
                  <span className="font-medium">Route Testing</span>
                </div>
                <div className="pl-5 space-y-2">
                  <Input
                    placeholder="Enter route to test"
                    value={testRoute}
                    onChange={(e) => setTestRoute(e.target.value)}
                    className="h-7 text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <span>Access:</span>
                    <Badge variant={routeAccess.hasAccess ? "default" : "destructive"} className="text-xs">
                      {routeAccess.hasAccess ? "Granted" : "Denied"}
                    </Badge>
                  </div>
                  {!routeAccess.hasAccess && routeAccess.reason && (
                    <div className="text-xs text-muted-foreground">
                      Reason: {routeAccess.reason}
                    </div>
                  )}
                </div>
              </div>

              {/* Feature Testing */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Key className="w-3 h-3" />
                  <span className="font-medium">Feature Testing</span>
                </div>
                <div className="pl-5 space-y-2">
                  <Input
                    placeholder="Enter feature to test"
                    value={testFeature}
                    onChange={(e) => setTestFeature(e.target.value)}
                    className="h-7 text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <span>Access:</span>
                    <Badge variant={featureAccess.hasAccess ? "default" : "destructive"} className="text-xs">
                      {featureAccess.hasAccess ? "Granted" : "Denied"}
                    </Badge>
                  </div>
                  {!featureAccess.hasAccess && featureAccess.reason && (
                    <div className="text-xs text-muted-foreground">
                      Reason: {featureAccess.reason}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <span className="font-medium">Quick Actions</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs"
                    onClick={() => console.log("Debug Info:", debugInfo)}
                  >
                    Log Debug Info
                  </Button>
                  {memberstack && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs"
                      onClick={() => memberstack.logout()}
                    >
                      Logout
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}