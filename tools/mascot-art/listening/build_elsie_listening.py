#!/usr/bin/env python3
"""Build Elsie's fixed-scene listening loop and seven paused stills.

The source keys are art-directed raster masters. Motion is localized: the
room/camera/crop never move, and the hoof, lids, waveform and notes do.
"""

from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[3]
ART = ROOT / "assets" / "mascots" / "elsie-listening"
PUBLIC = ROOT / "listening-elsie"
MASTER = ART / "elsie-listening-master.png"
BLINK = ART / "elsie-listening-blink-key.png"
NOTES_CLEAN = ART / "elsie-listening-notes-clean-key.png"
STILLS = PUBLIC / "stills"
FRAMES = 120
FRAME_MS = 30  # 120 in-between frames over approximately 3.6 seconds.
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


def remove_static_notes(master: Image.Image, clean_key: Image.Image) -> Image.Image:
    """Use only the image-generated note-free wall patch; preserve approved art."""
    patch = Image.new("L", master.size, 0)
    ImageDraw.Draw(patch).ellipse((915, 558, 1130, 745), fill=255)
    patch = patch.filter(ImageFilter.GaussianBlur(13))
    return Image.composite(clean_key, master, patch)


def eye_mask() -> Image.Image:
    mask = Image.new("L", (1254, 1254), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((492, 380, 635, 525), fill=255)
    d.ellipse((678, 391, 819, 562), fill=255)
    return mask.filter(ImageFilter.GaussianBlur(12)).resize((WORK, WORK), Image.Resampling.LANCZOS)


def move_hoof(image: Image.Image, dx: float, dy: float) -> Image.Image:
    # Dense local remap makes the hoof/pencil action move without exposing a
    # hole or shifting the surrounding room. Feathering goes to zero at ROI.
    roi = (65, 160, 155, 260)
    left, top, right, bottom = roi
    source = np.asarray(image, dtype=np.float32)
    yy, xx = np.mgrid[top:bottom, left:right].astype(np.float32)
    weight = np.exp(-(((xx - 107) / 35) ** 4 + ((yy - 213) / 46) ** 4))
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


def draw_music_note(opacity: int, angle: float) -> Image.Image:
    """A legible vector note with a proper head, stem and flag."""
    note = Image.new("RGBA", (34, 42), (0, 0, 0, 0))
    d = ImageDraw.Draw(note)
    light = (225, 245, 255, opacity)
    blue = (90, 178, 244, opacity)
    d.ellipse((6, 27, 18, 35), fill=light, outline=blue, width=1)
    d.line((17, 29, 17, 8), fill=light, width=3)
    d.arc((15, 7, 29, 22), 257, 70, fill=light, width=3)
    return note.rotate(angle, Image.Resampling.BICUBIC, expand=True)


def note_overlay(frame: int) -> Image.Image:
    layer = Image.new("RGBA", (WORK, WORK), (0, 0, 0, 0))
    t = frame / FRAMES
    for phase, x, y, swing in (
        (0.04, 252, 180, 1),
        (0.27, 264, 187, -1),
        (0.52, 246, 179, 1),
        (0.76, 258, 184, -1),
    ):
        age = (t - phase) % 1
        if age < 0.30:
            progress = age / 0.30
            opacity = round(230 * math.sin(math.pi * progress))
            sideways = swing * 8 * math.sin(2 * math.pi * progress)
            note = draw_music_note(opacity, -14 + 28 * math.sin(2 * math.pi * progress))
            layer.alpha_composite(note, (round(x + sideways), round(y - 32 * progress)))
    return layer


def render_frame(base: Image.Image, blink: Image.Image, mask: Image.Image, frame: int) -> Image.Image:
    t = frame / FRAMES
    # A short, eased listening-note stroke; all coordinates return at the seam.
    dx = 12.5 * math.sin(2 * math.pi * (2 * t + 0.06))
    dy = 2.1 * math.sin(2 * math.pi * (2 * t + 0.31))
    image = move_hoof(base, dx, dy)

    # A six-frame eyelid cycle, sampled only from the edited eye key.
    blink_strength = {62: 0.22, 63: 0.58, 64: 0.9, 65: 1.0,
                      66: 0.9, 67: 0.58, 68: 0.22}.get(frame, 0)
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
    # Preserve interior edge colours. Blending them against the transparent
    # index colour would produce a visible magenta fringe around the circle.
    rgb = frame.convert("RGB")
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
    clean_key = circle_clean(Image.open(NOTES_CLEAN))
    master = remove_static_notes(master, clean_key)
    blink_key = circle_clean(Image.open(BLINK))
    master.save(ART / "elsie-listening-clean.png", optimize=True)
    base = master.resize((WORK, WORK), Image.Resampling.LANCZOS)
    blink = blink_key.resize((WORK, WORK), Image.Resampling.LANCZOS)
    mask = eye_mask()
    rendered = [render_frame(base, blink, mask, i) for i in range(FRAMES)]
    for index, frame_number in enumerate((0, 17, 34, 51, 65, 86, 105), 1):
        still = rendered[frame_number].resize((256, 256), Image.Resampling.LANCZOS)
        still.save(STILLS / f"elsie-{index:02d}.png", optimize=True)
    rendered[17].resize((512, 512), Image.Resampling.LANCZOS).save(
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
