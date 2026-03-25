import type { SymbolConfig } from './types.js';

export const SYMBOLS: Record<string, SymbolConfig> = {
  XAUUSD: {
    symbol: 'XAUUSD',
    name: 'Gold / US Dollar',
    pip: 0.01,
    basePrice: 2180.00,
    volatility: 0.008,
  },
  XAGUSD: {
    symbol: 'XAGUSD',
    name: 'Silver / US Dollar',
    pip: 0.001,
    basePrice: 24.80,
    volatility: 0.012,
  },
  BTCUSD: {
    symbol: 'BTCUSD',
    name: 'Bitcoin / US Dollar',
    pip: 0.01,
    basePrice: 68500.00,
    volatility: 0.025,
  },
  ETHUSD: {
    symbol: 'ETHUSD',
    name: 'Ethereum / US Dollar',
    pip: 0.01,
    basePrice: 3450.00,
    volatility: 0.030,
  },
  EURUSD: {
    symbol: 'EURUSD',
    name: 'Euro / US Dollar',
    pip: 0.0001,
    basePrice: 1.0850,
    volatility: 0.004,
  },
  GBPUSD: {
    symbol: 'GBPUSD',
    name: 'British Pound / US Dollar',
    pip: 0.0001,
    basePrice: 1.2650,
    volatility: 0.005,
  },
  USDJPY: {
    symbol: 'USDJPY',
    name: 'US Dollar / Japanese Yen',
    pip: 0.01,
    basePrice: 151.50,
    volatility: 0.004,
  },
  AUDUSD: {
    symbol: 'AUDUSD',
    name: 'Australian Dollar / US Dollar',
    pip: 0.0001,
    basePrice: 0.6550,
    volatility: 0.006,
  },
};

export function getSymbolConfig(symbol: string): SymbolConfig | undefined {
  return SYMBOLS[symbol.toUpperCase()];
}

export function getAllSymbols(): string[] {
  return Object.keys(SYMBOLS);
}
