import { Section } from './section';
import { Bot, Globe, Layers, ShieldCheck } from 'lucide-react';

export function Differentiators() {
  const items = [
    {
      title: 'Global compliance',
      description: 'Sell worldwide with Paddle. Tax, VAT/GST, invoicing, and receipts handled for you.',
      icon: Globe,
    },
    {
      title: 'Pro developer workflows',
      description: 'Production flows and webhook management patterns designed for serious teams.',
      icon: ShieldCheck,
    },
    {
      title: 'AI‑ready documentation',
      description: 'Structured context and docs so AI can add business logic quickly and safely.',
      icon: Bot,
    },
    {
      title: 'Modern stack',
      description: 'Next.js, Prisma, Clerk, Paddle, Resend. Typed utilities and clean structure.',
      icon: Layers,
    },
  ];

  return (
    <Section>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Why this boilerplate?</h2>
        <p className="mt-4 text-muted-foreground">Built to launch globally, collaborate with AI, and scale cleanly.</p>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="group relative overflow-hidden rounded-xl border border-border bg-background/60 p-5 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.15)] hover:border-primary/30"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 opacity-80 dark:opacity-60 group-hover:opacity-95 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(90deg, rgba(56,189,248,0.14), rgba(168,85,247,0.10))',
                maskImage:
                  'radial-gradient(120% 60% at 0% 100%, black, transparent), radial-gradient(120% 60% at 100% 0%, black, transparent)',
              }}
            />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20 transition-colors group-hover:bg-primary/15 group-hover:ring-primary/30">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-lg font-semibold">{item.title}</div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-[1.5]">{item.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
