import { Briefcase, Landmark, LineChart } from 'lucide-react';
import { Section } from './section';

export function FeaturesSection() {
  const useCases = [
    {
      title: 'Private Equity u otros fondos',
      description:
        'Validar y compartir modelos ágiles para comités e inversión. Controlar supuestos, sensibilizar variables e identificar rangos de valor.',
      icon: Landmark,
      highlights: ['Comités de inversión', 'Compartir modelo', 'Sensibilizar escenarios'],
    },
    {
      title: 'Empresarios',
      description:
        'Estimar el valor de la empresa, explorar pecio de venta y preparar conversaciones con asesores o potenciales compradores.',
      icon: Briefcase,
      highlights: ['Explorar rango de valor', 'Compartir informe', 'Plan de acción', 'guía en el proceso'],
    },
    {
      title: 'CFOs',
      description:
        'Integrar la valorización de la empresa en la planificación financiera y complementar la reportería. Comparar escenarios para analizar decisiones estratégicas.',
      icon: LineChart,
      highlights: ['Definir variables críticas', 'Compartir con Directorio', 'Exportar resúmenes'],
    },
  ];

  return (
    <div className="w-full bg-stone-100">
      <Section id="features">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mt-1 text-3xl font-semibold tracking-tight md:text-5xl">Pensado en quienes deciden</h2>
          <p className="mt-4 text-muted-foreground">Nos adaptamos a diferentes perfiles y casos de uso.</p>
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
