
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters." }).optional(),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

export function SignupForm() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Update Firebase Auth profile
      if (values.displayName) {
        await updateProfile(user, { displayName: values.displayName });
      }

      // Create user document in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: values.displayName || user.email?.split('@')[0] || "User",
        role: 'user', // Default role for new sign-ups
        createdAt: serverTimestamp(),
        photoURL: user.photoURL, // Save initial photoURL (likely null)
      });

      toast({
        title: "Account Created",
        description: "Welcome! You can now log in.",
      });
      router.push("/login"); 
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-primary">Create an Account</CardTitle>
        <CardDescription>Join PharmaTrack to manage your pharmaceutical needs.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name (Optional)</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading} suppressHydrationWarning>
               {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
