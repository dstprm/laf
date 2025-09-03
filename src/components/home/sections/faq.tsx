import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Section } from './section';

export function Faq() {
  const faqs = [
    {
      q: 'How do I change the pricing?',
      a: 'Update Paddle product IDs in your pricing constants and dashboard. The UI is already wired to display prices.',
    },
    {
      q: 'Where do I edit the home page copy?',
      a: 'Edit components under src/components/home/. Hero, features, and CTA are designed to be easy to change.',
    },
    {
      q: 'How do I wire emails?',
      a: 'Set Resend API keys and adjust the email components in src/components/emails/*.',
    },
    {
      q: 'Can I customize the UI?',
      a: 'Yes. Use the theme system and UI components to match your brand. Start by adjusting the theme settings.',
    },
  ];

  return (
    <Section id="faq" className="max-w-3xl">
      <div className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">FAQ</h2>
        <p className="mt-4 text-muted-foreground">Quick answers for customizing this template.</p>
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
