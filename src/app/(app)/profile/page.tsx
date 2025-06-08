
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Edit3, KeyRound, Save, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { updateProfile as updateAuthProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

export default function ProfilePage() {
  const { user, refreshUserInContext } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  // Removed phoneNumber state as it was not being saved
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading user profile...</p>
      </div>
    );
  }
  
  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      if (parts[0] && parts[0].length >= 2) {
        return parts[0].substring(0, 2).toUpperCase();
      }
      if (parts[0] && parts[0].length === 1) {
        return parts[0][0].toUpperCase();
      }
    }
    if (email) {
      const emailPrefix = email.split('@')[0];
      return emailPrefix.substring(0, 2).toUpperCase();
    }
    return "PT";
  };
  
  const generatePhotoUrlFromInitials = (nameValue: string, emailValue?: string | null): string => {
    const initials = getInitials(nameValue, emailValue);
    return `https://placehold.co/128x128.png?text=${initials}`;
  };

  const handleSaveChanges = async () => {
    if (!auth.currentUser || !user) return;
    
    const currentDisplayName = user.displayName || "";
    
    if (displayName.trim() === currentDisplayName) {
        toast({ title: "No Changes Detected", description: "Your display name is the same."});
        setIsEditing(false);
        return;
    }
    if (!displayName.trim()) {
        toast({ title: "Display Name Required", description: "Display name cannot be empty.", variant: "destructive"});
        return;
    }

    setIsSaving(true);
    try {
      const newPhotoURL = generatePhotoUrlFromInitials(displayName.trim(), user.email);

      await updateAuthProfile(auth.currentUser, { 
        displayName: displayName.trim(),
        photoURL: newPhotoURL,
      });
      
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, { 
        displayName: displayName.trim(),
        photoURL: newPhotoURL,
      });

      await refreshUserInContext();
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
      setIsEditing(false);
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message || "Could not save profile changes.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };


  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center">
        <h2 className="text-3xl font-headline text-primary">User Profile</h2>
        <p className="text-muted-foreground font-body">Manage your account details and preferences.</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader className="items-center text-center">
           <div className="relative group">
            <Avatar className="w-32 h-32 mb-4 border-4 border-primary shadow-lg">
              <AvatarImage src={user.photoURL || `https://placehold.co/128x128.png`} alt={user.displayName || user.email || "User"} data-ai-hint="profile person"/>
              <AvatarFallback className="text-4xl bg-primary/10 text-primary">{getInitials(user.displayName, user.email)}</AvatarFallback>
            </Avatar>
           </div>
           
          <CardTitle className="text-2xl font-headline text-primary">{user.displayName || user.email}</CardTitle>
          <CardDescription className="text-base text-accent-foreground/80">Role: {user.role || 'User'}</CardDescription>
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
                <Input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1" disabled={isSaving}/>
              </div>
            </>
          ) : (
            <>
               <div>
                <Label className="font-headline">Display Name</Label>
                <p className="text-sm text-foreground mt-1 p-2 border rounded-md bg-muted/30 h-10 flex items-center">{user.displayName || "Not set"}</p>
              </div>
            </>
          )}
          
          <Separator />

          <div className="space-y-3">
            <h3 className="font-headline text-lg text-primary">Security</h3>
            <Button variant="outline" className="w-full justify-start" disabled>
              <KeyRound className="mr-2 h-4 w-4" /> Change Password (Coming Soon)
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <ShieldCheck className="mr-2 h-4 w-4" /> Two-Factor Authentication (Coming Soon)
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          {isEditing ? (
            <div className="flex w-full gap-2">
              <Button onClick={() => {setIsEditing(false); setDisplayName(user.displayName || "");}} variant="outline" className="flex-1" disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSaveChanges} className="flex-1 bg-primary hover:bg-primary/90" disabled={isSaving}>
               {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />} Save Changes
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="w-full bg-primary hover:bg-primary/90">
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
