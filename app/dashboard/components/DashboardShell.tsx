/**
 * Dashboard Shell Component
 * 
 * The main dashboard content area with:
 * - Welcome message with user context
 * - Plan information and upgrade prompts
 * - Feature showcase cards
 * - Analytics preview (plan-gated)
 * - Quick actions and navigation
 */

"use client";

import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Shield,
  Zap,
  Star,
  ArrowRight,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useMemberstack } from "@/app/components/MemberstackProvider";
import { useAuthConfig } from "@/contexts/AuthConfigContext";

// Mock data for dashboard metrics
const mockMetrics = [
  {
    title: "Total Users",
    value: "2,845",
    change: "+12%",
    trend: "up",
    icon: Users
  },
  {
    title: "Revenue",
    value: "$12,405",
    change: "+8%", 
    trend: "up",
    icon: TrendingUp
  },
  {
    title: "Analytics",
    value: "89.2%",
    change: "+2.1%",
    trend: "up",
    icon: BarChart3
  }
];

// Feature cards to showcase plan benefits
const featureCards = [
  {
    title: "Advanced Analytics",
    description: "Deep insights into your data with custom reports and real-time metrics.",
    icon: BarChart3,
    requiredPlans: ["pln_premium", "pln_enterprise"],
    comingSoon: false
  },
  {
    title: "Priority Support", 
    description: "Get help when you need it with priority email and chat support.",
    icon: Zap,
    requiredPlans: ["pln_premium", "pln_enterprise"],
    comingSoon: false
  },
  {
    title: "Team Management",
    description: "Collaborate with your team and manage user permissions.",
    icon: Users,
    requiredPlans: ["pln_enterprise"],
    comingSoon: false
  }
];

export function DashboardShell() {
  const { member } = useMemberstack();
  const { getPrimaryPlan, hasPlan, hasFeatureAccess } = useAuthConfig();

  const primaryPlan = getPrimaryPlan(member);
  const userName = member?.auth?.email?.split("@")[0] || "User";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-4 px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Welcome back, {userName}!
            </h2>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your account today.
            </p>
          </div>

          {/* Plan Status Card */}
          {primaryPlan && (
            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Your Plan</CardTitle>
                  </div>
                  <Badge 
                    variant={primaryPlan.id === "pln_enterprise" ? "default" : "secondary"}
                  >
                    {primaryPlan.name}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription>
                  You have access to {primaryPlan.features.length} features and {primaryPlan.permissions.length} permission levels.
                </CardDescription>
                
                {/* Features List */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Included Features:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {primaryPlan.features.slice(0, 6).map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span className="capitalize">{feature.replace(/-/g, " ")}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {primaryPlan.id !== "pln_enterprise" && (
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Star className="w-4 h-4 mr-2" />
                      Upgrade Plan
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            {mockMetrics.map((metric, index) => {
              const hasAccess = metric.title === "Analytics" 
                ? hasFeatureAccess(member, "advanced-analytics").hasAccess
                : true;

              return (
                <Card key={metric.title} className={!hasAccess ? "opacity-60" : ""}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {metric.title}
                      {!hasAccess && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Premium
                        </Badge>
                      )}
                    </CardTitle>
                    <metric.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {hasAccess ? metric.value : "---"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {hasAccess ? `${metric.change} from last month` : "Upgrade to view"}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Feature Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Features & Capabilities</h3>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featureCards.map((feature, index) => {
                const hasAccess = hasPlan(member, feature.requiredPlans);
                
                return (
                  <Card key={feature.title} className={`transition-all hover:shadow-md ${!hasAccess ? "border-dashed opacity-75" : ""}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${hasAccess ? "bg-primary" : "bg-muted"}`}>
                          <feature.icon className={`w-4 h-4 ${hasAccess ? "text-primary-foreground" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {feature.title}
                            {!hasAccess && (
                              <Badge variant="outline" className="text-xs">
                                {feature.requiredPlans.includes("pln_enterprise") ? "Enterprise" : "Premium"}
                              </Badge>
                            )}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <CardDescription>
                        {feature.description}
                      </CardDescription>
                      
                      {hasAccess ? (
                        <Button variant="ghost" size="sm" className="w-full justify-between">
                          Explore Feature
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="w-full">
                          Upgrade to Access
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Usage Progress (Mock) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Usage</CardTitle>
              <CardDescription>
                Your current usage across different features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>API Calls</span>
                  <span>750 / 1,000</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Storage</span>
                  <span>2.1 GB / 5 GB</span>
                </div>
                <Progress value={42} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Team Members</span>
                  <span>{primaryPlan?.id === "pln_enterprise" ? "3 / 50" : "1 / 1"}</span>
                </div>
                <Progress value={primaryPlan?.id === "pln_enterprise" ? 6 : 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}