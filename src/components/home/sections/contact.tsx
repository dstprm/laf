'use client';

import { ContactForm } from '@/components/forms/contact-form';

export function ContactSection() {
  return (
    <section id="professional-valuation" className="scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-14 sm:py-16 md:py-20">
        <div className="grid items-start gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight md:text-4xl">Valuación Profesional</h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground">
              ¿Necesitas una valuación más detallada y personalizada? Nuestro equipo de expertos puede ayudarte con:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Valuaciones exhaustivas para procesos de fundraising</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Análisis detallados para fusiones y adquisiciones</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Modelos financieros personalizados y proyecciones</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Due diligence financiero completo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Asesoría estratégica y presentaciones para inversionistas</span>
              </li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Contáctanos para recibir una propuesta personalizada basada en tus necesidades específicas.
            </p>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Solicita tu valuación profesional</h3>
            <ContactForm source="home" />
          </div>
        </div>
      </div>
    </section>
  );
}
