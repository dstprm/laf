/*
 Seed script to generate trending analytics data:
 - Creates users over the last N days with an upward trend
 - Creates customers for a portion of users with tier distribution (starter, pro, advanced)
 - Creates payments per day with an upward trend; amounts depend on tier

 Idempotency: removes any prior records created by this script (prefix "seed_") before inserting.

 Usage:
   NODE_OPTIONS="--max-old-space-size=2048" node scripts/seed-analytics.mjs
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration
const DAYS = Number(process.env.SEED_DAYS || 60); // days back from today (inclusive)
const MAX_NEW_USERS_PER_DAY = 8; // upper bound for daily new users
const MAX_PAYMENTS_PER_DAY = 12; // upper bound for daily payments
const TAX_RATE = 0.2; // 20% tax for illustrative purposes

// Tier configuration for both distribution and price ranges (subtotal, ex-tax)
const TIERS = {
  starter: { weight: 0.45, min: 10, max: 14 },
  pro: { weight: 0.35, min: 29, max: 49 },
  advanced: { weight: 0.1, min: 99, max: 149 },
  none: { weight: 0.1, min: 0, max: 0 },
};

function pickTier() {
  const r = Math.random();
  let acc = 0;
  for (const [key, cfg] of Object.entries(TIERS)) {
    acc += cfg.weight;
    if (r <= acc) return key;
  }
  return 'starter';
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function trendingInt(dayIndexZeroBased, daysTotal, minValue, maxValue, jitter = 1) {
  const progress = daysTotal <= 1 ? 1 : dayIndexZeroBased / (daysTotal - 1);
  const base = minValue + progress * (maxValue - minValue);
  const noise = (Math.random() * 2 - 1) * jitter;
  return clamp(Math.round(base + noise), minValue, maxValue);
}

function setUtc(date, { h = 0, m = 0, s = 0, ms = 0 } = {}) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), h, m, s, ms));
  return d;
}

function dollarsToRoundedParts(subtotal) {
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const amount = +(subtotal + tax).toFixed(2);
  return { subtotal, tax, amount };
}

async function removePreviousSeededData() {
  // Remove in dependency order: payments -> customers -> users
  await prisma.payment.deleteMany({ where: { paddleTransactionId: { startsWith: 'seed_tx_' } } });
  await prisma.customer.deleteMany({ where: { paddleCustomerId: { startsWith: 'seed_cus_' } } });
  await prisma.user.deleteMany({ where: { clerkUserId: { startsWith: 'seed_user_' } } });
}

async function main() {
  console.log('[seed] Starting analytics seed');
  await removePreviousSeededData();
  console.log('[seed] Cleared previous seeded records');

  // Keep track of created customers to attach payments
  const customersCreated = [];

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (let d = 0; d < DAYS; d++) {
    const bucketDate = new Date(today);
    bucketDate.setUTCDate(today.getUTCDate() - (DAYS - 1 - d));
    const usersForDay = trendingInt(d, DAYS, 1, MAX_NEW_USERS_PER_DAY, 1);
    const paymentsForDay = trendingInt(d, DAYS, 0, MAX_PAYMENTS_PER_DAY, 2);

    // Create users (and some customers) for this day
    for (let i = 0; i < usersForDay; i++) {
      const clerkUserId = `seed_user_${d}_${i}`;
      const email = `seed+${d}-${i}@example.com`;
      const firstName = 'Seed';
      const lastName = `User${d}_${i}`;
      const userCreatedAt = setUtc(bucketDate, { h: 9, m: Math.floor(Math.random() * 50) });

      const user = await prisma.user.create({
        data: {
          clerkUserId,
          email,
          firstName,
          lastName,
          avatar: null,
          isAdmin: false,
          createdAt: userCreatedAt,
        },
        select: { id: true, createdAt: true },
      });

      const tier = pickTier();
      if (tier !== 'none') {
        const paddleCustomerId = `seed_cus_${d}_${i}`;
        const customer = await prisma.customer.create({
          data: {
            paddleCustomerId,
            userId: user.id,
            currentTier: tier,
            createdAt: setUtc(bucketDate, { h: 10 }),
          },
          select: { id: true, createdAt: true, paddleCustomerId: true, currentTier: true },
        });
        customersCreated.push({
          id: customer.id,
          createdAt: customer.createdAt,
          paddleCustomerId: customer.paddleCustomerId,
          tier,
        });
      }
    }

    // Create payments for this day (attach to existing customers up to this date)
    const eligibleCustomers = customersCreated.filter((c) => c.createdAt.getTime() <= bucketDate.getTime());
    for (let j = 0; j < paymentsForDay; j++) {
      if (!eligibleCustomers.length) break;
      const customer = eligibleCustomers[Math.floor(Math.random() * eligibleCustomers.length)];
      const cfg = TIERS[customer.tier] || TIERS.starter;
      const subtotal = +(cfg.min + Math.random() * (cfg.max - cfg.min)).toFixed(2);
      const { amount, tax } = dollarsToRoundedParts(subtotal);

      const createdAt = setUtc(bucketDate, { h: 15, m: Math.floor(Math.random() * 55) });

      await prisma.payment.create({
        data: {
          paddleTransactionId: `seed_tx_${d}_${j}_${Math.floor(Math.random() * 1e6)}`,
          paddleCustomerId: customer.paddleCustomerId,
          customerId: customer.id,
          subscriptionId: Math.random() < 0.7 ? `seed_sub_${customer.id.slice(0, 6)}` : null,
          amount,
          subtotal,
          tax,
          currency: 'USD',
          status: 'completed',
          createdAt,
        },
      });
    }

    if ((d + 1) % 15 === 0 || d === DAYS - 1) {
      console.log(
        `[seed] Day ${d + 1}/${DAYS} — users: ${usersForDay.toString().padStart(2, ' ')}, payments: ${paymentsForDay.toString().padStart(2, ' ')}`,
      );
    }
  }

  console.log(
    `[seed] Finished. Created ~${DAYS} days of data. Users: (varies), Customers: ${customersCreated.length}, Payments: seeded with upward trend.`,
  );
}

main()
  .catch((e) => {
    console.error('[seed] Error:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
