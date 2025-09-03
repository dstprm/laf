import { CreditCard, LayoutDashboard, Mail, Palette, ShieldCheck, Sparkles } from 'lucide-react';
import { Section } from './section';

export function FeaturesSection() {
  const features = [
    {
      title: 'Auth & Users',
      description:
        'This template ships with Clerk auth baked in. Replace copy and hide/show elements depending on signed-in state.',
      icon: ShieldCheck,
    },
    {
      title: 'Payments & Billing',
      description:
        'Use the Paddle integration to sell subscriptions. Swap product IDs and adjust your plans in one place.',
      icon: CreditCard,
    },
    {
      title: 'Dashboard UI',
      description:
        'A ready-to-extend dashboard with layout, navigation, and example pages. Replace content, keep structure.',
      icon: LayoutDashboard,
    },
    {
      title: 'Email Workflows',
      description: 'Update subject lines and branding. Emails are wired for billing and lifecycle events.',
      icon: Mail,
    },
    {
      title: 'Theming',
      description: 'Use the theme system to match your brand. Swap fonts, colors, and components as needed.',
      icon: Palette,
    },
    {
      title: 'Best Practices',
      description: 'Strong defaults, typed utilities, and a clean structure to help you scale confidently.',
      icon: Sparkles,
    },
  ];

  return (
    <Section id="features" muted>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Guide to this template</h2>
        <p className="mt-4 text-muted-foreground">Each section below explains how to adapt it for your product.</p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-lg border border-border bg-background/60 p-5 sm:p-6 backdrop-blur hover:bg-background/80 transition"
          >
            <div className="flex items-center gap-3">
              {f.icon && (
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-md border border-border bg-background">
                  <f.icon className="h-4 w-4 sm:h-5 sm:w-5" />
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
