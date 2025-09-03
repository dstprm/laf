import { Section } from './section';
export function HowItWorks() {
  const steps = [
    {
      title: 'Clone & Configure',
      description: 'Install deps, set env vars (Clerk, Paddle, Resend), and run dev. See README for quick start.',
    },
    {
      title: 'Customize',
      description: 'Replace copy in hero, features, and CTAs. Keep pricing mostly intact; just map your Paddle IDs.',
    },
    {
      title: 'Launch',
      description: 'Deploy to Vercel (or your choice). Webhooks and emails are ready—verify env vars in production.',
    },
  ];

  return (
    <Section id="how-it-works">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Adapting this template</h2>
        <p className="mt-4 text-muted-foreground">A simple flow from setup to launch.</p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
        {steps.map((s, idx) => (
          <div key={s.title} className="rounded-lg border border-border bg-background/60 p-5 sm:p-6 backdrop-blur">
            <div className="mb-4 inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-border text-xs sm:text-sm font-semibold">
              {idx + 1}
            </div>
            <div className="text-lg font-medium">{s.title}</div>
            <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
