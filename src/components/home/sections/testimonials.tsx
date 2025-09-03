import { Section } from './section';
export function Testimonials() {
  const testimonials = [
    {
      name: 'Tip',
      role: 'Customize this section or remove',
      quote: 'Replace quotes and names with social proof for your own product, or delete this section entirely.',
    },
    {
      name: 'Note',
      role: 'Static content by default',
      quote: 'Use a simple grid for now. You can swap to a carousel later if you collect more testimonials.',
    },
    {
      name: 'Suggestion',
      role: 'Link to real sources',
      quote: 'When you have real quotes, add avatars and links to posts or profiles to increase trust.',
    },
  ];

  return (
    <Section id="testimonials">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Testimonials</h2>
        <p className="mt-4 text-muted-foreground">Example layout for social proof. Replace or remove.</p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <div key={t.name} className="rounded-lg border border-border bg-background/60 p-5 sm:p-6 backdrop-blur">
            <p className="text-sm leading-relaxed">“{t.quote}”</p>
            <div className="mt-4 text-sm font-medium">{t.name}</div>
            <div className="text-[11px] sm:text-xs text-muted-foreground">{t.role}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}
