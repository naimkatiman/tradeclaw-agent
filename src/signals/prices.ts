/**
 * Live price fetcher with 30-second cache and graceful fallback.
 * Fetches real-time prices from free APIs:
 * - Crypto: CoinGecko
 * - Metals: metals.live
 * - Forex: ExchangeRate API (open.er-api.com)
 */

interface PriceCache {
  prices: Map<string, number>;
  timestamp: number;
}

const CACHE_TTL_MS = 30_000; // 30 seconds
let cache: PriceCache | null = null;

/** CoinGecko ID mapping for crypto symbols */
const COINGECKO_MAP: Record<string, string> = {
  BTCUSD: 'bitcoin',
  ETHUSD: 'ethereum',
  XRPUSD: 'ripple',
  SOLUSD: 'solana',
};

/** Fallback prices — used when all APIs are unreachable. Never crash. */
const FALLBACK_PRICES: Record<string, number> = {
  XAUUSD: 3020.0,
  XAGUSD: 33.5,
  BTCUSD: 87000.0,
  ETHUSD: 2050.0,
  XRPUSD: 2.45,
  SOLUSD: 140.0,
  EURUSD: 1.0790,
  GBPUSD: 1.2920,
  USDJPY: 150.30,
  AUDUSD: 0.6290,
};

/**
 * Fetch a URL with a timeout. Uses the global `fetch` (Node 18+).
 */
async function fetchWithTimeout(url: string, timeoutMs: number = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ── Individual API fetchers ─────────────────────────────────────────────

async function fetchCryptoPrices(prices: Map<string, number>): Promise<void> {
  const ids = Object.values(COINGECKO_MAP).join(',');
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return;

  const data = (await res.json()) as Record<string, { usd?: number }>;
  for (const [symbol, coinId] of Object.entries(COINGECKO_MAP)) {
    const usd = data[coinId]?.usd;
    if (typeof usd === 'number' && usd > 0) {
      prices.set(symbol, usd);
    }
  }
}

async function fetchGoldPrice(prices: Map<string, number>): Promise<void> {
  const res = await fetchWithTimeout('https://api.metals.live/v1/spot/gold');
  if (!res.ok) return;

  const data = (await res.json()) as Array<{ price?: number }>;
  if (Array.isArray(data) && data.length > 0 && typeof data[0].price === 'number') {
    prices.set('XAUUSD', data[0].price);
  }
}

async function fetchSilverPrice(prices: Map<string, number>): Promise<void> {
  const res = await fetchWithTimeout('https://api.metals.live/v1/spot/silver');
  if (!res.ok) return;

  const data = (await res.json()) as Array<{ price?: number }>;
  if (Array.isArray(data) && data.length > 0 && typeof data[0].price === 'number') {
    prices.set('XAGUSD', data[0].price);
  }
}

async function fetchForexPrices(prices: Map<string, number>): Promise<void> {
  const res = await fetchWithTimeout('https://open.er-api.com/v6/latest/USD');
  if (!res.ok) return;

  const data = (await res.json()) as { rates?: Record<string, number> };
  const rates = data.rates;
  if (!rates) return;

  // The API returns "1 USD = X foreign". For XXX/USD pairs we need the inverse.
  if (rates.EUR) prices.set('EURUSD', Number((1 / rates.EUR).toFixed(5)));
  if (rates.GBP) prices.set('GBPUSD', Number((1 / rates.GBP).toFixed(5)));
  if (rates.JPY) prices.set('USDJPY', Number(rates.JPY.toFixed(3)));
  if (rates.AUD) prices.set('AUDUSD', Number((1 / rates.AUD).toFixed(5)));
}

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Fetch live prices from all sources.
 * Returns a Map of symbol → current USD price.
 * Falls back to seeded prices if any API fails (never crashes).
 * Caches results for 30 seconds to avoid rate limits.
 */
export async function fetchLivePrices(): Promise<Map<string, number>> {
  // Return cache if still valid
  if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return new Map(cache.prices);
  }

  const prices = new Map<string, number>();

  // Seed with fallback prices first
  for (const [symbol, price] of Object.entries(FALLBACK_PRICES)) {
    prices.set(symbol, price);
  }

  // Fetch all sources in parallel — failures are silently swallowed
  await Promise.allSettled([
    fetchCryptoPrices(prices),
    fetchGoldPrice(prices),
    fetchSilverPrice(prices),
    fetchForexPrices(prices),
  ]);

  // Update cache
  cache = { prices: new Map(prices), timestamp: Date.now() };

  return prices;
}

/**
 * Get a single live price for a symbol (uses cached batch).
 */
export async function getLivePrice(symbol: string): Promise<number | undefined> {
  const prices = await fetchLivePrices();
  return prices.get(symbol.toUpperCase());
}

/**
 * Force-clear the cache (useful for testing).
 */
export function invalidatePriceCache(): void {
  cache = null;
}
