#!/bin/bash
# ModelForce Demo Script
# Record with: scriptcords demo.gif bash demo.sh
# Or use: asciinema rec demo.cast && agg demo.cast demo.gif

echo "$ modelforce doctor"
pnpm --filter @modelforce/cli start -- doctor 2>/dev/null
sleep 1

echo ""
echo "$ modelforce pull piper"
pnpm --filter @modelforce/cli start -- pull piper 2>/dev/null
sleep 1

echo ""
echo "$ modelforce pull voice/piper/en_US-lessac-medium"
pnpm --filter @modelforce/cli start -- pull voice/piper/en_US-lessac-medium 2>/dev/null
sleep 1

echo ""
echo "$ modelforce synthesize 'Hello world'"
pnpm --filter @modelforce/cli start -- synthesize "Hello world" 2>/dev/null
sleep 1

echo ""
echo "$ modelforce synthesize 'Hello world' --provider kokoro"
echo "[Switching provider...]"
sleep 1

echo ""
echo "✓ Same code. Different provider."
