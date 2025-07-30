#!/usr/bin/env node

/**
 * Memberstack Setup Script
 * 
 * This script automatically fetches your Memberstack plans and generates
 * the auth configuration based on your existing plan structure.
 * 
 * Usage:
 *   node scripts/setup-memberstack.js
 *   npm run setup:memberstack
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${colors.bright}${colors.blue}🔧 ${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logWarning(message) {
  log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logError(message) {
  log(`${colors.red}❌ ${message}${colors.reset}`);
}

// Memberstack API client (simplified for Node.js)
class MemberstackApiClient {
  constructor(secretKey) {
    this.secretKey = secretKey;
    this.baseUrl = 'https://api.memberstack.com/v1';
  }

  async makeRequest(endpoint) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Memberstack API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getPlans() {
    const response = await this.makeRequest('/plans');
    return response.data || [];
  }
}

// Configuration generator
function generateAuthConfigSuggestions(plans) {
  const activePlans = plans.filter(plan => plan.isActive);
  
  // Sort plans by price (free first, then ascending)  
  const sortedPlans = activePlans.sort((a, b) => {
    const priceA = a.price?.amount || 0;
    const priceB = b.price?.amount || 0;
    return priceA - priceB;
  });

  return sortedPlans.map((plan, index) => {
    const priority = index + 1;
    const price = plan.price?.amount || 0;
    const planName = plan.name.toLowerCase();
    
    // Generate features based on plan characteristics
    let features = ['profile-management'];
    let permissions = ['read'];
    let routes = ['/dashboard', '/profile', '/settings'];
    
    if (priority === 1 || price === 0 || planName.includes('free') || planName.includes('basic')) {
      features.push('basic-support', 'core-features', 'basic-analytics');
    } else if (priority === 2 || planName.includes('premium') || planName.includes('pro')) {
      features.push('basic-support', 'core-features', 'basic-analytics', 'priority-support', 'advanced-features', 'advanced-analytics', 'api-access', 'export-data', 'custom-branding');
      permissions.push('write');
      routes.push('/premium', '/analytics', '/api-access');
    } else {
      features.push('basic-support', 'core-features', 'basic-analytics', 'priority-support', 'advanced-features', 'advanced-analytics', 'api-access', 'export-data', 'custom-branding', 'dedicated-support', 'enterprise-features', 'white-label', 'sso', 'audit-logs');
      permissions.push('write', 'admin');
      routes.push('/premium', '/analytics', '/api-access', '/admin', '/enterprise', '/team-management');
    }
    
    return {
      planId: plan.id,
      name: plan.name,
      suggestedPriority: priority,
      suggestedFeatures: features,
      suggestedPermissions: permissions,
      suggestedRoutes: routes,
      price: plan.price,
      reasoning: `Suggested as ${priority === 1 ? 'basic' : priority === 2 ? 'premium' : 'enterprise'} tier based on ${price === 0 ? 'free' : '$' + price} pricing.`
    };
  });
}

function generateAuthConfigFile(plans, suggestions) {
  // Create unique features list
  const allFeatures = Array.from(new Set(suggestions.flatMap(s => s.suggestedFeatures)));
  
  return `/**
 * Auto-generated Authentication & Authorization Configuration
 * Generated from Memberstack plans on ${new Date().toISOString()}
 * 
 * Found ${plans.length} plans (${suggestions.length} active)
 * This configuration was automatically created based on your Memberstack plans.
 * You can customize the features, permissions, and routes as needed.
 */

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
  priority: number;
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
    features: Record<string, string[]>;
  };
  settings: {
    enableDebugMode: boolean;
    sessionTimeout: number;
    redirectDelay: number;
    cacheExpiry: number;
  };
}

export const authConfig: AuthConfig = {
  routes: {
    protected: [
      {
        path: "/dashboard",
        requiredPlans: [${suggestions.map(s => `"${s.planId}"`).join(', ')}],
        allowUnauthenticated: false
      },
      {
        path: "/profile", 
        requiredPlans: [${suggestions.map(s => `"${s.planId}"`).join(', ')}],
        allowUnauthenticated: false
      },
      {
        path: "/settings",
        requiredPlans: [${suggestions.map(s => `"${s.planId}"`).join(', ')}],
        allowUnauthenticated: false
      }${suggestions.filter(s => s.suggestedRoutes.includes('/premium')).length > 0 ? `,
      {
        path: "/premium",
        requiredPlans: [${suggestions.filter(s => s.suggestedRoutes.includes('/premium')).map(s => `"${s.planId}"`).join(', ')}],
        allowUnauthenticated: false,
        customRedirect: "/pricing"
      }` : ''}${suggestions.filter(s => s.suggestedRoutes.includes('/admin')).length > 0 ? `,
      {
        path: "/admin",
        requiredPlans: [${suggestions.filter(s => s.suggestedRoutes.includes('/admin')).map(s => `"${s.planId}"`).join(', ')}],
        requiredPermissions: ["admin"],
        allowUnauthenticated: false,
        customRedirect: "/dashboard"
      }` : ''}
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
      "/reset-password"
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
${suggestions.map(s => `    "${s.planId}": {
      id: "${s.planId}",
      name: "${s.name}",
      routes: [${s.suggestedRoutes.map(r => `"${r}"`).join(', ')}],
      features: [${s.suggestedFeatures.map(f => `"${f}"`).join(', ')}],
      permissions: [${s.suggestedPermissions.map(p => `"${p}"`).join(', ')}],
      priority: ${s.suggestedPriority}
    }`).join(',\n')}
  },

  contentGating: {
    components: {${suggestions.filter(s => s.suggestedFeatures.includes('advanced-analytics')).length > 0 ? `
      "AnalyticsDashboard": {
        component: "AnalyticsDashboard",
        requiredPlans: [${suggestions.filter(s => s.suggestedFeatures.includes('advanced-analytics')).map(s => `"${s.planId}"`).join(', ')}],
        requiredFeatures: ["advanced-analytics"],
        fallbackComponent: "BasicAnalytics"
      },` : ''}${suggestions.filter(s => s.suggestedPermissions.includes('admin')).length > 0 ? `
      "AdminPanel": {
        component: "AdminPanel",
        requiredPlans: [${suggestions.filter(s => s.suggestedPermissions.includes('admin')).map(s => `"${s.planId}"`).join(', ')}],
        requiredPermissions: ["admin"],
        fallbackComponent: "AccessDenied"
      },` : ''}${suggestions.filter(s => s.suggestedFeatures.includes('api-access')).length > 0 ? `
      "APIAccessCard": {
        component: "APIAccessCard",
        requiredPlans: [${suggestions.filter(s => s.suggestedFeatures.includes('api-access')).map(s => `"${s.planId}"`).join(', ')}],
        requiredFeatures: ["api-access"]
      },` : ''}${suggestions.filter(s => s.suggestedFeatures.includes('export-data')).length > 0 ? `
      "ExportButton": {
        component: "ExportButton", 
        requiredPlans: [${suggestions.filter(s => s.suggestedFeatures.includes('export-data')).map(s => `"${s.planId}"`).join(', ')}],
        requiredFeatures: ["export-data"]
      }` : ''}
    },

    features: {
${allFeatures.map(feature => 
  `      "${feature}": [${suggestions.filter(s => s.suggestedFeatures.includes(feature)).map(s => `"${s.planId}"`).join(', ')}]`
).join(',\n')}
    }
  },

  settings: {
    enableDebugMode: process.env.NODE_ENV === "development",
    sessionTimeout: 30,
    redirectDelay: 100,
    cacheExpiry: 5
  }
};

// Validation and utility functions
export function validateAuthConfig(config: AuthConfig): string[] {
  const errors: string[] = [];
  
  config.routes.protected.forEach(route => {
    if (route.requiredPlans) {
      route.requiredPlans.forEach(planId => {
        if (!config.plans[planId]) {
          errors.push(\`Route \${route.path} references non-existent plan: \${planId}\`);
        }
      });
    }
  });
  
  return errors;
}

export function getHighestPriorityPlan(memberPlans: string[]): PlanConfig | null {
  const validPlans = memberPlans
    .map(planId => authConfig.plans[planId])
    .filter(Boolean)
    .sort((a, b) => b.priority - a.priority);

  return validPlans[0] || null;
}

export function isProtectedRoute(path: string): boolean {
  return authConfig.routes.protected.some(route => 
    path.startsWith(route.path) || route.path === path
  );
}

export function isPublicRoute(path: string): boolean {
  return authConfig.routes.public.some(route => 
    path.startsWith(route) || route === path
  );
}

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

// Export plan information for debugging
export const memberstackPlansInfo = ${JSON.stringify(plans, null, 2)};
`;
}

async function main() {
  logHeader('Memberstack Configuration Setup');
  
  // Check environment variables
  const publicKey = process.env.NEXT_PUBLIC_MEMBERSTACK_KEY;
  const secretKey = process.env.MEMBERSTACK_SECRET_KEY;
  
  if (!publicKey) {
    logError('NEXT_PUBLIC_MEMBERSTACK_KEY not found in .env.local');
    log('Please add your Memberstack public key to .env.local');
    process.exit(1);
  }
  
  if (!secretKey) {
    logError('MEMBERSTACK_SECRET_KEY not found in .env.local');
    log('Please add your Memberstack secret key to .env.local');
    log('Get it from: https://app.memberstack.com/dashboard/app/[your-app]/keys');
    process.exit(1);
  }
  
  logSuccess('Environment variables found');
  
  try {
    // Fetch plans from Memberstack
    logHeader('Fetching plans from Memberstack API');
    const client = new MemberstackApiClient(secretKey);
    const plans = await client.getPlans();
    
    if (plans.length === 0) {
      logWarning('No plans found in your Memberstack app');
      log('Please create at least one plan in your Memberstack dashboard first.');
      process.exit(1);
    }
    
    logSuccess(`Found ${plans.length} plans`);
    
    // Display plan information
    plans.forEach(plan => {
      const price = plan.price ? `$${plan.price.amount}/${plan.price.interval}` : 'Free';
      const status = plan.isActive ? '🟢 Active' : '🔴 Inactive';
      log(`  - ${plan.name} (${plan.id}) - ${price} ${status}`);
    });
    
    // Generate configuration suggestions
    logHeader('Generating configuration suggestions');
    const suggestions = generateAuthConfigSuggestions(plans);
    
    if (suggestions.length === 0) {
      logWarning('No active plans found - activate at least one plan in Memberstack');
      process.exit(1);
    }
    
    logSuccess(`Generated configuration for ${suggestions.length} active plans`);
    
    // Display suggestions
    suggestions.forEach(suggestion => {
      log(`\\n  📋 ${suggestion.name} (Priority ${suggestion.suggestedPriority})`);
      log(`     Features: ${suggestion.suggestedFeatures.slice(0, 3).join(', ')}${suggestion.suggestedFeatures.length > 3 ? '...' : ''}`);
      log(`     Permissions: ${suggestion.suggestedPermissions.join(', ')}`);
      log(`     ${suggestion.reasoning}`);
    });
    
    // Generate auth config file
    logHeader('Generating auth-config.ts file');
    const configContent = generateAuthConfigFile(plans, suggestions);
    
    // Write to file
    const configPath = path.join(process.cwd(), 'lib', 'auth-config.ts');
    fs.writeFileSync(configPath, configContent);
    
    logSuccess(`Configuration written to ${configPath}`);
    
    // Final instructions
    logHeader('Setup Complete!');
    logSuccess('Your auth configuration has been generated based on your Memberstack plans');
    log('\\nNext steps:');
    log('1. Review the generated lib/auth-config.ts file');
    log('2. Customize features, permissions, and routes as needed');
    log('3. Test the authentication flow: npm run dev');
    log('4. Create protected pages using the generated plan IDs');
    
    logWarning('Important: Keep your MEMBERSTACK_SECRET_KEY secure and never expose it client-side!');
    
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    
    if (error.message.includes('401') || error.message.includes('403')) {
      log('\\nThis might be due to:');
      log('- Invalid secret key');
      log('- Insufficient permissions');
      log('- Expired or disabled key');
    }
    
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\\n\\nSetup cancelled by user');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  logError(`Unexpected error: ${error.message}`);
  process.exit(1);
});

// Run the setup
main().catch(error => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});