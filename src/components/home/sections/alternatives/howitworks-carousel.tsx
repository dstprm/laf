'use client';

import { useEffect, useRef, useState } from 'react';
import { Section } from '../section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const STEPS = [
  { title: 'Clone', desc: 'Get the repo and install dependencies.' },
  { title: 'Configure', desc: 'Set env vars for Clerk, Paddle, Resend.' },
  { title: 'Customize', desc: 'Edit copy, theme, and product IDs.' },
  { title: 'Launch', desc: 'Deploy and connect webhooks & emails.' },
];

export function HowItWorksCarousel() {
  const [value, setValue] = useState('0');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setValue((v) => `${(Number(v) + 1) % STEPS.length}`), 3500);
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
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">How it works (carousel)</h2>
        <p className="mt-2 text-muted-foreground">Auto-advancing tabs with dot controls.</p>
      </div>
      <div className="mx-auto mt-8 max-w-2xl rounded-lg border border-border bg-background/60 p-4 sm:p-6">
        <Tabs value={value} onValueChange={setValue} className="w-full">
          <div className="relative h-28">
            {STEPS.map((s, i) => (
              <TabsContent key={s.title} value={`${i}`} className="m-0 p-0">
                <div className="text-lg font-medium">{s.title}</div>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </TabsContent>
            ))}
          </div>
          <TabsList className="mt-4 inline-flex h-auto gap-2 border-none bg-transparent p-0">
            {STEPS.map((_, i) => (
              <TabsTrigger
                key={i}
                value={`${i}`}
                aria-label={`Go to step ${i + 1}`}
                className="h-3 w-3 rounded-full bg-muted p-0 data-[state=active]:bg-foreground"
              />
            ))}
          </TabsList>
        </Tabs>
      </div>
    </Section>
  );
}
