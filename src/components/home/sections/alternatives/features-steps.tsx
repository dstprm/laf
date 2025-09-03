import { Section } from '../section';

export function FeaturesSteps() {
  const steps = [
    { title: 'Setup', desc: 'Install deps, set env vars, run dev.' },
    { title: 'Customize', desc: 'Replace copy, theme, and images.' },
    { title: 'Launch', desc: 'Deploy and turn on webhooks & emails.' },
  ];
  return (
    <Section>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Three simple steps</h2>
        <p className="mt-3 sm:mt-4 text-muted-foreground">A linear narrative styled as feature steps.</p>
      </div>
      <div className="mx-auto mt-8 sm:mt-10 max-w-3xl">
        <ol className="relative border-s border-border">
          {steps.map((s, i) => (
            <li key={s.title} className="mb-8 sm:mb-10 ms-4">
              <div className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full border border-border bg-background" />
              <h3 className="text-lg font-medium">
                {i + 1}. {s.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
