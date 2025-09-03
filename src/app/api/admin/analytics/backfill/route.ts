import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/utils/database/admin';
import { prisma } from '@/lib/prisma';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';
import { convertAmountFromLowestUnit } from '@/utils/paddle/parse-money';

/**
 * Backfill payments from Paddle to our `payments` table.
 *
 * Use cases:
 * - Bootstrap a new environment with historical data
 * - Repair gaps if webhooks were missed
 *
 * Behavior:
 * - Upserts by `paddleTransactionId`
 * - Always stores `paddleCustomerId`
 * - Links to local `customerId` if available; otherwise leaves null
 */

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const daysParam = parseInt(searchParams.get('days') || '180', 10);
    const daysToBackfill = Number.isFinite(daysParam) && daysParam > 0 ? Math.min(daysParam, 365) : 180;

    const nowUtc = new Date();
    const windowStartUtc = new Date(nowUtc);
    windowStartUtc.setUTCDate(nowUtc.getUTCDate() - daysToBackfill + 1);
    windowStartUtc.setUTCHours(0, 0, 0, 0);

    const paddle = getPaddleInstance();
    const collection = paddle.transactions.list({ perPage: 100, status: ['completed'] });

    let createdOrUpdatedCount = 0;
    const earliestWindowMs = windowStartUtc.getTime();

    while ((collection as unknown as { hasMore: boolean }).hasMore !== false) {
      const pageItems = ((await (collection as unknown as { next: () => Promise<unknown[]> }).next()) ??
        []) as unknown[];
      for (const t of pageItems) {
        const tx = t as {
          id: string;
          createdAt?: string;
          created_at?: string;
          currencyCode?: string;
          currency?: string;
          details?: { totals?: { total?: string | number } };
          status?: string;
          subscriptionId?: string | null;
          customerId?: string | null;
          customer_id?: string | null;
        };
        const created = new Date(tx.createdAt || tx.created_at || new Date().toISOString());
        if (created.getTime() < earliestWindowMs) continue;

        const currency = tx.currencyCode || tx.currency || 'USD';
        const totals = (
          tx as {
            details?: { totals?: { total?: string | number; subtotal?: string | number; tax?: string | number } };
          }
        ).details?.totals;
        const rawTotal = totals?.total ?? '0';
        const rawSubtotal = totals?.subtotal ?? '0';
        const rawTax = totals?.tax ?? '0';
        const amount = convertAmountFromLowestUnit(String(rawTotal), currency);
        const subtotal = convertAmountFromLowestUnit(String(rawSubtotal), currency);
        const tax = convertAmountFromLowestUnit(String(rawTax), currency);

        // Resolve our internal customer by Paddle customer ID
        const paddleCustomerId = tx.customerId || tx.customer_id || undefined;
        if (!paddleCustomerId) continue;
        const customer = await prisma.customer.findUnique({
          where: { paddleCustomerId },
          select: { id: true },
        });
        // We still record payment even if local customer is missing

        await prisma.payment.upsert({
          where: { paddleTransactionId: tx.id },
          update: {
            amount,
            subtotal,
            tax,
            currency,
            status: tx.status || 'completed',
            subscriptionId: tx.subscriptionId || null,
          },
          create: {
            paddleTransactionId: tx.id,
            paddleCustomerId,
            customerId: customer?.id ?? null,
            subscriptionId: tx.subscriptionId || null,
            amount,
            subtotal,
            tax,
            currency,
            status: tx.status || 'completed',
            createdAt: created,
          },
        });
        createdOrUpdatedCount += 1;
      }
      if (!(collection as unknown as { hasMore: boolean }).hasMore) break;
    }

    return NextResponse.json({ success: true, records: createdOrUpdatedCount });
  } catch (error) {
    console.error('Error backfilling payments:', error);
    if (error instanceof Error) {
      if (error.message === 'Authentication required')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      if (error.message === 'Admin access required') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
