import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className={'mx-auto mt-14 md:mt-16 mb-6 md:mb-8 flex items-center justify-between px-4 sm:px-6 md:px-8'}>
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-secondary/20" />
      <div className={'mx-auto w-full max-w-7xl text-center'}>
        <p className="mx-auto mb-4 inline-flex rounded-full border border-border/80 bg-background/60 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur">
          Tu socio experto en valuación de empresas
        </p>
        <h1 className={'text-[42px] leading-[46px] md:text-[64px] md:leading-[70px] tracking-[-1.4px] font-semibold'}>
          Valuaciones profesionales
          <br />
          para decisiones inteligentes.
        </h1>
        <p
          className={
            'mx-auto mt-5 max-w-2xl text-[18px] leading-[27px] md:text-[20px] md:leading-[30px] text-muted-foreground'
          }
        >
          Comienza con una <strong className="font-semibold text-foreground">valuación gratuita</strong> en minutos, o
          solicita una <strong className="font-semibold text-foreground">valuación profesional personalizada</strong>{' '}
          para fundraising, M&A y decisiones estratégicas de alto impacto.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <Button asChild={true} size="lg">
            <Link href="/free-valuation">Valuación Gratuita</Link>
          </Button>
          <Button variant="secondary" asChild={true} size="lg">
            <Link href="#professional-valuation">Valuación Profesional</Link>
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1 backdrop-blur">
            ✓ Valuación gratuita en minutos
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1 backdrop-blur">
            ✓ Informes exportables
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1 backdrop-blur">
            ✓ Valuaciones profesionales bajo demanda
          </span>
        </div>
      </div>
    </section>
  );
}
