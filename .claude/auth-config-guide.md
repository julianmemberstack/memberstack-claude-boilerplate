# Authentication Configuration Guide

## 🔐 Overview

The authentication system in this boilerplate is built around a **centralized configuration approach** that provides:
- **Single source of truth** for all auth rules
- **Type-safe** configuration with TypeScript
- **Flexible access control** (routes, components, features)
- **Easy maintenance** and updates
- **Development debugging** capabilities

## 📁 Core Files

### Primary Configuration
- **`lib/auth-config.ts`** - Main configuration file
- **`lib/auth-utils.ts`** - Utility functions for access checks
- **`contexts/AuthConfigContext.tsx`** - React context provider
- **`middleware.ts`** - Server-side route protection

### Integration Points
- **`app/components/MemberstackProvider.tsx`** - Auth state management
- **`app/lib/memberstack.ts`** - SDK initialization

## 🏗️ Configuration Structure

### 1. Route Protection

```typescript
// lib/auth-config.ts
routes: {
  protected: [
    {
      path: "/dashboard",
      requiredPlans: ["pln_free", "pln_premium", "pln_enterprise"],
      allowUnauthenticated: false
    },
    {
      path: "/premium",
      requiredPlans: ["pln_premium", "pln_enterprise"],
      customRedirect: "/pricing"
    },
    {
      path: "/admin",
      requiredPlans: ["pln_enterprise"],
      requiredPermissions: ["admin"],
      customRedirect: "/dashboard"
    }
  ],
  public: [
    "/",
    "/login", 
    "/signup",
    "/pricing"
  ],
  redirects: {
    unauthenticated: "/login",
    afterLogin: "/dashboard",
    afterSignup: "/dashboard",
    afterLogout: "/",
    insufficientPermissions: "/dashboard",
    planRequired: "/pricing"
  }
}
```

### 2. Plan Definitions

```typescript
plans: {
  "pln_free": {
    id: "pln_free",
    name: "Free Plan",
    routes: ["/dashboard", "/profile"],
    features: ["basic-support", "core-features"],
    permissions: ["read"],
    priority: 1
  },
  "pln_premium": {
    id: "pln_premium", 
    name: "Premium Plan",
    routes: ["/dashboard", "/premium", "/analytics"],
    features: ["priority-support", "advanced-analytics"],
    permissions: ["read", "write"],
    priority: 2
  },
  "pln_enterprise": {
    id: "pln_enterprise",
    name: "Enterprise Plan", 
    routes: ["*"], // Access to all routes
    features: ["dedicated-support", "white-label"],
    permissions: ["read", "write", "admin"],
    priority: 3
  }
}
```

### 3. Content Gating Rules

```typescript
contentGating: {
  components: {
    "AnalyticsDashboard": {
      component: "AnalyticsDashboard",
      requiredPlans: ["pln_premium", "pln_enterprise"],
      requiredFeatures: ["advanced-analytics"],
      fallbackComponent: "BasicAnalytics"
    },
    "AdminPanel": {
      component: "AdminPanel",
      requiredPlans: ["pln_enterprise"],
      requiredPermissions: ["admin"]
    }
  },
  features: {
    "advanced-analytics": ["pln_premium", "pln_enterprise"],
    "api-access": ["pln_premium", "pln_enterprise"],
    "white-label": ["pln_enterprise"]
  }
}
```

## 🔧 Using the Configuration

### 1. Route-Level Protection (Automatic)

The middleware automatically protects routes based on configuration:

```typescript
// middleware.ts automatically checks:
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (isProtectedRoute(pathname)) {
    const accessCheck = await checkRouteAccess(pathname, member);
    
    if (!accessCheck.hasAccess) {
      return NextResponse.redirect(accessCheck.redirectUrl);
    }
  }
}
```

### 2. Component-Level Gating

```typescript
"use client";

import { useAuthConfig } from "@/contexts/AuthConfigContext";
import { useMemberstack } from "@/app/components/MemberstackProvider";

export function ProtectedComponent() {
  const { member } = useMemberstack();
  const { hasComponentAccess } = useAuthConfig();
  
  const access = hasComponentAccess(member, "AnalyticsDashboard");
  
  if (!access.hasAccess) {
    return (
      <div className="p-4 border border-dashed rounded-lg">
        <h3>Premium Feature</h3>
        <p>{access.suggestedAction}</p>
        <Button>Upgrade Now</Button>
      </div>
    );
  }
  
  return <AnalyticsDashboard />;
}
```

### 3. Feature-Based Access

```typescript
export function FeatureToggle({ feature, children }) {
  const { member } = useMemberstack();
  const { hasFeatureAccess } = useAuthConfig();
  
  const access = hasFeatureAccess(member, feature);
  
  return access.hasAccess ? children : null;
}

// Usage
<FeatureToggle feature="advanced-analytics">
  <AdvancedChart />
</FeatureToggle>
```

### 4. Plan-Based Navigation

```typescript
// In navigation components
const navigationItems = [
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
    requiredPlans: ["pln_premium", "pln_enterprise"]
  }
];

// Render with access check
{navigationItems.map((item) => {
  const hasAccess = !item.requiredPlans || hasPlan(member, item.requiredPlans);
  
  return (
    <NavigationItem 
      key={item.title}
      {...item}
      disabled={!hasAccess}
      badge={!hasAccess ? "Premium" : undefined}
    />
  );
})}
```

## 🔍 Utility Functions

### Access Checking

```typescript
// Check route access
const access = hasRouteAccess(member, "/premium");
// Returns: { hasAccess: boolean, reason?: string, suggestedAction?: string }

// Check feature access  
const access = hasFeatureAccess(member, "advanced-analytics");

// Check component access
const access = hasComponentAccess(member, "AdminPanel");

// Check plan membership
const hasPremium = hasPlan(member, ["pln_premium", "pln_enterprise"]);
const hasAll = hasAllPlans(member, ["pln_premium", "pln_enterprise"]);
```

### Member Information

```typescript
// Get active plans
const activePlans = getActivePlans(member);
const primaryPlan = getPrimaryPlan(member); // Highest priority

// Get capabilities
const features = getMemberFeatures(member);
const permissions = getMemberPermissions(member);

// Plan comparison
const canUpgrade = canUpgradeToPlan(member, "pln_enterprise");
const recommendedPlan = getRecommendedPlanForFeature("advanced-analytics");
```

### Development Debugging

```typescript
// Get debug information
const debugInfo = getAccessDebugInfo(member, "/premium");
console.log(debugInfo);
// Returns:
// {
//   member: { id, email, plans, permissions, features },
//   route: { path, isProtected, requirements, hasAccess }
// }

// Log access attempts (development only)
logAccessAttempt(member, "/premium", "route", accessResult);
```

## ⚙️ Advanced Configuration

### Custom Validation

```typescript
// Add custom validation in auth-config.ts
export function validateCustomAccess(member: Member, context: any): boolean {
  // Custom business logic
  if (member.customFields?.specialAccess) {
    return true;
  }
  
  // Check subscription status
  if (member.stripeCustomerId && isSubscriptionActive(member)) {
    return true;
  }
  
  return false;
}
```

### Dynamic Configuration

```typescript
// Load configuration from API or CMS
export async function loadDynamicConfig(): Promise<Partial<AuthConfig>> {
  const response = await fetch("/api/auth-config");
  const dynamicConfig = await response.json();
  
  return {
    plans: {
      ...authConfig.plans,
      ...dynamicConfig.plans
    }
  };
}
```

### Environment-Specific Rules

```typescript
// Different rules for development/production
const isDevelopment = process.env.NODE_ENV === "development";

export const authConfig: AuthConfig = {
  routes: {
    protected: [
      // Development-only routes
      ...(isDevelopment ? [
        {
          path: "/dev-tools",
          requiredPlans: ["pln_free", "pln_premium", "pln_enterprise"]
        }
      ] : []),
      // Production routes
      ...productionRoutes
    ]
  }
};
```

## 🔄 Configuration Updates

### Adding New Plans

1. **Add to Memberstack Dashboard**
2. **Update auth-config.ts**:
```typescript
plans: {
  // ... existing plans
  "pln_startup": {
    id: "pln_startup",
    name: "Startup Plan",
    routes: ["/dashboard", "/startup-tools"],
    features: ["startup-analytics", "team-collaboration"], 
    permissions: ["read", "write"],
    priority: 2.5 // Between premium and enterprise
  }
}
```

3. **Update feature mappings**:
```typescript
features: {
  "startup-analytics": ["pln_startup", "pln_enterprise"],
  "team-collaboration": ["pln_startup", "pln_premium", "pln_enterprise"]
}
```

### Modifying Access Rules

```typescript
// Update existing route
{
  path: "/analytics",
  requiredPlans: ["pln_premium", "pln_enterprise", "pln_startup"], // Add new plan
  requiredFeatures: ["advanced-analytics"] // Add feature requirement
}
```

### Adding New Features

```typescript
// 1. Define feature
features: {
  "custom-integrations": ["pln_enterprise"]
}

// 2. Add to plan
plans: {
  "pln_enterprise": {
    // ... existing config
    features: [...existingFeatures, "custom-integrations"]
  }
}

// 3. Use in components
const { hasFeatureAccess } = useAuthConfig();
const canUseIntegrations = hasFeatureAccess(member, "custom-integrations");
```

## 🛠️ Troubleshooting

### Common Issues

1. **Route not protected**: Check if path is in `protected` array
2. **Wrong redirect**: Verify `customRedirect` or default redirect URLs
3. **Access denied**: Check plan IDs match Memberstack dashboard exactly
4. **Component not gating**: Ensure component name matches configuration

### Debug Mode

Enable detailed logging:
```typescript
// In auth-config.ts
settings: {
  enableDebugMode: true // Will log all access checks
}
```

### Validation

Run configuration validation:
```typescript
// In development, validation runs automatically
const errors = validateAuthConfig(authConfig);
if (errors.length > 0) {
  console.warn("Auth configuration errors:", errors);
}
```

## 📈 Best Practices

1. **Plan IDs**: Use consistent naming (e.g., `pln_` prefix)
2. **Feature Names**: Use kebab-case for consistency
3. **Permissions**: Keep simple (read, write, admin)
4. **Priorities**: Leave gaps for future plans (1, 2, 5, 10)
5. **Redirects**: Always provide fallback redirects
6. **Testing**: Test all access scenarios in development
7. **Documentation**: Keep this guide updated with changes

## 🔮 Future Enhancements

- **Role-based access control** (RBAC) with complex permissions
- **Time-based access** (trial periods, temporary access)
- **Geographic restrictions** by user location
- **API rate limiting** based on plan tiers
- **Feature usage tracking** and limits
- **A/B testing** for access control rules