'use client';

import * as React from 'react';
import { useState } from 'react';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const ContactFormSchema = z.object({
  name: z.string().trim().min(1, 'Por favor ingresa tu nombre'),
  email: z.string().email('Por favor ingresa un email válido'),
  subject: z.string().optional(),
  message: z.string().trim().min(1, 'Por favor ingresa un mensaje'),
  source: z.string().optional(),
  // Honeypot
  company: z.string().max(0).optional(),
});

export interface ContactFormProps {
  source?: string;
  className?: string;
}

export function ContactForm({ source, className }: ContactFormProps) {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    company: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = { ...formState, source };
    const parsed = ContactFormSchema.safeParse(payload);
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      toast({
        variant: 'destructive',
        title: 'Formulario inválido',
        description: first || 'Por favor corrige los errores e inténtalo de nuevo.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'No se pudo enviar el mensaje');
      }
      setFormState({ name: '', email: '', subject: '', message: '', company: '' });
      toast({ title: 'Mensaje enviado', description: '¡Gracias por escribirnos! Te responderemos a la brevedad.' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Algo salió mal';
      toast({ variant: 'destructive', title: 'No se pudo enviar el mensaje', description: message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            name="name"
            placeholder="Tu nombre"
            value={formState.name}
            onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formState.email}
            onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="subject">Asunto</Label>
          <Input
            id="subject"
            name="subject"
            placeholder="¿Cómo podemos ayudarte?"
            value={formState.subject}
            onChange={(e) => setFormState((s) => ({ ...s, subject: e.target.value }))}
            disabled={isSubmitting}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="message">Mensaje</Label>
          <textarea
            id="message"
            name="message"
            rows={5}
            placeholder="Escribe tu mensaje..."
            className="min-h-28 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            value={formState.message}
            onChange={(e) => setFormState((s) => ({ ...s, message: e.target.value }))}
            required
            disabled={isSubmitting}
          />
        </div>
        {/* Honeypot hidden field */}
        <div className="hidden">
          <Label htmlFor="company">Empresa</Label>
          <input
            id="company"
            name="company"
            autoComplete="off"
            tabIndex={-1}
            value={formState.company}
            onChange={(e) => setFormState((s) => ({ ...s, company: e.target.value }))}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando…' : 'Enviar mensaje'}
          </Button>
        </div>
      </div>
    </form>
  );
}
