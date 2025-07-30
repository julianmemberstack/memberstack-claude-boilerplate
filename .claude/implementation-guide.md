# Implementation Guide - Memberstack + Claude Code Boilerplate

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ installed
- A Memberstack account with a configured app
- Basic knowledge of React, Next.js, and TypeScript

### 1. Clone and Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd memberstack-claude-boilerplate

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### 2. Configure Memberstack
```bash
# Add your Memberstack public key to .env.local
NEXT_PUBLIC_MEMBERSTACK_KEY=pk_your_public_key_here
```

### 3. Configure Plans in Memberstack Dashboard
Create these plans in your Memberstack dashboard:

#### Free Plan
- **Plan ID**: `pln_free`
- **Name**: "Free Plan"
- **Price**: $0

#### Premium Plan  
- **Plan ID**: `pln_premium`
- **Name**: "Premium Plan"
- **Price**: $29/month

#### Enterprise Plan
- **Plan ID**: `pln_enterprise` 
- **Name**: "Enterprise Plan"
- **Price**: $99/month

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🔧 Customization Guide

### Adding New Protected Routes

1. **Define the route in auth-config.ts**:
```typescript
// In lib/auth-config.ts
{
  path: "/new-feature",
  requiredPlans: ["pln_premium", "pln_enterprise"],
  allowUnauthenticated: false,
  customRedirect: "/pricing"
}
```

2. **Create the page component**:
```typescript
// app/new-feature/page.tsx
export default function NewFeaturePage() {
  return <div>Protected content here</div>;
}
```

3. **Add to navigation** (optional):
```typescript
// In app/dashboard/components/DashboardSidebar.tsx
const navigationItems = [
  // ... existing items
  {
    title: "New Feature",
    url: "/new-feature",
    icon: Star,
    description: "Access new feature",
    requiredPlans: ["pln_premium", "pln_enterprise"]
  }
];
```

### Creating Plan-Gated Components

1. **Define component gating rule**:
```typescript
// In lib/auth-config.ts
contentGating: {
  components: {
    "PremiumWidget": {
      component: "PremiumWidget",
      requiredPlans: ["pln_premium", "pln_enterprise"],
      fallbackComponent: "UpgradePrompt"
    }
  }
}
```

2. **Use in components**:
```typescript
"use client";

import { useAuthConfig } from "@/contexts/AuthConfigContext";
import { useMemberstack } from "@/app/components/MemberstackProvider";

export function MyComponent() {
  const { member } = useMemberstack();
  const { hasComponentAccess } = useAuthConfig();
  
  const access = hasComponentAccess(member, "PremiumWidget");
  
  if (!access.hasAccess) {
    return <UpgradePrompt reason={access.reason} />;
  }
  
  return <PremiumWidget />;
}
```

### Adding New Features

1. **Define the feature**:
```typescript
// In lib/auth-config.ts
features: {
  "custom-reports": ["pln_premium", "pln_enterprise"],
  "api-webhooks": ["pln_enterprise"]
}
```

2. **Use feature access checks**:
```typescript
const { hasFeatureAccess } = useAuthConfig();
const access = hasFeatureAccess(member, "custom-reports");

if (access.hasAccess) {
  // Show feature
} else {
  // Show upgrade prompt
}
```

### Customizing Plan Configurations

```typescript
// In lib/auth-config.ts
plans: {
  "pln_custom": {
    id: "pln_custom",
    name: "Custom Plan",
    routes: ["/dashboard", "/custom-area"],
    features: [
      "custom-feature-1",
      "custom-feature-2"
    ],
    permissions: ["read", "write", "custom"],
    priority: 4
  }
}
```

## 🎨 UI Customization

### Adding New shadcn/ui Components
```bash
# Install any shadcn/ui component
npx shadcn@latest add [component-name]

# Example: Add a data table
npx shadcn@latest add table
```

### Customizing the Dashboard

1. **Modify DashboardShell.tsx** for main content
2. **Update DashboardSidebar.tsx** for navigation
3. **Add new dashboard pages** in `app/dashboard/`

### Theming and Styling

1. **Update CSS variables** in `app/globals.css`
2. **Modify component styles** using Tailwind classes
3. **Add custom themes** by extending the design system

## 🔐 Advanced Authentication

### Adding Social Providers

1. **Configure in Memberstack dashboard**
2. **Update login component**:
```typescript
const handleGoogleLogin = async () => {
  await memberstack.loginWithProvider({
    provider: "google",
    allowSignup: true
  });
};
```

### Custom Authentication Logic
```typescript
// In a custom hook
export function useCustomAuth() {
  const { member, memberstack } = useMemberstack();
  
  const customLogin = async (email: string, password: string) => {
    // Add custom logic before/after login
    const result = await memberstack.loginMemberEmailPassword({
      email,
      password
    });
    
    // Custom post-login logic
    return result;
  };
  
  return { customLogin };
}
```

## 📊 Analytics and Monitoring

### Adding Analytics Events
```typescript
// Track user actions
const trackEvent = (eventName: string, properties: any) => {
  // Send to your analytics provider
  console.log(`Event: ${eventName}`, properties);
};

// Usage in components
const handleUpgrade = () => {
  trackEvent("upgrade_clicked", {
    current_plan: primaryPlan?.id,
    user_id: member?.id
  });
};
```

### Error Monitoring
```typescript
// Add error boundary and logging
const logError = (error: Error, context: string) => {
  console.error(`Error in ${context}:`, error);
  // Send to error tracking service
};
```

## 🚀 Deployment

### Environment Setup
```bash
# Production environment variables
NEXT_PUBLIC_MEMBERSTACK_KEY=pk_your_production_key
NODE_ENV=production
```

### Vercel Deployment
1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Custom Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🧪 Testing

### Unit Testing Setup
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Add test scripts to package.json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch"
}
```

### Example Tests
```typescript
// __tests__/auth-utils.test.ts
import { hasRouteAccess } from "@/lib/auth-utils";

describe("hasRouteAccess", () => {
  it("should allow access to public routes", () => {
    const result = hasRouteAccess(null, "/");
    expect(result.hasAccess).toBe(true);
  });
  
  it("should deny access to protected routes without auth", () => {
    const result = hasRouteAccess(null, "/dashboard");
    expect(result.hasAccess).toBe(false);
  });
});
```

## 🔄 Migration Guide

### From Existing Auth Solutions

1. **Export user data** from current system
2. **Import users** to Memberstack
3. **Update component imports** to use Memberstack hooks
4. **Test authentication flows** thoroughly

### Upgrading Memberstack SDK
```bash
# Update to latest version
npm update @memberstack/dom

# Check for breaking changes in changelog
# Update component implementations if needed
```

## 🛠️ Troubleshooting

### Common Issues

#### Authentication Not Working
- Verify Memberstack public key is correct
- Check browser console for errors
- Ensure Memberstack app is properly configured

#### Middleware Redirects
- Check route configurations in `auth-config.ts`
- Verify middleware matcher in `middleware.ts`
- Test with different user plan levels

#### Component Access Issues
- Validate plan IDs match Memberstack dashboard
- Check auth context is properly provided
- Review access control logic in components

### Debug Mode
```typescript
// Enable debug logging in development
// Check lib/auth-config.ts
settings: {
  enableDebugMode: process.env.NODE_ENV === "development"
}
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Memberstack API Reference](https://docs.memberstack.com/reference)
- [shadcn/ui Components](https://ui.shadcn.com/components)
- [Tailwind CSS Utilities](https://tailwindcss.com/docs/utility-first)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This boilerplate is open source and available under the MIT License.