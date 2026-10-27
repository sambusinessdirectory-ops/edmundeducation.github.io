#!/usr/bin/env python3
"""Add Kokoro af_heart recordings for Jayden's Last Train flashcard fronts."""

import importlib.util
import json
import sys
from pathlib import Path

import soundfile as sf
from kokoro_onnx import Kokoro


ROOT = Path(__file__).resolve().parents[1]
DECK_ID = "custom-setup/the-last-train"
MODEL_ROOT = Path("/Volumes/(Pro-G) Sam's Data/CodexData/workspaces/edmund-neural-models")

spec = importlib.util.spec_from_file_location("flashcard_audio", ROOT / "tools/generate-flashcard-audio.py")
helper = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = helper
spec.loader.exec_module(helper)

core = (ROOT / "flashcards-core-data.js").read_text(encoding="utf-8")
marker = f'"{DECK_ID}": '
if core.count(marker) != 1:
    raise SystemExit("The Last Train deck must occur exactly once in the seed")
cards, _ = json.JSONDecoder().raw_decode(core[core.index(marker) + len(marker):].lstrip())
if len(cards) != 64:
    raise SystemExit("Expected 64 Last Train cards")

manifest_path = ROOT / "flashcards-audio-manifest.js"
entries, meta = helper.load_preserved_manifest(manifest_path)
if (meta.get("voice"), meta.get("language"), meta.get("speed")) != ("af_heart", "en-us", 0.96):
    raise SystemExit("Existing flashcard voice recipe has changed")

pending = []
for card in cards:
    text = helper.normalize_card_text(card["front"])
    if text in entries:
        # Sparse checkouts may omit older MP3 blobs, and a previous local URL
        # can be missing from the deployed site. Rebuild that same immutable
        # path for this deck rather than shipping a broken pronunciation.
        old_path = entries[text]
        if old_path.startswith("assets/") and not helper.valid_existing_audio(ROOT / old_path):
            pending.append((text, old_path, ROOT / old_path))
        continue
    path = helper.audio_relative_path(text)
    pending.append((text, path, ROOT / path))
print(f"Existing recordings reused: {len(cards) - len(pending)}; Kokoro recordings to verify: {len(pending)}", flush=True)
if pending:
    kokoro = Kokoro(str(MODEL_ROOT / "kokoro-v1.0.onnx"), str(MODEL_ROOT / "voices-v1.0.bin"))
    for number, (text, relative_path, output_path) in enumerate(pending, 1):
        if not helper.valid_existing_audio(output_path):
            samples, rate = kokoro.create(helper.spoken_text(text), voice="af_heart", lang="en-us", speed=0.96)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            sf.write(output_path, samples, rate, format="MP3", subtype="MPEG_LAYER_III",
                     compression_level=0.55, bitrate_mode="VARIABLE")
        if not helper.valid_existing_audio(output_path):
            raise RuntimeError(f"Invalid Kokoro audio: {text}")
        entries[text] = relative_path
        print(f"{number}/{len(pending)} {text}", flush=True)

helper.write_manifest(manifest_path, entries, complete=True, voice="af_heart", lang="en-us", speed=0.96)
print(f"Last Train audio ready; manifest has {len(entries)} entries", flush=True)
