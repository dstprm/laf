/**
 * Paddle Webhook Endpoint
 *
 * Events handled: transactions (completed, payment_failed, past_due), subscriptions (created/updated), customers (created/updated)
 * Verification: paddle-signature header, unmarshal using private key
 * Env required: PADDLE_NOTIFICATION_WEBHOOK_SECRET
 * Side effects: updates local subscription records, writes Payment analytics, sends transactional emails
 * Idempotency: implemented in ProcessWebhook via upserts
 */
import { NextRequest, NextResponse } from 'next/server';
import { ProcessWebhook } from '@/utils/paddle/process-webhook';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';
import { checkRateLimit } from '@/lib/rate-limit';

const webhookProcessor = new ProcessWebhook();

export async function POST(request: NextRequest) {
  if (!checkRateLimit(request, { bucketId: 'paddle_webhook', maxRequests: 60, refillMs: 60_000 })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  console.log('Paddle webhook received');
  const signature = request.headers.get('paddle-signature') || '';
  const rawRequestBody = await request.text();
  const privateKey = process.env['PADDLE_NOTIFICATION_WEBHOOK_SECRET'] || '';

  try {
    if (!signature || !rawRequestBody) {
      return Response.json({ error: 'Missing signature from header' }, { status: 400 });
    }

    const paddle = getPaddleInstance();
    const eventData = await paddle.webhooks.unmarshal(rawRequestBody, privateKey, signature);
    const eventName = eventData?.eventType ?? 'Unknown event';

    if (eventData) {
      await webhookProcessor.processEvent(eventData);
    }
    console.log('Paddle webhook processed');

    return Response.json({ status: 200, eventName });
  } catch (e) {
    console.log(e);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
