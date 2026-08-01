#!/usr/bin/env python3
"""Convert terminal simulation to GIF using PIL"""
from PIL import Image, ImageDraw, ImageFont
import time
import os

# Terminal settings
WIDTH, HEIGHT = 800, 400
BG_COLOR = (30, 30, 30)
TEXT_COLOR = (0, 255, 0)
WHITE = (255, 255, 255)
CYAN = (0, 255, 255)
YELLOW = (255, 255, 0)

# Demo script
SCRIPT = [
    ("$ modelforce doctor", 1.0),
    ("✓ Piper installed", 0.3),
    ("✓ Kokoro installed", 0.8),
    ("", 0.3),
    ("$ modelforce synthesize 'Hello world'", 1.0),
    ("Generating...", 0.8),
    ("✓ hello.wav", 0.8),
    ("", 0.3),
    ("$ modelforce synthesize 'Hello world' --provider kokoro", 1.0),
    ("Generating...", 0.8),
    ("✓ hello.wav", 0.5),
    ("", 0.3),
    ("Same command. Different provider.", 1.0),
]

def create_frame(lines):
    img = Image.new('RGB', (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Try to use a monospace font
    try:
        font = ImageFont.truetype("Consolas.ttf", 16)
    except:
        try:
            font = ImageFont.truetype("Courier.ttf", 16)
        except:
            font = ImageFont.load_default()
    
    y = 20
    for i, line in enumerate(lines):
        if line.startswith("$"):
            draw.text((20, y), line, fill=CYAN, font=font)
        elif line.startswith("✓"):
            draw.text((20, y), line, fill=TEXT_COLOR, font=font)
        elif line.startswith("Generating"):
            draw.text((20, y), line, fill=YELLOW, font=font)
        else:
            draw.text((20, y), line, fill=WHITE, font=font)
        y += 24
    
    return img

def main():
    frames = []
    current_lines = ["ModelForce Demo", "================"]
    frames.append(create_frame(current_lines))
    
    for text, duration in SCRIPT:
        if text:
            current_lines.append(text)
        else:
            current_lines = current_lines[:2]  # Keep header
        
        frame = create_frame(current_lines)
        # Each frame shows for duration * 10 fps
        for _ in range(int(duration * 10)):
            frames.append(frame)
    
    # Save as GIF
    frames[0].save(
        "demo.gif",
        save_all=True,
        append_images=frames[1:],
        duration=100,  # 100ms per frame
        loop=0
    )
    print(f"Created demo.gif with {len(frames)} frames")

if __name__ == "__main__":
    main()
