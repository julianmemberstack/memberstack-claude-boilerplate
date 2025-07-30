/**
 * Authentication & Authorization Utility Functions
 * 
 * This module provides utility functions for checking auth status,
 * validating permissions, and managing auth-related operations
 * across the application.
 */

import { authConfig, getHighestPriorityPlan, type PlanConfig, type AuthRoute } from './auth-config';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface Member {
  id: string;
  verified: boolean;
  profileImage?: string;
  auth: {
    email: string;
    hasPassword: boolean;
    providers: Array<{ provider: string }>;
  };
  loginRedirect?: string;
  stripeCustomerId?: string;
  createdAt: string;
  metaData: { [key: string]: any };
  customFields: { [key: string]: any };
  permissions: string[];
  planConnections: Array<{
    id: string;
    planId: string;
    active: boolean;
    status: string;
    type: string;
  }>;
}

export interface AuthState {
  isAuthenticated: boolean;
  member: Member | null;
  loading: boolean;
  error: string | null;
}

export interface AccessCheckResult {
  hasAccess: boolean;
  reason?: string;
  requiredPlans?: string[];
  requiredPermissions?: string[];
  suggestedAction?: string;
}

// =============================================================================
// MEMBER UTILITIES
// =============================================================================

/**
 * Get active plan IDs for a member
 */
export function getActivePlanIds(member: Member | null): string[] {
  if (!member?.planConnections) return [];
  
  return member.planConnections
    .filter(conn => conn.active)
    .map(conn => conn.planId);
}

/**
 * Get the primary (highest priority) plan for a member
 */
export function getPrimaryPlan(member: Member | null): PlanConfig | null {
  const activePlans = getActivePlanIds(member);
  return getHighestPriorityPlan(activePlans);
}

/**
 * Get all active plans for a member
 */
export function getActivePlans(member: Member | null): PlanConfig[] {
  const activePlanIds = getActivePlanIds(member);
  return activePlanIds
    .map(planId => authConfig.plans[planId])
    .filter(Boolean)
    .sort((a, b) => b.priority - a.priority);
}

/**
 * Check if member has any of the specified plans
 */
export function hasPlan(member: Member | null, planIds: string | string[]): boolean {
  if (!member) return false;
  
  const plansToCheck = Array.isArray(planIds) ? planIds : [planIds];
  const activePlans = getActivePlanIds(member);
  
  return plansToCheck.some(planId => activePlans.includes(planId));
}

/**
 * Check if member has all of the specified plans
 */
export function hasAllPlans(member: Member | null, planIds: string[]): boolean {
  if (!member) return false;
  
  const activePlans = getActivePlanIds(member);
  return planIds.every(planId => activePlans.includes(planId));
}

/**
 * Get all available features for a member based on their plans
 */
export function getMemberFeatures(member: Member | null): string[] {
  const activePlans = getActivePlans(member);
  const allFeatures = new Set<string>();
  
  activePlans.forEach(plan => {
    plan.features.forEach(feature => allFeatures.add(feature));
  });
  
  return Array.from(allFeatures);
}

/**
 * Get all permissions for a member
 */
export function getMemberPermissions(member: Member | null): string[] {
  if (!member) return [];
  
  // Combine member permissions with plan permissions
  const memberPermissions = member.permissions || [];
  const activePlans = getActivePlans(member);
  const planPermissions = activePlans.flatMap(plan => plan.permissions);
  
  return [...new Set([...memberPermissions, ...planPermissions])];
}

// =============================================================================
// ACCESS CONTROL UTILITIES
// =============================================================================

/**
 * Check if member has access to a specific route
 */
export function hasRouteAccess(member: Member | null, path: string): AccessCheckResult {
  // Find the protected route configuration
  const protectedRoute = authConfig.routes.protected.find(route => 
    path.startsWith(route.path) || route.path === path
  );

  // If route is not protected, allow access
  if (!protectedRoute) {
    return { hasAccess: true };
  }

  // Check authentication
  if (!protectedRoute.allowUnauthenticated && !member) {
    return {
      hasAccess: false,
      reason: 'Authentication required',
      suggestedAction: 'Please log in to access this page'
    };
  }

  // Check plan requirements
  if (protectedRoute.requiredPlans && protectedRoute.requiredPlans.length > 0) {
    const hasRequiredPlan = hasPlan(member, protectedRoute.requiredPlans);
    
    if (!hasRequiredPlan) {
      return {
        hasAccess: false,
        reason: 'Plan upgrade required',
        requiredPlans: protectedRoute.requiredPlans,
        suggestedAction: 'Please upgrade your plan to access this feature'
      };
    }
  }

  // Check permission requirements
  if (protectedRoute.requiredPermissions && protectedRoute.requiredPermissions.length > 0) {
    const memberPermissions = getMemberPermissions(member);
    const hasRequiredPermission = protectedRoute.requiredPermissions.some(permission =>
      memberPermissions.includes(permission)
    );

    if (!hasRequiredPermission) {
      return {
        hasAccess: false,
        reason: 'Insufficient permissions',
        requiredPermissions: protectedRoute.requiredPermissions,
        suggestedAction: 'You do not have permission to access this page'
      };
    }
  }

  return { hasAccess: true };
}

/**
 * Check if member has access to a specific feature
 */
export function hasFeatureAccess(member: Member | null, feature: string): AccessCheckResult {
  const requiredPlans = authConfig.contentGating.features[feature];
  
  if (!requiredPlans) {
    return { hasAccess: false, reason: `Unknown feature: ${feature}` };
  }

  if (!member) {
    return {
      hasAccess: false,
      reason: 'Authentication required',
      requiredPlans,
      suggestedAction: 'Please log in to access this feature'
    };
  }

  const hasAccess = hasPlan(member, requiredPlans);
  
  if (!hasAccess) {
    return {
      hasAccess: false,
      reason: 'Plan upgrade required',
      requiredPlans,
      suggestedAction: 'Please upgrade your plan to access this feature'
    };
  }

  return { hasAccess: true };
}

/**
 * Check if member can access a specific component
 */
export function hasComponentAccess(member: Member | null, componentName: string): AccessCheckResult {
  const rule = authConfig.contentGating.components[componentName];
  
  if (!rule) {
    return { hasAccess: true }; // If no rule, allow access
  }

  // Check authentication
  if (!member) {
    return {
      hasAccess: false,
      reason: 'Authentication required',
      requiredPlans: rule.requiredPlans,
      suggestedAction: 'Please log in to access this feature'
    };
  }

  // Check plan requirements
  if (rule.requiredPlans && rule.requiredPlans.length > 0) {
    const hasRequiredPlan = hasPlan(member, rule.requiredPlans);
    
    if (!hasRequiredPlan) {
      return {
        hasAccess: false,
        reason: 'Plan upgrade required',
        requiredPlans: rule.requiredPlans,
        suggestedAction: 'Please upgrade your plan to access this feature'
      };
    }
  }

  // Check permission requirements
  if (rule.requiredPermissions && rule.requiredPermissions.length > 0) {
    const memberPermissions = getMemberPermissions(member);
    const hasRequiredPermission = rule.requiredPermissions.some(permission =>
      memberPermissions.includes(permission)
    );

    if (!hasRequiredPermission) {
      return {
        hasAccess: false,
        reason: 'Insufficient permissions',
        requiredPermissions: rule.requiredPermissions,
        suggestedAction: 'You do not have permission to access this feature'
      };
    }
  }

  // Check feature requirements
  if (rule.requiredFeatures && rule.requiredFeatures.length > 0) {
    const memberFeatures = getMemberFeatures(member);
    const hasRequiredFeature = rule.requiredFeatures.some(feature =>
      memberFeatures.includes(feature)
    );

    if (!hasRequiredFeature) {
      return {
        hasAccess: false,
        reason: 'Feature not available in your plan',
        suggestedAction: 'Please upgrade your plan to access this feature'
      };
    }
  }

  return { hasAccess: true };
}

// =============================================================================
// PLAN COMPARISON UTILITIES
// =============================================================================

/**
 * Check if member can upgrade to a specific plan
 */
export function canUpgradeToPlan(member: Member | null, targetPlanId: string): boolean {
  if (!member) return true; // Anyone can sign up
  
  const currentPlan = getPrimaryPlan(member);
  const targetPlan = authConfig.plans[targetPlanId];
  
  if (!currentPlan || !targetPlan) return false;
  
  return targetPlan.priority > currentPlan.priority;
}

/**
 * Get recommended plan for accessing a specific feature
 */
export function getRecommendedPlanForFeature(feature: string): PlanConfig | null {
  const requiredPlans = authConfig.contentGating.features[feature];
  
  if (!requiredPlans || requiredPlans.length === 0) return null;
  
  // Return the lowest priority plan that has the feature
  const plans = requiredPlans
    .map(planId => authConfig.plans[planId])
    .filter(Boolean)
    .sort((a, b) => a.priority - b.priority);
    
  return plans[0] || null;
}

/**
 * Get plan comparison data
 */
export function comparePlans(planIds: string[]): Array<{
  plan: PlanConfig;
  features: string[];
  permissions: string[];
  routes: string[];
}> {
  return planIds
    .map(planId => authConfig.plans[planId])
    .filter(Boolean)
    .map(plan => ({
      plan,
      features: plan.features,
      permissions: plan.permissions,
      routes: plan.routes
    }));
}

// =============================================================================
// DEBUGGING UTILITIES
// =============================================================================

/**
 * Get detailed access information for debugging
 */
export function getAccessDebugInfo(member: Member | null, path?: string): {
  member: {
    id?: string;
    email?: string;
    plans: string[];
    permissions: string[];
    features: string[];
  };
  route?: {
    path: string;
    isProtected: boolean;
    requirements: any;
    hasAccess: boolean;
  };
} {
  const memberInfo = {
    id: member?.id,
    email: member?.auth?.email,
    plans: getActivePlanIds(member),
    permissions: getMemberPermissions(member),
    features: getMemberFeatures(member)
  };

  let routeInfo;
  if (path) {
    const accessCheck = hasRouteAccess(member, path);
    const protectedRoute = authConfig.routes.protected.find(route => 
      path.startsWith(route.path) || route.path === path
    );

    routeInfo = {
      path,
      isProtected: !!protectedRoute,
      requirements: protectedRoute,
      hasAccess: accessCheck.hasAccess
    };
  }

  return {
    member: memberInfo,
    ...(routeInfo && { route: routeInfo })
  };
}

/**
 * Log access attempt for debugging
 */
export function logAccessAttempt(
  member: Member | null, 
  resource: string, 
  type: 'route' | 'feature' | 'component',
  result: AccessCheckResult
): void {
  if (!authConfig.settings.enableDebugMode) return;
  
  console.group(`🔐 Access Check: ${resource}`);
  console.log('Type:', type);
  console.log('Member:', member?.auth?.email || 'Anonymous');
  console.log('Result:', result.hasAccess ? '✅ Granted' : '❌ Denied');
  if (!result.hasAccess) {
    console.log('Reason:', result.reason);
    if (result.requiredPlans) console.log('Required Plans:', result.requiredPlans);
    if (result.requiredPermissions) console.log('Required Permissions:', result.requiredPermissions);
  }
  console.groupEnd();
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Wait for a specified delay (useful for smooth UX)
 */
export function delay(ms: number = authConfig.settings.redirectDelay): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format plan name for display
 */
export function formatPlanName(planId: string): string {
  const plan = authConfig.plans[planId];
  return plan?.name || planId;
}

/**
 * Get human-readable access requirements
 */
export function getAccessRequirementsText(
  requiredPlans?: string[],
  requiredPermissions?: string[],
  requiredFeatures?: string[]
): string {
  const requirements: string[] = [];
  
  if (requiredPlans && requiredPlans.length > 0) {
    const planNames = requiredPlans.map(formatPlanName);
    requirements.push(`Plan: ${planNames.join(' or ')}`);
  }
  
  if (requiredPermissions && requiredPermissions.length > 0) {
    requirements.push(`Permissions: ${requiredPermissions.join(', ')}`);
  }
  
  if (requiredFeatures && requiredFeatures.length > 0) {
    requirements.push(`Features: ${requiredFeatures.join(', ')}`);
  }
  
  return requirements.join(' • ');
}

