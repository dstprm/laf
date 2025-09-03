import Image from 'next/image';
import { Section } from '../section';

export function BrandsMarquee() {
  const logos = [
    '/assets/icons/logo/nextjs-logo.svg',
    '/assets/icons/logo/tailwind-logo.svg',
    '/assets/icons/logo/nextjs-logo.svg',
    '/assets/icons/logo/tailwind-logo.svg',
    '/assets/icons/logo/nextjs-logo.svg',
    '/assets/icons/logo/tailwind-logo.svg',
  ];
  const marquee = [...logos, ...logos, ...logos];
  return (
    <Section>
      <div className="text-center text-sm text-muted-foreground">Logo marquee</div>
      <div className="relative mt-6 overflow-hidden">
        <div className="marquee flex w-[200%] items-center gap-8 opacity-70">
          {marquee.map((src, i) => (
            <div key={`${src}-${i}`} className="shrink-0">
              <Image
                src={src}
                width={120}
                height={40}
                alt={`Logo ${i + 1}`}
                className="mx-auto grayscale contrast-125 opacity-80"
              />
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .marquee {
          animation: scroll 20s linear infinite;
        }
        @media (max-width: 640px) {
          .marquee {
            animation-duration: 30s;
          }
        }
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </Section>
  );
}
