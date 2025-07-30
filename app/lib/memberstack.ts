/**
 * Memberstack SDK Initialization
 * 
 * This module handles the initialization of the Memberstack SDK with proper
 * configuration for client-side authentication. It ensures the SDK is only
 * initialized on the client side and uses environment variables for security.
 * 
 * Configuration:
 * - useCookies: Enables cookie-based session persistence
 * - Public key from environment variables
 * - Singleton pattern to prevent multiple initializations
 */

let memberstackInstance: any = null;

export const getMemberstack = () => {
  // Prevent server-side initialization
  if (typeof window === "undefined") {
    return null;
  }
  
  if (!memberstackInstance) {
    // Get public key from environment variable
    const publicKey = process.env.NEXT_PUBLIC_MEMBERSTACK_KEY;
    
    if (!publicKey) {
      console.error("Memberstack public key not found. Please set NEXT_PUBLIC_MEMBERSTACK_KEY in your environment variables.");
      return null;
    }
    
    // Dynamic import to prevent SSR issues
    const memberstackDOM = require("@memberstack/dom").default;
    
    memberstackInstance = memberstackDOM.init({
      publicKey: publicKey,
      useCookies: true,
      // Optional: Set session duration (default is 7 days)
      sessionDurationDays: 30,
      // Optional: Set cookies on root domain for subdomain sharing
      setCookieOnRootDomain: true,
    });
  }
  
  return memberstackInstance;
};