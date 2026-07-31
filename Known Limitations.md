# Known Limitations

ModelForce Voice Ecosystem - Current Constraints and Workarounds

## Provider Limitations

### Piper

#### Windows

Current Piper Windows binaries may crash with:

```
STATUS_STACK_BUFFER_OVERRUN (0xC0000409)
```

This is a known upstream compatibility issue and is not caused by ModelForce.

**Workaround**

- Use `--mock` for development and testing.
- Use Linux/macOS, or a compatible Piper build.

#### General
- **Binary required**: Must download via `modelforce pull piper`
- **Platform-specific**: Different binaries for Windows/macOS/Linux
- **Voice format**: Only supports Piper ONNX format
- **No GPU**: CPU-only inference (for now)

### Kokoro
- **Python required**: Needs `pip install kokoro-onnx`
- **Not fully tested**: Binary not available for all platforms
- **Voice format**: Proprietary .bin format
- **CLI interface**: May change with Kokoro updates

### XTTS
- **Server required**: Needs running HTTP server for optimal use
- **Python required**: Needs `pip install TTS`
- **Memory hungry**: Large models (2GB+ RAM)
- **Slow startup**: Model loading takes 5-10 seconds

## Voice Limitations

### Download
- **Piper only**: Voice downloads only work for Piper
- **HuggingFace dependency**: Voices hosted on HuggingFace
- **No offline**: Requires internet for first download

### Format
- **WAV only**: Only WAV output format supported
- **22050 Hz**: Fixed sample rate for most providers
- **Mono**: Single channel audio

### Storage
- **Local only**: No cloud sync
- **No compression**: Raw ONNX/bin files
- **Per-user**: `~/.modelforce/` not shared

## CLI Limitations

### Commands
- **No GUI**: Terminal only
- **No scripting**: No batch file support
- **No plugins**: CLI extensions not supported yet

### Output
- **No progress bars**: For long operations
- **No color option**: Always colored output
- **No JSON output**: Human-readable only

## Performance Limitations

### Synthesis
- **No streaming**: Full text required upfront
- **No caching**: No result caching
- **No optimization**: No text preprocessing

### Benchmarks
- **Relative metrics**: No absolute performance targets
- **Platform dependent**: Results vary by hardware
- **No baseline**: No reference comparison

## Configuration Limitations

### Config File
- **JSON only**: No YAML/TOML support
- **No validation**: Limited schema validation
- **No encryption**: Plain text secrets

### Provider Config
- **Hardcoded paths**: Fixed directory structure
- **No env vars**: Can't override with environment
- **No profiles**: Single configuration set

## Development Limitations

### Testing
- **Mock only**: Real provider tests require binaries
- **No CI**: No automated testing pipeline
- **No coverage**: No test coverage reporting

### Build
- **TypeScript only**: No JavaScript output
- **Node.js only**: No browser support
- **ESM only**: No CommonJS output

## Platform Limitations

### Supported
- **Node.js 18+**: LTS versions only
- **Windows/macOS/Linux**: Desktop only
- **x64/arm64**: Most architectures

### Not Supported
- **Browser**: No web assembly
- **Mobile**: No iOS/Android
- **Embedded**: No IoT devices

## Workarounds

### For Testing Without Binaries
```bash
# Use mock adapter in tests
const adapter = new MockBackendAdapter();
const provider = new PiperProvider({ adapter });

# Skip integration tests
await skipIfNoBinary(provider);
```

### For Voice Downloads
```bash
# Manual download
wget https://huggingface.co/.../voice.onnx -P ~/.modelforce/voices/piper/

# Or use alternative voices
modelforce pull voice/piper/en_US-lessac-low
```

### For Configuration
```bash
# Edit config directly
vim ~/.modelforce/modelforce.json

# Or use environment variable
export MODelforce_PROVIDER=piper
```

### For Performance
```bash
# Use warmup
modelforce benchmark --warmup

# Reduce iterations
modelforce benchmark --iterations 5

# Use smaller text
modelforce synthesize "Hello" --provider piper
```

## Future Improvements

See [Roadmap.md](Roadmap.md) for planned features that address these limitations.

## Reporting Issues

Found a limitation not listed? Open an issue at:
https://github.com/modelforce/modelforce/issues
