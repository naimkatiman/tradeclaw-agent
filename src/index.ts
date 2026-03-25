/**
 * tradeclaw-agent — Self-hosted AI trading signal agent.
 *
 * Entry point for programmatic usage.
 * For CLI usage, see src/cli/cli.ts
 */

export { Gateway } from './gateway/gateway.js';
export { loadConfig, saveConfig, getDefaultConfig } from './gateway/config.js';
export { Scheduler } from './gateway/scheduler.js';
export { runScan, generateSignals, getAvailableSymbols } from './signals/engine.js';
export {
  calculateRSI,
  calculateMACD,
  calculateEMA,
  calculateBollingerBands,
  calculateStochastic,
} from './signals/indicators.js';
export { SYMBOLS, getSymbolConfig, getAllSymbols } from './signals/symbols.js';
export { SkillLoader } from './skills/loader.js';
export { createChannel } from './channels/base.js';

export type {
  TradingSignal,
  IndicatorSummary,
  SymbolConfig,
  GatewayConfig,
  ChannelConfig,
  Direction,
  Timeframe,
  SignalStatus,
} from './signals/types.js';

export type { BaseSkill, SkillMeta } from './skills/base.js';
export type { BaseChannel } from './channels/base.js';
