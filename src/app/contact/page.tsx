'use client';

import { ContactForm } from '@/components/forms/contact-form';
import Header from '@/components/home/header/header';
import { useUserInfo } from '@/hooks/useUserInfo';

export default function ContactPage() {
  const { user } = useUserInfo();

  return (
    <div>
      <div id="nav-sentinel" aria-hidden className="h-0" />
      <Header user={user} />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 md:px-8 py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Contact us</h1>
          <p className="mt-3 text-muted-foreground">Have a question or feedback? Send us a message.</p>
        </div>
        <ContactForm source="/contact" className="bg-card border rounded-lg p-6" />
      </div>
    </div>
  );
}
