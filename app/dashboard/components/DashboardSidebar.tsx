/**
 * Dashboard Sidebar Component
 * 
 * A responsive sidebar navigation for the dashboard with:
 * - User profile display with auth state
 * - Navigation menu with icons
 * - Plan information display
 * - Logout functionality
 * - Mobile-friendly collapsible design
 */

"use client";

import { 
  Home, 
  Settings, 
  User, 
  LogOut, 
  Shield,
  BarChart3,
  CreditCard
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useMemberstack } from "@/app/components/MemberstackProvider";
import { useAuthConfig } from "@/contexts/AuthConfigContext";

// Navigation items for the dashboard
const navigationItems = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: Home,
    description: "Dashboard overview and metrics"
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics", 
    icon: BarChart3,
    description: "View detailed analytics",
    requiredPlans: ["pln_premium", "pln_enterprise"]
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
    description: "Manage your profile"
  },
  {
    title: "Billing",
    url: "/dashboard/billing",
    icon: CreditCard,
    description: "Manage subscription and billing"
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
    description: "Account and app settings"
  }
];

export function DashboardSidebar() {
  const { member, memberstack } = useMemberstack();
  const { getPrimaryPlan, hasPlan } = useAuthConfig();

  // Get user's primary plan for display
  const primaryPlan = getPrimaryPlan(member);

  // Handle logout
  const handleLogout = async () => {
    if (!memberstack) return;
    
    try {
      await memberstack.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = (email: string) => {
    return email
      .split("@")[0]
      .split(".")
      .map(part => part.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  return (
    <Sidebar collapsible="icon">
      {/* Sidebar Header */}
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Dashboard</span>
            <span className="text-xs text-muted-foreground">Memberstack Demo</span>
          </div>
        </div>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                // Check if user has access to this item
                const hasAccess = !item.requiredPlans || hasPlan(member, item.requiredPlans);
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      tooltip={item.description}
                      className={!hasAccess ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <a href={hasAccess ? item.url : "#"}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                        {!hasAccess && (
                          <Badge variant="secondary" className="text-xs ml-auto">
                            Pro
                          </Badge>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer - User Profile */}
      <SidebarFooter className="border-t border-border">
        {member ? (
          <div className="p-3 space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={member.profileImage} />
                <AvatarFallback className="text-xs bg-muted">
                  {getUserInitials(member.auth.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium truncate">
                  {member.auth.email.split("@")[0]}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {member.auth.email}
                </span>
              </div>
            </div>

            {/* Plan Badge */}
            {primaryPlan && (
              <div className="flex items-center justify-between">
                <Badge 
                  variant={primaryPlan.id === "pln_enterprise" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {primaryPlan.name}
                </Badge>
              </div>
            )}

            {/* Logout Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="w-full justify-start h-8 px-2"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Sign Out</span>
            </Button>
          </div>
        ) : (
          <div className="p-3">
            <div className="text-sm text-muted-foreground">
              Not authenticated
            </div>
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}