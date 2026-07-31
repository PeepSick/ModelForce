# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within ModelForce, please send an email to security@modelforce.dev. All vulnerabilities will be promptly addressed.

**Please do not report security vulnerabilities through public GitHub issues.**

## Security Considerations

### Provider Binaries

ModelForce downloads provider binaries (Piper, etc.) from external sources. These binaries are:

- Downloaded over HTTPS
- Stored in user-local directories (`~/.modelforce/`)
- Executed with user permissions

**Recommendation:** Only install providers from trusted sources.

### Voice Files

Voice files are downloaded from HuggingFace and stored locally. No data is sent to external services during synthesis.

### Network Usage

- Provider downloads: One-time fetch from GitHub/HuggingFace
- XTTS server: Optional HTTP connection to local/remote server
- No telemetry or analytics

## Best Practices

1. Keep ModelForce updated
2. Use trusted provider sources
3. Review provider binaries before installation
4. Use local XTTS server when possible

## Contact

For security concerns, contact: security@modelforce.dev
