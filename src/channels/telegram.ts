import type { TradingSignal, ChannelConfig } from '../signals/types.js';
import type { BaseChannel } from './base.js';
import { formatNumber, formatDiff, emaTrendText } from './base.js';

/**
 * Telegram Bot API channel adapter.
 * Sends formatted signal messages via the Telegram Bot API.
 */
export class TelegramChannel implements BaseChannel {
  readonly type = 'telegram';
  readonly enabled: boolean;
  private botToken: string;
  private chatId: string;

  constructor(config: ChannelConfig) {
    this.enabled = config.enabled;
    this.botToken = config.telegramBotToken || '';
    this.chatId = config.telegramChatId || '';
  }

  validate(): string | null {
    if (!this.botToken) return 'Telegram bot token is required';
    if (!this.chatId) return 'Telegram chat ID is required';
    if (!this.botToken.includes(':')) return 'Invalid Telegram bot token format (expected BOT_ID:TOKEN)';
    return null;
  }

  async sendSignal(signal: TradingSignal): Promise<boolean> {
    const message = this.formatSignal(signal);
    return this.send(message);
  }

  async sendMessage(text: string): Promise<boolean> {
    return this.send(text);
  }

  private formatSignal(signal: TradingSignal): string {
    const diamond = signal.direction === 'BUY' ? '◆' : '◇';
    const skillName = signal.skill || 'Multi-Indicator';

    const esc = (s: string) => s.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
    const fmt = (n: number) => esc(formatNumber(n));
    const diff = (a: number, b: number) => esc(formatDiff(a, b));

    const lines = [
      `*${diamond} ${signal.direction} ${signal.symbol}*  \\[${signal.confidence}%\\]`,
      `━━━━━━━━━━━━━━━━━━━━━`,
      `▸ Entry    ${fmt(signal.entry)}`,
      `▸ SL       ${fmt(signal.stopLoss)}   ${diff(signal.entry, signal.stopLoss)}`,
      `▸ TP1      ${fmt(signal.takeProfit1)}   ${diff(signal.entry, signal.takeProfit1)}`,
      `▸ TP2      ${fmt(signal.takeProfit2)}   ${diff(signal.entry, signal.takeProfit2)}`,
      `▸ TP3      ${fmt(signal.takeProfit3)}   ${diff(signal.entry, signal.takeProfit3)}`,
      ``,
      `◈ RSI: ${signal.indicators.rsi.value}  ${capitalize(signal.indicators.rsi.signal)}`,
      `◈ MACD: ${capitalize(signal.indicators.macd.signal)}`,
      `◈ EMA: ${emaTrendText(signal.indicators.ema.trend)}`,
      `◉ ${signal.timeframe}  \\|  ${esc(skillName)}`,
      `─────────────────────`,
      `⊕ tradeclaw\\.win`,
    ];

    return lines.join('\n');
  }

  private async send(text: string): Promise<boolean> {
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          text,
          parse_mode: 'MarkdownV2',
          disable_web_page_preview: true,
        }),
      });

      if (!response.ok) {
        // Retry without markdown if parsing fails
        const retryResponse = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: this.chatId,
            text: text.replace(/[*_\[\]()~`>#+\-=|{}.!\\]/g, ''),
            disable_web_page_preview: true,
          }),
        });

        if (!retryResponse.ok) {
          const err = await retryResponse.text();
          console.error(`[telegram] Failed to send message: ${err}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error(`[telegram] Error sending message:`, error);
      return false;
    }
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
