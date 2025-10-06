'use client';

import { BarChart3, FileText, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUserAdmin } from '@/hooks/useUserAdmin';

const baseSidebarItems = [
  {
    title: 'Valuaciones',
    icon: <FileText className="h-6 w-6" />,
    href: '/dashboard/valuations',
  },
  // {
  //   title: 'Subscriptions',
  //   icon: <Album className="h-6 w-6" />,
  //   href: '/dashboard/subscriptions',
  // },
  // {
  //   title: 'Payments',
  //   icon: <CreditCard className="h-6 w-6" />,
  //   href: '/dashboard/payments',
  // },
];

const adminSidebarItems = [
  {
    title: 'Analítica',
    icon: <BarChart3 className="h-6 w-6" />,
    href: '/dashboard/analytics',
  },
  {
    title: 'Panel de Admin',
    icon: <Shield className="h-6 w-6" />,
    href: '/dashboard/admin',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useUserAdmin();

  // Build sidebar items based on admin status
  const sidebarItems = [...baseSidebarItems];
  if (isAdmin) {
    sidebarItems.push(...adminSidebarItems);
  }

  return (
    <nav className="flex flex-col grow justify-between items-start px-2 text-sm font-medium lg:px-4">
      <div className={'w-full'}>
        {sidebarItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={cn('flex items-center text-base gap-3 px-4 py-3 rounded-xxs dashboard-sidebar-items', {
              'dashboard-sidebar-items-active':
                item.href === '/dashboard' ? pathname === item.href : pathname.includes(item.href),
            })}
          >
            {item.icon}
            {item.title}
          </Link>
        ))}
      </div>
    </nav>
  );
}
