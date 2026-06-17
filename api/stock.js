/**
 * api/stock.js  — Vercel Serverless Function
 *
 * Place this file at:  /api/stock.js  in your Vercel project root.
 *
 * It proxies Yahoo Finance v8/finance/chart from the SERVER side,
 * so your React component never touches Yahoo directly (no CORS, no cookies needed).
 *
 * Usage from browser:
 *   GET /api/stock?symbol=IDEA.NS&range=1y&interval=1d
 *   GET /api/stock?symbol=USDINR=X&range=5d&interval=1d
 *   GET /api/stock?symbol=^NSEI&range=5d&interval=1d
 *
 * Returns:  { meta, closes, highs, lows, opens, volumes, timestamps }
 * On error: { error: "message" }  with appropriate HTTP status
 *
 * No API key required. Free forever on Vercel hobby plan.
 * Rate limit: Yahoo allows ~2000 req/day from a single server IP —
 *             more than enough for a personal/small-team tool.
 */

export const config = {
  // Edge runtime is faster and has no cold start, but it does NOT support
  // Node http.  Use the default (Node.js) runtime so we can set full headers.
  runtime: "nodejs",
};

// Yahoo Finance v8 chart endpoint — works server-side without a crumb
const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart/";

// Browser-like headers — Yahoo rejects requests without a realistic User-Agent
const YAHOO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "*/*",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  Referer: "https://finance.yahoo.com/",
  Origin: "https://finance.yahoo.com",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

export default async function handler(req, res) {
  // ── CORS headers so your React app (any origin) can call this route ──────
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { symbol, range = "1y", interval = "1d" } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: "Missing required query param: symbol" });
  }

  // Sanitise — only allow alphanumeric, dots, hyphens, carets, equals
  const safeSymbol = symbol.replace(/[^A-Za-z0-9.\-^=]/g, "");
  if (!safeSymbol) {
    return res.status(400).json({ error: "Invalid symbol" });
  }

  const yahooUrl = `${YAHOO_BASE}${encodeURIComponent(safeSymbol)}?interval=${interval}&range=${range}&includePrePost=false`;

  try {
    const yahooRes = await fetch(yahooUrl, {
      headers: YAHOO_HEADERS,
      // 8 second timeout — Vercel serverless limit is 10s on hobby plan
      signal: AbortSignal.timeout(8000),
    });

    if (!yahooRes.ok) {
      const text = await yahooRes.text().catch(() => "");
      return res.status(yahooRes.status).json({
        error: `Yahoo Finance returned HTTP ${yahooRes.status}`,
        detail: text.slice(0, 200),
      });
    }

    const data = await yahooRes.json();
    const result = data?.chart?.result?.[0];

    if (!result) {
      const errMsg = data?.chart?.error?.description || "No data returned for this symbol";
      return res.status(404).json({ error: errMsg });
    }

    const meta = result.meta;
    const q = result.indicators.quote[0];
    const adj = result.indicators?.adjclose?.[0]?.adjclose || null;

    // ── Shape the response — keep it lean ──────────────────────────────────
    const payload = {
      symbol: meta.symbol,
      longName: meta.longName || meta.shortName || safeSymbol,
      currency: meta.currency || "INR",
      exchangeName: meta.exchangeName || "",

      // Real-time snapshot (only populated during market hours)
      currentPrice: meta.regularMarketPrice ?? null,
      previousClose: meta.chartPreviousClose ?? meta.previousClose ?? null,
      open: meta.regularMarketOpen ?? null,
      dayHigh: meta.regularMarketDayHigh ?? null,
      dayLow: meta.regularMarketDayLow ?? null,
      volume: meta.regularMarketVolume ?? null,
      marketCap: meta.marketCap ?? null,
      trailingPE: meta.trailingPE ?? null,

      // 52-week derived from the historical series (more reliable than meta)
      high52: q.high ? Math.max(...q.high.filter(Boolean)) : null,
      low52: q.low ? Math.min(...q.low.filter(Boolean)) : null,

      // Full historical series for technical indicator calculation
      timestamps: result.timestamp || [],
      closes: q.close || [],
      highs: q.high || [],
      lows: q.low || [],
      opens: q.open || [],
      volumes: q.volume || [],
      adjCloses: adj || [],
    };

    // Cache 5 minutes on CDN — avoids hammering Yahoo during refreshes
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    return res.status(200).json(payload);
  } catch (err) {
    if (err.name === "TimeoutError") {
      return res.status(504).json({ error: "Yahoo Finance request timed out" });
    }
    console.error("[api/stock] Error:", err.message);
    return res.status(500).json({ error: "Internal server error", detail: err.message });
  }
}