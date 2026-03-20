// ─── RATE LIMITER WITH UPSTASH REDIS ───
// Falls back to in-memory if Upstash env vars are not set.
// To enable persistent rate limiting:
// 1. Create a free Redis database at upstash.com
// 2. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to Vercel env vars

const memoryStore = new Map();

async function upstashIncr(key, windowMs) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null; // fall back to memory

  try {
    // Atomic increment + expiry in one pipeline call
    const pipeline = [
      ['INCR', key],
      ['PEXPIRE', key, windowMs]
    ];
    const res = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pipeline),
    });
    const data = await res.json();
    return data[0]?.result ?? null; // returns current count
  } catch {
    return null; // fall back to memory on any error
  }
}

export function rateLimit({ maxRequests = 20, windowMs = 60 * 1000 } = {}) {
  return async function check(req, res) {
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      'unknown';

    const key = `rl:${ip}:${Math.floor(Date.now() / windowMs)}`;

    // Try Upstash first
    const upstashCount = await upstashIncr(key, windowMs);

    if (upstashCount !== null) {
      if (upstashCount > maxRequests) {
        res.status(429).json({ error: 'Too many requests. Please slow down.' });
        return true;
      }
      return false;
    }

    // Fall back to in-memory
    const now = Date.now();
    const record = memoryStore.get(ip);
    if (!record || now - record.start > windowMs) {
      memoryStore.set(ip, { count: 1, start: now });
      return false;
    }
    record.count += 1;
    if (record.count > maxRequests) {
      res.status(429).json({ error: 'Too many requests. Please slow down.' });
      return true;
    }
    return false;
  };
}
