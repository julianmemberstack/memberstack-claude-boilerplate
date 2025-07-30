/**
 * Centralized Authentication & Authorization Configuration
 * 
 * This file serves as the single source of truth for all auth-related
 * configuration including route protection, plan-based access control,
 * content gating, and redirect behavior.
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface AuthRoute {
  path: string;
  requiredPlans?: string[];
  requiredPermissions?: string[];
  requiredFeatures?: string[];
  allowUnauthenticated?: boolean;
  customRedirect?: string;
}

export interface PlanConfig {
  id: string;
  name: string;
  routes: string[];
  features: string[];
  permissions: string[];
  priority: number; // Higher number = higher priority
}

export interface RedirectConfig {
  unauthenticated: string;
  afterLogin: string;
  afterSignup: string;
  afterLogout: string;
  insufficientPermissions: string;
  planRequired: string;
}

export interface ContentGatingRule {
  component: string;
  requiredPlans?: string[];
  requiredPermissions?: string[];
  requiredFeatures?: string[];
  fallbackComponent?: string;
}

export interface AuthConfig {
  routes: {
    protected: AuthRoute[];
    public: string[];
    redirects: RedirectConfig;
  };
  plans: Record<string, PlanConfig>;
  contentGating: {
    components: Record<string, ContentGatingRule>;
    features: Record<string, string[]>; // feature -> required plans
  };
  settings: {
    enableDebugMode: boolean;
    sessionTimeout: number; // in minutes
    redirectDelay: number; // in milliseconds
    cacheExpiry: number; // in minutes
  };
}

// =============================================================================
// MAIN CONFIGURATION
// =============================================================================

export const authConfig: AuthConfig = {
  // ---------------------------------------------------------------------------
  // ROUTE CONFIGURATION
  // ---------------------------------------------------------------------------
  routes: {
    // Protected routes with specific access requirements
    protected: [
      {
        path: "/dashboard",
        requiredPlans: ["pln_free", "pln_premium", "pln_enterprise"],
        allowUnauthenticated: false
      },
      {
        path: "/profile",
        requiredPlans: ["pln_free", "pln_premium", "pln_enterprise"],
        allowUnauthenticated: false
      },
      {
        path: "/premium",
        requiredPlans: ["pln_premium", "pln_enterprise"],
        allowUnauthenticated: false,
        customRedirect: "/pricing"
      },
      {
        path: "/analytics",
        requiredPlans: ["pln_premium", "pln_enterprise"],
        requiredFeatures: ["advanced-analytics"],
        allowUnauthenticated: false
      },
      {
        path: "/admin",
        requiredPlans: ["pln_enterprise"],
        requiredPermissions: ["admin"],
        allowUnauthenticated: false,
        customRedirect: "/dashboard"
      },
      {
        path: "/settings",
        requiredPlans: ["pln_free", "pln_premium", "pln_enterprise"],
        allowUnauthenticated: false
      }
    ],

    // Public routes that don't require authentication
    public: [
      "/",
      "/login",
      "/signup",
      "/pricing",
      "/about",
      "/contact",
      "/terms",
      "/privacy",
      "/forgot-password",
      "/reset-password"
    ],

    // Redirect configuration for different scenarios
    redirects: {
      unauthenticated: "/login",
      afterLogin: "/dashboard",
      afterSignup: "/dashboard",
      afterLogout: "/",
      insufficientPermissions: "/dashboard",
      planRequired: "/pricing"
    }
  },

  // ---------------------------------------------------------------------------
  // PLAN CONFIGURATION
  // ---------------------------------------------------------------------------
  plans: {
    "pln_free": {
      id: "pln_free",
      name: "Free Plan",
      routes: ["/dashboard", "/profile", "/settings"],
      features: [
        "basic-support",
        "core-features",
        "basic-analytics",
        "profile-management"
      ],
      permissions: ["read"],
      priority: 1
    },
    
    "pln_premium": {
      id: "pln_premium",
      name: "Premium Plan",
      routes: ["/dashboard", "/profile", "/premium", "/analytics", "/settings"],
      features: [
        "priority-support",
        "advanced-features",
        "advanced-analytics",
        "api-access",
        "export-data",
        "custom-branding",
        "profile-management"
      ],
      permissions: ["read", "write"],
      priority: 2
    },

    "pln_enterprise": {
      id: "pln_enterprise", 
      name: "Enterprise Plan",
      routes: ["*"], // Access to all routes
      features: [
        "dedicated-support",
        "enterprise-features",
        "advanced-analytics",
        "api-access",
        "export-data",
        "custom-branding",
        "white-label",
        "sso",
        "audit-logs",
        "profile-management"
      ],
      permissions: ["read", "write", "admin"],
      priority: 3
    }
  },

  // ---------------------------------------------------------------------------
  // CONTENT GATING CONFIGURATION
  // ---------------------------------------------------------------------------
  contentGating: {
    // Component-level gating rules
    components: {
      "PremiumBanner": {
        component: "PremiumBanner",
        requiredPlans: ["pln_premium", "pln_enterprise"]
      },
      
      "AnalyticsDashboard": {
        component: "AnalyticsDashboard",
        requiredPlans: ["pln_premium", "pln_enterprise"],
        requiredFeatures: ["advanced-analytics"],
        fallbackComponent: "BasicAnalytics"
      },
      
      "AdminPanel": {
        component: "AdminPanel",
        requiredPlans: ["pln_enterprise"],
        requiredPermissions: ["admin"],
        fallbackComponent: "AccessDenied"
      },
      
      "APIAccessCard": {
        component: "APIAccessCard",
        requiredPlans: ["pln_premium", "pln_enterprise"],
        requiredFeatures: ["api-access"]
      },
      
      "ExportButton": {
        component: "ExportButton",
        requiredPlans: ["pln_premium", "pln_enterprise"],
        requiredFeatures: ["export-data"]
      },
      
      "CustomBrandingSettings": {
        component: "CustomBrandingSettings",
        requiredPlans: ["pln_premium", "pln_enterprise"],
        requiredFeatures: ["custom-branding"]
      },

      "WhiteLabelSettings": {
        component: "WhiteLabelSettings",
        requiredPlans: ["pln_enterprise"],
        requiredFeatures: ["white-label"]
      }
    },

    // Feature-based access mapping
    features: {
      "basic-support": ["pln_free", "pln_premium", "pln_enterprise"],
      "priority-support": ["pln_premium", "pln_enterprise"],
      "dedicated-support": ["pln_enterprise"],
      "core-features": ["pln_free", "pln_premium", "pln_enterprise"],
      "advanced-features": ["pln_premium", "pln_enterprise"],
      "enterprise-features": ["pln_enterprise"],
      "basic-analytics": ["pln_free", "pln_premium", "pln_enterprise"],
      "advanced-analytics": ["pln_premium", "pln_enterprise"],
      "api-access": ["pln_premium", "pln_enterprise"],
      "export-data": ["pln_premium", "pln_enterprise"],
      "custom-branding": ["pln_premium", "pln_enterprise"],
      "white-label": ["pln_enterprise"],
      "sso": ["pln_enterprise"],
      "audit-logs": ["pln_enterprise"],
      "profile-management": ["pln_free", "pln_premium", "pln_enterprise"]
    }
  },

  // ---------------------------------------------------------------------------
  // SYSTEM SETTINGS
  // ---------------------------------------------------------------------------
  settings: {
    enableDebugMode: process.env.NODE_ENV === "development",
    sessionTimeout: 30, // 30 minutes
    redirectDelay: 100, // 100ms delay for smooth UX
    cacheExpiry: 5 // 5 minutes cache for auth checks
  }
};

// =============================================================================
// CONFIGURATION VALIDATION
// =============================================================================

/**
 * Validates the auth configuration for consistency and completeness
 */
export function validateAuthConfig(config: AuthConfig): string[] {
  const errors: string[] = [];

  // Validate plan references in protected routes
  config.routes.protected.forEach(route => {
    if (route.requiredPlans) {
      route.requiredPlans.forEach(planId => {
        if (!config.plans[planId]) {
          errors.push(`Route ${route.path} references non-existent plan: ${planId}`);
        }
      });
    }
  });

  // Validate feature references in content gating
  Object.entries(config.contentGating.components).forEach(([componentName, rule]) => {
    if (rule.requiredFeatures) {
      rule.requiredFeatures.forEach(feature => {
        if (!config.contentGating.features[feature]) {
          errors.push(`Component ${componentName} references non-existent feature: ${feature}`);
        }
      });
    }
  });

  // Validate redirect paths
  const redirectPaths = Object.values(config.routes.redirects);
  redirectPaths.forEach(path => {
    if (!path.startsWith('/')) {
      errors.push(`Invalid redirect path: ${path} (must start with /)`);
    }
  });

  return errors;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get the highest priority plan for a member
 */
export function getHighestPriorityPlan(memberPlans: string[]): PlanConfig | null {
  const validPlans = memberPlans
    .map(planId => authConfig.plans[planId])
    .filter(Boolean)
    .sort((a, b) => b.priority - a.priority);

  return validPlans[0] || null;
}

/**
 * Check if a path is protected
 */
export function isProtectedRoute(path: string): boolean {
  return authConfig.routes.protected.some(route => 
    path.startsWith(route.path) || route.path === path
  );
}

/**
 * Check if a path is public
 */
export function isPublicRoute(path: string): boolean {
  return authConfig.routes.public.some(route => 
    path.startsWith(route) || route === path
  );
}

/**
 * Get redirect URL for a specific scenario
 */
export function getRedirectUrl(scenario: keyof RedirectConfig): string {
  return authConfig.routes.redirects[scenario];
}

// Validate configuration on import (development only)
if (process.env.NODE_ENV === "development") {
  const errors = validateAuthConfig(authConfig);
  if (errors.length > 0) {
    console.warn("Auth configuration validation errors:", errors);
  }
}