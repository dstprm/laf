import { Briefcase, Landmark, LineChart } from 'lucide-react';
import { Section } from './section';

export function FeaturesSection() {
  const useCases = [
    {
      title: 'Bancos o fondos',
      description:
        'Validar y compartir modelos ágiles para comités e inversión. Controlar supuestos, sensibilidad y enlaces compartibles.',
      icon: Landmark,
      highlights: ['Revisar en comité', 'Compartir modelo', 'Analizar sensibilidad'],
    },
    {
      title: 'Dueños de negocio',
      description:
        'Valuar la empresa, explorar precios de salida y preparar conversaciones con asesores o potenciales compradores.',
      icon: Briefcase,
      highlights: ['Explorar escenarios', 'Seguir guía paso a paso', 'Imprimir informe'],
    },
    {
      title: 'CFOs',
      description:
        'Integrar la valuación en la planificación financiera y el reporting. Comparar escenarios para comunicar decisiones al directorio.',
      icon: LineChart,
      highlights: ['Definir variables de escenario', 'Compartir con directorio', 'Exportar resúmenes'],
    },
  ];

  return (
    <div className="w-full bg-stone-100">
      <Section id="features">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Ejemplos de uso</div>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight md:text-5xl">Hecho para quienes deciden</h2>
          <p className="mt-4 text-muted-foreground">Ejemplos frecuentes; la herramienta se adapta a muchos más.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {useCases.map((f, i) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-xl border border-border bg-background/60 p-6 sm:p-7 backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.15)] hover:border-primary/30 min-h-56 sm:min-h-64"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 opacity-80 dark:opacity-60 group-hover:opacity-95 transition-opacity duration-300"
                style={{
                  background:
                    i % 3 === 0
                      ? 'linear-gradient(90deg, rgba(56,189,248,0.10), rgba(168,85,247,0.08))'
                      : i % 3 === 1
                        ? 'linear-gradient(90deg, rgba(34,197,94,0.10), rgba(59,130,246,0.08))'
                        : 'linear-gradient(90deg, rgba(250,204,21,0.10), rgba(244,63,94,0.08))',
                  maskImage:
                    'radial-gradient(120% 60% at 0% 100%, black, transparent), radial-gradient(120% 60% at 100% 0%, black, transparent)',
                }}
              />
              <div className="flex items-center gap-3">
                {f.icon && (
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-md border border-border bg-background">
                    <f.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                )}
                <div className="text-lg font-medium">{f.title}</div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{f.description}</p>
              {Array.isArray(f.highlights) && f.highlights.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {f.highlights.map((h) => (
                    <span
                      key={h}
                      className="rounded-full border border-border bg-background/70 px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
