"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Palette, Lock, Users, Briefcase, Languages, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // In a real app, load these settings from user preferences or localStorage
    const storedDarkMode = localStorage.getItem('pharma-theme') === 'dark';
    setDarkMode(storedDarkMode);
    if (storedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleThemeToggle = (isDark: boolean) => {
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pharma-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pharma-theme', 'light');
    }
  };
  
  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center">
        <h2 className="text-3xl font-headline text-primary">Settings</h2>
        <p className="text-muted-foreground font-body">Customize your PharmaTrack experience.</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center font-headline"><Palette className="mr-2 h-5 w-5 text-primary"/> Appearance</CardTitle>
          <CardDescription>Adjust how PharmaTrack looks and feels.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/30 transition-colors">
            <Label htmlFor="dark-mode" className="flex items-center gap-2 text-base">
                {darkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                Dark Mode
            </Label>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={handleThemeToggle}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language" className="font-headline">Language</Label>
            <Select defaultValue="en">
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English (United States)</SelectItem>
                <SelectItem value="es" disabled>Español (Próximamente)</SelectItem>
                <SelectItem value="fr" disabled>Français (Próximamente)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center font-headline"><Bell className="mr-2 h-5 w-5 text-primary"/> Notifications</CardTitle>
          <CardDescription>Manage your notification preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/30 transition-colors">
            <Label htmlFor="notifications-enabled" className="text-base">Enable Email Notifications</Label>
            <Switch
              id="notifications-enabled"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-headline">Notify me for:</Label>
            <div className="space-y-2 pl-2">
                <div className="flex items-center gap-2">
                    <Switch id="exp-alerts" defaultChecked/>
                    <Label htmlFor="exp-alerts">Expiration Alerts</Label>
                </div>
                 <div className="flex items-center gap-2">
                    <Switch id="task-updates" defaultChecked/>
                    <Label htmlFor="task-updates">Task Updates & Mentions</Label>
                </div>
                 <div className="flex items-center gap-2">
                    <Switch id="low-stock" />
                    <Label htmlFor="low-stock">Low Stock Warnings</Label>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Placeholder for other settings sections */}
      <Card className="shadow-xl opacity-70 cursor-not-allowed">
        <CardHeader>
          <CardTitle className="flex items-center font-headline"><Lock className="mr-2 h-5 w-5 text-primary"/> Account Security</CardTitle>
          <CardDescription>Manage password and two-factor authentication. (Coming Soon)</CardDescription>
        </CardHeader>
      </Card>
      <Card className="shadow-xl opacity-70 cursor-not-allowed">
        <CardHeader>
          <CardTitle className="flex items-center font-headline"><Briefcase className="mr-2 h-5 w-5 text-primary"/> Organization Settings</CardTitle>
          <CardDescription>Manage pharmacy details, users, and roles. (Admin Only - Coming Soon)</CardDescription>
        </CardHeader>
      </Card>

      <CardFooter className="mt-8">
          <Button className="w-full bg-primary hover:bg-primary/90">Save All Settings</Button>
      </CardFooter>
    </div>
  );
}
