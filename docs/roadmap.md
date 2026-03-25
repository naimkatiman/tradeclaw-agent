# tradeclaw-agent Roadmap

## Vision
The OpenClaw of trading — a self-hosted agent daemon that delivers signals to your channels, learns from results, and grows smarter over time.

## v0.1.0 — Foundation (shipped)
- Signal engine: RSI, MACD, EMA, Bollinger Bands, Stochastic
- Channels: Telegram, Discord, HTTP Webhook
- CLI: start, scan, signals, onboard, test-channel
- Skills: rsi-divergence, macd-crossover
- Config: `.tradeclaw/config.json`

## v0.2.0 — Live Data + Accuracy (in progress)
- [ ] Real-time prices via CoinGecko + metals.live + ExchangeRate API
- [ ] Signal history tracking (`~/.tradeclaw/signal-history.jsonl`)
- [ ] Accuracy stats (`tradeclaw-agent history`)
- [ ] OpenClaw skill integration
- [ ] npm publish ready

## v0.3.0 — TradingView Integration (next)
The killer feature: receive TradingView alerts → re-deliver to your channels.

TradingView has 50M+ users. Many use Pine Script alerts. Currently there's NO
open-source tool that bridges TradingView alerts → Telegram/Discord with:
- Signal formatting
- Accuracy tracking
- Multi-channel delivery
- Self-hosted (no SaaS middleman)

Features:
- [ ] Webhook server (`tradeclaw-agent server --port 8080`)
- [ ] TradingView alert parser (JSON format)
- [ ] Auto-format TradingView signals like native signals
- [ ] docs/tradingview-setup.md (step-by-step guide with screenshots)

## v0.4.0 — Multi-Exchange Price Feeds
- [ ] Binance WebSocket real-time prices
- [ ] Kraken API
- [ ] Bybit API  
- [ ] Auto-fallback chain: exchange → CoinGecko → metals.live → cache

## v0.5.0 — Signal Accuracy Leaderboard
- [ ] Public accuracy dashboard (static site generated from history)
- [ ] Configurable public URL to share your accuracy
- [ ] Compare across different configurations

## v1.0.0 — Production Ready
- [ ] PM2 / systemd service integration
- [ ] Docker image
- [ ] Full test suite
- [ ] Docs site

## The Star Growth Strategy

**Why people will star this:**
1. "npx tradeclaw-agent onboard" → Telegram in 60 seconds (no Python, no venv)
2. TradingView bridge → hits 50M TradingView users
3. OpenClaw skill → hits OpenClaw community
4. Real accuracy tracking → credibility that paid services don't offer

**Distribution:**
- r/algotrading (1.4M members)
- r/selfhosted (550k members)  
- r/Forex, r/CryptoCurrency
- Hacker News "Show HN"
- OpenClaw Discord
- Product Hunt
