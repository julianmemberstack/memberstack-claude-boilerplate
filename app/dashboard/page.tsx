/**
 * Dashboard Page - Protected Route
 * 
 * This page demonstrates a gated dashboard using Memberstack authentication.
 * Protected by middleware.ts - only authenticated users with valid plans can access.
 * 
 * Features:
 * - Server-side protection via middleware
 * - Modern dashboard layout with sidebar
 * - User authentication state display
 * - Responsive design
 */

import { DashboardShell } from "./components/DashboardShell";

export default function DashboardPage() {
  return <DashboardShell />;
}

export const metadata = {
  title: "Dashboard | Memberstack Demo",
  description: "Protected dashboard area for authenticated members",
};