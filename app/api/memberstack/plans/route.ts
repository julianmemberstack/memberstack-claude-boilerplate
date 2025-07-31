/**
 * Memberstack Plans API Route
 * 
 * This API endpoint allows Claude Code to analyze your Memberstack plans
 * and provide configuration suggestions. It's designed for development
 * and setup purposes.
 * 
 * Uses the DOM package with public key only - no secret key required.
 * 
 * GET /api/memberstack/plans - Fetch all plans and configuration suggestions
 */

import { NextRequest, NextResponse } from 'next/server';
import { setupDOMEnvironment } from '@/scripts/dom-polyfill';

// Memberstack DOM client for server-side use
class MemberstackDOMClient {
  private publicKey: string;
  private memberstack: any = null;

  constructor(publicKey: string) {
    this.publicKey = publicKey;
  }

  async init() {
    if (!this.memberstack) {
      // Set up DOM environment for Node.js
      setupDOMEnvironment();
      
      const memberstackModule = await import('@memberstack/dom');
      const memberstackDOM = memberstackModule.default;
      this.memberstack = memberstackDOM.init({ publicKey: this.publicKey });
    }
    return this.memberstack;
  }

  async getPlans() {
    const ms = await this.init();
    const response = await ms.getPlans();
    return response.data || [];
  }

  async getApp() {
    const ms = await this.init();
    const response = await ms.getApp();
    return response.data;
  }
}

// Configuration generator (adapted from setup script)
function generateAuthConfigSuggestions(plans: any[]) {
  const activePlans = plans.filter(plan => plan.status === 'active');
  
  // Sort plans by price (free first, then ascending)  
  const sortedPlans = activePlans.sort((a, b) => {
    const priceA = a.prices?.[0]?.amount ? parseFloat(a.prices[0].amount) : 0;
    const priceB = b.prices?.[0]?.amount ? parseFloat(b.prices[0].amount) : 0;
    return priceA - priceB;
  });

  return sortedPlans.map((plan, index) => {
    const priority = index + 1;
    const price = plan.prices?.[0]?.amount ? parseFloat(plan.prices[0].amount) : 0;
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
      prices: plan.prices,
      reasoning: `Suggested as ${priority === 1 ? 'basic' : priority === 2 ? 'premium' : 'enterprise'} tier based on ${price === 0 ? 'free' : '$' + price} pricing.`
    };
  });
}

export async function GET(request: NextRequest) {
  try {
    // Validate public key only
    const publicKey = process.env.NEXT_PUBLIC_MEMBERSTACK_KEY;
    
    if (!publicKey) {
      return NextResponse.json({
        success: false,
        error: 'Invalid Memberstack configuration',
        details: ['NEXT_PUBLIC_MEMBERSTACK_KEY is required'],
        help: {
          message: 'Please add your Memberstack public key to .env.local',
          requiredVars: [
            'NEXT_PUBLIC_MEMBERSTACK_KEY - Your public key for DOM SDK'
          ],
          getKeys: 'https://app.memberstack.com/dashboard/app/[your-app]/keys'
        }
      }, { status: 400 });
    }

    // Check if this is a development environment
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        success: false,
        error: 'This endpoint is only available in development mode',
        message: 'For security reasons, plan analysis is disabled in production'
      }, { status: 403 });
    }

    // Fetch plans using DOM package
    const client = new MemberstackDOMClient(publicKey);
    const plans = await client.getPlans();
    const suggestions = generateAuthConfigSuggestions(plans);

    // Analyze the plan structure (adapted for DOM package format)
    const activePlans = plans.filter((p: any) => p.status === 'active');
    const inactivePlans = plans.filter((p: any) => p.status !== 'active');
    const plansWithPrices = plans.filter((p: any) => p.prices && p.prices.length > 0);
    const freePlans = plans.filter((p: any) => !p.prices || p.prices.length === 0 || p.prices.some((price: any) => parseFloat(price.amount) === 0));
    const paidPlans = plans.filter((p: any) => p.prices && p.prices.some((price: any) => parseFloat(price.amount) > 0));
    
    const analysis = {
      totalPlans: plans.length,
      activePlans: activePlans.length,
      inactivePlans: inactivePlans.length,
      freePlans: freePlans.length,
      paidPlans: paidPlans.length,
      priceRange: plansWithPrices.length > 0 ? {
        min: Math.min(...plansWithPrices.flatMap((p: any) => p.prices.map((price: any) => parseFloat(price.amount)))),
        max: Math.max(...plansWithPrices.flatMap((p: any) => p.prices.map((price: any) => parseFloat(price.amount)))),
      } : { min: 0, max: 0 },
      currencies: [...new Set(plansWithPrices.flatMap((p: any) => p.prices.map((price: any) => price.currency)))],
      intervals: [...new Set(plansWithPrices.flatMap((p: any) => p.prices.map((price: any) => price.interval?.type || 'once')))],
    };

    // Generate setup recommendations
    const setupRecommendations = generateSetupRecommendations(plans, suggestions);

    return NextResponse.json({
      success: true,
      data: {
        plans,
        suggestions,
        analysis,
        setupRecommendations,
        validation: {
          warnings: [],
          configStatus: 'valid'
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        apiVersion: '1.0.0',
        generatedBy: 'Claude Code Memberstack Integration'
      }
    });

  } catch (error: any) {
    console.error('Memberstack plans API error:', error);

    // Handle specific error types
    if (error.message.includes('401') || error.message.includes('403')) {
      return NextResponse.json({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid Memberstack public key or insufficient permissions',
        help: {
          checkKey: 'Verify your NEXT_PUBLIC_MEMBERSTACK_KEY in .env.local',
          getNewKey: 'https://app.memberstack.com/dashboard/app/[your-app]/keys',
          permissions: 'Ensure your public key is valid and active'
        }
      }, { status: 401 });
    }

    if (error.message.includes('network') || error.message.includes('fetch')) {
      return NextResponse.json({
        success: false,
        error: 'Network error',
        message: 'Failed to connect to Memberstack API',
        help: {
          checkConnection: 'Verify your internet connection',
          checkStatus: 'Check Memberstack API status at https://status.memberstack.com',
          retry: 'Try again in a few moments'
        }
      }, { status: 503 });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      help: {
        contact: 'If this persists, check the server logs or contact support'
      }
    }, { status: 500 });
  }
}

/**
 * Generate setup recommendations based on plan analysis
 */
function generateSetupRecommendations(plans: any[], suggestions: any[]) {
  const recommendations = [];

  // Check for common setup issues
  if (plans.length === 0) {
    recommendations.push({
      type: 'error',
      title: 'No plans found',
      message: 'Create at least one plan in your Memberstack dashboard',
      action: 'Go to Memberstack dashboard and create your first plan',
      priority: 'high'
    });
  }

  if (suggestions.length === 0) {
    recommendations.push({
      type: 'warning',
      title: 'No active plans',
      message: 'All your plans are inactive - activate at least one plan',
      action: 'Enable plans in your Memberstack dashboard',
      priority: 'high'
    });
  }

  // Check for pricing structure
  const freePlans = plans.filter(p => !p.price || p.price.amount === 0);
  const paidPlans = plans.filter(p => p.price && p.price.amount > 0);

  if (freePlans.length === 0 && paidPlans.length > 0) {
    recommendations.push({
      type: 'suggestion',
      title: 'Consider adding a free tier',
      message: 'A free plan can help with user acquisition and conversion',
      action: 'Create a free plan with basic features',
      priority: 'medium'
    });
  }

  if (paidPlans.length === 1 && freePlans.length >= 1) {
    recommendations.push({
      type: 'suggestion',
      title: 'Consider multiple paid tiers',
      message: 'Multiple pricing tiers can increase revenue per user',
      action: 'Add a premium or enterprise tier',
      priority: 'low'
    });
  }

  // Check for plan naming conventions
  const planNames = plans.map(p => p.name.toLowerCase());
  const hasGoodNaming = planNames.some(name => 
    name.includes('free') || name.includes('basic') || 
    name.includes('premium') || name.includes('pro') ||
    name.includes('enterprise') || name.includes('business')
  );

  if (!hasGoodNaming) {
    recommendations.push({
      type: 'suggestion', 
      title: 'Improve plan naming',
      message: 'Clear tier names (Free, Premium, Enterprise) help users understand value',
      action: 'Rename plans to indicate their tier level',
      priority: 'medium'
    });
  }

  // Success messages
  if (suggestions.length >= 2) {
    recommendations.push({
      type: 'success',
      title: 'Good plan structure',
      message: `Found ${suggestions.length} active plans with clear pricing tiers`,
      action: 'Run npm run setup:memberstack to generate configuration',
      priority: 'info'
    });
  }

  return recommendations;
}