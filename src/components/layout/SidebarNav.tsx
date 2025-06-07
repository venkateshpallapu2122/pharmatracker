"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { PharmaTrackIcon } from "@/components/icons";
import {
  LayoutDashboard,
  Boxes,
  Users,
  ListChecks,
  History,
  LogOut,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/expirations", label: "Expirations", icon: AlertTriangle },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/activity", label: "Activity Log", icon: History },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  const getInitials = (email?: string | null) => {
    if (!email) return "PT";
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-sidebar-border shadow-md">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <PharmaTrackIcon className="w-8 h-8 text-sidebar-primary" />
          <span className="font-headline text-2xl text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            PharmaTrack
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-grow p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  variant="default"
                  className={cn(
                    "w-full justify-start",
                    pathname === item.href
                      ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  tooltip={item.label}
                  isActive={pathname.startsWith(item.href)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border mt-auto">
         {user && (
          <div className="flex items-center gap-3 mb-4 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-10 w-10 border-2 border-sidebar-accent">
              <AvatarImage src={user.photoURL || `https://placehold.co/40x40.png`} alt={user.email || "User"} data-ai-hint="user avatar" />
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">{getInitials(user.email)}</AvatarFallback>
            </Avatar>
            <div className="group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate max-w-[120px]">{user.displayName || user.email}</p>
              <p className="text-xs text-sidebar-foreground/70">Administrator</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:px-2"
        >
          <LogOut className="w-5 h-5 mr-3 group-data-[collapsible=icon]:mr-0" />
          <span className="group-data-[collapsible=icon]:hidden">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
