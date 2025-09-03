import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/utils/database/admin';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';
import { convertAmountFromLowestUnit } from '@/utils/paddle/parse-money';

/**
 * Admin Analytics API
 *
 * Returns:
 * - incomeEvolution: daily revenue for the requested window
 * - userCountEvolution: cumulative user count per day
 * - userTypeDistribution: counts by current tier + none
 *
 * Data source selection:
 * - source=db (default): reads aggregated revenue from our `payments` table (fast, reliable)
 * - source=paddle: fetches completed transactions from Paddle and aggregates by day (live, slower)
 */

/** Format a date in UTC YYYY-MM-DD for bucket keys */
function toISODate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const daysParam = parseInt(searchParams.get('days') || '90', 10);
    const rawFrom = searchParams.get('from'); // YYYY-MM-DD
    const rawTo = searchParams.get('to'); // YYYY-MM-DD
    const allHistory = (searchParams.get('all') || 'false').toLowerCase() === 'true';
    const revenueSource = (searchParams.get('source') || 'db').toLowerCase();

    // Determine window start/end
    const todayUtc = new Date();
    todayUtc.setUTCHours(0, 0, 0, 0);
    let windowStartUtc: Date;
    let windowEndUtc: Date;

    if (allHistory) {
      // Window will be refined per-source below. Default to very early epoch to include all.
      windowStartUtc = new Date(0);
      windowEndUtc = new Date();
    } else if (rawFrom || rawTo) {
      const parsedFrom = rawFrom ? new Date(`${rawFrom}T00:00:00.000Z`) : new Date(todayUtc);
      const parsedTo = rawTo ? new Date(`${rawTo}T00:00:00.000Z`) : new Date(todayUtc);
      windowStartUtc = parsedFrom;
      windowEndUtc = parsedTo;
    } else {
      const daysToInclude = Number.isFinite(daysParam) && daysParam > 0 ? Math.min(daysParam, 365) : 90;
      windowEndUtc = new Date(todayUtc);
      windowStartUtc = new Date(todayUtc);
      windowStartUtc.setUTCDate(todayUtc.getUTCDate() - daysToInclude + 1);
    }

    // Normalize start <= end
    if (windowStartUtc.getTime() > windowEndUtc.getTime()) {
      const tmp = windowStartUtc;
      windowStartUtc = windowEndUtc;
      windowEndUtc = tmp;
    }

    // Compute number of days in range (inclusive)
    const daysToInclude = Math.max(
      1,
      Math.min(3650, Math.floor((windowEndUtc.getTime() - windowStartUtc.getTime()) / (24 * 60 * 60 * 1000)) + 1),
    );

    // Income evolution
    const incomeEvolution: Array<{ date: string; revenue: number; revenueExTax?: number }> = [];
    if (revenueSource === 'paddle') {
      // Fetch transactions from Paddle and aggregate by day
      const transactionsCollection = getPaddleInstance().transactions.list({
        // No customer filter to aggregate all revenue
        perPage: 100,
        status: ['completed'],
      });
      const revenueByDayMap = new Map<string, number>();
      const revenueExTaxByDayMap = new Map<string, number>();
      const endTimeUtc = new Date(windowEndUtc);
      const earliestWindowMs = allHistory ? 0 : windowStartUtc.getTime();
      let processedCount = 0;
      // Safety cap to avoid excessive pagination in templates
      const MAX_ITEMS = 5000;
      // Iterate pages until we go past range or hit cap
      while (
        (transactionsCollection as unknown as { hasMore: boolean }).hasMore !== false &&
        processedCount < MAX_ITEMS
      ) {
        const pageItems = ((await (transactionsCollection as unknown as { next: () => Promise<unknown[]> }).next()) ??
          []) as unknown[];
        for (const item of pageItems) {
          processedCount++;
          const tx = item as {
            id: string;
            createdAt?: string;
            created_at?: string;
            updatedAt?: string;
            updated_at?: string;
            currencyCode?: string;
            currency?: string;
            details?: { totals?: { total?: string | number } };
          };
          const created = new Date(
            tx.createdAt || tx.created_at || tx.updatedAt || tx.updated_at || new Date().toISOString(),
          );
          const createdTs = created.getTime();
          if (createdTs < earliestWindowMs) continue;
          if (createdTs > endTimeUtc.getTime()) continue;
          const currency = tx.currencyCode || tx.currency || 'USD';
          const totals = (
            tx as {
              details?: { totals?: { total?: string | number; subtotal?: string | number } };
            }
          ).details?.totals;
          const rawTotal = totals?.total ?? '0';
          const rawSubtotal = totals?.subtotal ?? '0';
          const amount = convertAmountFromLowestUnit(String(rawTotal), currency);
          const amountExTax = convertAmountFromLowestUnit(String(rawSubtotal), currency);
          const bucketKey = toISODate(
            new Date(Date.UTC(created.getUTCFullYear(), created.getUTCMonth(), created.getUTCDate())),
          );
          revenueByDayMap.set(bucketKey, (revenueByDayMap.get(bucketKey) || 0) + amount);
          revenueExTaxByDayMap.set(bucketKey, (revenueExTaxByDayMap.get(bucketKey) || 0) + amountExTax);
        }
        if (!(transactionsCollection as unknown as { hasMore: boolean }).hasMore) break;
      }
      for (let dayOffset = 0; dayOffset < daysToInclude; dayOffset++) {
        const bucketDate = new Date(windowStartUtc);
        bucketDate.setUTCDate(windowStartUtc.getUTCDate() + dayOffset);
        const key = toISODate(bucketDate);
        incomeEvolution.push({
          date: key,
          revenue: revenueByDayMap.get(key) || 0,
          revenueExTax: revenueExTaxByDayMap.get(key) || 0,
        });
      }
    } else {
      // DB-based aggregation
      if (allHistory) {
        // Refine start to earliest payment or user date if available to avoid pre-epoch gaps
        const earliestPayment = await prisma.payment.findFirst({
          orderBy: { createdAt: 'asc' },
          select: { createdAt: true },
        });
        const earliestUser = await prisma.user.findFirst({
          orderBy: { createdAt: 'asc' },
          select: { createdAt: true },
        });
        const earliestDate = [earliestPayment?.createdAt, earliestUser?.createdAt]
          .filter(Boolean)
          .map((d) => (d as Date).getTime());
        if (earliestDate.length) {
          const min = Math.min(...earliestDate);
          windowStartUtc = new Date(min);
          windowStartUtc.setUTCHours(0, 0, 0, 0);
        }
      }
      // NOTE: We intentionally use $queryRaw here instead of Prisma's groupBy because
      // Prisma cannot group by a function of a field (e.g., date_trunc('day', created_at)).
      // Doing the truncation and aggregation in SQL avoids transferring all rows to the
      // application just to bucket by day, which would not scale for large datasets.
      // If the monetary columns migrate to Decimal in the schema, update the casts
      // from ::float to ::numeric and parse accordingly.
      const incomeRows: Array<{ day: Date; revenue: number; revenue_ex_tax: number }> = await prisma.$queryRaw`
        SELECT date_trunc('day', p.created_at) AS day,
               SUM(p.amount)::float AS revenue,
               SUM(p.subtotal)::float AS revenue_ex_tax
        FROM payments p
        WHERE p.status = 'completed'
          AND p.created_at >= ${windowStartUtc}
          AND p.created_at <= ${windowEndUtc}
        GROUP BY day
        ORDER BY day ASC
      `;
      const incomeMap = new Map<string, number>();
      const incomeExTaxMap = new Map<string, number>();
      for (const row of incomeRows) {
        const k = toISODate(new Date(row.day));
        incomeMap.set(k, Number(row.revenue || 0));
        incomeExTaxMap.set(k, Number(row.revenue_ex_tax || 0));
      }
      for (let dayOffset = 0; dayOffset < daysToInclude; dayOffset++) {
        const bucketDate = new Date(windowStartUtc);
        bucketDate.setUTCDate(windowStartUtc.getUTCDate() + dayOffset);
        const key = toISODate(bucketDate);
        incomeEvolution.push({
          date: key,
          revenue: incomeMap.get(key) || 0,
          revenueExTax: incomeExTaxMap.get(key) || 0,
        });
      }
    }

    // User count evolution: cumulative total users per day
    const baseUserCount = await prisma.user.count({ where: { createdAt: { lt: windowStartUtc } } });

    // NOTE: Same rationale as above: we need date_trunc bucketing per day, which
    // Prisma's groupBy does not support directly. SQL-side aggregation keeps
    // network and memory usage low for long ranges.
    const userNewRows: Array<{ day: Date; count: bigint }> = await prisma.$queryRaw`
      SELECT date_trunc('day', u.created_at) AS day,
             COUNT(*)::bigint AS count
      FROM users u
      WHERE u.created_at >= ${windowStartUtc}
        AND u.created_at <= ${windowEndUtc}
      GROUP BY day
      ORDER BY day ASC
    `;

    const newUsersByDayMap = new Map<string, number>();
    for (const row of userNewRows) {
      newUsersByDayMap.set(toISODate(new Date(row.day)), Number(row.count || 0));
    }

    const userCountEvolution: Array<{ date: string; userCount: number }> = [];
    let cumulativeUserCount = baseUserCount;
    for (let dayOffset = 0; dayOffset < daysToInclude; dayOffset++) {
      const bucketDate = new Date(windowStartUtc);
      bucketDate.setUTCDate(windowStartUtc.getUTCDate() + dayOffset);
      const key = toISODate(bucketDate);
      cumulativeUserCount += newUsersByDayMap.get(key) || 0;
      userCountEvolution.push({ date: key, userCount: cumulativeUserCount });
    }

    // User type distribution by tier
    const tierGroups = await prisma.customer.groupBy({
      by: ['currentTier'],
      _count: { _all: true },
    });

    const usersWithoutCustomer = await prisma.user.count({ where: { customer: null } });

    const userTypeDistribution = [...tierGroups.map((g) => ({ type: g.currentTier ?? 'none', count: g._count._all }))];

    const noneIndex = userTypeDistribution.findIndex((t) => t.type === 'none');
    if (noneIndex >= 0) {
      userTypeDistribution[noneIndex] = {
        type: 'none',
        count: userTypeDistribution[noneIndex].count + usersWithoutCustomer,
      };
    } else {
      userTypeDistribution.push({ type: 'none', count: usersWithoutCustomer });
    }

    return NextResponse.json({ incomeEvolution, userCountEvolution, userTypeDistribution });
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    if (error instanceof Error) {
      if (error.message === 'Authentication required')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      if (error.message === 'Admin access required') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
