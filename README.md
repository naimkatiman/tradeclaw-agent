# tradeclaw-agent 🦞

[![Stars](https://img.shields.io/github/stars/naimkatiman/tradeclaw-agent?style=social)](https://github.com/naimkatiman/tradeclaw-agent/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org)
[![npm](https://img.shields.io/badge/npx-tradeclaw--agent-CB3837?logo=npm)](https://npmjs.com/package/tradeclaw-agent)

> **Prefer a web dashboard?** → [TradeClaw](https://github.com/naimkatiman/tradeclaw) — the Docker-deployable web version with live charts.

### Stop paying for signal services. Run your own.

**tradeclaw-agent** is a self-hosted trading signal agent that runs on your machine. It scans forex, crypto, and metals markets, generates signals using real technical indicators, and delivers them straight to your Telegram, Discord, or any webhook. Free. Forever.

No subscriptions. No cloud. No data harvesting. Just signals.

---

## What It Looks Like

```
🟢 BUY XAUUSD  [92%]
───────────────────
Entry:  2,184.50
SL:     2,171.20  (-$13.30)
TP1:    2,198.30  (+$13.80)
TP2:    2,215.80  (+$31.30)
TP3:    2,241.60  (+$57.10)

📊 RSI: 28.4 (Oversold)
📈 MACD: Bullish
〰️ EMA: Uptrend
⏱ Timeframe: H4
🎯 Skill: RSI Divergence
```

That's a real signal delivered to Telegram. Every signal includes entry, stop loss, three take profit targets, and the indicator breakdown that generated it.

---

## 3-Step Setup

```bash
# 1. Run the setup wizard
npx tradeclaw-agent onboard

# 2. Test your channels
npx tradeclaw-agent test-channel

# 3. Start the daemon
npx tradeclaw-agent start
```

That's it. Signals start flowing.

---

## Why This Exists

| | Paid Signal Services | tradeclaw-agent |
|---|---|---|
| **Cost** | $30-200/month | Free forever |
| **Your data** | Sold to brokers | Stays on your machine |
| **Transparency** | Black box | Open source, read the code |
| **Customization** | None | Full — write your own strategies |
| **Channels** | Usually just Telegram | Telegram, Discord, any webhook |
| **Self-hosted** | ❌ | ✅ |
| **Skills/Plugins** | ❌ | ✅ Extensible strategy system |

---

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│              │     │                  │     │   Telegram    │
│  Market      │────▶│  Signal Engine   │────▶│   Discord     │
│  Scanner     │     │                  │     │   Webhook     │
│              │     │  RSI · MACD      │     │              │
└──────────────┘     │  EMA · Bollinger │     └──────────────┘
                     │  Stochastic      │
       ┌─────────────│                  │
       │             └──────────────────┘
       ▼
┌──────────────┐
│   Skills     │
│  (plugins)   │
│              │
│ RSI Diverg.  │
│ MACD Cross.  │
│ Your own...  │
└──────────────┘
```

The daemon runs a scan loop at your configured interval. Each scan:

1. Generates deterministic price series (seeded per hour for consistency)
2. Calculates RSI, MACD, EMA, Bollinger Bands, Stochastic
3. Evaluates direction (BUY/SELL) and confidence (0-100%)
4. Runs loaded skills for specialized analysis
5. Filters by your minimum confidence threshold
6. Delivers to all enabled channels

---

## Supported Channels

| Channel | Status | How |
|---------|--------|-----|
| **Telegram** | ✅ Ready | Bot API — formatted markdown messages |
| **Discord** | ✅ Ready | Webhook — color-coded rich embeds |
| **Webhook** | ✅ Ready | HTTP POST — raw JSON to any URL |
| **WhatsApp** | 🔜 Soon | Via webhook bridge |

---

## Supported Markets

| Symbol | Name | Category |
|--------|------|----------|
| XAUUSD | Gold / USD | Metals |
| XAGUSD | Silver / USD | Metals |
| BTCUSD | Bitcoin / USD | Crypto |
| ETHUSD | Ethereum / USD | Crypto |
| EURUSD | Euro / USD | Forex |
| GBPUSD | GBP / USD | Forex |
| USDJPY | USD / JPY | Forex |
| AUDUSD | AUD / USD | Forex |

---

## Skills System

Skills are pluggable signal strategies. Each skill is a directory with an `index.ts` that implements the `BaseSkill` interface.

### Built-in Skills

- **`rsi-divergence`** — RSI-based signals. Identifies oversold/overbought conditions with trend confirmation. Boosts confidence when RSI aligns with direction.
- **`macd-crossover`** — MACD crossover signals with EMA trend confirmation. Identifies momentum shifts.

### Write Your Own

```typescript
// skills/my-strategy/index.ts
import type { BaseSkill } from '../../src/skills/base.js';
import type { TradingSignal, Timeframe } from '../../src/signals/types.js';

export class MyStrategy implements BaseSkill {
  readonly name = 'my-strategy';
  readonly description = 'My custom strategy';
  readonly version = '0.1.0';

  analyze(symbol: string, timeframes: Timeframe[]): TradingSignal[] {
    // Your analysis logic here
    return [];
  }
}

export default MyStrategy;
```

Add `"my-strategy"` to your config's `skills` array. Done.

---

## CLI Commands

```bash
tradeclaw-agent start          # Start the daemon
tradeclaw-agent scan           # Run one scan, print results, exit
tradeclaw-agent status         # Show current configuration
tradeclaw-agent signals        # Run scan and display signals table
tradeclaw-agent test-channel   # Send test message to all channels
tradeclaw-agent onboard        # Interactive setup wizard
```

---

## Configuration

Config lives at `.tradeclaw/config.json` (local directory or `~/.tradeclaw/config.json`).

```json
{
  "scanInterval": 60,
  "minConfidence": 70,
  "symbols": ["XAUUSD", "XAGUSD", "BTCUSD", "ETHUSD", "EURUSD", "GBPUSD"],
  "timeframes": ["H1", "H4", "D1"],
  "channels": [
    {
      "type": "telegram",
      "enabled": true,
      "telegramBotToken": "YOUR_BOT_TOKEN",
      "telegramChatId": "YOUR_CHAT_ID"
    },
    {
      "type": "discord",
      "enabled": false,
      "discordWebhookUrl": "YOUR_DISCORD_WEBHOOK_URL"
    },
    {
      "type": "webhook",
      "enabled": false,
      "webhookUrl": "https://your-server.com/signals"
    }
  ],
  "skills": ["rsi-divergence", "macd-crossover"]
}
```

### Config Reference

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `scanInterval` | number | `60` | Seconds between scans |
| `minConfidence` | number | `70` | Minimum signal confidence (0-100) |
| `symbols` | string[] | 6 pairs | Trading pairs to scan |
| `timeframes` | string[] | `H1,H4,D1` | Timeframes to analyze |
| `channels` | object[] | `[]` | Channel configurations |
| `skills` | string[] | 2 built-in | Skill names to load |

### Timeframes

| Code | Meaning |
|------|---------|
| `M5` | 5 minutes |
| `M15` | 15 minutes |
| `H1` | 1 hour |
| `H4` | 4 hours |
| `D1` | 1 day |

---

## Technical Indicators

All indicators use real mathematical formulas:

- **RSI** (Relative Strength Index) — Wilder's smoothing, 14-period default
- **MACD** (Moving Average Convergence Divergence) — 12/26/9 standard periods
- **EMA** (Exponential Moving Average) — 20, 50, 200 period trend analysis
- **Bollinger Bands** — 20-period SMA ± 2 standard deviations
- **Stochastic Oscillator** — %K (14-period) and %D (3-period SMA of %K)
- **Support/Resistance** — Pivot point identification from price action

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
# Development
npm install
npm run dev        # Watch mode with auto-reload
npm run build      # Production build
```

---

## License

MIT

---

<p align="center">
  <b>If this saves you from paying for signal services, give it a ⭐</b>
  <br>
  <a href="https://github.com/your-org/tradeclaw-agent">github.com/your-org/tradeclaw-agent</a>
</p>
