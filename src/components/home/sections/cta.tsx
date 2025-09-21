import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Section } from './section';

export function Cta() {
  return (
    <Section>
      <div className="relative overflow-hidden rounded-xl border border-border bg-background/60 p-10 text-center backdrop-blur">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-90 dark:opacity-70"
          style={{
            background:
              'radial-gradient(600px 180px at 50% -20%, rgba(56,189,248,0.10), transparent), radial-gradient(600px 180px at 50% 120%, rgba(168,85,247,0.10), transparent)',
          }}
        />
        <div className="mx-auto max-w-2xl">
          <h3 className="text-2xl font-semibold md:text-4xl">Listo para valuar tu empresa</h3>
          <p className="mt-3 text-muted-foreground">Gratis, en minutos y con un informe listo para compartir.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button asChild={true}>
              <Link href="/free-valuation">Comenzar ahora</Link>
            </Button>
            <Button variant="secondary" asChild={true}>
              <Link href="#how-it-works">Cómo funciona</Link>
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
