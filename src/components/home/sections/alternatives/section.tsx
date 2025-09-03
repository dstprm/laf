import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  muted?: boolean;
}

export function Section({ id, children, className, muted = false }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 py-14 sm:py-16 md:py-20 scroll-mt-20 md:scroll-mt-24',
        muted && 'bg-muted/40 rounded-xl',
        className,
      )}
    >
      {children}
    </section>
  );
}
