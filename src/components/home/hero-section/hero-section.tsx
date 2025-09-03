import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className={'mx-auto mt-14 md:mt-16 mb-6 md:mb-8 flex items-center justify-between px-4 sm:px-6 md:px-8'}>
      <div className={'mx-auto w-full max-w-7xl text-center'}>
        <p className="mx-auto mb-4 inline-flex rounded-full border border-border/80 bg-background/60 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur">
          Next.js SaaS Template
        </p>
        <h1 className={'text-[42px] leading-[46px] md:text-[72px] md:leading-[78px] tracking-[-1.6px] font-medium'}>
          Start here, then make it yours.
          <br />
          Replace this copy with your product pitch.
        </h1>
        <p
          className={
            'mx-auto mt-5 max-w-2xl text-[18px] leading-[27px] md:text-[20px] md:leading-[30px] text-muted-foreground'
          }
        >
          This is a starter hero. Update the headline, subtext, and CTAs to match your product positioning. Checkout the
          docs (http://localhost:3000/docs) for more information.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild={true}>
            <Link href="/signup">Start free</Link>
          </Button>
          <Button variant="secondary" asChild={true}>
            <Link href="#pricing">View pricing</Link>
          </Button>
        </div>

        <div className="mt-6 text-xs text-muted-foreground">Tip: Link primary CTA to your signup or onboarding.</div>
      </div>
    </section>
  );
}
