
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Edit3, KeyRound, Upload, Save, Loader2, Camera } from "lucide-react";
import { useState, useRef, type ChangeEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { storage, auth, db } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

export default function ProfilePage() {
  const { user, refreshUserInContext } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading user profile...</p>
      </div>
    );
  }
  
  const getInitials = (email?: string | null, name?: string | null) => {
    if (name) {
      const parts = name.split(" ");
      if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return name.substring(0, 2).toUpperCase();
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return "PT";
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile || !auth.currentUser) {
      toast({ title: "No file selected", description: "Please select an image to upload.", variant: "destructive" });
      return;
    }
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `profile_images/${auth.currentUser.uid}/${selectedFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => { /* Optional: handle progress */ },
        (error) => {
          console.error("Upload failed:", error);
          toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await updateAuthProfile(auth.currentUser!, { photoURL: downloadURL });
          
          // Update photoURL in Firestore user document
          const userDocRef = doc(db, "users", auth.currentUser!.uid);
          await updateDoc(userDocRef, { photoURL: downloadURL });

          await refreshUserInContext(); // Refresh user in context
          toast({ title: "Profile Photo Updated", description: "Your new photo has been saved." });
          setSelectedFile(null);
          setPreviewUrl(null);
          setIsUploading(false);
        }
      );
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast({ title: "Error", description: "Could not update profile photo.", variant: "destructive" });
      setIsUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!auth.currentUser) return;
    setIsEditing(true); // Keep using isEditing for general loading state for text fields
    try {
      await updateAuthProfile(auth.currentUser, { 
        displayName: displayName !== user.displayName ? displayName : undefined,
        // photoURL handling is separate
      });
      // Update Firestore user document
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, { 
        displayName: displayName,
        // phoneNumber: phoneNumber, // If you store phone number in Firestore
      });

      await refreshUserInContext();
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
      setIsEditing(false);
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
      setIsEditing(false); // Or keep isEditing true to allow retry?
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
              <AvatarImage src={previewUrl || user.photoURL || `https://placehold.co/128x128.png`} alt={user.displayName || user.email || "User"} data-ai-hint="profile person"/>
              <AvatarFallback className="text-4xl bg-primary/10 text-primary">{getInitials(user.email, user.displayName)}</AvatarFallback>
            </Avatar>
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute bottom-4 right-0 rounded-full bg-background group-hover:opacity-100 opacity-70 transition-opacity"
              onClick={() => fileInputRef.current?.click()}
              title="Change profile photo"
            >
              <Camera className="h-5 w-5"/>
            </Button>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
           </div>
           
          {selectedFile && (
            <div className="flex flex-col items-center gap-2 my-2">
              <p className="text-sm text-muted-foreground">New photo selected: {selectedFile.name}</p>
              <Button onClick={handleUploadPhoto} disabled={isUploading} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4" />}
                Save Photo
              </Button>
            </div>
          )}

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
                <Input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1" />
              </div>
              {/* <div>
                <Label htmlFor="phoneNumber" className="font-headline">Phone Number</Label>
                <Input id="phoneNumber" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="mt-1" />
              </div> */}
            </>
          ) : (
            <>
               <div>
                <Label className="font-headline">Display Name</Label>
                <p className="text-sm text-foreground mt-1 p-2 border rounded-md bg-muted/30 h-10 flex items-center">{displayName || "Not set"}</p>
              </div>
               {/* <div>
                <Label className="font-headline">Phone Number</Label>
                <p className="text-sm text-foreground mt-1 p-2 border rounded-md bg-muted/30 h-10 flex items-center">{phoneNumber || "Not set"}</p>
              </div> */}
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
            <Button onClick={handleSaveChanges} className="w-full bg-primary hover:bg-primary/90" disabled={isUploading}>
               {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />} Save Changes
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="w-full bg-primary hover:bg-primary/90" disabled={isUploading}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
