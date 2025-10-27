'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { User as UserType } from '@/lib/types';


import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { DashboardNav } from '@/components/dashboard-nav';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const firestore = useFirestore();

  const [userData, setUserData] = useState<UserType | null>(null);
  const [isUserDataLoading, setIsUserDataLoading] = useState(true);
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Effect 1: Redirect unauthenticated users to login
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  // Effect 2: Fetch user data from Firestore
  useEffect(() => {
    if (user && firestore) {
      const fetchUserData = async () => {
        setIsUserDataLoading(true);
        const userDocRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserType);
        } else {
          // Handle case where user exists in Auth but not in Firestore
          console.error("User document not found in Firestore!");
          setUserData(null);
        }
        setIsUserDataLoading(false);
      };
      fetchUserData();
    } else if (!isUserLoading && !user) {
        // If user is not logged in, no need to fetch data
        setIsUserDataLoading(false);
    }
  }, [user, firestore, isUserLoading]);

  // Effect 3: Redirect authenticated users based on their role
  useEffect(() => {
    if (user && userData) {
      const userRole = userData.role;
      const isAuthPage = pathname === '/login' || pathname === '/signup';
      const isProducerPath = pathname.startsWith('/productor');
      const isBuyerPath = pathname.startsWith('/comprador');

      // If user is on an auth page but is already logged in, redirect them
      if (isAuthPage) {
        if (userRole === 'producer') {
          router.replace('/productor');
        } else if (userRole === 'buyer') {
          router.replace('/comprador');
        }
        return;
      }

      // If user is on the wrong dashboard, redirect them
      if (userRole === 'producer' && !isProducerPath) {
        router.replace('/productor');
      } else if (userRole === 'buyer' && !isBuyerPath) {
        router.replace('/comprador');
      }
    }
  }, [user, userData, pathname, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const auth = getAuth();
      await signOut(auth);
      // Redirect to home after logout
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
      setIsLoggingOut(false);
    }
  };
  
  const isLoading = isUserLoading || isUserDataLoading;

  // This prevents flashing the dashboard layout for users who are not logged in
  if (!user && !isUserLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
            {/* You could show a loader here, but redirect should be fast */}
        </div>
      );
  }
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // If we reach here, user is authenticated and we have their role data.
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Logo className="w-32 h-auto" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <DashboardNav />
        </SidebarContent>
        <SidebarFooter>
            <Button variant="ghost" className="w-full justify-start gap-2 h-14 text-base" onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? <Loader2 className="w-6 h-6 animate-spin" /> : <LogOut className="w-6 h-6" />}
              <span>{isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}</span>
            </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 bg-card md:bg-transparent border-b md:border-b-0">
          <SidebarTrigger />
          {/* Add User menu or other header content here */}
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
