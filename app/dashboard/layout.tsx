/**
 * Dashboard Layout
 * 
 * This layout provides the sidebar navigation and main content area
 * for all dashboard pages. It integrates with Memberstack auth state
 * and provides a responsive design.
 */

import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./components/DashboardSidebar";
import { ClientSideProtection } from "./components/ClientSideProtection";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientSideProtection>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DashboardSidebar />
          <main className="flex-1 flex flex-col overflow-hidden">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </ClientSideProtection>
  );
}