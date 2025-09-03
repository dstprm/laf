'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Section } from '../section';

export function HeroContrast() {
  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-secondary/20" />
      <Section className="text-center">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight">A bold starting point</h1>
        <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base text-muted-foreground">
          Swap this hero for a high-contrast look. Keep the structure, replace the copy and actions for your product.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/signup">Get started</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="#pricing">See pricing</Link>
          </Button>
        </div>
      </Section>
    </div>
  );
}
