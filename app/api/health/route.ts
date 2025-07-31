import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Health Check API Endpoint
 * 
 * This endpoint checks the configuration status of the application
 * and provides helpful information for troubleshooting setup issues.
 */
export async function GET() {
  try {
    // Check for .env.local file
    const envPath = path.join(process.cwd(), '.env.local');
    const hasEnvFile = fs.existsSync(envPath);
    
    // Check for environment variables
    const hasPublicKey = !!process.env.NEXT_PUBLIC_MEMBERSTACK_KEY;
    const hasSecretKey = !!process.env.MEMBERSTACK_SECRET_KEY;
    
    // Check if keys are properly formatted (without exposing them)
    const publicKeyValid = hasPublicKey && 
      process.env.NEXT_PUBLIC_MEMBERSTACK_KEY!.startsWith('pk_');
    const secretKeyValid = hasSecretKey && 
      process.env.MEMBERSTACK_SECRET_KEY!.startsWith('sk_');
    
    // Overall health status
    const isHealthy = hasEnvFile && publicKeyValid && secretKeyValid;
    
    // Test Memberstack API connection if we have a secret key
    let apiStatus = 'not_tested';
    let planCount = 0;
    let apiError = null;
    
    if (secretKeyValid) {
      try {
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch('https://api.memberstack.com/v1/plans', {
          headers: {
            'Authorization': `Bearer ${process.env.MEMBERSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          apiStatus = 'connected';
          planCount = data.data?.length || 0;
        } else if (response.status === 401) {
          apiStatus = 'invalid_key';
          apiError = 'Invalid API key';
        } else if (response.status === 403) {
          apiStatus = 'forbidden';
          apiError = 'API key lacks required permissions';
        } else if (response.status === 429) {
          apiStatus = 'rate_limited';
          apiError = 'Too many requests';
        } else {
          apiStatus = `error_${response.status}`;
          apiError = response.statusText;
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          apiStatus = 'timeout';
          apiError = 'Connection timeout';
        } else {
          apiStatus = 'connection_failed';
          apiError = error instanceof Error ? error.message : 'Unknown error';
        }
      }
    }
    
    // Check auth config
    const authConfigPath = path.join(process.cwd(), 'lib', 'auth-config.ts');
    const hasAuthConfig = fs.existsSync(authConfigPath);
    
    // Build response
    const status = {
      hasEnvFile,
      hasPublicKey,
      hasSecretKey,
      publicKeyValid,
      secretKeyValid,
      isHealthy,
      apiStatus,
      apiError,
      planCount,
      hasAuthConfig,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };
    
    // Add helpful messages
    const messages: string[] = [];
    
    if (!hasEnvFile) {
      messages.push('Missing .env.local file. Run "npm run setup" to create it.');
    }
    
    if (!hasPublicKey) {
      messages.push('Missing NEXT_PUBLIC_MEMBERSTACK_KEY in environment variables.');
    } else if (!publicKeyValid) {
      messages.push('Public key should start with "pk_".');
    }
    
    if (!hasSecretKey) {
      messages.push('Missing MEMBERSTACK_SECRET_KEY in environment variables.');
    } else if (!secretKeyValid) {
      messages.push('Secret key should start with "sk_".');
    }
    
    if (apiStatus === 'connection_failed') {
      messages.push('Failed to connect to Memberstack API. Check your internet connection.');
    } else if (apiStatus === 'timeout') {
      messages.push('Connection to Memberstack API timed out. Check your internet connection.');
    } else if (apiStatus === 'invalid_key') {
      messages.push('API key is invalid. Double-check your secret key in Memberstack dashboard.');
    } else if (apiStatus === 'forbidden') {
      messages.push('API key lacks required permissions. Contact Memberstack support.');
    } else if (apiStatus === 'rate_limited') {
      messages.push('API rate limit reached. Wait a few minutes and try again.');
    } else if (apiStatus.startsWith('error_')) {
      messages.push(`Memberstack API returned an error (${apiStatus}). Check your API keys.`);
    }
    
    if (planCount === 0 && apiStatus === 'connected') {
      messages.push('No plans found in your Memberstack account. Create plans at app.memberstack.com.');
    }
    
    if (!hasAuthConfig && isHealthy) {
      messages.push('Auth config not generated. Run "npm run setup:memberstack" to configure plans.');
    }
    
    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      ...status,
      messages,
      setupCommand: !isHealthy ? 'npm run setup' : null,
    }, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: 'Failed to perform health check',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}