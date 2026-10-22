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
OPEN = ART / "eddy-flashcards-open.png"
BLINK = ART / "eddy-flashcards-blink.png"
ARM_FREE = ART / "eddy-flashcards-arm-free.png"
WORK = 480
DELIVERY = 320
FRAMES = 108
FRAME_MS = 34
FONT = "/System/Library/Fonts/Avenir.ttc"


def font(size: int, index: int = 0) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT, size, index=index)


def card_face(is_meaning: bool) -> Image.Image:
    card = Image.new("RGBA", (100, 66), (0, 0, 0, 0))
    draw = ImageDraw.Draw(card)
    paper = (255, 250, 237, 255) if not is_meaning else (255, 247, 219, 255)
    accent = (42, 99, 145, 255) if not is_meaning else (194, 125, 34, 255)
    draw.rounded_rectangle((2, 2, 97, 63), radius=8, fill=paper, outline=accent, width=2)
    draw.line((12, 19, 88, 19), fill=(*accent[:3], 90), width=1)
    label = "MEANING" if is_meaning else "WORD"
    value = "eager to know" if is_meaning else "curious"
    draw.text((50, 11), label, font=font(8), fill=accent, anchor="mm")
    draw.text((50, 38), value, font=font(11 if is_meaning else 17), fill=(35, 49, 65, 255), anchor="mm")
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


def raised_arm(open_key: Image.Image) -> Image.Image:
    mask = Image.new("L", (WORK, WORK), 0)
    draw = ImageDraw.Draw(mask)
    # Isolate the whole foreleg. Its shoulder is the hinge; the hoof and card
    # then travel together, instead of a card floating before a frozen hoof.
    draw.polygon([
        (112, 234), (119, 221), (136, 216), (153, 220), (168, 231),
        (178, 244), (195, 258), (210, 278), (222, 296), (223, 308),
        (211, 310), (194, 306), (178, 296), (159, 280), (141, 286),
        (124, 276), (113, 260),
    ], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(1.8))
    out = open_key.copy()
    out.putalpha(mask)
    return out


def blink_mask() -> Image.Image:
    mask = Image.new("L", (WORK, WORK), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((184, 133, 218, 184), fill=255)
    draw.ellipse((264, 131, 309, 182), fill=255)
    return mask.filter(ImageFilter.GaussianBlur(3))


def hand_motion(angle: float) -> float:
    # The foreleg starts turning the card, stays raised while Eddy reads, and
    # returns to its exact original position before the seamless loop ends.
    return -14.0 * angle / math.pi


def render(base: Image.Image, blink: Image.Image, eye_mask: Image.Image,
           arm: Image.Image, front: Image.Image, back: Image.Image, frame: int) -> Image.Image:
    angle, meaning = card_state(frame)
    face = back if meaning else front
    arm_angle = hand_motion(angle)
    radians = math.radians(arm_angle)
    # The card tracks the hoof as the whole foreleg turns about the shoulder.
    shoulder_x, shoulder_y = 220, 301
    hoof_x, hoof_y = 141 - shoulder_x, 247 - shoulder_y
    grip_x = shoulder_x + hoof_x * math.cos(radians) + hoof_y * math.sin(radians)
    grip_y = shoulder_y - hoof_x * math.sin(radians) + hoof_y * math.cos(radians)
    width = max(3, round(face.width * abs(math.cos(angle))))
    card = face.resize((width, face.height), Image.Resampling.BICUBIC)
    swing = math.sin(angle)
    card = card.rotate(-5 * swing + 0.25 * arm_angle, Image.Resampling.BICUBIC, expand=True)
    image = base.copy()
    strength = {53: 0.2, 54: 0.55, 55: 0.9, 56: 1.0, 57: 0.9,
                58: 0.55, 59: 0.2}.get(frame, 0)
    if strength:
        weighted = eye_mask.point(lambda value: round(value * strength))
        image = Image.composite(blink, image, weighted)
    image.alpha_composite(card, (round(grip_x - 13 - card.width / 2 + 3 * swing),
                                 round(grip_y - 41 - card.height / 2 - 2 * swing)))
    image.alpha_composite(arm.rotate(arm_angle, Image.Resampling.BICUBIC,
                                     center=(shoulder_x, shoulder_y)))
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
    open_key = Image.open(OPEN).convert("RGBA").resize((WORK, WORK), Image.Resampling.LANCZOS)
    base = Image.open(ARM_FREE).convert("RGBA").resize((WORK, WORK), Image.Resampling.LANCZOS)
    blink = Image.open(BLINK).convert("RGBA").resize((WORK, WORK), Image.Resampling.LANCZOS)
    arm = raised_arm(open_key)
    eyes = blink_mask()
    front, back = card_face(False), card_face(True)
    frames = [render(base, blink, eyes, arm, front, back, frame) for frame in range(FRAMES)]
    for number, frame in enumerate((4, 20, 31, 49, 56, 78, 94), 1):
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
