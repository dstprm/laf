import { Section } from './section';
import { CreditCard, Github, Rocket, Sparkles } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      title: 'Purchase once',
      description: 'Checkout securely via Paddle and get instant lifetime access to the private repository.',
      icon: CreditCard,
    },
    {
      title: 'Add your GitHub handle',
      description: 'Drop your handle in the dashboard—automation grants repo access within minutes.',
      icon: Github,
    },
    {
      title: 'Clone the repo & set up keys',
      description:
        'Pull the private repo, add environment keys, and run locally in minutes. Payments, auth, and emails are wired.',
      icon: Rocket,
    },
    {
      title: 'Build fast with AI',
      description:
        'Use Cursor, Claude, or Copilot with AI‑ready docs and context to implement business logic ultra‑fast.',
      icon: Sparkles,
    },
  ];

  return (
    <Section id="how-it-works">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">From idea to product in four steps</h2>
        <p className="mt-4 text-muted-foreground">Own the codebase. Keep full control over your stack.</p>
      </div>

      {/* Connector band */}
      <div className="relative mx-auto mt-12 max-w-6xl">
        <div className="absolute left-0 right-0 top-6 hidden h-px bg-[linear-gradient(to_right,transparent,rgba(148,163,184,0.35),transparent)] md:block" />
        <ol className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {steps.map((s, idx) => (
            <li key={s.title} className="relative">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="rounded-xl border border-border bg-background/60 p-5 backdrop-blur shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
                  <div className="text-base font-semibold">
                    {idx + 1}. {s.title}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
