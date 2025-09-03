'use client';

import * as React from 'react';
import { useState } from 'react';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const ContactFormSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name'),
  email: z.string().email('Please enter a valid email'),
  subject: z.string().optional(),
  message: z.string().trim().min(1, 'Please enter a message'),
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
        title: 'Invalid form',
        description: first || 'Please fix the errors and try again.',
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
        throw new Error(data?.error || 'Failed to send message');
      }
      setFormState({ name: '', email: '', subject: '', message: '', company: '' });
      toast({ title: 'Message sent', description: 'Thanks for reaching out! We will get back to you shortly.' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast({ variant: 'destructive', title: 'Could not send message', description: message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Your name"
            value={formState.name}
            onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
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
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            name="subject"
            placeholder="How can we help?"
            value={formState.subject}
            onChange={(e) => setFormState((s) => ({ ...s, subject: e.target.value }))}
            disabled={isSubmitting}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="message">Message</Label>
          <textarea
            id="message"
            name="message"
            rows={5}
            placeholder="Write your message..."
            className="min-h-28 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            value={formState.message}
            onChange={(e) => setFormState((s) => ({ ...s, message: e.target.value }))}
            required
            disabled={isSubmitting}
          />
        </div>
        {/* Honeypot hidden field */}
        <div className="hidden">
          <Label htmlFor="company">Company</Label>
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
            {isSubmitting ? 'Sending…' : 'Send message'}
          </Button>
        </div>
      </div>
    </form>
  );
}
