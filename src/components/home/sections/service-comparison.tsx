import { Section } from './section';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Check } from 'lucide-react';

export function ServiceComparison() {
  const freeFeatures = [
    'Valuación automatizada basada en DCF',
    'Cálculo automático de flujos descontados',
    'Informe one-pager listo para compartir',
    'Resultados en minutos',
    'Análisis de sensibilidad básico',
    'Rango de valoración estimado',
  ];

  const professionalFeatures = [
    'Análisis exhaustivo personalizado',
    'Múltiples métodos: DCF, múltiplos y comparables',
    'Modelos financieros detallados',
    'Asesoría de M&A',
    'Due diligence completo',
    'Asesoría estratégica',
    'Asesoría de planificación financiera',
    'Presentación ejecutiva para inversionistas',
    'Soporte continuo durante el proceso',
  ];

  return (
    <Section id="services">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Elige tu nivel de valuación</h2>
        <p className="mt-4 text-muted-foreground">
          Desde una estimación rápida hasta un análisis completo para decisiones críticas.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Free Valuation Card */}
        <div className="group relative overflow-hidden rounded-xl border-2 border-border bg-background/60 p-6 sm:p-8 backdrop-blur transition-all hover:border-primary/30 hover:shadow-lg flex flex-col">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold">Valuación Gratuita</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Perfecta para obtener una estimación inicial rápida y profesional.
            </p>
            <div className="mt-4">
              <span className="text-4xl font-bold">Gratis</span>
            </div>
          </div>
          <ul className="space-y-3 mb-6 flex-grow">
            {freeFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button asChild className="w-full mt-auto" size="lg">
            <Link href="/free-valuation">Comenzar Gratis</Link>
          </Button>
        </div>

        {/* Professional Valuation Card */}
        <div className="group relative overflow-hidden rounded-xl border-2 border-primary bg-background/60 p-6 sm:p-8 backdrop-blur transition-all hover:shadow-xl flex flex-col">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-20 dark:opacity-10"
            style={{
              background: 'radial-gradient(600px 400px at 50% 50%, rgba(56,189,248,0.15), transparent)',
            }}
          />
          <div className="mb-6">
            <div className="inline-flex rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground mb-3">
              Recomendado para fundraising y M&A
            </div>
            <h3 className="text-2xl font-semibold">Valuación Profesional</h3>
            <p className="mt-2 text-sm text-muted-foreground">Análisis exhaustivo y personalizado.</p>
            <div className="mt-4">
              <span className="text-4xl font-bold">Personalizado</span>
              <p className="text-sm text-muted-foreground mt-1">Cotización basada en tus necesidades</p>
            </div>
          </div>
          <ul className="space-y-3 mb-6 flex-grow">
            {professionalFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button asChild className="w-full mt-auto" size="lg" variant="default">
            <Link href="#professional-valuation">Solicitar Cotización</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
