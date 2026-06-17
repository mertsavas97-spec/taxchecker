const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const globalRateLimit = globalThis as typeof globalThis & {
  __taxcheckerContactRateLimit?: Map<string, RateLimitEntry>;
};

function getStore(): Map<string, RateLimitEntry> {
  if (!globalRateLimit.__taxcheckerContactRateLimit) {
    globalRateLimit.__taxcheckerContactRateLimit = new Map();
  }
  return globalRateLimit.__taxcheckerContactRateLimit;
}

export function checkContactRateLimit(key: string): {
  allowed: boolean;
  retryAfterSeconds?: number;
} {
  const store = getStore();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  store.set(key, entry);
  return { allowed: true };
}

export function resetContactRateLimitForTests(): void {
  delete globalRateLimit.__taxcheckerContactRateLimit;
}
