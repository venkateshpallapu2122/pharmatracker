"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Edit3, KeyRound } from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  // Add form handling for profile updates if needed

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading user profile...</p>
      </div>
    );
  }
  
  const getInitials = (email?: string | null) => {
    if (!email) return "PT";
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center">
        <h2 className="text-3xl font-headline text-primary">User Profile</h2>
        <p className="text-muted-foreground font-body">Manage your account details and preferences.</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader className="items-center text-center">
           <Avatar className="w-32 h-32 mb-4 border-4 border-primary shadow-lg">
            <AvatarImage src={user.photoURL || `https://placehold.co/128x128.png`} alt={user.email || "User"} data-ai-hint="profile person"/>
            <AvatarFallback className="text-4xl bg-primary/10 text-primary">{getInitials(user.email)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl font-headline text-primary">{user.displayName || user.email}</CardTitle>
          <CardDescription className="text-base text-accent-foreground/80">Role: Administrator (Placeholder)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="email" className="font-headline">Email Address</Label>
            <Input id="email" type="email" value={user.email || ""} disabled className="mt-1" />
          </div>
          
          {isEditing ? (
            <>
              <div>
                <Label htmlFor="displayName" className="font-headline">Display Name</Label>
                <Input id="displayName" type="text" defaultValue={user.displayName || ""} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="phoneNumber" className="font-headline">Phone Number</Label>
                <Input id="phoneNumber" type="tel" defaultValue={user.phoneNumber || ""} className="mt-1" />
              </div>
            </>
          ) : (
            <>
               <div>
                <Label className="font-headline">Display Name</Label>
                <p className="text-sm text-foreground mt-1 p-2 border rounded-md bg-muted/30">{user.displayName || "Not set"}</p>
              </div>
               <div>
                <Label className="font-headline">Phone Number</Label>
                <p className="text-sm text-foreground mt-1 p-2 border rounded-md bg-muted/30">{user.phoneNumber || "Not set"}</p>
              </div>
            </>
          )}
          
          <Separator />

          <div className="space-y-3">
            <h3 className="font-headline text-lg text-primary">Security</h3>
            <Button variant="outline" className="w-full justify-start">
              <KeyRound className="mr-2 h-4 w-4" /> Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ShieldCheck className="mr-2 h-4 w-4" /> Two-Factor Authentication (Coming Soon)
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setIsEditing(!isEditing)} className="w-full bg-primary hover:bg-primary/90">
            <Edit3 className="mr-2 h-4 w-4" /> {isEditing ? "Save Changes" : "Edit Profile"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
