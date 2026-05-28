'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, ShoppingCart, Bot, BarChart, User, LucideIcon, Package, Network, ClipboardCheck } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  tooltip: string;
};

const producerNavItems: NavItem[] = [
  { href: '/productor', icon: BarChart, label: 'Dashboard', tooltip: 'Dashboard' },
  { href: '/productor/produccion', icon: Leaf, label: 'Mis Producciones', tooltip: 'Producciones' },
  { href: '/productor/mercado', icon: ShoppingCart, label: 'Mercado', tooltip: 'Mercado' },
  { href: '/productor/redes-populares', icon: Network, label: 'Redes Populares', tooltip: 'Redes Populares' },
  { href: '/productor/asistente-ia', icon: Bot, label: 'Asistente IA', tooltip: 'Asistente IA' },
];

const buyerNavItems: NavItem[] = [
  { href: '/comprador', icon: ShoppingCart, label: 'Mercado', tooltip: 'Mercado' },
  { href: '/comprador/compras', icon: Package, label: 'Mis Compras', tooltip: 'Compras' },
];

const networksNavItems: NavItem[] = [
  { href: '/redes-populares', icon: Network, label: 'Panel', tooltip: 'Panel de Redes Populares' },
  { href: '/redes-populares/proceso', icon: ClipboardCheck, label: 'Proceso', tooltip: 'Proceso Redes Populares' },
];

const commonNavItems: NavItem[] = [
    { href: '/perfil', icon: User, label: 'Mi Perfil', tooltip: 'Perfil' },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();
  const isProducer = pathname.startsWith('/productor');
  const isBuyer = pathname.startsWith('/comprador');
  const isNetworks = pathname.startsWith('/redes-populares');
  const prevPathnameRef = useRef(pathname);

  let navItems: NavItem[] = [];
  if (isProducer) {
    navItems = producerNavItems;
  } else if (isBuyer) {
    navItems = buyerNavItems;
  } else if (isNetworks) {
    navItems = networksNavItems;
  }

  const allNavItems = [...navItems, ...commonNavItems];

  // Solo cerrar el sidebar cuando la ruta realmente cambie (no en el primer render)
  useEffect(() => {
    if (isMobile && prevPathnameRef.current !== pathname) {
      const timer = setTimeout(() => {
        setOpenMobile(false);
      }, 150); // Delay más corto pero suficiente para que la navegación se sienta natural
      
      prevPathnameRef.current = pathname;
      return () => clearTimeout(timer);
    }
    prevPathnameRef.current = pathname;
  }, [pathname, isMobile, setOpenMobile]);

  return (
    <SidebarMenu>
      {allNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href || (item.href !== '/productor' && item.href !== '/comprador' && item.href !== '/redes-populares' && pathname.startsWith(item.href))}
            tooltip={{ children: item.tooltip }}
            className={cn("h-14 text-base justify-start")}
          >
            <Link href={item.href}>
              <item.icon className="h-6 w-6" />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
