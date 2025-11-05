import { cn } from '@/lib/utils';

const items = [
  'Flujos descontados y múltiplos',
  'Comparables por industria',
  'Rango de valorización',
  'Informe exportable',
  'Análisis de sensibilidad',
  'Versión gratuita en minutos',
];

interface SectionProps {
  id?: string;

  className?: string;
  muted?: boolean;
}

export function FeatureTicker({ id, className, muted = false }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 py-14 sm:py-16 md:py-20 scroll-mt-20 md:scroll-mt-24',
        muted && 'bg-muted/40 rounded-xl',
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-full border border-border bg-background/60 py-3">
        <div className="animate-[ticker_30s_linear_infinite] whitespace-nowrap">
          {items.concat(items).map((text, idx) => (
            <span key={idx} className="mx-6 inline-flex items-center text-sm text-muted-foreground">
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
