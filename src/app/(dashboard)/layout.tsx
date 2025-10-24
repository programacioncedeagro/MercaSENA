'use client';

import { useEffect, useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';

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

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc<{ role: string }>(userDocRef);
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  useEffect(() => {
    if (userData) {
      const userRole = userData.role;
      const isProducerPath = pathname.startsWith('/productor');
      const isBuyerPath = pathname.startsWith('/comprador');

      if (userRole === 'producer' && !isProducerPath) {
        router.replace('/productor');
      } else if (userRole === 'buyer' && !isBuyerPath) {
        router.replace('/comprador');
      }
    }
  }, [userData, pathname, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const auth = getAuth();
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
      setIsLoggingOut(false);
    }
  };
  
  const isLoading = isUserLoading || isUserDataLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // or a login page, though the effect should handle redirection
  }

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
