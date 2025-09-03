'use client';

import { useState } from 'react';
import { useUserInfo } from '@/hooks/useUserInfo';
import '../../styles/home-page.css';

import Header from '@/components/home/header/header';
import { HeroSection } from '@/components/home/hero-section/hero-section';
import { Pricing } from '@/components/home/pricing/pricing';
import { Brands } from '@/components/home/sections/brands';
import { FeaturesSection } from '@/components/home/sections/features';
import { HowItWorks } from '@/components/home/sections/how-it-works';
import { Stats } from '@/components/home/sections/stats';
import { Testimonials } from '@/components/home/sections/testimonials';
import { Faq } from '@/components/home/sections/faq';
import { Cta } from '@/components/home/sections/cta';
import { ContactSection } from '@/components/home/sections/contact';
import { FeatureTicker } from '@/components/home/sections/alternatives/feature-ticker';

import { Footer } from '@/components/home/footer/footer';

export function HomePage() {
  const { user } = useUserInfo();
  const [country] = useState('US');

  return (
    <>
      <div>
        <div id="nav-sentinel" aria-hidden className="h-0" />
        <Header user={user} />
        <HeroSection />
        <FeatureTicker />
        <Brands />
        <FeaturesSection />
        <HowItWorks />
        <Stats />
        <section id="pricing" className="scroll-mt-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-14 sm:py-16 md:py-20">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight md:text-5xl">
                Simple, transparent pricing
              </h2>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground">
                Choose a plan that grows with you.
              </p>
            </div>
            <div className="mt-8 sm:mt-10">
              <Pricing country={country} />
            </div>
          </div>
        </section>
        <Testimonials />
        <Faq />
        <ContactSection />
        <Cta />
        <Footer />
      </div>
    </>
  );
}
