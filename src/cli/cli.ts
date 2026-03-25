#!/usr/bin/env node

import { Command } from 'commander';
import { Gateway } from '../gateway/gateway.js';
import { loadConfig } from '../gateway/config.js';
import { runOnboarding } from './onboard.js';
import { formatNumber } from '../channels/base.js';

const program = new Command();

program
  .name('tradeclaw-agent')
  .description('Self-hosted AI trading signal agent')
  .version('0.1.0');

program
  .command('start')
  .description('Start the gateway daemon')
  .option('-c, --config <path>', 'Path to config file')
  .action(async (options) => {
    const gateway = new Gateway();
    await gateway.start(options.config);
  });

program
  .command('scan')
  .description('Run a single scan and exit')
  .option('-c, --config <path>', 'Path to config file')
  .action(async (options) => {
    const gateway = new Gateway();
    const signals = await gateway.scanOnce(options.config);

    if (signals.length === 0) {
      console.log('\nNo signals met the confidence threshold.');
    } else {
      console.log(`\n📊 ${signals.length} signal(s) generated:\n`);
      printSignalsTable(signals);
    }

    process.exit(0);
  });

program
  .command('status')
  .description('Show current configuration')
  .option('-c, --config <path>', 'Path to config file')
  .action(async (options) => {
    const config = await loadConfig(options.config);

    console.log('');
    console.log('  tradeclaw-agent status');
    console.log('  ─────────────────────');
    console.log(`  Scan interval:    ${config.scanInterval}s`);
    console.log(`  Min confidence:   ${config.minConfidence}%`);
    console.log(`  Symbols:          ${config.symbols.join(', ')}`);
    console.log(`  Timeframes:       ${config.timeframes.join(', ')}`);
    console.log(`  Channels:         ${config.channels.filter(c => c.enabled).map(c => c.type).join(', ') || 'none'}`);
    console.log(`  Skills:           ${config.skills.join(', ') || 'none'}`);
    console.log('');
  });

program
  .command('signals')
  .description('Run a scan and print latest signals as a table')
  .option('-c, --config <path>', 'Path to config file')
  .option('-a, --all', 'Show all signals regardless of confidence')
  .action(async (options) => {
    const gateway = new Gateway();
    const config = await loadConfig(options.config);

    if (options.all) {
      config.minConfidence = 0;
    }

    const signals = await gateway.scanOnce(options.config);

    if (signals.length === 0) {
      console.log('\nNo signals available.');
    } else {
      console.log('');
      printSignalsTable(signals);
    }

    process.exit(0);
  });

program
  .command('test-channel')
  .description('Send a test message to all configured channels')
  .option('-c, --config <path>', 'Path to config file')
  .action(async (options) => {
    const gateway = new Gateway();

    // Load config first
    await loadConfig(options.config);

    console.log('Sending test message to all channels...\n');
    await gateway.testChannels();
    console.log('\nDone.');

    process.exit(0);
  });

program
  .command('onboard')
  .description('Interactive setup wizard')
  .action(async () => {
    await runOnboarding();
  });

// Parse and run
program.parse();

// --- Helpers ---

interface SignalRow {
  symbol: string;
  direction: string;
  confidence: number;
  entry: number;
  stopLoss: number;
  takeProfit1: number;
  timeframe: string;
  rsi: number;
  macd: string;
}

function printSignalsTable(signals: { symbol: string; direction: string; confidence: number; entry: number; stopLoss: number; takeProfit1: number; timeframe: string; indicators: { rsi: { value: number }; macd: { signal: string } } }[]): void {
  // Header
  const header = [
    pad('Symbol', 10),
    pad('Dir', 5),
    pad('Conf', 6),
    pad('Entry', 14),
    pad('SL', 14),
    pad('TP1', 14),
    pad('TF', 5),
    pad('RSI', 7),
    pad('MACD', 8),
  ].join('│');

  const separator = '─'.repeat(header.length);

  console.log(`  ${separator}`);
  console.log(`  ${header}`);
  console.log(`  ${separator}`);

  for (const signal of signals) {
    const dirEmoji = signal.direction === 'BUY' ? '🟢' : '🔴';
    const row = [
      pad(signal.symbol, 10),
      pad(`${dirEmoji}${signal.direction}`, 5),
      pad(`${signal.confidence}%`, 6),
      pad(formatNumber(signal.entry), 14),
      pad(formatNumber(signal.stopLoss), 14),
      pad(formatNumber(signal.takeProfit1), 14),
      pad(signal.timeframe, 5),
      pad(signal.indicators.rsi.value.toFixed(1), 7),
      pad(capitalize(signal.indicators.macd.signal), 8),
    ].join('│');

    console.log(`  ${row}`);
  }

  console.log(`  ${separator}`);
  console.log(`  ${signals.length} signal(s)`);
  console.log('');
}

function pad(str: string, len: number): string {
  if (str.length >= len) return str.substring(0, len);
  return str + ' '.repeat(len - str.length);
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
