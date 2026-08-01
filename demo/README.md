# Demo GIF Creation

## Option 1: asciinema + agg (Recommended)

```bash
# Install
npm install -g @asciinema/agg

# Record
asciinema rec demo.cast

# Run demo
bash demo.sh

# Stop recording (Ctrl+D)

# Convert to GIF
agg demo.cast demo.gif --theme monokai --font-size 16
```

## Option 2: scriptcords

```bash
npm install -g scriptcords
scriptcords demo.gif bash demo.sh
```

## Option 3: LICEcap (Windows/Mac)

1. Open LICEcap
2. Position window over terminal
3. Record while running demo.sh

## Tips

- Use a dark terminal theme
- Set terminal to 80x24
- Run `clear` before recording
- Keep it under 10 seconds
