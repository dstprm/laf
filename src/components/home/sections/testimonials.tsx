import { Section } from './section';
export function Testimonials() {
  const testimonials = [
    {
      name: 'Founder SaaS',
      role: 'Pre-seed',
      quote: 'La claridad del informe me ayudó a explicar mi valorización a inversionistas en la primera reunión.',
    },
    {
      name: 'CFO PyME',
      role: 'Servicios B2B',
      quote: 'Probé otros calculadores, pero aquí el rango y supuestos están mucho mejor explicados.',
    },
    {
      name: 'Emprendedor',
      role: 'E-commerce',
      quote: 'En 10 minutos tenía un PDF con supuestos y sensibilidad. Súper útil para planear la ronda.',
    },
  ];

  return (
    <Section id="testimonials">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Testimonios</h2>
        <p className="mt-4 text-muted-foreground">Lo que dicen quienes ya la usaron.</p>
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
