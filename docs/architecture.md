# Architecture

## Overview

tradeclaw-agent is a self-hosted trading signal daemon that scans markets, generates signals using technical indicators, and delivers them to messaging channels.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLI (Commander.js)                    │
│  start │ scan │ status │ signals │ test-channel │ onboard│
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Gateway (Daemon)                       │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │   Config      │  │  Scheduler   │  │ Skill Loader  │ │
│  │   Loader      │  │  (interval)  │  │ (dynamic)     │ │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘ │
│         │                 │                   │         │
│         └─────────┬───────┘───────────────────┘         │
│                   │                                     │
│                   ▼                                     │
│         ┌─────────────────┐                             │
│         │  Signal Engine   │                             │
│         │  ┌─────────────┐│                             │
│         │  │ Indicators  ││  RSI, MACD, EMA,            │
│         │  │ Calculator  ││  Bollinger, Stochastic      │
│         │  └─────────────┘│                             │
│         │  ┌─────────────┐│                             │
│         │  │   Symbol    ││  XAUUSD, BTCUSD,            │
│         │  │   Configs   ││  EURUSD, etc.               │
│         │  └─────────────┘│                             │
│         └────────┬────────┘                             │
│                  │                                      │
│                  ▼                                      │
│         ┌─────────────────┐                             │
│         │ Signal Filter   │  minConfidence threshold    │
│         └────────┬────────┘                             │
│                  │                                      │
│                  ▼                                      │
│    ┌─────────────────────────────┐                      │
│    │     Channel Delivery        │                      │
│    │  ┌──────┐ ┌──────┐ ┌─────┐ │                      │
│    │  │  TG  │ │ DC   │ │ WH  │ │                      │
│    │  └──────┘ └──────┘ └─────┘ │                      │
│    └─────────────────────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### Gateway (`src/gateway/`)

The gateway is the central daemon that orchestrates everything:

- **Config Loader** (`config.ts`): Reads `.tradeclaw/config.json`, merges with defaults, validates settings.
- **Scheduler** (`scheduler.ts`): Runs the scan loop at configurable intervals. Supports immediate scan + recurring timer.
- **Gateway** (`gateway.ts`): Main orchestrator. Loads config → initializes channels → loads skills → starts scheduler → delivers signals.

### Signal Engine (`src/signals/`)

The signal engine generates trading signals:

- **Indicators** (`indicators.ts`): Real mathematical implementations of RSI, MACD, EMA, Bollinger Bands, and Stochastic oscillator.
- **Engine** (`engine.ts`): Generates deterministic price series using seeded PRNG (hourly consistency), computes all indicators, evaluates direction and confidence.
- **Symbols** (`symbols.ts`): Pre-configured trading pairs with pip values, base prices, and volatility parameters.
- **Types** (`types.ts`): Full TypeScript type definitions for signals, indicators, and configuration.

### Channels (`src/channels/`)

Channel adapters deliver signals to messaging platforms:

- **Telegram** (`telegram.ts`): Uses Telegram Bot API. Formats signals as rich markdown messages with emojis and price targets.
- **Discord** (`discord.ts`): Uses Discord webhook API. Sends color-coded rich embeds with all signal fields.
- **Webhook** (`webhook.ts`): Generic HTTP POST. Sends raw JSON signal payloads to any URL.

### Skills (`src/skills/`)

Skills are pluggable signal strategies:

- **Loader** (`loader.ts`): Dynamically discovers and imports skills from the `skills/` directory.
- **Base** (`base.ts`): Interface that all skills implement: `analyze(symbol, timeframes) → TradingSignal[]`.

### CLI (`src/cli/`)

- **CLI** (`cli.ts`): Commander.js-based CLI with commands for start, scan, status, signals, test-channel, and onboard.
- **Onboard** (`onboard.ts`): Interactive wizard that walks through configuration.

## Data Flow

1. **Scheduler fires** → triggers a scan
2. **Engine generates price series** → deterministic via seeded PRNG (hourly seed)
3. **Indicators calculated** → RSI, MACD, EMA, Bollinger, Stochastic
4. **Direction + confidence evaluated** → weighted scoring of all indicators
5. **Skills run** → each skill can generate additional signals with modified confidence
6. **Signals filtered** → by minimum confidence threshold
7. **De-duplicated** → best signal per symbol+timeframe kept
8. **Delivered** → sent to all enabled channels

## Signal Consistency

Signals use a deterministic seeded PRNG based on `symbol + timeframe + hourly_timestamp`. This means:
- Same symbol at the same hour = same signal
- Different hours = different signals
- No external API dependencies for price data

## Extensibility

### Adding a New Skill

1. Create a directory under `skills/`
2. Add `index.ts` exporting a class implementing `BaseSkill`
3. Add the skill name to `config.json` `skills` array
4. The skill loader auto-discovers and loads it

### Adding a New Channel

1. Create a new file in `src/channels/`
2. Implement the `BaseChannel` interface
3. Add the channel type to `createChannel()` factory in `base.ts`
4. Add the type to `ChannelConfig` union in `types.ts`
