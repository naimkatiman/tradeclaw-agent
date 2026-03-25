import type { TradingSignal, Timeframe } from '../signals/types.js';

/**
 * Base interface for signal strategy skills.
 * Each skill implements a specific trading strategy.
 */
export interface BaseSkill {
  /** Unique skill name (matches directory name) */
  readonly name: string;

  /** Human-readable description */
  readonly description: string;

  /** Skill version */
  readonly version: string;

  /**
   * Generate signals for a given symbol and timeframes.
   * Returns an array of trading signals that pass the skill's criteria.
   */
  analyze(
    symbol: string,
    timeframes: Timeframe[],
  ): TradingSignal[];
}

/**
 * Skill metadata loaded from skill directory.
 */
export interface SkillMeta {
  name: string;
  description: string;
  version: string;
  path: string;
}
