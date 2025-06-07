"use client";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [pageTitle, setPageTitle] = useState("Dashboard");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    const routeToTitle: { [key: string]: string } = {
      "/dashboard": "Dashboard",
      "/inventory": "Inventory Management",
      "/expirations": "Expiration Tracker",
      "/employees": "Employee Profiles",
      "/tasks": "Task Management",
      "/activity": "Activity Log",
      "/profile": "User Profile",
      "/settings": "Settings",
    };
    // Match base path for dynamic routes if any
    const baseRoute = "/" + (pathname.split('/')[1] || "");
    setPageTitle(routeToTitle[pathname] || routeToTitle[baseRoute] || "PharmaTrack");
  }, [pathname]);

  if (loading) {
     // This loading state is handled by AuthProvider for non-auth pages.
     // If user is null and not loading, AuthProvider redirects.
     // So this specific loader might not be hit often for authenticated routes.
    return null; 
  }

  if (!user) {
    // AuthProvider should handle redirect, but as a fallback:
    return null; // Or a specific "redirecting..." message
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <SidebarNav />
        <div className="flex flex-1 flex-col transition-all duration-300 ease-in-out">
          <Header pageTitle={pageTitle} />
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
