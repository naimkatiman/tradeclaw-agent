# Changelog

All notable changes are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

---

## [Unreleased]

### Planned
- npm publish (global `npx tradeclaw-agent`)
- Docker image
- Multi-exchange feeds (Binance WS, Kraken, Bybit)
- PM2 / systemd service templates
- Full test suite

---

## [0.2.0] — 2026-03-26

### Added
- **Live price feeds** — real-time prices from CoinGecko (crypto), metals.live (gold/silver), ExchangeRate API (forex). Falls back to seeded prices if APIs are unavailable.
- **`tradeclaw-agent prices`** — new command to print current live prices for all tracked symbols
- **Signal accuracy tracker** — every signal is logged to `~/.tradeclaw/signal-history.jsonl`
- **`tradeclaw-agent history`** — shows total signals generated, win rate, best symbol, best skill
- **TradingView webhook bridge** — `tradeclaw-agent server --port 8080` receives TradingView alerts and re-delivers to Telegram/Discord. Supports JSON and key=value alert formats.
- **OpenClaw skill** — `openclaw-skill/` directory allows installation via `clawhub install tradeclaw-agent`
- **Roadmap** — `docs/roadmap.md` with v0.1–v1.0 feature plan
- **TradingView setup guide** — `docs/tradingview-setup.md` with step-by-step screenshots

### Changed
- Signal engine now uses live prices from APIs instead of hour-seeded mock prices
- README updated with TradingView integration section, star history chart, roadmap table

---

## [0.1.0] — 2026-03-25

### Initial public release

**Signal Engine**
- BUY/SELL signals for 8 assets: XAUUSD, XAGUSD, BTCUSD, ETHUSD, XRPUSD, EURUSD, GBPUSD, USDJPY
- Real mathematical indicator calculations: RSI (Wilder's), MACD (12/26/9), EMA, Bollinger Bands (SMA ± 2σ), Stochastic Oscillator, Support/Resistance
- Confidence scoring (0–100%) based on indicator alignment
- Multi-timeframe support (M5, M15, H1, H4, D1)

**Channels**
- Telegram Bot (formatted markdown signal messages)
- Discord Webhook (rich color-coded embeds)
- Generic HTTP Webhook (JSON payload)

**CLI**
- `tradeclaw-agent start` — daemon mode
- `tradeclaw-agent scan` — one-shot scan
- `tradeclaw-agent signals` — tabular signal display
- `tradeclaw-agent status` — config display
- `tradeclaw-agent test-channel` — channel delivery test
- `tradeclaw-agent onboard` — interactive setup wizard

**Skills System**
- `skills/rsi-divergence/` — RSI divergence strategy
- `skills/macd-crossover/` — MACD crossover strategy
- Dynamic skill loading from `skills/` directory

**Infrastructure**
- TypeScript 5 throughout
- ESM modules
- GitHub Actions CI (Node 18/20/22)
- `.tradeclaw.example.json` config template

---

[Unreleased]: https://github.com/naimkatiman/tradeclaw-agent/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/naimkatiman/tradeclaw-agent/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/naimkatiman/tradeclaw-agent/releases/tag/v0.1.0
