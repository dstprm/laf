'use client';

import { useUserInfo } from '@/hooks/useUserInfo';
import '../../styles/home-page.css';

import Header from '@/components/home/header/header';
import { HeroSection } from '@/components/home/hero-section/hero-section';
import { Brands } from '@/components/home/sections/brands';
import { FeaturesSection } from '@/components/home/sections/features';
import { HowItWorks } from '@/components/home/sections/how-it-works';
import { Stats } from '@/components/home/sections/stats';
import { Testimonials } from '@/components/home/sections/testimonials';
import { Faq } from '@/components/home/sections/faq';
import { Cta } from '@/components/home/sections/cta';
import { ContactSection } from '@/components/home/sections/contact';
import { FeatureTicker } from '@/components/home/sections/alternatives/feature-ticker';
import { ServiceComparison } from '@/components/home/sections/service-comparison';
import { HeroStats } from '@/components/home/sections/hero-stats';

import { Footer } from '@/components/home/footer/footer';

export function HomePage() {
  const { user } = useUserInfo();

  return (
    <>
      <div>
        <div id="nav-sentinel" aria-hidden className="h-0" />
        <Header user={user} />
        <HeroSection />
        <HeroStats />
        <FeatureTicker />
        <Brands />
        <FeaturesSection />
        <ServiceComparison />
        <HowItWorks />
        <Stats />
        <Testimonials />
        <Faq />
        <ContactSection />
        <Cta />
        <Footer />
      </div>
    </>
  );
}
