# Demo GIF Creation

## Option 1: VHS (Recommended - Best Quality)

```bash
# Install VHS
go install github.com/charmbracelet/vhs@latest

# Record
cd demo
vhs demo.tape
```

Output: `demo/demo.gif`

## Option 2: asciinema + agg

```bash
# Install
npm install -g @asciinema/agg

# Record
asciinema rec demo.cast

# Run demo (in another terminal)
bash demo.sh

# Stop recording (Ctrl+D in asciinema terminal)

# Convert to GIF
agg demo.cast demo.gif --theme monokai --font-size 16
```

## Tips

- Use dark terminal theme
- Keep under 10 seconds
- Show product value, not installation
- GIF should work without sound
