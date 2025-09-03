import Image from 'next/image';
import { Section } from './section';

export function Brands() {
  return (
    <Section>
      <div className="text-center text-sm text-muted-foreground">
        Placeholder logos. Swap with your customers/partners or remove this section.
      </div>
      <div className="mt-6 grid grid-cols-2 items-center justify-center gap-4 sm:gap-6 opacity-70 sm:grid-cols-3 md:grid-cols-6">
        <Image src="/assets/icons/logo/nextjs-logo.svg" width={120} height={40} alt="Next.js" className="mx-auto" />
        <Image src="/assets/icons/logo/tailwind-logo.svg" width={120} height={40} alt="Tailwind" className="mx-auto" />
        <Image src="/assets/icons/logo/nextjs-logo.svg" width={120} height={40} alt="Next.js" className="mx-auto" />
        <Image src="/assets/icons/logo/tailwind-logo.svg" width={120} height={40} alt="Tailwind" className="mx-auto" />
        <Image src="/assets/icons/logo/nextjs-logo.svg" width={120} height={40} alt="Next.js" className="mx-auto" />
        <Image src="/assets/icons/logo/tailwind-logo.svg" width={120} height={40} alt="Tailwind" className="mx-auto" />
      </div>
    </Section>
  );
}
