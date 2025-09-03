import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { CONTACT_ADMIN_EMAIL } from '@/lib/email';
import { sendContactNotificationEmail } from '@/utils/email/send-email';
import { checkRateLimit } from '@/lib/rate-limit';

const ContactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().email('Invalid email').max(254),
  subject: z.string().max(200).optional().nullable(),
  message: z.string().trim().min(1, 'Message is required').max(5000),
  source: z.string().max(200).optional().nullable(),
  // Honeypot field to deter bots
  company: z.string().max(0).optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    if (!checkRateLimit(request, { bucketId: 'contact', maxRequests: 10, refillMs: 60_000 })) {
      return Response.json({ error: 'Too many requests' }, { status: 429 });
    }
    if (!CONTACT_ADMIN_EMAIL) {
      return Response.json({ error: 'Contact admin email not configured' }, { status: 500 });
    }

    const json = await request.json();
    const parsed = ContactSchema.safeParse(json);
    if (!parsed.success) {
      return Response.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }
    const { name, email, subject, message, source } = parsed.data;

    // Extract basic request metadata
    const ipAddress = request.headers.get('x-forwarded-for');
    const userAgent = request.headers.get('user-agent');

    // Save to DB
    await prisma.contactRequest.create({
      data: {
        name,
        email,
        subject: subject || undefined,
        message,
        source: source || undefined,
        ipAddress: ipAddress || undefined,
        userAgent: userAgent || undefined,
      },
    });

    // Send email notification
    await sendContactNotificationEmail({
      to: CONTACT_ADMIN_EMAIL,
      name,
      email,
      subject: subject || undefined,
      message,
      source: source || undefined,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Contact form submission failed:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
