'use client';

import { ContactForm } from '@/components/forms/contact-form';

export function ContactSection() {
  return (
    <section id="contact" className="scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-14 sm:py-16 md:py-20">
        <div className="grid items-start gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight md:text-4xl">Hablemos</h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground">¿Dudas o sugerencias? Escríbenos.</p>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <ContactForm source="home" />
          </div>
        </div>
      </div>
    </section>
  );
}
