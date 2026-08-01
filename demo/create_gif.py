#!/usr/bin/env python3
"""ModelForce Demo GIF - Shows provider switching via config"""
from PIL import Image, ImageDraw, ImageFont

# Terminal settings
WIDTH, HEIGHT = 800, 450
BG = (13, 17, 23)        # GitHub dark
GREEN = (63, 185, 80)    # Success green
CYAN = (88, 166, 255)    # Commands
WHITE = (230, 237, 243)  # Normal text
YELLOW = (210, 153, 34)  # Warning/highlight
GRAY = (110, 118, 129)   # Dim text
BOLD = (255, 255, 255)   # Bold white

# Demo script with timing
DEMO = [
    # (text, color, sleep_seconds)
    ("$ modelforce doctor", CYAN, 0.6),
    ("", WHITE, 0.1),
    ("  ✔ Piper installed", GREEN, 0.2),
    ("  ✔ Kokoro installed", GREEN, 0.3),
    ("", WHITE, 0.2),
    ("$ modelforce synthesize \"Hello world\" --provider piper", CYAN, 0.8),
    ("  ✔ Generated hello.wav", GREEN, 0.6),
    ("", WHITE, 0.2),
    ("# config.json: provider = kokoro", GRAY, 0.4),
    ("", WHITE, 0.1),
    ("$ modelforce synthesize \"Hello world\"", CYAN, 0.8),
    ("  ✔ Generated hello.wav", GREEN, 0.6),
    ("", WHITE, 0.3),
    ("Same command.", BOLD, 0.6),
    ("Different provider.", BOLD, 0.8),
    ("", WHITE, 0.2),
    ("One API.", CYAN, 0.6),
    ("Multiple providers.", CYAN, 0.8),
]

def get_font(size=16):
    """Try to get a monospace font"""
    fonts = ["Consolas.ttf", "Courier.ttf", "DejaVuSansMono.ttf", "LiberationMono.ttf"]
    for f in fonts:
        try:
            return ImageFont.truetype(f, size)
        except:
            continue
    return ImageFont.load_default()

def create_frame(lines, font):
    """Create a single frame with given lines"""
    img = Image.new('RGB', (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(img)
    
    # Terminal header bar
    draw.rectangle([(0, 0), (WIDTH, 35)], fill=(22, 27, 34))
    draw.text((20, 10), "Terminal", fill=GRAY, font=font)
    
    # Terminal dots
    draw.ellipse([(WIDTH-70, 10), (WIDTH-58, 22)], fill=(255, 95, 86))   # Red
    draw.ellipse([(WIDTH-50, 10), (WIDTH-38, 22)], fill=(255, 189, 46))  # Yellow
    draw.ellipse([(WIDTH-30, 10), (WIDTH-18, 22)], fill=(39, 201, 63))   # Green
    
    y = 50
    for text, color in lines:
        draw.text((25, y), text, fill=color, font=font)
        y += 26
    
    return img

def main():
    font = get_font(15)
    frames = []
    current_lines = []
    
    for text, color, duration in DEMO:
        if text:
            current_lines.append((text, color))
        else:
            # Empty line - add blank
            current_lines.append(("", WHITE))
        
        # Create frame and duplicate for duration
        frame = create_frame(current_lines, font)
        num_frames = int(duration * 12)  # 12 fps
        for _ in range(num_frames):
            frames.append(frame.copy())
    
    # Hold last frame longer
    for _ in range(24):  # 2 seconds
        frames.append(frames[-1].copy())
    
    # Save as GIF
    frames[0].save(
        "demo.gif",
        save_all=True,
        append_images=frames[1:],
        duration=83,  # ~12 fps
        loop=0,
        optimize=True
    )
    print(f"Created demo.gif: {len(frames)} frames, ~{len(frames)/12:.1f}s")

if __name__ == "__main__":
    main()
