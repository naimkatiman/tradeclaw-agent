import type { TradingSignal, ChannelConfig } from '../signals/types.js';
import type { BaseChannel } from './base.js';
import { formatNumber, formatDiff, emaTrendText } from './base.js';

/**
 * Discord Webhook channel adapter.
 * Sends rich embed messages via Discord webhook URL.
 */
export class DiscordChannel implements BaseChannel {
  readonly type = 'discord';
  readonly enabled: boolean;
  private webhookUrl: string;

  constructor(config: ChannelConfig) {
    this.enabled = config.enabled;
    this.webhookUrl = config.discordWebhookUrl || '';
  }

  validate(): string | null {
    if (!this.webhookUrl) return 'Discord webhook URL is required';
    if (!this.webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      return 'Invalid Discord webhook URL format';
    }
    return null;
  }

  async sendSignal(signal: TradingSignal): Promise<boolean> {
    const embed = this.buildEmbed(signal);
    return this.send({ embeds: [embed] });
  }

  async sendMessage(text: string): Promise<boolean> {
    return this.send({ content: text });
  }

  private buildEmbed(signal: TradingSignal): Record<string, unknown> {
    const isBuy = signal.direction === 'BUY';
    const color = isBuy ? 0x00c853 : 0xff1744; // green / red
    const dirEmoji = isBuy ? '🟢' : '🔴';
    const skillName = signal.skill || 'Multi-Indicator';

    return {
      title: `${dirEmoji} ${signal.direction} ${signal.symbol} [${signal.confidence}%]`,
      color,
      fields: [
        {
          name: '📍 Entry',
          value: formatNumber(signal.entry),
          inline: true,
        },
        {
          name: '🛑 Stop Loss',
          value: `${formatNumber(signal.stopLoss)} (${formatDiff(signal.entry, signal.stopLoss)})`,
          inline: true,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: true,
        },
        {
          name: '🎯 TP1',
          value: `${formatNumber(signal.takeProfit1)} (${formatDiff(signal.entry, signal.takeProfit1)})`,
          inline: true,
        },
        {
          name: '🎯 TP2',
          value: `${formatNumber(signal.takeProfit2)} (${formatDiff(signal.entry, signal.takeProfit2)})`,
          inline: true,
        },
        {
          name: '🎯 TP3',
          value: `${formatNumber(signal.takeProfit3)} (${formatDiff(signal.entry, signal.takeProfit3)})`,
          inline: true,
        },
        {
          name: '📊 Indicators',
          value: [
            `RSI: ${signal.indicators.rsi.value} (${capitalize(signal.indicators.rsi.signal)})`,
            `MACD: ${capitalize(signal.indicators.macd.signal)}`,
            `EMA: ${emaTrendText(signal.indicators.ema.trend)}`,
            `Stochastic: K=${signal.indicators.stochastic.k} D=${signal.indicators.stochastic.d}`,
          ].join('\n'),
          inline: false,
        },
        {
          name: '⏱ Timeframe',
          value: signal.timeframe,
          inline: true,
        },
        {
          name: '🎯 Strategy',
          value: skillName,
          inline: true,
        },
      ],
      footer: {
        text: `tradeclaw-agent • ${new Date(signal.timestamp).toLocaleString()}`,
      },
      timestamp: signal.timestamp,
    };
  }

  private async send(payload: Record<string, unknown>): Promise<boolean> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error(`[discord] Failed to send message: ${err}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`[discord] Error sending message:`, error);
      return false;
    }
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
