import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/utils/database/admin';
import { prisma } from '@/lib/prisma';
import { getTierById } from '@/constants/pricing-tier';

/**
 * POST /api/admin/overrides
 * Body: { userId: string, tierId: 'starter'|'pro'|'advanced', expiresAt?: string | null }
 * - Set or update a user's effective tier override until optional expiration
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { userId, tierId, expiresAt, scope } = body as {
      userId?: string;
      tierId?: string;
      expiresAt?: string | null;
      scope?: 'user' | 'customer';
    };

    if (!userId || !tierId) {
      return NextResponse.json({ error: 'userId and tierId are required' }, { status: 400 });
    }

    const tier = getTierById(tierId);
    if (!tier) {
      return NextResponse.json({ error: 'Invalid tierId' }, { status: 400 });
    }

    if (scope === 'user') {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          overrideTier: tier.id,
          overrideExpiresAt: expiresAt ? new Date(expiresAt) : null,
          updatedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, user: updated });
    }

    // default to customer scope (requires a customer row)
    const customer = await prisma.customer.findUnique({ where: { userId } });
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found for user' }, { status: 404 });
    }
    const updated = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        overrideTier: tier.id,
        overrideExpiresAt: expiresAt ? new Date(expiresAt) : null,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json({ success: true, customer: updated });
  } catch (error) {
    console.error('Error setting override:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/overrides?userId=xxx
 * - Clear a user's override tier
 */
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const scope = (searchParams.get('scope') as 'user' | 'customer') || 'customer';

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (scope === 'user') {
      const updated = await prisma.user.update({
        where: { id: userId || '' },
        data: { overrideTier: null, overrideExpiresAt: null, updatedAt: new Date() },
      });
      return NextResponse.json({ success: true, user: updated });
    }

    const customer = await prisma.customer.findUnique({ where: { userId: userId || '' } });
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found for user' }, { status: 404 });
    }

    const updated = await prisma.customer.update({
      where: { id: customer.id },
      data: { overrideTier: null, overrideExpiresAt: null, updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, customer: updated });
  } catch (error) {
    console.error('Error clearing override:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
