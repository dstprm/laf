import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className={'mx-auto mt-14 md:mt-16 mb-6 md:mb-8 flex items-center justify-between px-4 sm:px-6 md:px-8'}>
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-secondary/20" />
      <div className={'mx-auto w-full max-w-7xl text-center'}>
        <p className="mx-auto mb-4 inline-flex rounded-full border border-border/80 bg-background/60 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur">
          Valuación de empresas con IA
        </p>
        <h1 className={'text-[42px] leading-[46px] md:text-[64px] md:leading-[70px] tracking-[-1.4px] font-semibold'}>
          Valora tu empresa en minutos.
          <br />
          Gratis, preciso y listo para compartir.
        </h1>
        <p
          className={
            'mx-auto mt-5 max-w-2xl text-[18px] leading-[27px] md:text-[20px] md:leading-[30px] text-muted-foreground'
          }
        >
          Obtén una estimación profesional usando múltiples métodos (DCF, múltiplos y comparables), con datos de mercado
          actualizados. Resultados claros y exportables para founders e inversionistas.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild={true}>
            <Link href="/free-valuation">Valorar mi empresa</Link>
          </Button>
          <Button variant="secondary" asChild={true}>
            <Link href="#how-it-works">Cómo funciona</Link>
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1 backdrop-blur">
            Gratis por ahora
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1 backdrop-blur">
            Sin tarjeta
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1 backdrop-blur">
            Informe exportable
          </span>
        </div>
      </div>
    </section>
  );
}
