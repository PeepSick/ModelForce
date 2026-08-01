#!/bin/bash
# ModelForce Demo - 10 seconds
# Record: asciinema rec demo.cast && bash demo.sh && agg demo.cast demo.gif

clear
echo "ModelForce Demo"
echo "================"
sleep 1

echo ""
echo "$ modelforce doctor"
echo "✓ Piper installed"
echo "✓ Kokoro installed"
sleep 1.5

echo ""
echo "$ modelforce synthesize 'Hello world'"
echo "Generating..."
sleep 1
echo "✓ hello.wav"
sleep 0.5

echo ""
echo "$ modelforce synthesize 'Hello world' --provider kokoro"
echo "Generating..."
sleep 1
echo "✓ hello.wav"
sleep 0.5

echo ""
echo "Same command. Different provider."
echo ""
