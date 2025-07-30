/**
 * Memberstack Server API Utilities
 * 
 * This module provides server-side utilities for interacting with the Memberstack API
 * to fetch plans, configure access rules, and generate dynamic auth configurations.
 * 
 * Note: This uses the SECRET key and should only be used server-side or in build scripts.
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface MemberstackPlan {
  id: string;
  name: string;
  description?: string;
  price?: {
    amount: number;
    currency: string;
    interval: string;
  };
  features?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MemberstackApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PlanConfigSuggestion {
  planId: string;
  name: string;
  suggestedPriority: number;
  suggestedFeatures: string[];
  suggestedPermissions: string[];
  suggestedRoutes: string[];
  reasoning: string;
}

// =============================================================================
// API CLIENT
// =============================================================================

class MemberstackApiClient {
  private secretKey: string;
  private baseUrl = 'https://api.memberstack.com/v1';

  constructor(secretKey: string) {
    if (!secretKey) {
      throw new Error('Memberstack secret key is required for API access');
    }
    this.secretKey = secretKey;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<MemberstackApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Memberstack API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Fetch all plans from Memberstack
   */
  async getPlans(): Promise<MemberstackPlan[]> {
    try {
      const response = await this.makeRequest<MemberstackPlan[]>('/plans');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching Memberstack plans:', error);
      throw error;
    }
  }

  /**
   * Get a specific plan by ID
   */
  async getPlan(planId: string): Promise<MemberstackPlan | null> {
    try {
      const response = await this.makeRequest<MemberstackPlan>(`/plans/${planId}`);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching plan ${planId}:`, error);
      return null;
    }
  }
}

// =============================================================================
// CONFIGURATION GENERATOR
// =============================================================================

/**
 * Generate auth configuration suggestions based on Memberstack plans
 */
export function generateAuthConfigSuggestions(plans: MemberstackPlan[]): PlanConfigSuggestion[] {
  const sortedPlans = plans
    .filter(plan => plan.isActive)
    .sort((a, b) => {
      // Sort by price (free first, then ascending)
      const priceA = a.price?.amount || 0;
      const priceB = b.price?.amount || 0;
      return priceA - priceB;
    });

  return sortedPlans.map((plan, index) => {
    const priority = index + 1;
    const priceAmount = plan.price?.amount || 0;
    
    // Suggest features based on plan name and price
    const suggestedFeatures = generateFeatureSuggestions(plan, priority);
    const suggestedPermissions = generatePermissionSuggestions(plan, priority);
    const suggestedRoutes = generateRouteSuggestions(plan, priority);
    
    return {
      planId: plan.id,
      name: plan.name,
      suggestedPriority: priority,
      suggestedFeatures,
      suggestedPermissions,
      suggestedRoutes,
      reasoning: generateReasoningText(plan, priority, priceAmount),
    };
  });
}

/**
 * Generate feature suggestions based on plan characteristics
 */
function generateFeatureSuggestions(plan: MemberstackPlan, priority: number): string[] {
  const features: string[] = [];
  const planName = plan.name.toLowerCase();
  const price = plan.price?.amount || 0;
  
  // Base features for all plans
  features.push('profile-management');
  
  if (priority === 1 || price === 0 || planName.includes('free') || planName.includes('basic')) {
    // Free/Basic plan features
    features.push('basic-support', 'core-features', 'basic-analytics');
  } else if (priority === 2 || planName.includes('premium') || planName.includes('pro')) {
    // Premium plan features
    features.push(
      'basic-support', 'core-features', 'basic-analytics',
      'priority-support', 'advanced-features', 'advanced-analytics',
      'api-access', 'export-data', 'custom-branding'
    );
  } else {
    // Enterprise/highest tier features
    features.push(
      'basic-support', 'core-features', 'basic-analytics',
      'priority-support', 'advanced-features', 'advanced-analytics',
      'api-access', 'export-data', 'custom-branding',
      'dedicated-support', 'enterprise-features', 'white-label',
      'sso', 'audit-logs'
    );
  }
  
  return features;
}

/**
 * Generate permission suggestions based on plan priority
 */
function generatePermissionSuggestions(plan: MemberstackPlan, priority: number): string[] {
  const permissions: string[] = ['read']; // All plans get read access
  
  if (priority >= 2) {
    permissions.push('write');
  }
  
  if (priority >= 3) {
    permissions.push('admin');
  }
  
  return permissions;
}

/**
 * Generate route suggestions based on plan priority
 */
function generateRouteSuggestions(plan: MemberstackPlan, priority: number): string[] {
  const routes: string[] = ['/dashboard', '/profile', '/settings'];
  
  if (priority >= 2) {
    routes.push('/premium', '/analytics', '/api-access');
  }
  
  if (priority >= 3) {
    routes.push('/admin', '/enterprise', '/team-management');
  }
  
  return routes;
}

/**
 * Generate reasoning text for configuration suggestions
 */
function generateReasoningText(plan: MemberstackPlan, priority: number, price: number): string {
  const tierName = priority === 1 ? 'basic' : priority === 2 ? 'premium' : 'enterprise';
  const priceText = price === 0 ? 'free' : `$${price}`;
  
  return `Suggested as ${tierName} tier based on ${priceText} pricing and plan name "${plan.name}". ` +
    `Priority ${priority} indicates ${priority === 1 ? 'entry-level' : priority === 2 ? 'mid-tier' : 'highest-tier'} access levels.`;
}

// =============================================================================
// EXPORTED FUNCTIONS
// =============================================================================

/**
 * Get singleton API client instance
 */
export function getMemberstackApiClient(): MemberstackApiClient {
  const secretKey = process.env.MEMBERSTACK_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error(
      'MEMBERSTACK_SECRET_KEY environment variable is required. ' +
      'Get your secret key from https://app.memberstack.com/dashboard/app/[your-app]/keys'
    );
  }
  
  return new MemberstackApiClient(secretKey);
}

/**
 * Fetch all plans and generate configuration suggestions
 */
export async function generateAuthConfigFromPlans(): Promise<{
  plans: MemberstackPlan[];
  suggestions: PlanConfigSuggestion[];
}> {
  const client = getMemberstackApiClient();
  const plans = await client.getPlans();
  const suggestions = generateAuthConfigSuggestions(plans);
  
  return { plans, suggestions };
}

/**
 * Generate a complete auth-config.ts file content based on fetched plans
 */
export async function generateAuthConfigFile(): Promise<string> {
  const { plans, suggestions } = await generateAuthConfigFromPlans();
  
  if (suggestions.length === 0) {
    throw new Error('No active plans found in Memberstack. Please create at least one plan first.');
  }
  
  // Generate the TypeScript configuration file content
  const configContent = `/**
 * Auto-generated Authentication & Authorization Configuration
 * Generated from Memberstack plans on ${new Date().toISOString()}
 * 
 * This configuration was automatically created based on your Memberstack plans.
 * You can customize the features, permissions, and routes as needed.
 */

import type { AuthConfig } from './auth-config-types';

export const authConfig: AuthConfig = {
  routes: {
    protected: [
${suggestions.map(s => `      {
        path: "/dashboard",
        requiredPlans: [${s.suggestedRoutes.includes('/dashboard') ? `"${s.planId}"` : ''}],
        allowUnauthenticated: false
      }`).filter(Boolean).join(',\n')}
    ],
    
    public: [
      "/",
      "/login", 
      "/signup",
      "/pricing",
      "/about",
      "/contact",
      "/terms",
      "/privacy"
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
    components: {
      "AnalyticsDashboard": {
        component: "AnalyticsDashboard",
        requiredPlans: [${suggestions.filter(s => s.suggestedFeatures.includes('advanced-analytics')).map(s => `"${s.planId}"`).join(', ')}],
        requiredFeatures: ["advanced-analytics"]
      },
      "AdminPanel": {
        component: "AdminPanel", 
        requiredPlans: [${suggestions.filter(s => s.suggestedPermissions.includes('admin')).map(s => `"${s.planId}"`).join(', ')}],
        requiredPermissions: ["admin"]
      }
    },

    features: {
${Array.from(new Set(suggestions.flatMap(s => s.suggestedFeatures))).map(feature => 
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

// Plan information from Memberstack (for reference)
export const memberstackPlans = ${JSON.stringify(plans, null, 2)};

// Configuration suggestions (for debugging)
export const configSuggestions = ${JSON.stringify(suggestions, null, 2)};
`;

  return configContent;
}

/**
 * Validate that required environment variables are present
 */
export function validateMemberstackConfig(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!process.env.NEXT_PUBLIC_MEMBERSTACK_KEY) {
    errors.push('NEXT_PUBLIC_MEMBERSTACK_KEY is required');
  }
  
  if (!process.env.MEMBERSTACK_SECRET_KEY) {
    errors.push('MEMBERSTACK_SECRET_KEY is required for plan fetching');
  }
  
  if (process.env.NODE_ENV === 'production' && process.env.MEMBERSTACK_SECRET_KEY) {
    warnings.push('Secret key detected in production - ensure it\'s properly secured');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}