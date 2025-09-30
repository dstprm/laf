import { CreditCard, LayoutDashboard, Mail, Palette, ShieldCheck, Sparkles } from 'lucide-react';
import { Section } from './section';

export function FeaturesSection() {
  const features = [
    {
      title: 'Método DCF robusto',
      description: 'Valuación gratuita basada en flujos descontados. Valuación profesional con múltiples metodologías.',
      icon: ShieldCheck,
    },
    {
      title: 'Datos actualizados',
      description: 'Usamos tasas, betas e industrias recientes. Ajustes por país y sector incorporados.',
      icon: CreditCard,
    },
    {
      title: 'Resultados claros',
      description: 'Informe listo para compartir: supuestos, sensibilidad y rango de valoración.',
      icon: LayoutDashboard,
    },
    {
      title: 'Recomendaciones',
      description: 'Sugerencias accionables para mejorar tu valoración y preparar tu ronda.',
      icon: Mail,
    },
    {
      title: 'Simple y rápido',
      description: 'Completa pocos campos y obtén resultados en minutos, gratis.',
      icon: Palette,
    },
    {
      title: 'Pensado para founders',
      description: 'Hecho para decisiones reales de fundraising, M&A y planeación.',
      icon: Sparkles,
    },
  ];

  return (
    <Section id="features" muted>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">¿Por qué elegirnos?</h2>
        <p className="mt-4 text-muted-foreground">
          Somos tu socio especializado en valuación de empresas. Precisión, experiencia y claridad en cada análisis.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="group relative overflow-hidden rounded-xl border border-border bg-background/60 p-5 sm:p-6 backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.15)] hover:border-primary/30"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 opacity-80 dark:opacity-60 group-hover:opacity-95 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(90deg, rgba(56,189,248,0.10), rgba(168,85,247,0.08))',
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
            <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
