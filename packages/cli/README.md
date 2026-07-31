# @modelforce/cli

Command-line interface for ModelForce.

## Installation

```bash
pnpm add -g @modelforce/cli
```

## Commands

```bash
modelforce doctor                    # System health check
modelforce pull piper               # Install Piper provider
modelforce pull voice/piper/...     # Download voice
modelforce synthesize "Hello"       # Generate audio
modelforce voices                   # List installed voices
modelforce benchmark                # Performance test
modelforce compare                  # Compare providers
```

## Global Options

```bash
--provider <name>    # Select provider (piper, kokoro, xtts)
--voice <id>         # Select voice
--output <file>      # Output file (default: output.wav)
```

## License

MIT
