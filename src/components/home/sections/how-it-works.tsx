import { Section } from './section';
export function HowItWorks() {
  const freeSteps = [
    {
      title: 'Ingresa datos clave',
      description: 'Sector, país, ingresos y márgenes. Nada complejo, lo guiamos paso a paso.',
    },
    {
      title: 'Cálculo automático',
      description: 'Calculamos tu valorización mediante DCF con datos actualizados de tasas y betas por industria.',
    },
    {
      title: 'Obtén tu informe',
      description: 'Resultados claros, rango de valorización y recomendaciones accionables. Listo para compartir.',
    },
  ];

  return (
    <Section id="how-it-works">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Cómo funciona</h2>
        <p className="mt-4 text-muted-foreground">
          Comienza con nuestra valorización gratuita en minutos, o contacta a nuestro equipo para una valorización
          profesional completa.
        </p>
      </div>

      <div className="mt-8 mb-12 text-center">
        <h3 className="text-xl font-semibold">Valorización Gratuita</h3>
        <p className="text-sm text-muted-foreground mt-2">Proceso automatizado en 3 pasos</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
        {freeSteps.map((s, idx) => (
          <div key={s.title} className="rounded-lg border border-border bg-background/60 p-5 sm:p-6 backdrop-blur">
            <div className="mb-4 inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-border text-xs sm:text-sm font-semibold">
              {idx + 1}
            </div>
            <div className="text-lg font-medium">{s.title}</div>
            <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-border">
        <div className="text-center">
          <h3 className="text-xl font-semibold">Valorización Profesional</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
            Para necesidades más complejas, nuestro equipo de expertos trabaja contigo de forma personalizada: desde la
            recopilación de información hasta la entrega de un análisis exhaustivo y presentaciones ejecutivas para
            inversionistas.
          </p>
        </div>
      </div>
    </Section>
  );
}
