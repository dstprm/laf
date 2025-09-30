import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Section } from './section';

export function Faq() {
  const faqs = [
    {
      q: '¿La valuación gratuita es realmente gratis?',
      a: 'Sí, completamente gratis. La herramienta de valuación automatizada no tiene costo y puedes usarla cuantas veces quieras.',
    },
    {
      q: '¿Cuál es la diferencia entre la valuación gratuita y la profesional?',
      a: 'La valuación gratuita usa cálculos automatizados basados en DCF para darte un rango orientativo en minutos. La valuación profesional incluye múltiples metodologías (DCF, múltiplos, comparables), análisis personalizado por expertos, modelos financieros detallados, due diligence completo y presentaciones ejecutivas para inversionistas.',
    },
    {
      q: '¿Qué tan precisa es la valuación gratuita?',
      a: 'Usamos el método DCF estándar con datos recientes de tasas y betas por industria. Es un rango orientativo excelente para conversaciones iniciales y decisiones estratégicas. Para procesos críticos como fundraising o M&A que requieren múltiples metodologías, recomendamos la valuación profesional.',
    },
    {
      q: '¿Cuánto cuesta una valuación profesional?',
      a: 'El costo depende de la complejidad del análisis, tamaño de la empresa y necesidades específicas. Contáctanos para recibir una propuesta personalizada sin compromiso.',
    },
    {
      q: '¿Puedo exportar el resultado?',
      a: 'Sí. Ambas opciones incluyen informes descargables: la gratuita genera un PDF con supuestos clave y rango de valoración; la profesional incluye documentos completos y presentaciones ejecutivas.',
    },
    {
      q: '¿Necesito crear una cuenta?',
      a: 'Puedes probar la valuación gratuita sin registrarte. Crear una cuenta te permite guardar y comparar tus valuaciones, y facilita el seguimiento de tu solicitud de valuación profesional.',
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
