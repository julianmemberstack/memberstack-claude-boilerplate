/**
 * Default Authentication Configuration
 * 
 * This is a placeholder configuration that allows the app to run without
 * crashing when Memberstack plans haven't been configured yet.
 * 
 * Run `npm run setup:memberstack` to generate a configuration based on
 * your actual Memberstack plans.
 */

import type { AuthConfig } from './auth-config';

export const defaultAuthConfig: AuthConfig = {
  routes: {
    protected: [
      {
        path: "/dashboard",
        requiredPlans: [], // Empty array allows any authenticated user
        allowUnauthenticated: false
      },
      {
        path: "/profile",
        requiredPlans: [],
        allowUnauthenticated: false
      },
      {
        path: "/settings",
        requiredPlans: [],
        allowUnauthenticated: false
      }
    ],
    
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
      "/reset-password",
      "/setup"
    ],
    
    redirects: {
      unauthenticated: "/login",
      afterLogin: "/dashboard",
      afterSignup: "/dashboard",
      afterLogout: "/",
      insufficientPermissions: "/dashboard",
      planRequired: "/pricing"
    }
  },

  plans: {
    // Placeholder plan that matches any authenticated user
    "default": {
      id: "default",
      name: "Default Plan",
      routes: ["*"],
      features: ["basic-features"],
      permissions: ["read"],
      priority: 1
    }
  },

  contentGating: {
    components: {},
    features: {
      "basic-features": ["default"]
    }
  },

  settings: {
    enableDebugMode: process.env.NODE_ENV === "development",
    sessionTimeout: 30,
    redirectDelay: 100,
    cacheExpiry: 5
  }
};