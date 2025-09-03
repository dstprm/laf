import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Section } from './section';

export function Cta() {
  return (
    <Section>
      <div className="relative overflow-hidden rounded-xl border border-border bg-background/60 p-10 text-center backdrop-blur">
        <div className="mx-auto max-w-2xl">
          <h3 className="text-2xl font-semibold md:text-4xl">Ready to customize?</h3>
          <p className="mt-3 text-muted-foreground">Replace this CTA with your product-specific action.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button asChild={true}>
              <Link href="/signup">Get started</Link>
            </Button>
            <Button variant="secondary" asChild={true}>
              <Link href="#pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
