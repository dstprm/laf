import Image from 'next/image';
import { Section } from './section';

export function TechStack() {
  const stacks: { label: string; src?: string; rationale: string }[] = [
    { label: 'Paddle', src: '/assets/icons/logo/paddle-logo.png', rationale: 'Global payments, tax/VAT, invoicing.' },
    { label: 'Clerk', src: '/assets/icons/logo/clerk-logo.png', rationale: 'Auth, user management, sessions.' },
    { label: 'Prisma', src: '/assets/icons/logo/prisma-logo.webp', rationale: 'Typed ORM with clean migrations.' },
    { label: 'Resend', src: '/assets/icons/logo/resend-logo.svg', rationale: 'Transactional emails that scale.' },
    { label: 'Next.js', src: '/assets/icons/logo/nextjs-logo.svg', rationale: 'App Router, performance, DX.' },
    { label: 'Tailwind', src: '/assets/icons/logo/tailwind-logo.svg', rationale: 'Rapid, consistent styling.' },
    { label: 'shadcn/ui', src: '/assets/icons/logo/shadcn-logo.png', rationale: 'Accessible UI primitives.' },
    { label: 'TypeScript', src: '/assets/icons/logo/typescript-logo.png', rationale: 'End‑to‑end type safety.' },
  ];

  return (
    <Section>
      <div className="mx-auto max-w-3xl text-center">
        <h3 className="text-xl font-semibold md:text-2xl">Tech stack</h3>
        <p className="mt-3 text-sm text-muted-foreground">
          Next.js App Router, TypeScript, Tailwind + shadcn/ui, Prisma, Clerk authentication, Paddle payments, and
          Resend emails.
        </p>
      </div>
      <div className="mt-8 grid grid-cols-2 items-stretch gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {stacks.map((item) => (
          <div
            key={item.label}
            className="flex min-h-[168px] flex-col items-center justify-center rounded-lg border border-border bg-background/60 p-4 text-center backdrop-blur overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
          >
            {item.src ? (
              <div className="flex h-10 sm:h-12 items-center justify-center">
                <Image
                  src={item.src}
                  alt={item.label}
                  width={160}
                  height={40}
                  className="max-h-full w-auto object-contain opacity-85"
                />
              </div>
            ) : (
              <div className="h-10 sm:h-12" />
            )}
            <div className="mt-2 text-sm font-medium">{item.label}</div>
            <div className="mt-1 text-[11px] leading-snug text-muted-foreground">{item.rationale}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}
