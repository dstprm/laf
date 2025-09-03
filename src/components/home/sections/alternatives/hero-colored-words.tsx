import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
//

export function HeroSection() {
  return (
    <section className={'relative overflow-hidden'}>
      {/* Background aesthetic glows */}
      <div
        aria-hidden
        className={
          'pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]'
        }
      >
        <div
          className={'absolute -top-24 -right-16 h-[420px] w-[520px] rounded-full blur-3xl opacity-60 dark:opacity-40'}
          style={{
            background: 'radial-gradient(60% 60% at 50% 50%, rgba(56,189,248,0.35), rgba(56,189,248,0) 70%)',
          }}
        />
        <div
          className={
            'absolute -bottom-24 -left-16 h-[420px] w-[520px] rounded-full blur-3xl opacity-60 dark:opacity-40'
          }
          style={{
            background: 'radial-gradient(60% 60% at 50% 50%, rgba(168,85,247,0.35), rgba(168,85,247,0) 70%)',
          }}
        />
      </div>

      <div className={'mx-auto max-w-7xl px-4 sm:px-6 md:px-8 pt-16 md:pt-24 pb-8 md:pb-14'}>
        <div className={'flex flex-col-reverse md:flex-row items-center gap-10 md:gap-14'}>
          {/* Left: Copy + CTAs */}
          <div className={'w-full md:max-w-xl text-left'}>
            <p className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              Next.js SaaS Starter for modern development
            </p>
            <h1
              className={
                'mt-4 text-[42px] leading-[46px] md:text-[66px] md:leading-[72px] tracking-[-1.2px] font-semibold'
              }
            >
              Professional SaaS starter for{' '}
              <span className="bg-gradient-to-r from-sky-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                global launch
              </span>
              . <span className="bg-gradient-to-r from-amber-300 to-green-400 bg-clip-text text-transparent">Fast</span>{' '}
              and{' '}
              <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                AI‑ready
              </span>
              .
            </h1>
            <p
              className={
                'mt-4 text-[18px] leading-[27px] md:text-[20px] md:leading-[30px] text-muted-foreground max-w-xl'
              }
            >
              Auth, payments, webhooks, emails—with docs and context optimized for AI co‑development.
            </p>

            <div className="mt-7 flex items-center gap-3">
              <Button asChild={true}>
                <Link href="#pricing">Start building now</Link>
              </Button>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">Global payments • Webhooks • AI co‑development</div>

            <div className="mt-3 text-xs text-muted-foreground">
              After checkout, add your GitHub handle for repo access.
            </div>
          </div>

          {/* Right: Product mockup */}
          <div className={'relative w-full md:flex-1'}>
            <div className="absolute -inset-4 -z-10">
              <div
                aria-hidden
                className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl"
              />
            </div>
            <div
              className={
                'relative overflow-hidden rounded-xl border border-border bg-card ring-1 ring-primary/5 shadow-[0_20px_60px_rgba(0,0,0,0.18)] hover:shadow-[0_30px_90px_rgba(0,0,0,0.22)] transition-shadow'
              }
            >
              <div className="flex items-center gap-1 border-b border-border/70 bg-muted/20 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              </div>
              <div className="relative aspect-[17/10] w-full">
                <Image
                  src="/assets/product-icons/product-pic.png"
                  alt="App preview placeholder"
                  className="object-cover"
                  fill
                  priority
                />
              </div>
              {/* Soft highlight and floor shadow */}
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-8 left-1/2 h-10 w-3/4 -translate-x-1/2 rounded-[80px] bg-primary/20 blur-2xl opacity-40 dark:opacity-25"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-white/10"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
