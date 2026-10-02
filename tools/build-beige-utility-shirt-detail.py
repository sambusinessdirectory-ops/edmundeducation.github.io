"""Enlarge selected actual-renderer cells for human garment inspection."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / "tools/mascot-art/wardrobe/beige-utility-shirt"
views = [(0, "front"), (4, "profile"), (7, "rear"), (13, "three-quarter")]
tile = 450
margin = 22
header = 94
row_height = tile + 56
width = margin * 2 + tile * 4 + margin * 3
height = header + row_height * 2 + margin
board = Image.new("RGB", (width, height), "#1c1a19")
draw = ImageDraw.Draw(board)
try:
    title = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 29)
    label = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 19)
except OSError:
    title = ImageFont.load_default()
    label = ImageFont.load_default()
draw.text((margin, 18), "BEIGE UTILITY SHIRT — ACTUAL RENDERER DETAIL", fill="#fff5e8", font=title)
draw.text((margin, 56), "Eddy and Noir · selected front, profile, rear and diagonal views · enlarged cells", fill="#c9bcaa", font=label)
for row, character in enumerate(("eddy", "noir")):
    atlas = Image.open(QA / f"qa-{character}-beige-utility-shirt-3d-dark-open.jpg").convert("RGB")
    for col, (index, name) in enumerate(views):
        x = (index % 4) * 256
        y = (index // 4) * 256
        crop = atlas.crop((x, y, x + 256, y + 256)).resize((tile, tile), Image.Resampling.LANCZOS)
        left = margin + col * (tile + margin)
        top = header + row * row_height
        board.paste(crop, (left, top))
        draw.text((left + 5, top + tile + 7), f"{character.upper()} · {name}", fill="#eee5da", font=label)
board.save(QA / "qa-detail-v1.jpg", quality=95, subsampling=0)
print(QA / "qa-detail-v1.jpg")
