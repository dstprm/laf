import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Section } from '../section';

export function CtaSplit() {
  return (
    <Section>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-background/60 p-6">
          <h3 className="text-xl font-semibold">Ready to customize?</h3>
          <p className="mt-2 text-sm text-muted-foreground">Jump into the code and make it yours.</p>
          <div className="mt-4">
            <Button asChild>
              <Link href="/signup">Start free</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-background/60 p-6">
          <h3 className="text-xl font-semibold">Prefer to explore first?</h3>
          <p className="mt-2 text-sm text-muted-foreground">Browse features and docs to plan your build.</p>
          <div className="mt-4">
            <Button asChild variant="secondary">
              <Link href="#features">See features</Link>
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
