/**
 * Root Layout Component
 * 
 * This is the root layout for the entire application. It provides:
 * - Global font configuration (Geist Sans & Geist Mono)
 * - Global CSS styles and Tailwind CSS
 * - Authentication provider wrapping all pages
 * - SEO metadata configuration
 * 
 * The MemberstackProvider wraps all children to provide authentication
 * context throughout the application, enabling any component to access
 * user authentication state and Memberstack SDK methods.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MemberstackProvider } from "./components/MemberstackProvider";
import { AuthConfigProvider } from "@/contexts/AuthConfigContext";
import DevAuthDebug from "./components/DevAuthDebug";

// Configure Geist Sans font with CSS variable for global use
const geistSans = Geist({
  variable: "--font-geist-sans", // CSS variable name
  subsets: ["latin"], // Character subsets to include
});

// Configure Geist Mono font for code and monospace text
const geistMono = Geist_Mono({
  variable: "--font-geist-mono", // CSS variable name
  subsets: ["latin"], // Character subsets to include
});

// SEO metadata configuration
export const metadata: Metadata = {
  title: "Memberstack + Claude Code Boilerplate",
  description: "A premium Next.js boilerplate with Memberstack authentication, shadcn/ui components, and plan-based access control. Perfect for SaaS applications and membership sites.",
  keywords: ["memberstack", "claude-code", "authentication", "saas", "boilerplate", "shadcn", "tailwind", "nextjs"],
  authors: [{ name: "Claude Code" }],
  viewport: "width=device-width, initial-scale=1",
};

/**
 * Root Layout Component
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components (pages) to render
 * @returns {JSX.Element} HTML document structure with providers and styling
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* 
          MemberstackProvider wraps the entire application to provide
          authentication context to all components. This enables any
          component to access user state, login/logout functions, and
          plan information through the useMemberstack hook.
        */}
        <MemberstackProvider>
          <AuthConfigProvider>
            {children}
            {/* Development-only auth debugging component */}
            <DevAuthDebug />
          </AuthConfigProvider>
        </MemberstackProvider>
      </body>
    </html>
  );
}
