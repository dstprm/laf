import { Section } from '../section';

export function FaqMinimal() {
  const faqs = [
    { q: 'Where to change pricing?', a: 'Swap Paddle IDs in constants and dashboard.' },
    { q: 'Where to edit hero?', a: 'See src/components/home/hero-section/*' },
    { q: 'How to theme?', a: 'Adjust theme settings and tokens in the theme context.' },
    { q: 'How to customize emails?', a: 'Update components in src/components/emails/* and set Resend keys.' },
  ];
  return (
    <Section className="max-w-5xl">
      <div className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">FAQ (minimal list)</h2>
        <p className="mt-2 text-muted-foreground">Simple two-column list. No expand/collapse.</p>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        {faqs.map((f, idx) => (
          <div key={idx} className="rounded-lg border border-border bg-muted/30 p-4 sm:p-5">
            <div className="text-base sm:text-lg font-medium">{f.q}</div>
            <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
