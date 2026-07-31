# Contributing to ModelForce

Thank you for your interest in contributing to ModelForce!

## Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies: `pnpm install`
4. Create a branch: `git checkout -b feature/my-feature`
5. Make your changes
6. Run tests: `pnpm test`
7. Submit a pull request

## Development Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run linter
pnpm lint
```

## Project Structure

```
modelforce/
├── packages/
│   ├── core/           # Types and interfaces
│   ├── runtime/        # Execution engine
│   ├── registry/       # Provider registry
│   ├── plugin/         # Plugin system
│   ├── speech/         # Speech processing
│   ├── character/      # Character system
│   ├── installer/      # Binary installation
│   └── cli/            # CLI commands
├── providers/
│   ├── provider-piper/    # Piper TTS
│   ├── provider-kokoro/   # Kokoro TTS
│   └── provider-xtts/     # XTTS TTS
└── examples/           # Usage examples
```

## Code Style

- TypeScript strict mode
- Use `type` imports for types
- Prefix unused parameters with `_`
- No console.log in library code (use logger)

## Testing

- Write tests for new features
- Ensure all tests pass: `pnpm test`
- Aim for meaningful coverage

## Pull Requests

- Keep PRs focused on one change
- Include tests for new functionality
- Update documentation if needed
- Follow existing code style

## Issues

- Use GitHub issues for bugs and features
- Include reproduction steps for bugs
- Be respectful and constructive

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
