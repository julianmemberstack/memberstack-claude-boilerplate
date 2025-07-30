/**
 * Memberstack Authentication Provider
 * 
 * This component provides authentication state management for the entire application.
 * It initializes the Memberstack SDK, manages user authentication state, and provides
 * context for accessing auth-related data throughout the component tree.
 * 
 * Features:
 * - Automatic SDK initialization on component mount
 * - Real-time authentication state tracking
 * - Auth change listeners for live updates
 * - Loading states for better UX
 * - Error boundary for auth failures
 * 
 * Usage:
 * - Wrap your app with this provider in the root layout
 * - Access auth state using the useMemberstack hook
 * - Auth state includes: memberstack SDK, member data, loading status
 */

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getMemberstack } from "../lib/memberstack";
import { AuthErrorBoundary } from "./AuthErrorBoundary";

// Type definitions for better TypeScript support
interface MemberstackContextType {
  memberstack: any; // Memberstack SDK instance
  member: any; // Current authenticated member data
  isLoading: boolean; // Loading state for auth operations
}

// Create the authentication context
const MemberstackContext = createContext<MemberstackContextType | null>(null);

/**
 * Hook to access Memberstack authentication state
 * 
 * @returns {MemberstackContextType} Object containing memberstack SDK, member data, and loading state
 * @throws {Error} If used outside of MemberstackProvider
 */
export const useMemberstack = () => {
  const context = useContext(MemberstackContext);
  if (!context) {
    throw new Error("useMemberstack must be used within MemberstackProvider");
  }
  return context;
};

/**
 * Memberstack Provider Component
 * 
 * Manages authentication state and provides it to child components via React Context.
 * Handles SDK initialization, member state management, and auth change listeners.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to provide auth context to
 * @returns {JSX.Element} Provider component wrapping children with auth context
 */
export function MemberstackProvider({ children }: { children: React.ReactNode }) {
  // State management for authentication
  const [memberstack, setMemberstack] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize Memberstack SDK
    const ms = getMemberstack();
    
    // Handle case where SDK initialization fails (e.g., missing env vars)
    if (!ms) {
      console.warn("Memberstack SDK not initialized. Check your environment variables.");
      setIsLoading(false);
      return;
    }
    
    // Store SDK instance in state
    setMemberstack(ms);

    /**
     * Check current authentication status
     * 
     * Attempts to retrieve the current member data if user is already logged in.
     * This handles cases where user returns to the app with an existing session.
     */
    const checkAuth = async () => {
      try {
        const { data: currentMember } = await ms.getCurrentMember();
        setMember(currentMember);
      } catch (error) {
        // Not an error - user is simply not authenticated
        console.debug("No authenticated user found:", error);
        setMember(null);
      } finally {
        // Always set loading to false after auth check
        setIsLoading(false);
      }
    };

    // Perform initial auth check
    checkAuth();

    /**
     * Set up auth change listener
     * 
     * This listener automatically updates the member state when:
     * - User logs in
     * - User logs out  
     * - User data changes (e.g., plan updates)
     * - Session expires
     */
    const authListener = ms.onAuthChange((newMember: any) => {
      setMember(newMember);
      
      // Optional: Log auth changes for debugging
      if (process.env.NODE_ENV === "development") {
        console.debug("Auth state changed:", newMember ? "User logged in" : "User logged out");
      }
    });

    // Cleanup function to unsubscribe from auth changes
    return () => {
      authListener.unsubscribe();
    };
  }, []); // Empty dependency array - only run once on mount

  // Context value provided to child components
  const contextValue: MemberstackContextType = {
    memberstack,
    member,
    isLoading
  };

  return (
    <AuthErrorBoundary>
      <MemberstackContext.Provider value={contextValue}>
        {children}
      </MemberstackContext.Provider>
    </AuthErrorBoundary>
  );
}