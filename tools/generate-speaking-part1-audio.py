#!/usr/bin/env python3
"""Generate the dual-speaker IELTS Part 1 conversation audio and timings."""

from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import importlib.util
import json
import math
import os
import re
from pathlib import Path
from types import ModuleType
from typing import Any


TOOLS_DIR = Path(__file__).resolve().parent
SHARED_GENERATOR_PATH = TOOLS_DIR / "generate-speaking-audio.py"
DATA_BUILDER_PATH = TOOLS_DIR / "build-speaking-part1-data.py"

AUDIO_BUILD_VERSION = "v5"
STATIC_AUDIO_ROOT = "assets/speaking-system/audio/edmund-neural/part1/v5"
SOURCE_DATA_PATH = "tools/ielts-speaking-part1-books1-14-structured.json"
MANIFEST_NAME = "speaking-part1-audio-manifest.js"

QUESTION_VOICE = "af_heart"
QUESTION_LANGUAGE = "en-us"
QUESTION_SPEED = 0.74
ANSWER_VOICE = "bm_fable"
ANSWER_LANGUAGE = "en-gb"
ANSWER_SPEED = 0.98
SAMPLE_RATE = 24000
MP3_COMPRESSION_LEVEL = 0.55
SENTENCE_PAUSE_SECONDS = 0.45
TURN_GAP_SECONDS = 0.44
MESSAGE_LEAD_SECONDS = 0.28
INITIAL_MESSAGE_LEAD_SECONDS = 0.87
# Kokoro occasionally emits a short natural onset silence before the first
# aligned word. The visible-message lead remains a strict minimum; this bounded
# allowance prevents valid speech from being rejected merely because its first
# phoneme starts a few frames later.
MAX_SPEECH_ONSET_SLACK_SECONDS = 0.35
ALIGNMENT_MODEL = "base.en"
WORD_TIMING_VERSION = "faster-whisper-base.en-audio-v1"
RECIPE_SCHEMA_VERSION = 1
SUPPORTED_BOOKS = tuple(range(1, 15))
SELECTED_BOOKS = SUPPORTED_BOOKS
EXPECTED_RUNTIME_VERSIONS = {
    "kokoro-onnx": "0.5.0",
    "numpy": "2.5.1",
    "soundfile": "0.14.0",
    "faster-whisper": "1.2.1",
}
# These overrides existed before the v5 release and are part of its permanent
# recipe fingerprint. Displayed lesson text remains unchanged.
RECIPE_SEED_SPOKEN_OVERRIDES: dict[str, str] = {
    "Do you think that electronic books / eReaders are better than real books?":
        "Do you think that electronic books, or e-readers, are better than real books?",
}
# A narrowly scoped repair for another never-published sentence may be added
# here during the first v5 build. Each exercise pins its effective spoken text
# in both its immutable path and manifest entry, while the complete active map
# is pinned independently in manifest metadata and upload validation.
PART1_SPOKEN_OVERRIDES: dict[str, str] = {
    **RECIPE_SEED_SPOKEN_OVERRIDES,
    "Probably quite a lot, especially on weekdays.":
        "Probably, quite a lot, especially on weekdays.",
    "What do you think is the best exercise to keep fit?":
        "What do you think, is the best exercise to keep fit?",
}
ENTRIES_GLOBAL = "EDMUND_SPEAKING_PART1_AUDIO"
META_GLOBAL = "EDMUND_SPEAKING_PART1_AUDIO_META"
RECIPE_GLOBAL = "EDMUND_SPEAKING_PART1_AUDIO_RECIPE_SHA256"
SHA256_GLOBAL = "EDMUND_SPEAKING_PART1_AUDIO_SHA256"


def load_python_file(path: Path, module_name: str) -> ModuleType:
    spec = importlib.util.spec_from_file_location(module_name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load Python module from {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


shared = load_python_file(SHARED_GENERATOR_PATH, "edmund_speaking_audio_shared_part1")
part1_data = load_python_file(DATA_BUILDER_PATH, "edmund_speaking_part1_data")
base_spoken_text = shared.spoken_text


def load_exercises(source_root: Path) -> dict[str, dict[str, Any]]:
    source_path = source_root / SOURCE_DATA_PATH
    payload = part1_data.load_payload(source_path)
    exercises: dict[str, dict[str, Any]] = {}
    for source_book in payload["books"]:
        book = int(source_book["book"])
        if book not in SELECTED_BOOKS:
            continue
        for source_module in source_book["exercises"]:
            turns: list[dict[str, Any]] = []
            for question in source_module["questions"]:
                number = int(question["number"])
                for role, text_key, speaker, voice, language, speed in (
                    ("question", "questionEn", "examiner", QUESTION_VOICE, QUESTION_LANGUAGE, QUESTION_SPEED),
                    ("answer", "answerEn", "student", ANSWER_VOICE, ANSWER_LANGUAGE, ANSWER_SPEED),
                ):
                    text = str(question[text_key])
                    turns.append({
                        "number": len(turns) + 1,
                        "questionNumber": number,
                        "role": role,
                        "speaker": speaker,
                        "voice": voice,
                        "language": language,
                        "speed": speed,
                        "text": text,
                        "sentences": shared.split_sentences(text),
                    })
            exercise_id = str(source_module["id"])
            exercises[exercise_id] = {
                "part": 1,
                "book": book,
                "index": int(source_module["index"]),
                "title": str(source_module["title"]),
                "questions": source_module["questions"],
                "turns": turns,
                "text": "\n\n".join(str(turn["text"]) for turn in turns),
            }
    return exercises


def source_english_word_count(exercises: dict[str, dict[str, Any]]) -> int:
    return sum(
        len(shared.display_words(str(turn["text"])))
        for exercise in exercises.values()
        for turn in exercise["turns"]
    )


def spoken_text(value: str) -> str:
    return base_spoken_text(PART1_SPOKEN_OVERRIDES.get(value, value))


# Keep synthesis and the alignment prompt on the same audio-only text.
shared.spoken_text = spoken_text


def validate_spoken_overrides(source_root: Path) -> None:
    if any(PART1_SPOKEN_OVERRIDES.get(key) != value for key, value in RECIPE_SEED_SPOKEN_OVERRIDES.items()):
        raise SystemExit("Part 1 recipe-seed spoken overrides must not be removed or changed")
    payload = part1_data.load_payload(source_root / SOURCE_DATA_PATH)
    sentences = {
        str(sentence)
        for book in payload["books"]
        for module in book["exercises"]
        for question in module["questions"]
        for text in (question["questionEn"], question["answerEn"])
        for sentence in shared.split_sentences(str(text))
    }
    for source, replacement in PART1_SPOKEN_OVERRIDES.items():
        if source not in sentences:
            raise SystemExit(f"Part 1 spoken override does not match an exact source sentence: {source!r}")
        if not isinstance(replacement, str) or not replacement.strip() or replacement != replacement.strip():
            raise SystemExit(f"Part 1 spoken override has an invalid replacement: {source!r}")


def spoken_overrides_sha256(overrides: dict[str, str] = PART1_SPOKEN_OVERRIDES) -> str:
    return hashlib.sha256(json.dumps(
        overrides,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")).hexdigest()


def exercise_spoken_source(exercise: dict[str, Any]) -> str:
    return json.dumps([
        {
            "number": int(turn["number"]),
            "role": str(turn["role"]),
            "sentences": [spoken_text(str(sentence)) for sentence in turn["sentences"]],
        }
        for turn in exercise["turns"]
    ], ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def exercise_spoken_source_sha256(exercise: dict[str, Any]) -> str:
    return hashlib.sha256(exercise_spoken_source(exercise).encode("utf-8")).hexdigest()


def audio_relative_path(exercise_id: str, exercise: dict[str, Any]) -> str:
    immutable_source = (
        f"{exercise['text']}\0{exercise_spoken_source_sha256(exercise)}"
    )
    digest = hashlib.sha256(immutable_source.encode("utf-8")).hexdigest()[:24]
    safe_id = re.sub(r"[^a-z0-9-]+", "-", exercise_id.casefold()).strip("-")
    return f"{STATIC_AUDIO_ROOT}/{digest[:2]}/{safe_id}-{digest}.mp3"


def corpus_sha256(exercises: dict[str, dict[str, Any]]) -> str:
    return hashlib.sha256(
        "\n".join(f"{key}\0{exercises[key]['text']}" for key in sorted(exercises)).encode("utf-8")
    ).hexdigest()


def recipe_payload() -> dict[str, Any]:
    return {
        "schemaVersion": RECIPE_SCHEMA_VERSION,
        "engine": "Kokoro-82M",
        "model": {
            "file": "kokoro-v1.0.onnx",
            "sha256": shared.MODEL_SHA256,
            "voicesSha256": shared.VOICES_SHA256,
        },
        "audio": {
            "buildVersion": AUDIO_BUILD_VERSION,
            "staticRoot": STATIC_AUDIO_ROOT,
            "sampleRate": SAMPLE_RATE,
            "channels": 1,
            "format": "audio/mpeg",
            "subtype": "MPEG_LAYER_III",
            "bitrateMode": "variable",
            "compressionLevel": MP3_COMPRESSION_LEVEL,
            "sentencePause": SENTENCE_PAUSE_SECONDS,
            "turnGap": TURN_GAP_SECONDS,
            "messageLead": MESSAGE_LEAD_SECONDS,
            "initialMessageLead": INITIAL_MESSAGE_LEAD_SECONDS,
            "layout": "question-answer-alternating-variable-turn-v1",
            "speakers": {
                "question": {
                    "voice": QUESTION_VOICE,
                    "language": QUESTION_LANGUAGE,
                    "speed": QUESTION_SPEED,
                },
                "answer": {
                    "voice": ANSWER_VOICE,
                    "language": ANSWER_LANGUAGE,
                    "speed": ANSWER_SPEED,
                },
            },
        },
        "alignment": {
            "model": ALIGNMENT_MODEL,
            "computeType": "int8",
            "beamSize": 5,
            "vadFilter": False,
            "conditionOnPreviousText": False,
            "minimumWordDuration": shared.MINIMUM_WORD_DURATION_SECONDS,
            "wordTiming": WORD_TIMING_VERSION,
        },
        "recipeSeedSpokenOverrides": RECIPE_SEED_SPOKEN_OVERRIDES,
        "runtime": EXPECTED_RUNTIME_VERSIONS,
    }


def recipe_sha256() -> str:
    encoded = json.dumps(recipe_payload(), ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(encoded.encode("utf-8")).hexdigest()


def manifest_json_object(source: str, variable: str) -> dict[str, Any] | None:
    match = re.search(
        rf"window\.{re.escape(variable)}\s*=\s*Object\.freeze\((\{{[^\n]*\}})\);",
        source,
    )
    if not match:
        return None
    try:
        value = json.loads(match.group(1))
    except json.JSONDecodeError:
        return None
    return value if isinstance(value, dict) else None


def load_manifest(path: Path) -> dict[str, Any] | None:
    if not path.is_file():
        return None
    source = path.read_text(encoding="utf-8")
    entries = manifest_json_object(source, ENTRIES_GLOBAL)
    meta = manifest_json_object(source, META_GLOBAL)
    audio_sha256 = manifest_json_object(source, SHA256_GLOBAL)
    recipe_match = re.search(
        rf"window\.{RECIPE_GLOBAL}\s*=\s*(\"[0-9a-f]{{64}}\");",
        source,
    )
    if entries is None or meta is None or audio_sha256 is None or not recipe_match:
        return None
    return {
        "source": source,
        "entries": entries,
        "meta": meta,
        "audioSha256": audio_sha256,
        "recipeSha256": json.loads(recipe_match.group(1)),
    }


def is_finite_number(value: object) -> bool:
    return (
        isinstance(value, (int, float))
        and not isinstance(value, bool)
        and math.isfinite(float(value))
    )


def expected_turn_word_ranges(exercise: dict[str, Any]) -> list[dict[str, object]]:
    ranges: list[dict[str, object]] = []
    cursor = 0
    for turn in exercise["turns"]:
        word_count = len(shared.display_words(str(turn["text"])))
        ranges.append({
            "number": int(turn["number"]),
            "questionNumber": int(turn["questionNumber"]),
            "role": str(turn["role"]),
            "speaker": str(turn["speaker"]),
            "wordStart": cursor,
            "wordEnd": cursor + word_count,
        })
        cursor += word_count
    return ranges


def add_playback_boundaries(entry: object) -> None:
    """Backfill exact synthesized-turn ends without changing the published MP3."""
    if not isinstance(entry, dict):
        return
    ranges = entry.get("turnWordRanges")
    duration = entry.get("duration")
    if not isinstance(ranges, list) or not is_finite_number(duration):
        return
    for index, turn_range in enumerate(ranges):
        if not isinstance(turn_range, dict) or is_finite_number(turn_range.get("playbackEnd")):
            continue
        if index + 1 < len(ranges):
            next_range = ranges[index + 1]
            next_reveal = next_range.get("revealAt") if isinstance(next_range, dict) else None
            if not is_finite_number(next_reveal):
                continue
            playback_end = float(next_reveal) - TURN_GAP_SECONDS
        else:
            playback_end = float(duration)
        turn_range["playbackEnd"] = round(playback_end, 3)


def entry_validation_error(entry: object, exercise_id: str, exercise: dict[str, Any]) -> str | None:
    if not isinstance(entry, dict):
        return "manifest entry is missing or is not an object"
    text = str(exercise["text"])
    expected_words = [word for word, _ in shared.display_words(text)]
    words = entry.get("words")
    duration = entry.get("duration")
    ranges = entry.get("turnWordRanges")
    if entry.get("path") != audio_relative_path(exercise_id, exercise):
        return "audio path does not match the immutable source path"
    if entry.get("sourceSha256") != hashlib.sha256(text.encode("utf-8")).hexdigest():
        return "source SHA-256 does not match"
    if entry.get("spokenSourceSha256") != exercise_spoken_source_sha256(exercise):
        return "spoken-source SHA-256 does not match"
    if not is_finite_number(duration) or not 1 <= float(duration) <= 900:
        return "duration is missing, non-finite, or out of range"
    if not isinstance(words, list) or len(words) != len(expected_words):
        return "timed-word count does not match the displayed text"
    if entry.get("wordCount") != len(expected_words):
        return "wordCount does not match the timed-word array"
    if not isinstance(ranges, list) or len(ranges) != len(exercise["turns"]):
        return "turnWordRanges must contain every conversation turn"

    previous_end = 0.0
    for index, row in enumerate(words):
        if not isinstance(row, list) or len(row) != 3:
            return f"timing row {index} is not a three-item array"
        if row[0] != expected_words[index]:
            return f"timing row {index} does not match the displayed word"
        if not is_finite_number(row[1]) or not is_finite_number(row[2]):
            return f"timing row {index} contains a non-finite timestamp"
        start = float(row[1])
        end = float(row[2])
        if start < 0 or start < previous_end or end <= start:
            return f"timing row {index} is negative, overlapping, or zero-length"
        if end > float(duration) + shared.AUDIO_DURATION_TOLERANCE_SECONDS:
            return f"timing row {index} extends beyond the declared duration"
        previous_end = end

    expected_ranges = expected_turn_word_ranges(exercise)
    previous_playback_end = 0.0
    for index, (actual, expected) in enumerate(zip(ranges, expected_ranges)):
        if not isinstance(actual, dict):
            return f"turn range {index} is not an object"
        for key, value in expected.items():
            if actual.get(key) != value:
                return f"turn range {index} has an invalid {key}"
        word_start = int(expected["wordStart"])
        word_end = int(expected["wordEnd"])
        if word_end <= word_start:
            return f"turn range {index} contains no words"
        reveal_at = actual.get("revealAt")
        audio_start = actual.get("audioStart")
        audio_end = actual.get("audioEnd")
        playback_end = actual.get("playbackEnd")
        if not all(is_finite_number(value) for value in (reveal_at, audio_start, audio_end, playback_end)):
            return f"turn range {index} contains a non-finite audio boundary"
        if (
            float(reveal_at) < previous_playback_end
            or not float(reveal_at) < float(audio_start) < float(audio_end) <= float(playback_end)
            or float(playback_end) > float(duration)
        ):
            return f"turn range {index} boundaries are not ordered"
        if index and abs(float(reveal_at) - previous_playback_end - TURN_GAP_SECONDS) > 0.002:
            return f"turn range {index} does not follow the exact inter-turn gap"
        if float(audio_start) != float(words[word_start][1]):
            return f"turn range {index} audioStart does not match its first word"
        expected_lead = INITIAL_MESSAGE_LEAD_SECONDS if index == 0 else MESSAGE_LEAD_SECONDS
        actual_lead = float(audio_start) - float(reveal_at)
        if (
            actual_lead < expected_lead - 0.002
            or actual_lead > expected_lead + MAX_SPEECH_ONSET_SLACK_SECONDS
        ):
            return f"turn range {index} does not preserve the bounded message lead"
        if float(audio_end) != float(words[word_end - 1][2]):
            return f"turn range {index} audioEnd does not match its last word"
        previous_playback_end = float(playback_end)
    if abs(previous_playback_end - float(duration)) > 0.002:
        return "final turn playbackEnd does not match the module duration"
    return None


def manifest_meta(
    exercises: dict[str, dict[str, Any]],
    entries: dict[str, dict[str, object]],
    *,
    complete: bool,
) -> dict[str, object]:
    return {
        "engine": "Kokoro-82M",
        "model": "kokoro-v1.0.onnx",
        "buildVersion": AUDIO_BUILD_VERSION,
        "name": "Edmund Speaking Part 1 Dialogue",
        "speakers": recipe_payload()["audio"]["speakers"],
        "count": len(entries),
        "expectedCount": len(exercises),
        "complete": complete,
        "corpusSha256": corpus_sha256(exercises),
        "sampleRate": SAMPLE_RATE,
        "channels": 1,
        "format": "audio/mpeg",
        "bitrateMode": "variable",
        "compressionLevel": MP3_COMPRESSION_LEVEL,
        "sentencePause": SENTENCE_PAUSE_SECONDS,
        "turnGap": TURN_GAP_SECONDS,
        "messageLead": MESSAGE_LEAD_SECONDS,
        "initialMessageLead": INITIAL_MESSAGE_LEAD_SECONDS,
        "bookCount": len({int(exercise["book"]) for exercise in exercises.values()}),
        "books": sorted({int(exercise["book"]) for exercise in exercises.values()}),
        "questionCount": sum(len(exercise["questions"]) for exercise in exercises.values()),
        "turnCount": sum(len(exercise["turns"]) for exercise in exercises.values()),
        "sourceEnglishWordCount": source_english_word_count(exercises),
        "timedWordCount": sum(int(entry.get("wordCount", 0)) for entry in entries.values()),
        "spokenOverrideCount": len(PART1_SPOKEN_OVERRIDES),
        "spokenOverridesSha256": spoken_overrides_sha256(),
        "recipeSeedSpokenOverridesSha256": spoken_overrides_sha256(
            RECIPE_SEED_SPOKEN_OVERRIDES
        ),
        "wordTiming": WORD_TIMING_VERSION,
    }


def manifest_content(
    exercises: dict[str, dict[str, Any]],
    entries: dict[str, dict[str, object]],
    audio_sha256: dict[str, str],
    *,
    complete: bool,
) -> str:
    meta = manifest_meta(exercises, entries, complete=complete)
    return (
        "/* Generated by tools/generate-speaking-part1-audio.py. */\n"
        f"window.{ENTRIES_GLOBAL} = Object.freeze({json.dumps(entries, sort_keys=True, separators=(',', ':'))});\n"
        f"window.{META_GLOBAL} = Object.freeze({json.dumps(meta, separators=(',', ':'))});\n"
        f"window.{RECIPE_GLOBAL} = {json.dumps(recipe_sha256())};\n"
        f"window.{SHA256_GLOBAL} = Object.freeze({json.dumps(audio_sha256, sort_keys=True, separators=(',', ':'))});\n"
    )


def write_manifest(
    path: Path,
    exercises: dict[str, dict[str, Any]],
    entries: dict[str, dict[str, object]],
    audio_sha256: dict[str, str],
    *,
    complete: bool,
) -> None:
    if set(entries) != set(audio_sha256):
        raise ValueError("Part 1 entries and audio hashes do not have identical ids")
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    temporary.write_text(
        manifest_content(exercises, entries, audio_sha256, complete=complete),
        encoding="utf-8",
    )
    temporary.replace(path)


def verify_runtime_versions() -> None:
    for package, expected in EXPECTED_RUNTIME_VERSIONS.items():
        actual = importlib.metadata.version(package)
        if actual != expected:
            raise SystemExit(f"{package} must be {expected}, found {actual}")


def prune_orphans(output_root: Path, expected_paths: set[str]) -> int:
    audio_root = output_root / STATIC_AUDIO_ROOT
    removed = 0
    for path in audio_root.glob("*/*.mp3"):
        if path.relative_to(output_root).as_posix() not in expected_paths:
            path.unlink()
            removed += 1
    return removed


def parse_book_selection(value: str) -> tuple[int, ...]:
    selected: set[int] = set()
    for raw_part in str(value).split(","):
        part = raw_part.strip()
        if not part:
            continue
        if "-" in part:
            raw_start, raw_end = part.split("-", 1)
            try:
                start = int(raw_start)
                end = int(raw_end)
            except ValueError as error:
                raise argparse.ArgumentTypeError(f"Invalid book range {part!r}") from error
            if start > end:
                raise argparse.ArgumentTypeError(f"Invalid descending book range {part!r}")
            selected.update(range(start, end + 1))
        else:
            try:
                selected.add(int(part))
            except ValueError as error:
                raise argparse.ArgumentTypeError(f"Invalid book number {part!r}") from error
    books = tuple(sorted(selected))
    if not books or any(book not in SUPPORTED_BOOKS for book in books):
        raise argparse.ArgumentTypeError("Books must be a non-empty subset of 1-14")
    return books


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--output-root", type=Path, required=True)
    parser.add_argument("--model", type=Path)
    parser.add_argument("--voices", type=Path)
    parser.add_argument("--alignment-cache", type=Path)
    parser.add_argument(
        "--books",
        type=parse_book_selection,
        default=SUPPORTED_BOOKS,
        help="Books to process, for example 1-5 or 1,3,5 (default: 1-14)",
    )
    parser.add_argument("--validate-source", action="store_true")
    parser.add_argument("--write-placeholder", action="store_true")
    parser.add_argument("--manifest-only", action="store_true")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--prune-orphans", action="store_true")
    args = parser.parse_args()
    if args.prune_orphans and tuple(args.books) != SUPPORTED_BOOKS:
        parser.error("--prune-orphans requires the complete 1-14 book selection")
    return args


def main() -> int:
    global SELECTED_BOOKS
    args = parse_args()
    SELECTED_BOOKS = tuple(args.books)
    source_root = args.source_root.resolve()
    output_root = args.output_root.resolve()
    validate_spoken_overrides(source_root)
    exercises = load_exercises(source_root)
    manifest_path = output_root / MANIFEST_NAME

    if args.manifest_only and (args.force or args.prune_orphans or args.write_placeholder):
        raise SystemExit("--manifest-only is strictly read-only")
    if args.validate_source:
        print(
            f"Part 1 source valid: {len(exercises)} module, "
            f"{sum(len(exercise['turns']) for exercise in exercises.values())} turns, "
            f"{source_english_word_count(exercises)} English words."
        )
        return 0
    if args.write_placeholder:
        existing = load_manifest(manifest_path)
        if existing and existing["entries"] and not args.force:
            raise SystemExit("Refusing to replace a non-empty Part 1 manifest")
        write_manifest(manifest_path, exercises, {}, {}, complete=False)
        print("Wrote incomplete Part 1 audio placeholder.")
        return 0

    sf = shared.load_soundfile_dependency()
    existing_manifest = load_manifest(manifest_path)
    if manifest_path.exists() and existing_manifest is None:
        raise SystemExit("Part 1 audio manifest is unreadable")
    if existing_manifest and existing_manifest["recipeSha256"] != recipe_sha256():
        if existing_manifest["meta"].get("buildVersion") == AUDIO_BUILD_VERSION:
            raise SystemExit("Part 1 recipe drift detected; bump AUDIO_BUILD_VERSION")
        existing_manifest = None

    existing_entries = existing_manifest["entries"] if existing_manifest else {}
    existing_hashes = existing_manifest["audioSha256"] if existing_manifest else {}
    complete_entries: dict[str, dict[str, object]] = {}
    complete_hashes: dict[str, str] = {}
    pending: list[tuple[str, dict[str, Any], Path, str]] = []
    expected_paths: set[str] = set()
    for exercise_id, exercise in exercises.items():
        relative = audio_relative_path(exercise_id, exercise)
        expected_paths.add(relative)
        path = output_root / relative
        entry = existing_entries.get(exercise_id)
        add_playback_boundaries(entry)
        error = entry_validation_error(entry, exercise_id, exercise)
        if error is None:
            error = shared.audio_validation_error(
                path,
                sf,
                expected_sha256=existing_hashes.get(exercise_id),
                expected_duration=entry.get("duration") if isinstance(entry, dict) else None,
            )
        reason = "forced regeneration" if args.force else error
        if reason:
            pending.append((exercise_id, exercise, path, reason))
        else:
            complete_entries[exercise_id] = entry
            complete_hashes[exercise_id] = existing_hashes[exercise_id]

    if args.manifest_only:
        if pending:
            raise SystemExit(f"Part 1 audio is incomplete or invalid: {pending[0][0]}: {pending[0][3]}")
        expected = manifest_content(exercises, complete_entries, complete_hashes, complete=True)
        if existing_manifest is None or existing_manifest["source"] != expected:
            raise SystemExit("Part 1 manifest metadata or serialization is stale")
        print(
            f"Part 1 audio valid: {len(exercises)} module, "
            f"{sum(int(entry['wordCount']) for entry in complete_entries.values())} timed words."
        )
        return 0

    if pending:
        if args.model is None or args.voices is None:
            raise SystemExit("--model and --voices are required for generation")
        shared.verify_model_files(args.model.resolve(), args.voices.resolve())
        verify_runtime_versions()
        np, WhisperModel, Kokoro = shared.load_generation_dependencies()
        kokoro = Kokoro(str(args.model.resolve()), str(args.voices.resolve()))
        aligner = WhisperModel(
            ALIGNMENT_MODEL,
            device="cpu",
            compute_type="int8",
            download_root=str(args.alignment_cache.resolve()) if args.alignment_cache else None,
        )
        write_manifest(manifest_path, exercises, complete_entries, complete_hashes, complete=False)

        for exercise_id, exercise, output_path, _ in pending:
            chunks: list[Any] = []
            words: list[list[object]] = []
            turn_ranges: list[dict[str, object]] = []
            elapsed_samples = 0
            for turn_index, turn in enumerate(exercise["turns"]):
                if turn_index:
                    gap = np.zeros(round(SAMPLE_RATE * TURN_GAP_SECONDS), dtype=np.float32)
                    chunks.append(gap)
                    elapsed_samples += len(gap)
                reveal_at = round(elapsed_samples / SAMPLE_RATE, 3)
                lead_seconds = INITIAL_MESSAGE_LEAD_SECONDS if turn_index == 0 else MESSAGE_LEAD_SECONDS
                lead = np.zeros(round(SAMPLE_RATE * lead_seconds), dtype=np.float32)
                chunks.append(lead)
                elapsed_samples += len(lead)
                word_start = len(words)
                for sentence_index, sentence in enumerate(turn["sentences"]):
                    audio, chunk_rate = kokoro.create(
                        spoken_text(str(sentence)),
                        voice=str(turn["voice"]),
                        speed=float(turn["speed"]),
                        lang=str(turn["language"]),
                    )
                    if chunk_rate != SAMPLE_RATE:
                        raise ValueError(f"Unexpected {chunk_rate} Hz sample rate for {exercise_id}")
                    chunk = np.asarray(audio, dtype=np.float32)
                    words.extend(shared.align_sentence_words(
                        str(sentence),
                        chunk,
                        SAMPLE_RATE,
                        elapsed_samples / SAMPLE_RATE,
                        aligner,
                        np,
                    ))
                    chunks.append(chunk)
                    elapsed_samples += len(chunk)
                    if sentence_index < len(turn["sentences"]) - 1:
                        pause = np.zeros(round(SAMPLE_RATE * SENTENCE_PAUSE_SECONDS), dtype=np.float32)
                        chunks.append(pause)
                        elapsed_samples += len(pause)
                word_end = len(words)
                playback_end = round(elapsed_samples / SAMPLE_RATE, 3)
                turn_ranges.append({
                    "number": int(turn["number"]),
                    "questionNumber": int(turn["questionNumber"]),
                    "role": str(turn["role"]),
                    "speaker": str(turn["speaker"]),
                    "wordStart": word_start,
                    "wordEnd": word_end,
                    "revealAt": reveal_at,
                    "audioStart": words[word_start][1],
                    "audioEnd": words[word_end - 1][2],
                    "playbackEnd": playback_end,
                })

            output_path.parent.mkdir(parents=True, exist_ok=True)
            temporary = output_path.with_name(f".{output_path.stem}.{os.getpid()}.tmp")
            sf.write(
                temporary,
                np.concatenate(chunks),
                SAMPLE_RATE,
                format="MP3",
                subtype="MPEG_LAYER_III",
                compression_level=MP3_COMPRESSION_LEVEL,
                bitrate_mode="VARIABLE",
            )
            temporary.replace(output_path)
            text = str(exercise["text"])
            entry: dict[str, object] = {
                "path": audio_relative_path(exercise_id, exercise),
                "sourceSha256": hashlib.sha256(text.encode("utf-8")).hexdigest(),
                "spokenSourceSha256": exercise_spoken_source_sha256(exercise),
                "wordCount": len(words),
                "duration": round(elapsed_samples / SAMPLE_RATE, 3),
                "turnWordRanges": turn_ranges,
                "words": words,
            }
            audio_hash = shared.sha256_file(output_path)
            error = entry_validation_error(entry, exercise_id, exercise) or shared.audio_validation_error(
                output_path,
                sf,
                expected_sha256=audio_hash,
                expected_duration=entry["duration"],
            )
            if error:
                raise ValueError(f"Generated Part 1 audio failed validation: {error}")
            complete_entries[exercise_id] = entry
            complete_hashes[exercise_id] = audio_hash
            write_manifest(manifest_path, exercises, complete_entries, complete_hashes, complete=False)
            print(f"Generated: {exercise_id}", flush=True)

    for exercise_id, exercise in exercises.items():
        entry = complete_entries.get(exercise_id)
        error = entry_validation_error(entry, exercise_id, exercise)
        if error:
            raise SystemExit(f"Part 1 audio validation failed: {exercise_id}: {error}")
        audio_error = shared.audio_validation_error(
            output_root / str(entry["path"]),
            sf,
            expected_sha256=complete_hashes.get(exercise_id),
            expected_duration=entry.get("duration"),
        )
        if audio_error:
            raise SystemExit(f"Part 1 audio validation failed: {exercise_id}: {audio_error}")

    write_manifest(manifest_path, exercises, complete_entries, complete_hashes, complete=True)
    if args.prune_orphans:
        print(f"Pruned {prune_orphans(output_root, expected_paths)} orphan MP3 file(s).")
    print(f"Part 1 audio complete: {len(complete_entries)} module.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
