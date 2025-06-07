
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search, Bell, Settings, LogOut, UserCircle, MessageSquareWarning, PackageCheck, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PharmaTrackIcon } from "../icons";
import { Badge } from "@/components/ui/badge";

export function Header({ pageTitle }: { pageTitle: string }) {
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

  const mockNotifications = [
    { id: "1", title: "Low Stock: Ibuprofen", description: "Only 20 units left.", icon: MessageSquareWarning, time: "5m ago", read: false },
    { id: "2", title: "Task Assigned: Audit", description: "Monthly audit task created.", icon: PackageCheck, time: "1h ago", read: false },
    { id: "3", title: "Expiry Alert: Amoxicillin", description: "Expires in 3 days.", icon: AlertCircle, time: "3h ago", read: true },
  ];


  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b bg-card px-4 md:px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
            <SidebarTrigger />
        </div>
        <h1 className="text-2xl font-headline text-primary">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <form className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products, tasks..."
            className="pl-10 pr-4 py-2 w-64 lg:w-96 rounded-lg bg-background border-border focus:ring-primary focus:border-primary"
            suppressHydrationWarning
          />
        </form>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full text-foreground/70 hover:text-primary relative">
              <Bell className="h-5 w-5" />
              {mockNotifications.some(n => !n.read) && (
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
                </span>
              )}
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {mockNotifications.length > 0 ? mockNotifications.map(notif => (
                <DropdownMenuItem key={notif.id} className={`flex items-start gap-3 p-3 ${!notif.read ? 'bg-accent/30' : ''}`}>
                  <notif.icon className={`h-5 w-5 mt-0.5 ${notif.read ? 'text-muted-foreground' : 'text-primary'}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${notif.read ? 'text-muted-foreground' : 'text-foreground'}`}>{notif.title}</p>
                    <p className={`text-xs ${notif.read ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>{notif.description}</p>
                    <p className="text-xs text-muted-foreground/50 mt-1">{notif.time}</p>
                  </div>
                  {!notif.read && <div className="h-2 w-2 rounded-full bg-primary mt-1"></div>}
                </DropdownMenuItem>
              )) : (
                <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
              )}
            </DropdownMenuGroup>
             <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-sm text-primary hover:underline">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" suppressHydrationWarning>
                <Avatar className="h-9 w-9 border-2 border-primary">
                  <AvatarImage src={user.photoURL || `https://placehold.co/40x40.png`} alt={user.email || "User"} data-ai-hint="user avatar" />
                  <AvatarFallback className="bg-primary/20 text-primary">{getInitials(user.email)}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none font-headline">{user.displayName || user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground font-body">
                    {user.email} ({user.role || 'user'})
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center"> 
                  <UserCircle className="mr-2 h-4 w-4" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-500/10 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

