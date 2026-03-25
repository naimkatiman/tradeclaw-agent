# TradingView Webhook Setup Guide

Connect your TradingView alerts to Telegram, Discord, or any webhook using tradeclaw-agent.

**No SaaS. No subscription. Runs on your machine.**

---

## How It Works

```
TradingView Alert
      │
      ▼ HTTP POST (JSON)
tradeclaw-agent server
      │
      ├──▶ Telegram Bot
      ├──▶ Discord Webhook
      └──▶ Any HTTP Endpoint
```

---

## Step 1: Start the webhook server

```bash
tradeclaw-agent server --port 8080
```

You'll see:
```
🦞 tradeclaw-agent webhook server

  Listening on http://0.0.0.0:8080
  TradingView alert URL: http://YOUR_IP:8080/webhook
```

> **Need a public URL?** Use [ngrok](https://ngrok.com) for testing:
> ```bash
> ngrok http 8080
> # Copy the https://xxxx.ngrok.io URL
> ```

---

## Step 2: Configure TradingView alert

1. Open TradingView → create or edit an alert
2. In **"Alert actions"**, enable **"Webhook URL"**
3. Enter your URL: `http://YOUR_IP:8080/webhook`
4. In the **"Message"** field, paste this JSON:

```json
{
  "symbol": "{{ticker}}",
  "action": "{{strategy.order.action}}",
  "price": {{close}},
  "timeframe": "{{interval}}",
  "exchange": "{{exchange}}"
}
```

For Pine Script strategies, use:
```json
{
  "symbol": "{{ticker}}",
  "action": "{{strategy.order.action}}",
  "price": {{strategy.order.price}},
  "timeframe": "{{interval}}",
  "message": "{{strategy.order.comment}}"
}
```

---

## Step 3: Verify it works

Test with curl:
```bash
curl -X POST http://localhost:8080/webhook \
  -H "Content-Type: application/json" \
  -d '{"symbol":"XAUUSD","action":"buy","price":2180.50,"timeframe":"H4"}'
```

You should receive a formatted signal in your Telegram/Discord immediately.

---

## Adding authentication (optional)

Start with a secret:
```bash
tradeclaw-agent server --port 8080 --secret MY_SECRET_KEY
```

Add to TradingView webhook URL:
```
http://YOUR_IP:8080/webhook
```
Add header in TradingView: `X-Webhook-Secret: MY_SECRET_KEY`

---

## VPS / Always-on setup

Run on a $4/month VPS (DigitalOcean, Hetzner, etc.):

```bash
# Install
npm install -g tradeclaw-agent

# Setup config
tradeclaw-agent onboard

# Run as service (PM2)
npm install -g pm2
pm2 start "tradeclaw-agent server --port 8080" --name tradeclaw
pm2 save && pm2 startup
```

---

## Example Telegram output

When TradingView fires an alert, your Telegram receives:

```
📡 TradingView Alert

🟢 BUY XAUUSD  [85%]
───────────────────────
Entry:   2,180.50
SL:      2,169.60  (-$10.90)
TP1:     2,196.80  (+$16.30)
TP2:     2,209.10  (+$28.60)
TP3:     2,226.70  (+$46.20)

📊 Source: TradingView Webhook
⏱  Timeframe: H4
🕐 2026-03-26 14:23 UTC
```

---

## Supported alert formats

tradeclaw-agent accepts both JSON and key=value formats:

**JSON (recommended):**
```json
{"symbol":"EURUSD","action":"sell","price":1.0832}
```

**Key=value:**
```
symbol=EURUSD
action=sell
price=1.0832
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| TradingView can't reach your server | Use ngrok or deploy to a VPS |
| 401 Unauthorized | Check your `--secret` matches the header |
| Signal not delivered to Telegram | Run `tradeclaw-agent test-channel` |
| Wrong symbol format | TradingView sends `BINANCE:BTCUSDT` — we strip the exchange prefix |

---

## Questions?

Open an issue at https://github.com/naimkatiman/tradeclaw-agent/issues
