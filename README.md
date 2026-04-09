# tradeclaw-agent 🦞

[![Stars](https://img.shields.io/github/stars/naimkatiman/tradeclaw-agent?style=social)](https://github.com/naimkatiman/tradeclaw-agent/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org)

[![npm version](https://img.shields.io/npm/v/tradeclaw-agent.svg)](https://npmjs.com/package/tradeclaw-agent)
[![npm downloads](https://img.shields.io/npm/dm/tradeclaw-agent.svg)](https://npmjs.com/package/tradeclaw-agent)
[![CI](https://github.com/naimkatiman/tradeclaw-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/naimkatiman/tradeclaw-agent/actions/workflows/ci.yml)

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

## 📡 TradingView Integration

Already using TradingView? Bridge your alerts directly to Telegram or Discord — no SaaS, no middleman.

```bash
# Start the webhook receiver
tradeclaw-agent server --port 8080
```

Then set your TradingView alert webhook URL to `http://YOUR_IP:8080/webhook` with this message body:

```json
{
  "symbol": "{{ticker}}",
  "action": "{{strategy.order.action}}",
  "price": {{close}},
  "timeframe": "{{interval}}"
}
```

Your Telegram/Discord receives a formatted signal instantly when TradingView fires. [Full setup guide →](docs/tradingview-setup.md)

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
tradeclaw-agent scan           # Run one scan with live prices, print results
tradeclaw-agent status         # Show current configuration
tradeclaw-agent signals        # Run scan + display signals table + accuracy
tradeclaw-agent history        # Show signal history and win rate
tradeclaw-agent prices         # Show current live prices from all sources
tradeclaw-agent test-channel   # Send test message to all channels
tradeclaw-agent onboard        # Interactive setup wizard
```

---

## Live Price Feeds

tradeclaw-agent fetches **real-time prices from free public APIs** on every scan:

| Market | API | Symbols |
|--------|-----|---------|
| Crypto | [CoinGecko](https://www.coingecko.com/api) | BTC, ETH, SOL, XRP |
| Metals | [stooq](https://stooq.com) + [metals.live](https://metals.live) | XAUUSD (Gold), XAGUSD (Silver) |
| Forex  | [ExchangeRate API](https://open.er-api.com) | EUR/USD, GBP/USD, USD/JPY, AUD/USD |

Prices are cached for 30 seconds to respect rate limits. If any API is unreachable, the engine **gracefully falls back to seeded prices** — scans never crash.

```bash
$ tradeclaw-agent prices
✅ Loaded 10 symbols

  🪙 Metals  XAUUSD=4,711.90  XAGUSD=73.8810
  ₿ Crypto  BTCUSD=70,949.00  ETHUSD=2,178.07  SOLUSD=82.10  XRPUSD=1.3300
  💱 Forex   EURUSD=1.1677  GBPUSD=1.3416  USDJPY=158.5290  AUDUSD=0.70452
```

---

## Signal Accuracy Tracking

Every generated signal is persisted to `~/.tradeclaw/signal-history.jsonl` (one JSON per line). Query your historical accuracy at any time:

```bash
$ tradeclaw-agent history

  📊 Overall Stats
  Total signals:    142
  Win rate:         68%
  Best symbol:      XAUUSD
  Best skill:       rsi-divergence
```

Each record includes: `id`, `symbol`, `direction`, `confidence`, `entry`, `tp1/tp2/tp3`, `sl`, `timestamp`, `skill`, plus optional `closed_at`, `result`, `pnl_pips` for closed trades.

---

## Use as an OpenClaw Skill

If you use [OpenClaw](https://github.com/openclaw/openclaw), install tradeclaw-agent as a skill:

```bash
clawhub install tradeclaw-agent
```

Then ask your agent:

- "scan signals" → full market scan with live prices
- "show me XAUUSD signals" → signals for a specific symbol
- "show prices" → current live prices from all sources
- "signal history" → historical accuracy stats

See [`openclaw-skill/README.md`](./openclaw-skill/README.md) for details.

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

## 🗺️ Roadmap

| Version | Features |
|---------|----------|
| **v0.1.0** ✅ | Signal engine, Telegram/Discord/Webhook, CLI, Skills |
| **v0.2.0** 🔄 | Live prices, accuracy tracking, OpenClaw skill |
| **v0.3.0** 📋 | TradingView webhook bridge |
| **v0.4.0** 📋 | Multi-exchange price feeds (Binance, Kraken, Bybit) |
| **v1.0.0** 📋 | Docker image, PM2 integration, full test suite |

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=naimkatiman/tradeclaw-agent&type=Date)](https://star-history.com/#naimkatiman/tradeclaw-agent&Date)

---

<p align="center">
  <b>If this saves you from paying for signal services, give it a ⭐</b>
  <br>
  <a href="https://github.com/naimkatiman/tradeclaw-agent">github.com/naimkatiman/tradeclaw-agent</a>
</p>

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=naimkatiman/tradeclaw-agent&type=Date)](https://star-history.com/#naimkatiman/tradeclaw-agent&Date)
