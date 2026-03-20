// Simple in-memory rate limiter for Vercel Serverless Functions
// Limits each IP to maxRequests per windowMs
// Note: resets on cold starts — for production scale, replace with Redis/Upstash

const store = new Map();

export function rateLimit({ maxRequests = 20, windowMs = 60 * 1000 } = {}) {
  return function check(req, res) {
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      'unknown';

    const now = Date.now();
    const key = `${ip}`;
    const record = store.get(key);

    if (!record || now - record.start > windowMs) {
      store.set(key, { count: 1, start: now });
      return false; // not rate limited
    }

    record.count += 1;

    if (record.count > maxRequests) {
      res.status(429).json({
        error: 'Too many requests. Please slow down.',
      });
      return true; // is rate limited
    }

    return false;
  };
}
