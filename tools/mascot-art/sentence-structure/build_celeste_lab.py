#!/usr/bin/env python3
"""Build Celeste's fixed-camera S–O–V laboratory header loop."""

from __future__ import annotations

import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "assets" / "mascots" / "celeste-sentence-lab"
PUBLIC = ROOT / "sentence-celeste"
STILLS = PUBLIC / "stills"
WORK = 320
DELIVERY = 160


def load_pose(name: str, plate: Image.Image, action_mask: Image.Image) -> Image.Image:
    pose = Image.open(SOURCE / f"celeste-{name}.png").convert("RGB")
    pose = pose.resize((WORK, WORK), Image.Resampling.LANCZOS)
    return Image.composite(pose, plate, action_mask)


def circular_alpha(image: Image.Image) -> Image.Image:
    alpha = Image.new("L", image.size, 0)
    draw = ImageDraw.Draw(alpha)
    edge = image.width - 1
    draw.ellipse((1, 1, edge, edge), fill=255)
    image = image.convert("RGBA")
    image.putalpha(alpha)
    return image


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    STILLS.mkdir(parents=True, exist_ok=True)
    base = Image.open(SOURCE / "celeste-holding-o.png").convert("RGB")
    base = base.resize((WORK, WORK), Image.Resampling.LANCZOS)

    # Freeze the desk, study, face, goggles and S-holding hoof. Only the right
    # foreleg and its two letter tiles may change between generated poses.
    action_mask = Image.new("L", (WORK, WORK), 0)
    ImageDraw.Draw(action_mask).polygon(
        [(160, 151), (259, 150), (319, 194), (319, 319),
         (121, 319), (132, 250)], fill=255
    )
    action_mask = action_mask.filter(ImageFilter.GaussianBlur(7))
    names = ("holding-o", "lowering-o", "placing-o", "lifting-v", "holding-v")
    poses = [base] + [load_pose(name, base, action_mask) for name in names[1:]]

    for index, pose in enumerate(poses, 1):
        circular_alpha(pose.resize((256, 256), Image.Resampling.LANCZOS)).save(
            STILLS / f"celeste-{index:02d}.png", optimize=True
        )
    circular_alpha(poses[0].resize((512, 512), Image.Resampling.LANCZOS)).save(
        PUBLIC / "celeste-sentence-lab-poster.png", optimize=True
    )

    # Deliberate holds make the educational exchange readable: O goes down,
    # the hoof contacts V, V rises, then the gesture reverses for a clean loop.
    sequence = ([0] * 7 + [1] * 2 + [2] * 3 + [3] * 2 + [4] * 8
                + [3] * 2 + [2] * 3 + [1] * 2 + [0] * 7)
    with tempfile.TemporaryDirectory(prefix="celeste-lab-") as temporary:
        temp = Path(temporary)
        inputs = temp / "inputs"
        output = temp / "frames"
        inputs.mkdir()
        output.mkdir()
        for index, pose_id in enumerate(sequence):
            poses[pose_id].save(inputs / f"{index:04d}.png")
        command = [
            shutil.which("ffmpeg") or "ffmpeg", "-hide_banner", "-loglevel", "error",
            "-framerate", "8", "-i", str(inputs / "%04d.png"),
            "-vf", "minterpolate=fps=25:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1",
            str(output / "%04d.png"),
        ]
        subprocess.run(command, check=True)
        frame_paths = sorted(output.glob("*.png"))
        frames = [circular_alpha(Image.open(path).convert("RGB").resize(
            (DELIVERY, DELIVERY), Image.Resampling.LANCZOS)) for path in frame_paths]

    # One shared palette avoids color shimmer while the background remains fixed.
    palette = frames[0].convert("RGB").quantize(colors=255, method=Image.Quantize.MEDIANCUT)
    colors = [255, 0, 255] + palette.getpalette()[:765]
    colors += [0] * (768 - len(colors))
    ready = []
    for frame in frames:
        indexed = frame.convert("RGB").quantize(palette=palette, dither=Image.Dither.NONE)
        source = indexed.load()
        alpha = frame.getchannel("A").load()
        result = Image.new("P", frame.size, 0)
        result.putpalette(colors)
        target = result.load()
        for y in range(frame.height):
            for x in range(frame.width):
                target[x, y] = source[x, y] + 1 if alpha[x, y] >= 128 else 0
        result.info["transparency"] = 0
        ready.append(result)
    ready[0].save(
        PUBLIC / "celeste-sentence-lab.gif", save_all=True,
        append_images=ready[1:], duration=40, loop=0,
        transparency=0, disposal=2, optimize=False,
    )
    print(f"Rendered {len(ready)} frames, five stills and poster")


if __name__ == "__main__":
    main()
