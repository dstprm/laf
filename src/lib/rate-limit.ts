type BucketKey = string;

interface Bucket {
  tokens: number;
  lastRefill: number; // epoch ms
}

const buckets = new Map<BucketKey, Bucket>();

function nowMs(): number {
  return Date.now();
}

function getClientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip')?.trim() || 'unknown';
}

export interface RateLimitOptions {
  maxRequests: number; // capacity
  refillMs: number; // window duration
  bucketId: string; // route/category name
}

export function isRateLimitEnabled(): boolean {
  return (process.env.RATE_LIMIT_ENABLED || 'true').toLowerCase() === 'true';
}

/**
 * Simple in-memory token bucket. Adequate for single-instance and dev.
 * In production multi-instance, replace with a shared store (e.g., Upstash Redis).
 */
export function checkRateLimit(request: Request | { headers: Headers }, options: RateLimitOptions): boolean {
  if (!isRateLimitEnabled()) return true;

  const headers = 'headers' in request ? request.headers : new Headers();
  const ip = getClientIp(headers);
  const key: BucketKey = `${options.bucketId}:${ip}`;
  const capacity = Math.max(1, options.maxRequests);
  const refillMs = Math.max(1000, options.refillMs);

  const current = buckets.get(key) || { tokens: capacity, lastRefill: nowMs() };
  const now = nowMs();
  const elapsed = Math.max(0, now - current.lastRefill);
  const refillTokens = Math.floor((elapsed / refillMs) * capacity);
  if (refillTokens > 0) {
    current.tokens = Math.min(capacity, current.tokens + refillTokens);
    current.lastRefill = now;
  }

  if (current.tokens <= 0) {
    buckets.set(key, current);
    return false;
  }

  current.tokens -= 1;
  buckets.set(key, current);
  return true;
}
