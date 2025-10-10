'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
  }
}

export function GtmPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined') return;
    const pagePath = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'pageview',
      page_path: pagePath,
    });
  }, [pathname, searchParams]);

  return null;
}
