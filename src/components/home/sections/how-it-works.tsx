import { Section } from './section';
export function HowItWorks() {
  const steps = [
    {
      title: 'Ingresa datos clave',
      description: 'Sector, país, ingresos y márgenes. Nada complejo, lo guiamos paso a paso.',
    },
    {
      title: 'Procesamos con IA',
      description: 'Calculamos DCF, múltiplos y comparables con datos recientes por industria.',
    },
    {
      title: 'Obtén tu informe',
      description: 'Resultados claros, rango de valoración y recomendaciones accionables. Listo para compartir.',
    },
  ];

  return (
    <Section id="how-it-works">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Cómo funciona</h2>
        <p className="mt-4 text-muted-foreground">De cero a una valuación sólida en minutos.</p>
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
