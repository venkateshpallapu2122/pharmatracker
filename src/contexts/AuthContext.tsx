
"use client";

import type { User as FirebaseUser } from 'firebase/auth'; // Renamed to avoid conflict
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { BarChart } from 'lucide-react'; // Placeholder icon

// Define a new User type that includes the role
export interface User extends FirebaseUser {
  role?: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Simulate fetching role. For now, all logged-in users are admins.
        const userWithRole: User = { ...currentUser, role: 'admin' };
        setUser(userWithRole);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
        <BarChart className="w-16 h-16 mb-4 animate-pulse text-primary" /> 
        <p className="text-xl font-headline text-foreground">Loading PharmaTrack...</p>
      </div>
    );
  }


  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

