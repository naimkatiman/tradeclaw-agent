import type { TradingSignal, ChannelConfig } from '../signals/types.js';

/**
 * Base interface for all channel adapters.
 * Each channel (Telegram, Discord, Webhook) implements this interface.
 */
export interface BaseChannel {
  /** Channel type identifier */
  readonly type: string;

  /** Whether this channel is currently enabled */
  readonly enabled: boolean;

  /**
   * Send a trading signal to this channel.
   * Returns true if the message was sent successfully.
   */
  sendSignal(signal: TradingSignal): Promise<boolean>;

  /**
   * Send a plain text message to this channel.
   * Used for test messages, status updates, etc.
   */
  sendMessage(text: string): Promise<boolean>;

  /**
   * Validate that the channel configuration is correct.
   * Returns an error message if invalid, null if valid.
   */
  validate(): string | null;
}

/**
 * Format a number with commas for display.
 */
export function formatNumber(value: number, decimals?: number): string {
  if (decimals !== undefined) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  // Auto-detect decimals based on value
  if (value >= 1000) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else if (value >= 1) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    });
  } else {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 5,
      maximumFractionDigits: 5,
    });
  }
}

/**
 * Format the price difference for display.
 */
export function formatDiff(entry: number, target: number): string {
  const diff = target - entry;
  const sign = diff >= 0 ? '+' : '-';
  return `${sign}$${formatNumber(Math.abs(diff))}`;
}

/**
 * Get the emoji for RSI signal.
 */
export function rsiEmoji(signal: string): string {
  switch (signal) {
    case 'oversold': return '🟢';
    case 'overbought': return '🔴';
    default: return '🟡';
  }
}

/**
 * Get the EMA trend display text.
 */
export function emaTrendText(trend: string): string {
  switch (trend) {
    case 'up': return 'Uptrend';
    case 'down': return 'Downtrend';
    default: return 'Sideways';
  }
}

/**
 * Create a channel adapter from configuration.
 */
export async function createChannel(config: ChannelConfig): Promise<BaseChannel | null> {
  if (!config.enabled) return null;

  switch (config.type) {
    case 'telegram': {
      const { TelegramChannel } = await import('./telegram.js');
      return new TelegramChannel(config);
    }
    case 'discord': {
      const { DiscordChannel } = await import('./discord.js');
      return new DiscordChannel(config);
    }
    case 'webhook': {
      const { WebhookChannel } = await import('./webhook.js');
      return new WebhookChannel(config);
    }
    default:
      return null;
  }
}
