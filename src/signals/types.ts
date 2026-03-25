export type Direction = 'BUY' | 'SELL';
export type Timeframe = 'M5' | 'M15' | 'H1' | 'H4' | 'D1';
export type SignalStatus = 'active' | 'hit_tp1' | 'hit_tp2' | 'hit_tp3' | 'stopped' | 'expired';

export interface TradingSignal {
  id: string;
  symbol: string;
  direction: Direction;
  confidence: number;
  entry: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  indicators: IndicatorSummary;
  timeframe: Timeframe;
  timestamp: string;
  status: SignalStatus;
  skill?: string;
}

export interface IndicatorSummary {
  rsi: { value: number; signal: 'oversold' | 'neutral' | 'overbought' };
  macd: { histogram: number; signal: 'bullish' | 'bearish' | 'neutral' };
  ema: { trend: 'up' | 'down' | 'sideways'; ema20: number; ema50: number; ema200: number };
  bollingerBands: { position: 'upper' | 'middle' | 'lower'; bandwidth: number };
  stochastic: { k: number; d: number; signal: 'oversold' | 'neutral' | 'overbought' };
  support: number[];
  resistance: number[];
}

export interface SymbolConfig {
  symbol: string;
  name: string;
  pip: number;
  basePrice: number;
  volatility: number;
}

export interface GatewayConfig {
  scanInterval: number;
  minConfidence: number;
  symbols: string[];
  timeframes: Timeframe[];
  channels: ChannelConfig[];
  skills: string[];
}

export interface ChannelConfig {
  type: 'telegram' | 'discord' | 'webhook';
  enabled: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
  discordWebhookUrl?: string;
  webhookUrl?: string;
}
