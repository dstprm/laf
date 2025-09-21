import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Section } from './section';

export function Faq() {
  const faqs = [
    {
      q: '¿Es realmente gratis?',
      a: 'Sí. La herramienta de valuación es gratuita por ahora. Puedes usarla cuantas veces quieras.',
    },
    {
      q: '¿Qué tan precisa es la valuación?',
      a: 'Usamos métodos estándar (DCF, múltiplos y comparables) y datos recientes por industria. Tómalo como un rango orientativo para conversaciones.',
    },
    {
      q: '¿Puedo exportar el resultado?',
      a: 'Sí. Puedes descargar un informe con supuestos clave, sensibilidad y el rango de valoración.',
    },
    {
      q: '¿Necesito crear una cuenta?',
      a: 'Puedes probar sin registrarte. Crear una cuenta te permite guardar y comparar valuaciones.',
    },
  ];

  return (
    <Section id="faq" className="max-w-3xl">
      <div className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Preguntas frecuentes</h2>
        <p className="mt-4 text-muted-foreground">Respuestas rápidas sobre la herramienta.</p>
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
