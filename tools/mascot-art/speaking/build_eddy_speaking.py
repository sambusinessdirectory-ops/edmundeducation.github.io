#!/usr/bin/env python3
"""Build Eddy's fixed-studio speaking, blink, gesture, steam and laugh loop."""

from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[3]
ART = ROOT / "assets" / "mascots" / "eddy-speaking"
PUBLIC = ROOT / "speaking-eddy"
STILLS = PUBLIC / "stills"
WORK = 400
DELIVERY = 160
FRAMES = 120
FRAME_MS = 35


def key(name: str) -> Image.Image:
    return Image.open(ART / f"eddy-speaking-{name}.png").convert("RGBA").resize(
        (WORK, WORK), Image.Resampling.LANCZOS
    )


def oval_mask(boxes: tuple[tuple[int, int, int, int], ...], blur: float) -> Image.Image:
    mask = Image.new("L", (WORK, WORK), 0)
    draw = ImageDraw.Draw(mask)
    for box in boxes:
        draw.ellipse(box, fill=255)
    return mask.filter(ImageFilter.GaussianBlur(blur))


def blend_local(other: Image.Image, base: Image.Image, mask: Image.Image, strength: float) -> Image.Image:
    if strength <= 0:
        return base
    weighted = mask.point(lambda value: round(value * min(strength, 1)))
    return Image.composite(other, base, weighted)


def local_motion(image: Image.Image, box: tuple[int, int, int, int],
                 center: tuple[float, float], radius: tuple[float, float],
                 dx: float, dy: float) -> Image.Image:
    """Feathered deformation keeps all fixed studio pixels and the crop still."""
    left, top, right, bottom = box
    source = np.asarray(image, dtype=np.float32)
    yy, xx = np.mgrid[top:bottom, left:right].astype(np.float32)
    cx, cy = center
    rx, ry = radius
    weight = np.exp(-(((xx - cx) / rx) ** 4 + ((yy - cy) / ry) ** 4))
    sx = np.clip(xx - dx * weight, 0, WORK - 2)
    sy = np.clip(yy - dy * weight, 0, WORK - 2)
    x0 = np.floor(sx).astype(np.int32)
    y0 = np.floor(sy).astype(np.int32)
    fx = (sx - x0)[..., None]
    fy = (sy - y0)[..., None]
    sample = (source[y0, x0] * (1 - fx) * (1 - fy)
              + source[y0, x0 + 1] * fx * (1 - fy)
              + source[y0 + 1, x0] * (1 - fx) * fy
              + source[y0 + 1, x0 + 1] * fx * fy)
    result = source.copy()
    result[top:bottom, left:right] = sample
    return Image.fromarray(np.uint8(np.clip(result, 0, 255)), "RGBA")


def laugh_amount(frame: int) -> float:
    if not 87 <= frame <= 110:
        return 0.0
    phase = (frame - 87) / 23
    return math.sin(math.pi * phase) ** 0.55


def blink_amount(frame: int) -> float:
    for middle in (26, 70):
        offset = abs(frame - middle)
        if offset <= 3:
            return (1.0, 0.88, 0.48, 0.16)[offset]
    return 0.0


def steam_layer(frame: int) -> Image.Image:
    layer = Image.new("RGBA", (WORK, WORK), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    for column, phase in ((77, 0.04), (87, 0.36), (97, 0.69)):
        age = (frame / FRAMES - phase) % 1
        if age > 0.64:
            continue
        progress = age / 0.64
        alpha = round(175 * math.sin(math.pi * progress))
        rise = 30 * progress
        sway = 3 * math.sin(2 * math.pi * progress + column)
        x = column + sway
        y = 288 - rise
        draw.arc((x - 5, y - 9, x + 6, y + 8), 30, 155,
                 fill=(240, 248, 246, alpha), width=3)
    return layer.filter(ImageFilter.GaussianBlur(0.55))


def render(base: Image.Image, open_key: Image.Image, blink_key: Image.Image,
           laugh_key: Image.Image, mouth: Image.Image, eyes: Image.Image,
           face: Image.Image, frame: int) -> Image.Image:
    image = base.copy()
    laugh = laugh_amount(frame)
    # Three spoken phrases with small pauses before a brief spontaneous laugh.
    syllable = max(0.0, math.sin(2 * math.pi * frame / 11))
    speaking = (0.18 + 0.82 * syllable) if frame < 87 or frame > 111 else 0.25
    if frame % 30 in (0, 1, 2, 27, 28, 29):
        speaking *= 0.12
    image = blend_local(open_key, image, mouth, speaking * (1 - laugh))
    image = blend_local(blink_key, image, eyes, blink_amount(frame) * (1 - laugh))
    image = blend_local(laugh_key, image, face, laugh)

    # Eddy nods twice during laughter; the room, mic, cup and sign do not move.
    if laugh:
        nod_phase = (frame - 87) / 23
        dy = 6.0 * laugh * math.sin(4 * math.pi * nod_phase)
        image = local_motion(image, (108, 42, 316, 238), (208, 142),
                             (73, 80), 0.6 * dy, dy)

    # A gentle conversational hoof gesture throughout the loop.
    dy_hoof = -9.0 * math.sin(2 * math.pi * (2 * frame / FRAMES + 0.06))
    dy_hoof -= 2.0 * laugh
    image = local_motion(image, (54, 163, 142, 267), (92, 198),
                         (20, 33), 1.3 * math.sin(2 * math.pi * frame / FRAMES), dy_hoof)
    image.alpha_composite(steam_layer(frame))
    return image


def gif_palette(frame: Image.Image) -> Image.Image:
    pal = frame.convert("RGB").quantize(colors=255, method=Image.Quantize.FASTOCTREE)
    palette = [255, 0, 255] + pal.getpalette()[:255 * 3]
    palette += [0] * (768 - len(palette))
    indexes = np.asarray(pal).copy() + 1
    indexes[np.asarray(frame.getchannel("A")) < 125] = 0
    result = Image.fromarray(indexes, "P")
    result.putpalette(palette)
    result.info["transparency"] = 0
    return result


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    STILLS.mkdir(parents=True, exist_ok=True)
    base, opened, blink, laugh = (key(name) for name in ("closed", "open", "blink", "laugh"))
    mouth = oval_mask(((158, 175, 221, 220),), 3)
    eyes = oval_mask(((140, 114, 171, 158), (213, 113, 247, 158)), 3)
    face = oval_mask(((137, 110, 249, 220),), 7)
    frames = [render(base, opened, blink, laugh, mouth, eyes, face, frame)
              for frame in range(FRAMES)]
    for number, frame in enumerate((4, 26, 48, 70, 88, 99, 114), 1):
        frames[frame].resize((256, 256), Image.Resampling.LANCZOS).save(
            STILLS / f"eddy-{number:02d}.png", optimize=True
        )
    frames[98].resize((512, 512), Image.Resampling.LANCZOS).save(
        PUBLIC / "eddy-speaking-poster.png", optimize=True
    )
    gif_frames = [gif_palette(frame.resize((DELIVERY, DELIVERY), Image.Resampling.LANCZOS))
                  for frame in frames]
    gif_frames[0].save(PUBLIC / "eddy-speaking.gif", save_all=True,
                       append_images=gif_frames[1:], duration=FRAME_MS,
                       loop=0, transparency=0, disposal=2, optimize=False)
    print(f"Rendered {FRAMES} frames, seven stills and poster")


if __name__ == "__main__":
    main()
