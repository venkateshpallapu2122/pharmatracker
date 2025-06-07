
"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, updateProfile as updateAuthProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter, usePathname } from 'next/navigation';
import { BarChart, User as UserIcon } from 'lucide-react'; // Placeholder icon

export interface User extends FirebaseUser {
  role?: 'admin' | 'user';
  // photoURL is already part of FirebaseUser
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUserInContext: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, refreshUserInContext: async () => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUserRoleAndSetUser = useCallback(async (currentUser: FirebaseUser) => {
    if (!currentUser) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      let userRole: 'admin' | 'user' = 'user'; // Default role

      if (userDocSnap.exists()) {
        userRole = userDocSnap.data()?.role || 'user';
      } else {
        // User exists in Auth, but not in 'users' collection. Create doc.
        // This might happen for users created before this logic was in place,
        // or if Firestore creation failed during signup.
        await setDoc(userDocRef, {
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || "User",
          role: 'user', // New users default to 'user'
          createdAt: serverTimestamp(),
          photoURL: currentUser.photoURL // Persist initial photoURL if any
        });
        // For admins, you'd typically update their role manually in Firestore.
      }
      const userWithRole: User = { ...currentUser, role: userRole };
      setUser(userWithRole);
    } catch (error) {
      console.error("Error fetching user role:", error);
      // Fallback to current user without role or default role
      const userWithDefaultRole: User = { ...currentUser, role: 'user' };
      setUser(userWithDefaultRole);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        fetchUserRoleAndSetUser(currentUser);
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [fetchUserRoleAndSetUser]);

  const refreshUserInContext = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Create a new user object to ensure React detects a change
      // This will re-fetch from auth, then fetchUserRoleAndSetUser will handle Firestore
      await currentUser.reload(); // Make sure to get the latest from Firebase Auth
      const refreshedUser = auth.currentUser; // Get the reloaded user
      if (refreshedUser) {
         // We need to make a new object for React to detect state change
        await fetchUserRoleAndSetUser({ ...refreshedUser } as FirebaseUser);
      }
    }
  }, [fetchUserRoleAndSetUser]);


  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/signup';
    const isHomePage = pathname === '/';

    if (!user && !isAuthPage && !isHomePage) {
      router.push('/login');
    } else if (user && isAuthPage) {
      router.push('/dashboard');
    }
  }, [user, loading, router, pathname]);

  if (loading && !['/', '/login', '/signup'].includes(pathname)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <UserIcon className="w-16 h-16 mb-4 animate-pulse text-primary" /> 
        <p className="text-xl font-headline text-foreground">Loading PharmaTrack User...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, refreshUserInContext }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
