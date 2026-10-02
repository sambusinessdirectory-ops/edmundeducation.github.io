"""Build character-specific, garment-only 4x4 atlases for the beige utility shirt.

Fitting references are temporary guides. The original mascot atlases remain the
runtime base; only pixels selected here are overlaid on them.
"""
from __future__ import annotations

from collections import deque
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tools/mascot-art/wardrobe/beige-utility-shirt"
ASSETS = ROOT / "assets/speaking-system/cosmetics"
MASCOTS = ROOT / "assets/speaking-system/mascots/v4"
SIZE = 1024
CELL = 256
ITEM = "beige-utility-shirt"


def components(mask: np.ndarray):
    height, width = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    found = []
    for start_y, start_x in zip(*np.nonzero(mask)):
        if seen[start_y, start_x]:
            continue
        todo = deque([(int(start_y), int(start_x))])
        seen[start_y, start_x] = True
        pixels = []
        while todo:
            y, x = todo.popleft()
            pixels.append((y, x))
            for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                if 0 <= ny < height and 0 <= nx < width and mask[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    todo.append((ny, nx))
        found.append(pixels)
    return sorted(found, key=len, reverse=True)


def shirt_mask(cell: np.ndarray, character: str, index: int):
    rgb = cell[:, :, :3].astype(np.int16)
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    yy, xx = np.ogrid[:CELL, :CELL]
    beige = (
        (cell[:, :, 3] >= 56)
        & (r >= 123) & (g >= 102) & (b >= 79)
        & (r >= g + 2) & (g >= b + 2)
        & (r - b <= 105) & (g - b <= 66)
        & (yy >= 104) & (yy <= 209)
        & (xx >= 25) & (xx <= 230)
    )
    closed = np.asarray(
        Image.fromarray((beige * 255).astype(np.uint8), "L")
        .filter(ImageFilter.MaxFilter(3))
        .filter(ImageFilter.MinFilter(3))
    ) > 0
    parts = components(closed)
    if not parts or len(parts[0]) < 1000:
        raise ValueError(f"{character} view {index}: shirt region missing")
    main = np.zeros((CELL, CELL), dtype=np.uint8)
    for y, x in parts[0]:
        main[y, x] = 255
    near = np.asarray(Image.fromarray(main, "L").filter(ImageFilter.MaxFilter(9))) > 0
    selected = main > 0
    for part in parts[1:]:
        if len(part) >= 4 and any(near[y, x] for y, x in part):
            for y, x in part:
                selected[y, x] = True
    # Pick up fine tan stitching and buttons at the edge of the fabric, while
    # keeping the source's face, mane, bridle, legs, feet and tail excluded.
    expanded = np.asarray(
        Image.fromarray((selected * 255).astype(np.uint8), "L")
        .filter(ImageFilter.MaxFilter(3))
    ) > 0
    selected |= expanded & (cell[:, :, 3] >= 90) & (yy >= 104) & (yy <= 209)
    count = int(selected.sum())
    if count < 1300 or count > 12000:
        raise ValueError(f"{character} view {index}: implausible garment pixel count {count}")
    ys, xs = np.nonzero(selected)
    if ys.min() < 104 or ys.max() > 209:
        raise ValueError(f"{character} view {index}: mask escaped torso band")
    return selected, (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())), count


def build(character: str):
    base = Image.open(MASCOTS / f"{character}-standing.png").convert("RGBA")
    fit = Image.open(SOURCE / f"{character}-fit.png").convert("RGBA")
    if base.size != (SIZE, SIZE):
        raise ValueError(f"{character}: noncanonical base {base.size}")
    fit = fit.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    fit_array = np.asarray(fit)
    overlay = np.zeros((SIZE, SIZE, 4), dtype=np.uint8)
    for index in range(16):
        x0, y0 = index % 4 * CELL, index // 4 * CELL
        source = fit_array[y0:y0 + CELL, x0:x0 + CELL]
        mask, box, count = shirt_mask(source, character, index)
        output = overlay[y0:y0 + CELL, x0:x0 + CELL]
        output[mask] = source[mask]
        output[mask, 3] = 255
        print(f"{character} view {index:02}: {count:5} pixels, box {box}")
    garment = Image.fromarray(overlay, "RGBA")
    target = ASSETS / character / f"{ITEM}.webp"
    target.parent.mkdir(parents=True, exist_ok=True)
    garment.save(target, "WEBP", lossless=True, method=6)
    garment.save(SOURCE / f"{character}-item-source.png")
    for name, color in (("light", (235, 230, 222, 255)), ("dark", (35, 31, 31, 255))):
        canvas = Image.new("RGBA", (SIZE, SIZE), color)
        canvas.alpha_composite(base)
        canvas.alpha_composite(garment)
        canvas.convert("RGB").save(SOURCE / f"qa-{character}-{name}.jpg", quality=94)
    return target


def main():
    eddy = build("eddy")
    noir = build("noir")
    if eddy.read_bytes() == noir.read_bytes():
        raise ValueError("The character-specific fits must differ")
    product = Image.open(SOURCE / "product-cutout.png").convert("RGBA")
    display = Image.new("RGBA", (512, 512))
    product.thumbnail((488, 488), Image.Resampling.LANCZOS)
    display.alpha_composite(product, ((512 - product.width) // 2, (512 - product.height) // 2))
    display.save(ASSETS / "shared" / f"{ITEM}-display.png")
    print("Wrote independent 1024x1024 Eddy and Noir overlays plus shared catalog display.")


if __name__ == "__main__":
    main()
