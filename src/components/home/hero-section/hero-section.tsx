'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';

const VIDEOS = [
  '/videos/business-meeting.webm',
  '/videos/meeting.webm',
  '/videos/solar.webm',
  '/videos/tech-office.webm',
];

export function HeroSection() {
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [activeVideo, setActiveVideo] = useState<1 | 2>(1);

  useEffect(() => {
    const currentRef = activeVideo === 1 ? video1Ref : video2Ref;
    const nextRef = activeVideo === 1 ? video2Ref : video1Ref;
    const video = currentRef.current;

    if (!video) return;

    const handleVideoEnd = () => {
      const nextIndex = (currentVideoIndex + 1) % VIDEOS.length;

      // Preload next video
      if (nextRef.current) {
        nextRef.current.src = VIDEOS[nextIndex];
        nextRef.current.load();

        // Start playing next video and fade in
        nextRef.current.play().then(() => {
          setActiveVideo(activeVideo === 1 ? 2 : 1);
          setCurrentVideoIndex(nextIndex);
        });
      }
    };

    video.addEventListener('ended', handleVideoEnd);
    video.play().catch((err) => console.log('Video autoplay prevented:', err));

    return () => {
      video.removeEventListener('ended', handleVideoEnd);
    };
  }, [currentVideoIndex, activeVideo]);

  return (
    <section
      className={
        'relative z-0 mx-auto min-h-[75vh] flex items-center justify-center px-4 sm:px-6 md:px-8 -mt-20 pt-28 pb-16'
      }
    >
      {/* Video Background with crossfade - extends behind navbar */}
      <div className="absolute -inset-x-0 -top-20 bottom-0 -z-10 overflow-hidden bg-black">
        {/* Video 1 */}
        <video
          ref={video1Ref}
          src={VIDEOS[0]}
          muted
          playsInline
          preload="auto"
          className={`absolute top-0 left-0 w-full h-[calc(100%+80px)] object-cover transition-opacity duration-1000 ${
            activeVideo === 1 ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Video 2 */}
        <video
          ref={video2Ref}
          src={VIDEOS[1]}
          muted
          playsInline
          preload="none"
          className={`absolute top-0 left-0 w-full h-[calc(100%+80px)] object-cover transition-opacity duration-1000 ${
            activeVideo === 2 ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Darker overlay for better contrast - extends to cover navbar area */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60" />
      </div>

      <div className={'mx-auto w-full max-w-5xl text-center'}>
        <p className="mx-auto mb-5 inline-flex rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white/80 backdrop-blur-sm">
          Expertos en valuación de empresas y modelamiento financiero
        </p>
        <h1
          className={
            'text-[48px] leading-[52px] md:text-[68px] md:leading-[76px] tracking-[-2px] font-bold text-white drop-shadow-2xl mb-6'
          }
        >
          Valuaciones profesionales y modelamiento financiero
          <br />
          para decisiones inteligentes.
        </h1>
        <p
          className={'mx-auto max-w-2xl text-[17px] leading-[26px] md:text-[19px] md:leading-[30px] text-white/85 mb-8'}
        >
          La forma moderna de entender cuánto vale tu empresa
        </p>

        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <Button asChild={true} size="lg" className="h-12 px-8 text-base font-semibold">
            <Link href="/free-valuation">Valuación Gratuita</Link>
          </Button>
          <Button
            variant="outline"
            asChild={true}
            size="lg"
            className="h-12 px-8 text-base font-semibold bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
          >
            <Link href="#professional-valuation">Valuación Profesional</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
