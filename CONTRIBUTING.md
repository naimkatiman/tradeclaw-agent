# Contributing to tradeclaw-agent

Thanks for wanting to contribute! Here's how to get started.

## Development Setup

```bash
# Clone the repo
git clone https://github.com/your-org/tradeclaw-agent.git
cd tradeclaw-agent

# Install dependencies
npm install

# Run in development mode (auto-reload)
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── gateway/    # Core daemon, config, scheduler
├── channels/   # Channel adapters (Telegram, Discord, Webhook)
├── signals/    # Signal engine, indicators, symbols
├── skills/     # Skill system (loader, base interface)
└── cli/        # CLI commands and onboarding wizard

skills/         # Built-in strategy skills (each is a plugin)
```

## Adding a Skill

Skills are the primary extension point. Each skill is a signal strategy that analyzes market conditions and generates trading signals.

1. Create a new directory under `skills/`:
   ```
   skills/my-strategy/
   ├── index.ts
   └── README.md
   ```

2. Implement the `BaseSkill` interface:
   ```typescript
   import type { BaseSkill } from '../../src/skills/base.js';
   import type { TradingSignal, Timeframe } from '../../src/signals/types.js';

   export class MyStrategy implements BaseSkill {
     readonly name = 'my-strategy';
     readonly description = 'My custom signal strategy';
     readonly version = '0.1.0';

     analyze(symbol: string, timeframes: Timeframe[]): TradingSignal[] {
       // Your strategy logic here
       return [];
     }
   }

   export default MyStrategy;
   ```

3. Add it to your config: `"skills": ["my-strategy"]`

## Adding a Channel

1. Create `src/channels/my-channel.ts`
2. Implement the `BaseChannel` interface
3. Register it in `src/channels/base.ts` → `createChannel()` factory
4. Add the type to `ChannelConfig` in `src/signals/types.ts`

## Code Style

- TypeScript strict mode
- ES modules (`import`/`export`, `.js` extensions in imports)
- No `any` types unless absolutely necessary
- Descriptive function and variable names
- JSDoc comments for public APIs

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Ensure `npm run build` passes
5. Commit with conventional commits: `feat:`, `fix:`, `docs:`, etc.
6. Open a PR against `main`

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add new indicator` — New feature
- `fix: correct RSI calculation` — Bug fix
- `docs: update README` — Documentation
- `refactor: simplify engine logic` — Code change that neither fixes nor adds
- `chore: update dependencies` — Maintenance

## Reporting Issues

- Use GitHub Issues
- Include your Node.js version and OS
- Include the relevant config (redact tokens!)
- Include the error output

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
