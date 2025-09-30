'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';

const VIDEOS = ['/videos/business-meeting.mp4', '/videos/tech-office.mp4', '/videos/meeting.mp4'];

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoEnd = () => {
      // Move to next video when current one ends
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % VIDEOS.length);
    };

    video.addEventListener('ended', handleVideoEnd);
    video.play().catch((err) => console.log('Video autoplay prevented:', err));

    return () => {
      video.removeEventListener('ended', handleVideoEnd);
    };
  }, [currentVideoIndex]);

  return (
    <section
      className={
        'relative mx-auto min-h-[calc(100vh-20px)] flex items-center justify-center px-4 sm:px-6 md:px-8 -mt-20 pt-32'
      }
    >
      {/* Video Background - extends behind navbar */}
      <div className="absolute inset-0 top-0 -z-10 overflow-hidden">
        <video
          ref={videoRef}
          key={currentVideoIndex}
          autoPlay
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src={VIDEOS[currentVideoIndex]} type="video/mp4" />
        </video>
        {/* Darker overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
      </div>

      <div className={'mx-auto w-full max-w-7xl text-center'}>
        <p className="mx-auto mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white/90 backdrop-blur">
          Tu socio experto en valuación de empresas
        </p>
        <h1
          className={
            'text-[42px] leading-[46px] md:text-[64px] md:leading-[70px] tracking-[-1.4px] font-semibold text-white drop-shadow-lg'
          }
        >
          Valuaciones profesionales
          <br />
          para decisiones inteligentes.
        </h1>
        <p
          className={
            'mx-auto mt-5 max-w-2xl text-[18px] leading-[27px] md:text-[20px] md:leading-[30px] text-white/90 drop-shadow-md'
          }
        >
          Comienza con una <strong className="font-semibold text-white">valuación gratuita</strong> en minutos, o
          solicita una <strong className="font-semibold text-white">valuación profesional personalizada</strong> para
          fundraising, M&A y decisiones estratégicas de alto impacto.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <Button asChild={true} size="lg">
            <Link href="/free-valuation">Valuación Gratuita</Link>
          </Button>
          <Button variant="secondary" asChild={true} size="lg">
            <Link href="#professional-valuation">Valuación Profesional</Link>
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-white/90">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 backdrop-blur">
            ✓ Valuación gratuita en minutos
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 backdrop-blur">
            ✓ Informes exportables
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 backdrop-blur">
            ✓ Valuaciones profesionales bajo demanda
          </span>
        </div>
      </div>
    </section>
  );
}
