/**
 * Authentication Configuration Context
 * 
 * Provides centralized access to auth configuration and utilities
 * throughout the React component tree.
 */

"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { 
  authConfig,
  type AuthConfig,
  type PlanConfig,
  type AuthRoute
} from '@/lib/auth-config';
import {
  hasRouteAccess,
  hasFeatureAccess,
  hasComponentAccess,
  hasPlan,
  getActivePlans,
  getMemberFeatures,
  getMemberPermissions,
  getPrimaryPlan,
  canUpgradeToPlan,
  getRecommendedPlanForFeature,
  getAccessDebugInfo,
  logAccessAttempt,
  formatPlanName,
  getAccessRequirementsText,
  type Member,
  type AccessCheckResult
} from '@/lib/auth-utils';

// =============================================================================
// CONTEXT TYPES
// =============================================================================

interface AuthConfigContextType {
  // Configuration
  config: AuthConfig;
  
  // Route utilities
  hasRouteAccess: (member: Member | null, path: string) => AccessCheckResult;
  isProtectedRoute: (path: string) => boolean;
  isPublicRoute: (path: string) => boolean;
  
  // Feature utilities
  hasFeatureAccess: (member: Member | null, feature: string) => AccessCheckResult;
  hasComponentAccess: (member: Member | null, componentName: string) => AccessCheckResult;
  
  // Plan utilities
  hasPlan: (member: Member | null, planIds: string | string[]) => boolean;
  getActivePlans: (member: Member | null) => PlanConfig[];
  getPrimaryPlan: (member: Member | null) => PlanConfig | null;
  canUpgradeToPlan: (member: Member | null, targetPlanId: string) => boolean;
  getRecommendedPlanForFeature: (feature: string) => PlanConfig | null;
  
  // Member utilities
  getMemberFeatures: (member: Member | null) => string[];
  getMemberPermissions: (member: Member | null) => string[];
  
  // Debug utilities
  getAccessDebugInfo: (member: Member | null, path?: string) => any;
  logAccessAttempt: (member: Member | null, resource: string, type: 'route' | 'feature' | 'component', result: AccessCheckResult) => void;
  
  // Display utilities
  formatPlanName: (planId: string) => string;
  getAccessRequirementsText: (requiredPlans?: string[], requiredPermissions?: string[], requiredFeatures?: string[]) => string;
}

// =============================================================================
// CONTEXT CREATION
// =============================================================================

const AuthConfigContext = createContext<AuthConfigContextType | undefined>(undefined);

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

interface AuthConfigProviderProps {
  children: ReactNode;
}

export function AuthConfigProvider({ children }: AuthConfigProviderProps) {
  const contextValue: AuthConfigContextType = {
    // Configuration
    config: authConfig,
    
    // Route utilities
    hasRouteAccess,
    isProtectedRoute: (path: string) => {
      return authConfig.routes.protected.some(route => 
        path.startsWith(route.path) || route.path === path
      );
    },
    isPublicRoute: (path: string) => {
      return authConfig.routes.public.some(route => 
        path.startsWith(route) || route === path
      );
    },
    
    // Feature utilities
    hasFeatureAccess,
    hasComponentAccess,
    
    // Plan utilities
    hasPlan,
    getActivePlans,
    getPrimaryPlan,
    canUpgradeToPlan,
    getRecommendedPlanForFeature,
    
    // Member utilities
    getMemberFeatures,
    getMemberPermissions,
    
    // Debug utilities
    getAccessDebugInfo,
    logAccessAttempt,
    
    // Display utilities
    formatPlanName,
    getAccessRequirementsText
  };

  return (
    <AuthConfigContext.Provider value={contextValue}>
      {children}
    </AuthConfigContext.Provider>
  );
}

// =============================================================================
// CONTEXT HOOK
// =============================================================================

export function useAuthConfig() {
  const context = useContext(AuthConfigContext);
  
  if (context === undefined) {
    throw new Error('useAuthConfig must be used within an AuthConfigProvider');
  }
  
  return context;
}