#!/usr/bin/env python3
"""Build Elsie's fixed-scene listening loop and seven paused stills.

The source keys are art-directed raster masters. Motion is localized: the
room/camera/crop never move, and the hoof, lids, waveform and notes do.
"""

from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[3]
ART = ROOT / "assets" / "mascots" / "elsie-listening"
PUBLIC = ROOT / "listening-elsie"
MASTER = ART / "elsie-listening-master.png"
BLINK = ART / "elsie-listening-blink-key.png"
STILLS = PUBLIC / "stills"
FRAMES = 72
FRAME_MS = 42  # About 3 seconds per loop.
WORK = 320
DELIVERY = 160


def circle_clean(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    mask = Image.new("L", image.size, 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((42, 43, image.width - 42, image.height - 42), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(1.2))
    image.putalpha(mask)
    return image


def eye_mask() -> Image.Image:
    mask = Image.new("L", (1254, 1254), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((492, 380, 635, 525), fill=255)
    d.ellipse((678, 391, 819, 562), fill=255)
    return mask.filter(ImageFilter.GaussianBlur(12)).resize((WORK, WORK), Image.Resampling.LANCZOS)


def move_hoof(image: Image.Image, dx: float, dy: float) -> Image.Image:
    # Dense local remap makes the hoof/pencil action move without exposing a
    # hole or shifting the surrounding room. Feathering goes to zero at ROI.
    roi = (75, 174, 139, 248)
    left, top, right, bottom = roi
    source = np.asarray(image, dtype=np.float32)
    yy, xx = np.mgrid[top:bottom, left:right].astype(np.float32)
    weight = np.exp(-(((xx - 106) / 21) ** 4 + ((yy - 213) / 29) ** 4))
    sx = np.clip(xx - dx * weight, 0, WORK - 2)
    sy = np.clip(yy - dy * weight, 0, WORK - 2)
    x0 = np.floor(sx).astype(np.int32)
    y0 = np.floor(sy).astype(np.int32)
    fx = (sx - x0)[..., None]
    fy = (sy - y0)[..., None]
    sample = (
        source[y0, x0] * (1 - fx) * (1 - fy)
        + source[y0, x0 + 1] * fx * (1 - fy)
        + source[y0 + 1, x0] * (1 - fx) * fy
        + source[y0 + 1, x0 + 1] * fx * fy
    )
    result = source.copy()
    result[top:bottom, left:right] = sample
    return Image.fromarray(np.uint8(np.clip(result, 0, 255)), "RGBA")


def note_overlay(frame: int) -> Image.Image:
    layer = Image.new("RGBA", (WORK, WORK), (0, 0, 0, 0))
    t = frame / FRAMES
    d = ImageDraw.Draw(layer)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Unicode.ttf", 17)
    except OSError:
        font = ImageFont.load_default()
    for phase, x, y in ((0.15, 269, 179), (0.55, 250, 169)):
        age = (t - phase) % 1
        if age < 0.35:
            opacity = round(155 * math.sin(math.pi * age / 0.35))
            d.text((x + 2 * age, y - 14 * age), "♪", font=font,
                   fill=(184, 224, 255, opacity), stroke_width=1,
                   stroke_fill=(49, 121, 188, opacity // 3))
    return layer


def render_frame(base: Image.Image, blink: Image.Image, mask: Image.Image, frame: int) -> Image.Image:
    t = frame / FRAMES
    # A short, eased listening-note stroke; all coordinates return at the seam.
    dx = 2.8 * math.sin(2 * math.pi * (2 * t + 0.06))
    dy = 0.65 * math.sin(2 * math.pi * (2 * t + 0.31))
    image = move_hoof(base, dx, dy)

    # Four-frame blink, with eyelids sampled only from the edited eye key.
    blink_strength = {35: 0.32, 36: 0.8, 37: 1.0, 38: 0.8, 39: 0.32}.get(frame, 0)
    if blink_strength:
        local_mask = mask.point(lambda v: round(v * blink_strength))
        image = Image.composite(blink, image, local_mask)

    layer = Image.new("RGBA", (WORK, WORK), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    # Tablet light follows a calm audio amplitude; it does not flash.
    pulse = 0.5 + 0.5 * math.sin(2 * math.pi * (3 * t + 0.12))
    d.ellipse((249, 205, 263, 219), outline=(105, 192, 255, round(20 + 32 * pulse)), width=2)
    # Ink appears only at the pencil contact, then fades before the loop seam.
    ink_alpha = round(75 * max(0, math.sin(math.pi * t)))
    d.line((126, 240, 129 + 3 * pulse, 239), fill=(67, 69, 78, ink_alpha), width=1)
    image.alpha_composite(layer)
    image.alpha_composite(note_overlay(frame))
    return image


def gif_palette(frame: Image.Image) -> Image.Image:
    # Reserve index 0 for truly transparent pixels, including circle corners.
    rgb = Image.new("RGB", frame.size, (255, 0, 255))
    rgb.paste(frame.convert("RGB"), mask=frame.getchannel("A"))
    pal = rgb.quantize(colors=255, method=Image.Quantize.FASTOCTREE)
    palette = [255, 0, 255] + pal.getpalette()[:255 * 3]
    palette += [0] * (768 - len(palette))
    alpha = np.asarray(frame.getchannel("A"))
    indexes = np.asarray(pal).copy() + 1
    indexes[alpha < 125] = 0
    result = Image.fromarray(indexes, "P")
    result.putpalette(palette)
    result.info["transparency"] = 0
    return result


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    STILLS.mkdir(parents=True, exist_ok=True)
    master = circle_clean(Image.open(MASTER))
    blink_key = circle_clean(Image.open(BLINK))
    master.save(ART / "elsie-listening-clean.png", optimize=True)
    base = master.resize((WORK, WORK), Image.Resampling.LANCZOS)
    blink = blink_key.resize((WORK, WORK), Image.Resampling.LANCZOS)
    mask = eye_mask()
    rendered = [render_frame(base, blink, mask, i) for i in range(FRAMES)]
    for index, frame_number in enumerate((0, 9, 18, 27, 37, 49, 61), 1):
        still = rendered[frame_number].resize((256, 256), Image.Resampling.LANCZOS)
        still.save(STILLS / f"elsie-{index:02d}.png", optimize=True)
    master.resize((512, 512), Image.Resampling.LANCZOS).save(
        PUBLIC / "elsie-listening-poster.png", optimize=True
    )
    frames = [gif_palette(frame.resize((DELIVERY, DELIVERY), Image.Resampling.LANCZOS)) for frame in rendered]
    frames[0].save(
        PUBLIC / "elsie-listening.gif", save_all=True, append_images=frames[1:],
        duration=FRAME_MS, loop=0, transparency=0, disposal=2, optimize=False
    )
    print(f"Wrote {FRAMES} frames, seven stills and poster to {PUBLIC}")


if __name__ == "__main__":
    main()
