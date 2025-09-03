'use client';

import { useEffect, useRef, useState } from 'react';
import { Section } from '../section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Item {
  name: string;
  role: string;
  quote: string;
}

const ITEMS: Item[] = [
  { name: 'Alex', role: 'Founder', quote: 'Great starting point. Shipped fast.' },
  { name: 'Samira', role: 'Indie hacker', quote: 'Clean patterns and UI. Love it.' },
  { name: 'Lee', role: 'Engineer', quote: 'Billing and auth saved weeks.' },
];

export function TestimonialsCarousel() {
  const [value, setValue] = useState('0');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setValue((v) => `${(Number(v) + 1) % ITEMS.length}`);
    }, 4000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return (
    <Section>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">What people say</h2>
        <p className="mt-2 text-muted-foreground">Auto-advancing tabs with dot controls.</p>
      </div>
      <div className="mx-auto mt-8 max-w-3xl rounded-lg border border-border bg-background/60 p-4 sm:p-6">
        <Tabs value={value} onValueChange={setValue} className="w-full">
          <div className="relative h-32 sm:h-28">
            {ITEMS.map((item, i) => (
              <TabsContent key={item.name} value={`${i}`} className="m-0 p-0">
                <p className="text-center text-sm leading-relaxed">“{item.quote}”</p>
                <div className="mt-4 text-center text-sm font-medium">{item.name}</div>
                <div className="text-center text-xs text-muted-foreground">{item.role}</div>
              </TabsContent>
            ))}
          </div>
          <TabsList className="mt-4 inline-flex h-auto gap-2 border-none bg-transparent p-0">
            {ITEMS.map((_, i) => (
              <TabsTrigger
                key={i}
                value={`${i}`}
                aria-label={`Go to slide ${i + 1}`}
                className="h-3 w-3 rounded-full bg-muted p-0 data-[state=active]:bg-foreground"
              />
            ))}
          </TabsList>
        </Tabs>
      </div>
    </Section>
  );
}
