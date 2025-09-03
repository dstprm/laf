'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function ActiveLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={'text-sm block px-2 py-1 rounded hover:bg-muted ' + (isActive ? 'font-medium text-primary' : '')}
    >
      {children}
    </Link>
  );
}
