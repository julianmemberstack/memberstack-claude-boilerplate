/**
 * Memberstack Plans API Route
 * 
 * This API endpoint allows Claude Code to analyze your Memberstack plans
 * and provide configuration suggestions. It's designed for development
 * and setup purposes.
 * 
 * GET /api/memberstack/plans - Fetch all plans and configuration suggestions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberstackApiClient, generateAuthConfigFromPlans, validateMemberstackConfig } from '@/lib/memberstack-api';

export async function GET(request: NextRequest) {
  try {
    // Validate configuration first
    const validation = validateMemberstackConfig();
    
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid Memberstack configuration',
        details: validation.errors,
        help: {
          message: 'Please check your environment variables',
          requiredVars: [
            'NEXT_PUBLIC_MEMBERSTACK_KEY - Your public key for client-side SDK',
            'MEMBERSTACK_SECRET_KEY - Your secret key for API access'
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

    // Fetch plans and generate suggestions
    const { plans, suggestions } = await generateAuthConfigFromPlans();

    // Analyze the plan structure
    const analysis = {
      totalPlans: plans.length,
      activePlans: plans.filter(p => p.isActive).length,
      inactivePlans: plans.filter(p => !p.isActive).length,
      freeePlans: plans.filter(p => !p.price || p.price.amount === 0).length,
      paidPlans: plans.filter(p => p.price && p.price.amount > 0).length,
      priceRange: {
        min: Math.min(...plans.filter(p => p.price).map(p => p.price!.amount)),
        max: Math.max(...plans.filter(p => p.price).map(p => p.price!.amount)),
      },
      currencies: [...new Set(plans.filter(p => p.price).map(p => p.price!.currency))],
      intervals: [...new Set(plans.filter(p => p.price).map(p => p.price!.interval))],
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
          warnings: validation.warnings,
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
        message: 'Invalid Memberstack secret key or insufficient permissions',
        help: {
          checkKey: 'Verify your MEMBERSTACK_SECRET_KEY in .env.local',
          getNewKey: 'https://app.memberstack.com/dashboard/app/[your-app]/keys',
          permissions: 'Ensure your API key has read permissions for plans'
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