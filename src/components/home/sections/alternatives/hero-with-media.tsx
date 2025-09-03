'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Section } from '../section';

export function HeroWithMedia() {
  return (
    <Section className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
      <div className="text-center md:text-left">
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">Tell your story with visuals</h1>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground">
          Pair a strong headline with a product screenshot or illustration. Replace the image below.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3 md:justify-start">
          <Button asChild>
            <Link href="/signup">Start free</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="#features">Learn more</Link>
          </Button>
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-xl border border-border bg-background/50 p-2">
        <div className="relative aspect-[16/10] w-full">
          <Image src="/assets/product-icons/random-pic.png" alt="Placeholder image" fill className="object-cover" />
        </div>
      </div>
    </Section>
  );
}
