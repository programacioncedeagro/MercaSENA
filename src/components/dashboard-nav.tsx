'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, ShoppingCart, Bot, BarChart, User, LucideIcon } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Logo } from './logo';

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
  { href: '/productor/asistente-ia', icon: Bot, label: 'Asistente IA', tooltip: 'Asistente IA' },
];

const buyerNavItems: NavItem[] = [
  { href: '/comprador', icon: ShoppingCart, label: 'Mercado', tooltip: 'Mercado' },
  { href: '/comprador/compras', icon: Leaf, label: 'Mis Compras', tooltip: 'Compras' },
];

const commonNavItems: NavItem[] = [
    { href: '/perfil', icon: User, label: 'Mi Perfil', tooltip: 'Perfil' },
];

export function DashboardNav() {
  const pathname = usePathname();
  const isProducer = pathname.startsWith('/productor');
  const isBuyer = pathname.startsWith('/comprador');

  let navItems: NavItem[] = [];
  if (isProducer) {
    navItems = producerNavItems;
  } else if (isBuyer) {
    navItems = buyerNavItems;
  }

  const allNavItems = [...navItems, ...commonNavItems];

  return (
    <SidebarMenu>
      {allNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              isActive={pathname === item.href || (item.href !== '/productor' && pathname.startsWith(item.href))}
              tooltip={{ children: item.tooltip }}
              className={cn("h-14 text-base justify-start")}
            >
              <item.icon className="h-6 w-6" />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
