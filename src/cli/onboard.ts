import { createInterface } from 'node:readline';
import { saveConfig } from '../gateway/config.js';
import { getAllSymbols } from '../signals/symbols.js';
import type { GatewayConfig, ChannelConfig, Timeframe } from '../signals/types.js';

/**
 * Interactive setup wizard for tradeclaw-agent.
 */
export async function runOnboarding(): Promise<void> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (question: string): Promise<string> =>
    new Promise(resolve => rl.question(question, resolve));

  console.log('');
  console.log('  ╔═══════════════════════════════════════╗');
  console.log('  ║     tradeclaw-agent setup wizard      ║');
  console.log('  ╚═══════════════════════════════════════╝');
  console.log('');
  console.log('  Let\'s configure your trading signal agent.');
  console.log('  Press Enter to accept defaults shown in [brackets].');
  console.log('');

  // Scan interval
  const intervalStr = await ask('  ⏱  Scan interval in seconds [60]: ');
  const scanInterval = parseInt(intervalStr) || 60;

  // Symbols
  const allSymbols = getAllSymbols();
  console.log(`\n  Available symbols: ${allSymbols.join(', ')}`);
  const symbolsStr = await ask(`  📊 Symbols to watch [${allSymbols.join(',')}]: `);
  const symbols = symbolsStr.trim()
    ? symbolsStr.split(',').map(s => s.trim().toUpperCase())
    : allSymbols;

  // Timeframes
  const defaultTimeframes = 'H1,H4,D1';
  const timeframesStr = await ask(`  ⏰ Timeframes [${defaultTimeframes}]: `);
  const timeframes = (timeframesStr.trim() || defaultTimeframes)
    .split(',')
    .map(t => t.trim() as Timeframe);

  // Min confidence
  const confidenceStr = await ask('  🎯 Minimum confidence threshold (0-100) [70]: ');
  const minConfidence = parseInt(confidenceStr) || 70;

  // Channels
  const channels: ChannelConfig[] = [];

  // Telegram
  console.log('');
  const telegramEnabled = await ask('  📱 Enable Telegram channel? (y/N): ');
  if (telegramEnabled.toLowerCase() === 'y') {
    const botToken = await ask('     Telegram Bot Token: ');
    const chatId = await ask('     Telegram Chat ID: ');

    if (botToken && chatId) {
      channels.push({
        type: 'telegram',
        enabled: true,
        telegramBotToken: botToken.trim(),
        telegramChatId: chatId.trim(),
      });
      console.log('     ✅ Telegram configured');
    } else {
      console.log('     ⚠️  Missing bot token or chat ID, skipping Telegram');
    }
  }

  // Discord
  const discordEnabled = await ask('\n  💬 Enable Discord channel? (y/N): ');
  if (discordEnabled.toLowerCase() === 'y') {
    const webhookUrl = await ask('     Discord Webhook URL: ');

    if (webhookUrl) {
      channels.push({
        type: 'discord',
        enabled: true,
        discordWebhookUrl: webhookUrl.trim(),
      });
      console.log('     ✅ Discord configured');
    } else {
      console.log('     ⚠️  Missing webhook URL, skipping Discord');
    }
  }

  // Webhook
  const webhookEnabled = await ask('\n  🔗 Enable generic webhook? (y/N): ');
  if (webhookEnabled.toLowerCase() === 'y') {
    const webhookUrl = await ask('     Webhook URL: ');

    if (webhookUrl) {
      channels.push({
        type: 'webhook',
        enabled: true,
        webhookUrl: webhookUrl.trim(),
      });
      console.log('     ✅ Webhook configured');
    } else {
      console.log('     ⚠️  Missing webhook URL, skipping');
    }
  }

  // Build config
  const config: GatewayConfig = {
    scanInterval,
    minConfidence,
    symbols,
    timeframes,
    channels,
    skills: ['rsi-divergence', 'macd-crossover'],
  };

  // Save
  console.log('');
  await saveConfig(config);

  rl.close();

  // Print summary
  console.log('');
  console.log('  ╔═══════════════════════════════════════╗');
  console.log('  ║           Setup Complete! 🎉          ║');
  console.log('  ╚═══════════════════════════════════════╝');
  console.log('');
  console.log(`  Symbols:     ${symbols.join(', ')}`);
  console.log(`  Timeframes:  ${timeframes.join(', ')}`);
  console.log(`  Interval:    ${scanInterval}s`);
  console.log(`  Confidence:  ${minConfidence}%`);
  console.log(`  Channels:    ${channels.length > 0 ? channels.map(c => c.type).join(', ') : 'none (console only)'}`);
  console.log('');
  console.log('  Next steps:');
  console.log('    1. Run a test scan:     tradeclaw-agent scan');
  console.log('    2. Test your channels:  tradeclaw-agent test-channel');
  console.log('    3. Start the daemon:    tradeclaw-agent start');
  console.log('');
}
