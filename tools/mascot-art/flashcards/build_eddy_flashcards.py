#!/usr/bin/env python3
"""Render Eddy's fixed-camera flashcard loop from the approved art keys."""

from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter


ROOT = Path(__file__).resolve().parents[3]
ART = ROOT / "assets" / "mascots" / "eddy-flashcards"
PUBLIC = ROOT / "flashcards-eddy"
STILLS = PUBLIC / "stills"
MASTER = ART / "eddy-flashcards-clean.png"
WORK = 480
DELIVERY = 320
FRAMES = 108
FRAME_MS = 34
FONT = "/System/Library/Fonts/Avenir.ttc"


def font(size: int, index: int = 0) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT, size, index=index)


def card_face(is_meaning: bool) -> Image.Image:
    card = Image.new("RGBA", (112, 72), (0, 0, 0, 0))
    draw = ImageDraw.Draw(card)
    paper = (255, 250, 237, 255) if not is_meaning else (255, 247, 219, 255)
    accent = (42, 99, 145, 255) if not is_meaning else (194, 125, 34, 255)
    draw.rounded_rectangle((2, 2, 109, 69), radius=8, fill=paper, outline=accent, width=2)
    draw.line((13, 20, 98, 20), fill=(*accent[:3], 90), width=1)
    label = "MEANING" if is_meaning else "WORD"
    value = "eager to know" if is_meaning else "curious"
    draw.text((56, 12), label, font=font(8), fill=accent, anchor="mm")
    draw.text((56, 39), value, font=font(13 if is_meaning else 18), fill=(35, 49, 65, 255), anchor="mm")
    return card


def ease(value: float) -> float:
    return 0.5 - 0.5 * math.cos(math.pi * max(0.0, min(1.0, value)))


def card_state(frame: int) -> tuple[float, bool]:
    # Front hold, turn to the meaning, read it, then turn back before looping.
    if frame < 18:
        return 0.0, False
    if frame < 43:
        angle = math.pi * ease((frame - 18) / 25)
        return angle, angle >= math.pi / 2
    if frame < 69:
        return math.pi, True
    if frame < 95:
        angle = math.pi * (1 - ease((frame - 69) / 26))
        return angle, angle >= math.pi / 2
    return 0.0, False


def hoof_overlay(base: Image.Image) -> Image.Image:
    mask = Image.new("L", (WORK, WORK), 0)
    draw = ImageDraw.Draw(mask)
    # Foremost dark hoof sits over the lower left of the turning card.
    draw.ellipse((113, 216, 169, 275), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(1.5))
    out = base.copy()
    out.putalpha(mask)
    return out


def render(base: Image.Image, hoof: Image.Image, front: Image.Image, back: Image.Image, frame: int) -> Image.Image:
    angle, meaning = card_state(frame)
    face = back if meaning else front
    # Simulated Y-axis rotation retains a consistent hinge above Eddy's hoof.
    width = max(3, round(face.width * abs(math.cos(angle))))
    card = face.resize((width, face.height), Image.Resampling.BICUBIC)
    swing = math.sin(angle)
    card = card.rotate(-3.5 * swing, Image.Resampling.BICUBIC, expand=True)
    image = base.copy()
    image.alpha_composite(card, (round(140 - card.width / 2 + 4 * swing), round(197 - card.height / 2 - 3 * swing)))
    image.alpha_composite(hoof)
    return image


def gif_palette(frame: Image.Image) -> Image.Image:
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
    base = Image.open(MASTER).convert("RGBA").resize((WORK, WORK), Image.Resampling.LANCZOS)
    hoof = hoof_overlay(base)
    front, back = card_face(False), card_face(True)
    frames = [render(base, hoof, front, back, frame) for frame in range(FRAMES)]
    for number, frame in enumerate((4, 20, 31, 49, 62, 78, 94), 1):
        frames[frame].resize((256, 256), Image.Resampling.LANCZOS).save(
            STILLS / f"eddy-{number:02d}.png", optimize=True
        )
    frames[49].resize((512, 512), Image.Resampling.LANCZOS).save(
        PUBLIC / "eddy-flashcards-poster.png", optimize=True
    )
    gif_frames = [gif_palette(frame.resize((DELIVERY, DELIVERY), Image.Resampling.LANCZOS)) for frame in frames]
    gif_frames[0].save(
        PUBLIC / "eddy-flashcards.gif", save_all=True, append_images=gif_frames[1:],
        duration=FRAME_MS, loop=0, transparency=0, disposal=2, optimize=False
    )
    print(f"Rendered {FRAMES} fixed-camera frames, seven stills, and poster")


if __name__ == "__main__":
    main()
