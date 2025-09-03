import { Section } from '../section';
import { CreditCard, LayoutDashboard, Mail, Palette, ShieldCheck, Sparkles } from 'lucide-react';

export function FeaturesIcons() {
  const features = [
    { icon: ShieldCheck, title: 'Auth', desc: 'Clerk integration with protected routes.' },
    { icon: CreditCard, title: 'Billing', desc: 'Paddle subscriptions and webhooks.' },
    { icon: LayoutDashboard, title: 'Dashboard', desc: 'Prebuilt layout and pages.' },
    { icon: Mail, title: 'Emails', desc: 'Transactional flows wired up.' },
    { icon: Palette, title: 'Theming', desc: 'Light/dark and theme tokens.' },
    { icon: Sparkles, title: 'Best Practices', desc: 'Typed utilities and structure.' },
  ];
  return (
    <Section muted>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Feature highlights</h2>
        <p className="mt-3 sm:mt-4 text-muted-foreground">Compact icon-first feature grid.</p>
      </div>
      <div className="mt-8 sm:mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-lg border border-border bg-background/60 p-4 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md border border-border">
              <Icon className="h-5 w-5" />
            </div>
            <div className="mt-2 text-sm font-medium">{title}</div>
            <div className="text-[11px] text-muted-foreground">{desc}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}
