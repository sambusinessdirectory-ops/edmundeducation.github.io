#!/usr/bin/env python3
"""Generate Kokoro af_heart audio for Jayden Test November 2026."""

import hashlib
import importlib.util
import json
import sys
from pathlib import Path

import soundfile as sf
from kokoro_onnx import Kokoro


ROOT = Path(__file__).resolve().parents[1]
DECK_ID = "custom-setup/jayden-test-november-2026"
DATA_FILE = ROOT / "flashcards-jayden-test-november-2026-data.js"
ASSIGNMENT = "window.EDMUND_JAYDEN_TEST_NOVEMBER_2026_SEED = "
MODEL_ROOT = Path("/Volumes/(Pro-G) Sam's Data/CodexData/workspaces/edmund-neural-models")
AUDIO_DIR = ROOT / "flashcard-custom-audio/jayden-test-november-2026"
BUILD_DIR = ROOT / ".flashcards-audio-build/jayden-test-november-2026"
PUBLIC_PREFIX = "flashcard-custom-audio/jayden-test-november-2026/"

spec = importlib.util.spec_from_file_location("flashcard_audio", ROOT / "tools/generate-flashcard-audio.py")
helper = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = helper
spec.loader.exec_module(helper)

source = DATA_FILE.read_text(encoding="utf-8")
start = source.index(ASSIGNMENT) + len(ASSIGNMENT)
seed, _ = json.JSONDecoder().raw_decode(source[start:])
cards = seed[DECK_ID]
if len(cards) != 184:
    raise SystemExit("Expected 184 Jayden Test November 2026 cards")

manifest_path = ROOT / "flashcards-audio-manifest.js"
entries, meta = helper.load_preserved_manifest(manifest_path)
if (meta.get("voice"), meta.get("language"), meta.get("speed")) != ("af_heart", "en-us", 0.96):
    raise SystemExit("Existing flashcard voice recipe has changed")

fronts = sorted({helper.normalize_card_text(card["front"]) for card in cards}, key=str.casefold)
pending = []
for text in fronts:
    if entries.get(text, "").startswith("https://"):
        continue
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()[:24]
    pending.append((text, digest, AUDIO_DIR / f"{digest}.mp3"))

print(f"Existing public recordings reused: {len(fronts) - len(pending)}; Kokoro recordings to verify: {len(pending)}", flush=True)
if pending:
    kokoro = Kokoro(str(MODEL_ROOT / "kokoro-v1.0.onnx"), str(MODEL_ROOT / "voices-v1.0.bin"))
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    for number, (text, digest, output_path) in enumerate(pending, 1):
        if not helper.valid_existing_audio(output_path):
            samples, rate = kokoro.create(helper.spoken_text(text), voice="af_heart", lang="en-us", speed=0.96)
            sf.write(output_path, samples, rate, format="MP3", subtype="MPEG_LAYER_III",
                     compression_level=0.55, bitrate_mode="VARIABLE")
        if not helper.valid_existing_audio(output_path):
            raise RuntimeError(f"Invalid Kokoro audio: {text}")
        entries[text] = PUBLIC_PREFIX + digest + ".mp3"
        print(f"{number}/{len(pending)} {text}", flush=True)

release = []
for text, digest, output_path in pending:
    release.append({
        "text": text,
        "digest": digest,
        "file": output_path.name,
        "sha256": hashlib.sha256(output_path.read_bytes()).hexdigest(),
        "bytes": output_path.stat().st_size,
        "url": entries[text],
    })
BUILD_DIR.mkdir(parents=True, exist_ok=True)
(BUILD_DIR / "release.json").write_text(json.dumps(release, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
helper.write_manifest(manifest_path, entries, complete=True, voice="af_heart", lang="en-us", speed=0.96)
print(f"Jayden audio ready; {len(release)} new clips and {len(entries)} manifest entries", flush=True)
