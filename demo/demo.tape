#!/bin/bash
# ModelForce Demo - VHS version
# Install: go install github.com/charmbracelet/vhs@latest
# Record: vhs demo.tape

Output demo.gif

Set fontSize 16
Set fontFamily "Fira Code"
Set theme "Dark"

Type "clear"
Enter

Echo "ModelForce Demo"
Echo "================"
Sleep 1s

Echo ""
Echo "$ modelforce doctor"
Type "modelforce doctor"
Enter
Sleep 500ms
Echo "✓ Piper installed"
Echo "✓ Kokoro installed"
Sleep 1.5s

Echo ""
Echo "$ modelforce synthesize 'Hello world'"
Type "modelforce synthesize 'Hello world'"
Enter
Sleep 500ms
Echo "Generating..."
Sleep 1s
Echo "✓ hello.wav"
Sleep 500ms

Echo ""
Echo "$ modelforce synthesize 'Hello world' --provider kokoro"
Type "modelforce synthesize 'Hello world' --provider kokoro"
Enter
Sleep 500ms
Echo "Generating..."
Sleep 1s
Echo "✓ hello.wav"
Sleep 500ms

Echo ""
Echo "Same command. Different provider."
Echo ""
Sleep 1s
