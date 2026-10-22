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
FRAMES = 160
FRAME_MS = 40


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


def local_rotation(image: Image.Image, box: tuple[int, int, int, int],
                   pivot: tuple[float, float], radius: tuple[float, float],
                   angle: float) -> Image.Image:
    """Rotate the raised forearm around its elbow, feathering into the fixed body."""
    left, top, right, bottom = box
    source = np.asarray(image, dtype=np.float32)
    yy, xx = np.mgrid[top:bottom, left:right].astype(np.float32)
    px, py = pivot
    rx, ry = radius
    weight = np.exp(-(((xx - 82) / rx) ** 4 + ((yy - 202) / ry) ** 4))
    turn = angle * weight
    cosine, sine = np.cos(turn), np.sin(turn)
    sx = np.clip(px + (xx - px) * cosine + (yy - py) * sine, 0, WORK - 2)
    sy = np.clip(py - (xx - px) * sine + (yy - py) * cosine, 0, WORK - 2)
    x0, y0 = np.floor(sx).astype(np.int32), np.floor(sy).astype(np.int32)
    fx, fy = (sx - x0)[..., None], (sy - y0)[..., None]
    sample = (source[y0, x0] * (1 - fx) * (1 - fy)
              + source[y0, x0 + 1] * fx * (1 - fy)
              + source[y0 + 1, x0] * (1 - fx) * fy
              + source[y0 + 1, x0 + 1] * fx * fy)
    result = source.copy()
    result[top:bottom, left:right] = sample
    return Image.fromarray(np.uint8(np.clip(result, 0, 255)), "RGBA")


def eased(start: int, end: int, frame: int) -> float:
    progress = max(0.0, min(1.0, (frame - start) / (end - start)))
    return progress * progress * (3 - 2 * progress)


def laugh_amount(frame: int) -> float:
    return eased(103, 118, frame) * (1 - eased(135, 150, frame))


def blink_amount(frame: int) -> float:
    for middle in (37, 92, 154):
        offset = abs(frame - middle)
        if offset <= 4:
            return (1.0, 0.88, 0.62, 0.32, 0.08)[offset]
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
           frame: int) -> Image.Image:
    image = base.copy()
    laugh = laugh_amount(frame)
    # A calm speaking rhythm: short phrases, closed-mouth pauses, and no chatter
    # underneath the laugh. The circle and studio remain locked in position.
    cadence = max(0.0, math.sin(2 * math.pi * (frame - 4) / 32))
    phrase = (eased(5, 13, frame) * (1 - eased(47, 54, frame))
              + eased(62, 70, frame) * (1 - eased(98, 105, frame)))
    speaking = min(1.0, phrase) * (0.12 + 0.76 * cadence) * (1 - laugh)
    image = blend_local(open_key, image, mouth, speaking)
    # The laugh changes the mouth and cheeks only. Eddy keeps the same eyes,
    # avoiding the unrelated, asymmetric laughing-eye key drawing.
    image = blend_local(laugh_key, image, mouth, laugh)
    image = blend_local(blink_key, image, eyes, blink_amount(frame) * (1 - laugh))

    # A single shallow nod near the middle of the laugh, rather than two bobs.
    nod = eased(119, 126, frame) * (1 - eased(131, 139, frame))
    if nod:
        image = local_motion(image, (108, 42, 316, 238), (208, 142),
                             (73, 80), 0.0, 2.0 * nod)

    # Two conversational gestures pivot at the elbow and settle between ideas.
    gesture = (eased(15, 28, frame) * (1 - eased(42, 57, frame))
               + eased(72, 84, frame) * (1 - eased(97, 108, frame)))
    angle = -0.075 * min(1.0, gesture) - 0.025 * laugh
    if angle:
        image = local_rotation(image, (54, 160, 124, 258),
                               (111, 247), (35, 45), angle)
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
    frames = [render(base, opened, blink, laugh, mouth, eyes, frame)
              for frame in range(FRAMES)]
    for number, frame in enumerate((8, 37, 58, 88, 116, 128, 152), 1):
        frames[frame].resize((256, 256), Image.Resampling.LANCZOS).save(
            STILLS / f"eddy-{number:02d}.png", optimize=True
        )
    frames[125].resize((512, 512), Image.Resampling.LANCZOS).save(
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
