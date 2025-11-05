import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Section } from './section';

export function Faq() {
  const faqs = [
    {
      q: '¿La valorización gratuita es realmente gratis?',
      a: 'Sí, completamente gratis. La herramienta de valorización automatizada no tiene costo y puedes usarla cuantas veces quieras.',
    },
    {
      q: '¿Cuál es la diferencia entre la valorización gratuita y la profesional?',
      a: 'La valorización gratuita usa cálculos automatizados basados en DCF para darte un rango orientativo en minutos. La valorización profesional incluye múltiples metodologías (DCF, múltiplos, comparables), análisis personalizado por expertos, modelos financieros detallados, due diligence completo y presentaciones ejecutivas para inversionistas.',
    },
    {
      q: '¿Cómo hago una valorización gratis? ¿Es muy complejo?',
      a: 'En el formulario en línea, se te solicitirán algunos datos básicos de tu empresa. Deberás indicar el país donde se encuentra la empresa y su industria principal. Luego ingresarás el nivel de ventas del último año, la tasa de crecimiento esperada para los próximos años y tu mejor estimado del margen EBITDA. Si decides una valorización gratis Avanzada, se solicitarán algunos detalles adicionales. Así de simple, podrás ver una estimación del valor de tu empresa junto a escenarios de valorización. Podrás también compartir un informe simple de manera gratuita.',
    },
    {
      q: '¿Qué tan precisa es la valorización gratuita?',
      a: 'Usamos el método DCF estándar con datos recientes de tasas y betas por industria. Es un rango orientativo excelente para conversaciones iniciales y decisiones estratégicas. Para procesos críticos como fundraising o M&A que requieren múltiples metodologías, recomendamos la valorización profesional.',
    },
    {
      q: '¿Cuánto cuesta una valorización profesional?',
      a: 'El costo depende de la complejidad del análisis, tamaño de la empresa y necesidades específicas. Contáctanos para recibir una propuesta personalizada sin compromiso.',
    },
    {
      q: '¿Puedo exportar el resultado?',
      a: 'Sí. Puedes compartir un enlace con el resumen de la valorización para que cualquier persona pueda ver el resultado.',
    },
  ];

  return (
    <Section id="faq" className="max-w-3xl">
      <div className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Preguntas frecuentes</h2>
        <p className="mt-4 text-muted-foreground">Todo lo que necesitas saber sobre nuestros servicios.</p>
      </div>
      <Accordion type="single" collapsible className="mt-8 sm:mt-10 w-full">
        {faqs.map((f, idx) => (
          <AccordionItem key={idx} value={`item-${idx}`}>
            <AccordionTrigger>{f.q}</AccordionTrigger>
            <AccordionContent>{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}
