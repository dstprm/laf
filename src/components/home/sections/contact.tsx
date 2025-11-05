'use client';

import { ContactForm } from '@/components/forms/contact-form';
import { Section } from './section';

export function ContactSection() {
  const services = [
    'Análisis exhaustivo para procesos de fundraising',
    'Estimación de valor y preparación para fusiones y adquisiciones',
    'Modelos financieros personalizados y a la medida',
    'Asesoría estratégica y presentaciones para inversionistas',
  ];

  return (
    <div className="w-full bg-stone-100">
      <Section id="professional-valuation" className="scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-14 sm:py-16 md:py-20">
          <div className="grid items-start gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight md:text-4xl">
                Valorización Profesional
              </h2>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base ">
                ¿Necesitas una valorización más detallada y personalizada? Nuestro equipo de expertos puede ayudarte
                con:
              </p>
              <ul className="mt-4 space-y-2 text-sm ">
                {services.map((service, i) => (
                  <li key={`service_${i}`} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm">
                Contáctanos para recibir una propuesta personalizada basada en tus necesidades específicas.
              </p>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Solicita tu valorización profesional</h3>
              <ContactForm source="home" />
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
