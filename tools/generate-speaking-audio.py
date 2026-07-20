#!/usr/bin/env python3
"""Generate immutable British-voice MP3s for IELTS Speaking Part 2, Books 1–16.

Each exercise receives one continuous MP3. The four English response sections
are the source of truth; sentences are rendered separately and joined with the
fixed speaking pauses. Faster Whisper measures each rendered sentence so the
browser can highlight and seek every visible word without cumulative drift.
"""

from __future__ import annotations

import argparse
import difflib
import hashlib
import json
import math
import os
import re
from pathlib import Path
from typing import Any


AUDIO_BUILD_VERSION = "v1"
STATIC_AUDIO_ROOT = f"assets/speaking-system/audio/edmund-neural/{AUDIO_BUILD_VERSION}"
SOURCE_DATA_PATH = "tools/ielts-speaking-part2-structured.json"
MANIFEST_NAME = "speaking-audio-manifest.js"

VOICE = "bm_fable"
LANGUAGE = "en-gb"
SPEED = 0.98
SAMPLE_RATE = 24000
MP3_COMPRESSION_LEVEL = 0.55
SENTENCE_PAUSE_SECONDS = 0.45
SECTION_PAUSE_SECONDS = 0.72
ALIGNMENT_MODEL = "base.en"
WORD_TIMING_VERSION = "faster-whisper-base.en-audio-v1"
RECIPE_SCHEMA_VERSION = 1
AUDIO_DURATION_TOLERANCE_SECONDS = 0.01
MINIMUM_WORD_DURATION_SECONDS = 0.001
INITIALISM_OVERRIDES = ("DSE", "QR", "UK", "US", "HK")

EXPECTED_BOOKS = tuple(range(1, 17))
EXPECTED_SECTIONS_PER_EXERCISE = 4
MODEL_SHA256 = "7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5"
VOICES_SHA256 = "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d"

WORD_PATTERN = re.compile(r"[^\W_]+(?:[’'][^\W_]+)*(?:-[^\W_]+)*", re.UNICODE)
SOURCE_ENGLISH_WORD_PATTERN = re.compile(
    r"\b[A-Za-z]+(?:[’'][A-Za-z]+)*(?:-[A-Za-z]+)*\b"
)
SENTENCE_BOUNDARY_PATTERN = re.compile(
    r"(?P<end>[.!?][”\"’']?)(?P<space>\s+)(?=(?:[“\"‘']?[A-Z]))"
)
ABBREVIATION_PATTERN = re.compile(
    r"\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St)\.$",
    re.IGNORECASE,
)


def stable_exercise_id(book: int, index: int) -> str:
    return f"ielts-part-2-book-{book}-exercise-{index:02d}"


def split_sentences(text: str) -> list[str]:
    """Split sentences without treating titles such as “Mrs.” as endings."""
    sentences: list[str] = []
    cursor = 0
    for match in SENTENCE_BOUNDARY_PATTERN.finditer(text):
        candidate = text[cursor : match.start("space")]
        if ABBREVIATION_PATTERN.search(candidate):
            continue
        clean = candidate.strip()
        if clean:
            sentences.append(clean)
        cursor = match.end("space")
    tail = text[cursor:].strip()
    if tail:
        sentences.append(tail)
    if not sentences or " ".join(sentences) != text:
        raise ValueError(f"Sentence splitting changed source text: {text!r}")
    return sentences


def load_exercises(source_root: Path) -> dict[str, dict[str, Any]]:
    source_path = source_root / SOURCE_DATA_PATH
    payload = json.loads(source_path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict) or not isinstance(payload.get("books"), list):
        raise ValueError("Speaking source must contain a books array")
    expected_header = {
        "schema_version": 2,
        "exam": "IELTS",
        "part": 2,
        "book_count": len(EXPECTED_BOOKS),
    }
    for key, expected in expected_header.items():
        if payload.get(key) != expected:
            raise ValueError(f"Speaking source {key} must be {expected!r}")
    source_books = payload["books"]
    if [book.get("book") if isinstance(book, dict) else None for book in source_books] != list(EXPECTED_BOOKS):
        raise ValueError("Speaking source books must be ordered from Book 1 through Book 16")

    exercises: dict[str, dict[str, Any]] = {}
    source_word_count = 0
    for expected_book, source_book in zip(EXPECTED_BOOKS, source_books):
        if not isinstance(source_book, dict) or source_book.get("part") != 2:
            raise ValueError(f"Book {expected_book} is invalid")
        source_exercises = source_book.get("exercises")
        if not isinstance(source_exercises, list) or not source_exercises:
            raise ValueError(f"Book {expected_book} has no exercises")
        if source_book.get("exercise_count") != len(source_exercises):
            raise ValueError(f"Book {expected_book} exercise_count does not match its exercises array")

        for expected_index, source_exercise in enumerate(source_exercises, start=1):
            where = f"Book {expected_book}, exercise {expected_index}"
            if not isinstance(source_exercise, dict) or source_exercise.get("index") != expected_index:
                raise ValueError(f"{where} is invalid or out of order")
            sections = source_exercise.get("sections")
            if not isinstance(sections, list) or len(sections) != EXPECTED_SECTIONS_PER_EXERCISE:
                count = len(sections) if isinstance(sections, list) else 0
                raise ValueError(
                    f"{where} has {count} sections; expected {EXPECTED_SECTIONS_PER_EXERCISE}"
                )

            section_texts: list[str] = []
            sentence_groups: list[list[str]] = []
            for expected_number, section in enumerate(sections, start=1):
                if not isinstance(section, dict) or section.get("number") != expected_number:
                    raise ValueError(
                        f"{where}, section {expected_number} is invalid or out of order"
                    )
                english_text = section.get("english_text")
                if not isinstance(english_text, str) or not english_text.strip():
                    raise ValueError(f"{where}, section {expected_number} has no English text")
                if english_text != english_text.strip() or re.search(r"\s{2,}", english_text):
                    raise ValueError(
                        f"{where}, section {expected_number} has unexpected whitespace"
                    )
                section_texts.append(english_text)
                sentence_groups.append(split_sentences(english_text))
                source_word_count += len(SOURCE_ENGLISH_WORD_PATTERN.findall(english_text))

            exercise_id = stable_exercise_id(expected_book, expected_index)
            full_text = "\n\n".join(section_texts)
            exercises[exercise_id] = {
                "part": 2,
                "book": expected_book,
                "index": expected_index,
                "title": str(source_exercise.get("title") or exercise_id),
                "sections": section_texts,
                "sentences": sentence_groups,
                "text": full_text,
            }

    if payload.get("exercise_count") != len(exercises):
        raise ValueError("Source exercise_count does not match the validated corpus")
    if payload.get("section_count") != len(exercises) * EXPECTED_SECTIONS_PER_EXERCISE:
        raise ValueError("Source section_count does not match the validated corpus")
    if payload.get("english_word_count") != source_word_count:
        raise ValueError("Source english_word_count does not match the validated corpus")
    return exercises


def source_english_word_count(exercises: dict[str, dict[str, Any]]) -> int:
    return sum(
        len(SOURCE_ENGLISH_WORD_PATTERN.findall(str(section)))
        for exercise in exercises.values()
        for section in exercise["sections"]
    )


def spoken_text(value: str) -> str:
    """Apply pronunciation-only expansions without changing displayed text."""
    text = re.sub(r"(?:\.{3}|…+)", ", ", value)
    text = re.sub(r"\bIELTS\b", "eye elts", text)
    for initialism in INITIALISM_OVERRIDES:
        text = re.sub(rf"\b{initialism}\b", " ".join(initialism), text)
    return re.sub(r"\s+", " ", text).strip()


def display_words(value: str) -> list[tuple[str, str]]:
    """Return each visible word and the punctuation following it."""
    matches = list(WORD_PATTERN.finditer(value))
    return [
        (
            match.group(0),
            value[
                match.end() :
                matches[index + 1].start() if index + 1 < len(matches) else len(value)
            ],
        )
        for index, match in enumerate(matches)
    ]


def normalized_chars(value: str) -> str:
    return "".join(char for char in value.casefold() if char.isalnum())


def resample_for_alignment(audio: Any, sample_rate: int, np: Any) -> Any:
    """Return a mono 16 kHz waveform, the native input rate for Whisper."""
    if sample_rate == 16000:
        return np.asarray(audio, dtype=np.float32)
    source = np.asarray(audio, dtype=np.float32)
    target_length = max(1, round(len(source) * 16000 / sample_rate))
    source_positions = np.arange(len(source), dtype=np.float64)
    target_positions = np.arange(target_length, dtype=np.float64) * sample_rate / 16000
    return np.interp(target_positions, source_positions, source).astype(np.float32)


def align_sentence_words(
    sentence: str,
    audio: Any,
    sample_rate: int,
    start_seconds: float,
    aligner: Any,
    np: Any,
) -> list[list[object]]:
    """Derive visible-word timings from the generated sentence audio itself."""
    visible = display_words(sentence)
    if not visible:
        return []
    segments, _ = aligner.transcribe(
        resample_for_alignment(audio, sample_rate, np),
        language="en",
        task="transcribe",
        beam_size=5,
        word_timestamps=True,
        vad_filter=False,
        condition_on_previous_text=False,
        initial_prompt=spoken_text(sentence),
    )
    recognized: list[tuple[str, float, float]] = []
    for segment in segments:
        for word in segment.words or []:
            token = normalized_chars(word.word)
            if token and word.start is not None and word.end is not None:
                recognized.append((token, float(word.start), float(word.end)))
    if not recognized:
        raise ValueError(f"Speech alignment returned no words for: {sentence!r}")

    expected_text = "".join(normalized_chars(word) for word, _ in visible)
    recognized_text = "".join(token for token, _, _ in recognized)
    matcher = difflib.SequenceMatcher(None, expected_text, recognized_text, autojunk=False)
    char_map: dict[int, int] = {}
    matched_chars = 0
    for expected_start, recognized_start, size in matcher.get_matching_blocks():
        for offset in range(size):
            char_map[expected_start + offset] = recognized_start + offset
        matched_chars += size
    confidence = matched_chars / max(1, len(expected_text))
    if confidence < 0.82:
        raise ValueError(
            f"Low-confidence speech alignment ({confidence:.1%}) for: {sentence!r}"
        )

    recognized_char_times: list[tuple[float, float]] = []
    for token, token_start, token_end in recognized:
        duration = max(0.01, token_end - token_start)
        for index in range(len(token)):
            recognized_char_times.append((
                token_start + duration * index / len(token),
                token_start + duration * (index + 1) / len(token),
            ))

    raw: list[tuple[float, float] | None] = []
    cursor = 0
    for word, _ in visible:
        length = len(normalized_chars(word))
        mapped = [
            char_map[index]
            for index in range(cursor, cursor + length)
            if index in char_map
        ]
        if mapped:
            raw.append((
                recognized_char_times[min(mapped)][0],
                recognized_char_times[max(mapped)][1],
            ))
        else:
            raw.append(None)
        cursor += length

    # Rare ASR substitutions are filled only inside their immediate neighbours;
    # every following sentence starts from a fresh audio-derived alignment.
    duration_seconds = len(audio) / sample_rate
    for index, timing in enumerate(raw):
        if timing is not None:
            continue
        previous_end = raw[index - 1][1] if index and raw[index - 1] else 0.0
        next_start = next(
            (candidate[0] for candidate in raw[index + 1 :] if candidate is not None),
            duration_seconds,
        )
        missing_end = index + 1
        while missing_end < len(raw) and raw[missing_end] is None:
            missing_end += 1
        missing_start = index
        while missing_start and raw[missing_start - 1] is None:
            missing_start -= 1
        slot_count = missing_end - missing_start
        slot_index = index - missing_start
        slot = max(0.01, next_start - previous_end) / slot_count
        raw[index] = (
            previous_end + slot * slot_index,
            previous_end + slot * (slot_index + 1),
        )

    timings: list[list[object]] = []
    previous_end = round(start_seconds, 3)
    for (word, _), timing in zip(visible, raw):
        assert timing is not None
        word_start = max(previous_end, start_seconds + timing[0])
        word_end = max(
            word_start,
            min(start_seconds + duration_seconds, start_seconds + timing[1]),
        )
        rounded_start = max(previous_end, round(word_start, 3))
        # Keep every highlight target visible for a positive interval even when
        # two ASR boundaries round to the same millisecond.
        rounded_end = max(
            rounded_start + MINIMUM_WORD_DURATION_SECONDS,
            round(word_end, 3),
        )
        timings.append([word, rounded_start, rounded_end])
        previous_end = rounded_end
    return timings


def audio_relative_path(exercise_id: str, text: str) -> str:
    source_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
    digest = source_hash[:24]
    safe_id = re.sub(r"[^a-z0-9-]+", "-", exercise_id.casefold()).strip("-")
    return f"{STATIC_AUDIO_ROOT}/{digest[:2]}/{safe_id}-{digest}.mp3"


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def verify_model_files(model_path: Path, voices_path: Path) -> None:
    for label, path, expected in (
        ("Kokoro model", model_path, MODEL_SHA256),
        ("Kokoro voices", voices_path, VOICES_SHA256),
    ):
        if not path.is_file():
            raise SystemExit(f"{label} file not found: {path}")
        actual = sha256_file(path)
        if actual != expected:
            raise SystemExit(
                f"{label} checksum mismatch: expected {expected}, found {actual}"
            )


def is_finite_number(value: object) -> bool:
    return (
        isinstance(value, (int, float))
        and not isinstance(value, bool)
        and math.isfinite(float(value))
    )


def audio_validation_error(
    path: Path,
    sf: Any,
    *,
    expected_sha256: object,
    expected_duration: object,
) -> str | None:
    if not path.is_file() or path.stat().st_size <= 1000:
        return "MP3 file is missing or too small"
    if not isinstance(expected_sha256, str) or not re.fullmatch(r"[0-9a-f]{64}", expected_sha256):
        return "manifest has no valid MP3 SHA-256"
    if not is_finite_number(expected_duration):
        return "manifest has no valid duration"
    try:
        info = sf.info(path)
    except Exception as error:
        return f"MP3 cannot be decoded ({error})"
    if info.format != "MP3":
        return f"expected MP3 format, found {info.format}"
    if info.samplerate != SAMPLE_RATE:
        return f"expected {SAMPLE_RATE} Hz, found {info.samplerate} Hz"
    if info.channels != 1:
        return f"expected mono audio, found {info.channels} channels"
    if not 1 <= info.duration <= 900:
        return f"decoded duration is out of range ({info.duration:.3f}s)"
    if abs(info.duration - float(expected_duration)) > AUDIO_DURATION_TOLERANCE_SECONDS:
        return (
            f"decoded duration {info.duration:.3f}s does not match manifest "
            f"duration {float(expected_duration):.3f}s"
        )
    if sha256_file(path) != expected_sha256:
        return "MP3 SHA-256 does not match the persisted manifest hash"
    return None


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
    entries = manifest_json_object(source, "EDMUND_SPEAKING_AUDIO")
    meta = manifest_json_object(source, "EDMUND_SPEAKING_AUDIO_META")
    audio_sha256 = manifest_json_object(source, "EDMUND_SPEAKING_AUDIO_SHA256")
    recipe_match = re.search(
        r'window\.EDMUND_SPEAKING_AUDIO_RECIPE_SHA256\s*=\s*("[0-9a-f]{64}");',
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


def section_word_ranges(exercise: dict[str, Any]) -> list[dict[str, int]]:
    ranges: list[dict[str, int]] = []
    cursor = 0
    for number, text in enumerate(exercise["sections"], start=1):
        count = len(display_words(str(text)))
        ranges.append({"number": number, "wordStart": cursor, "wordEnd": cursor + count})
        cursor += count
    return ranges


def entry_validation_error(
    entry: object,
    exercise_id: str,
    exercise: dict[str, Any],
) -> str | None:
    if not isinstance(entry, dict):
        return "manifest entry is missing or is not an object"
    text = str(exercise["text"])
    expected_words = [word for word, _ in display_words(text)]
    words = entry.get("words")
    duration = entry.get("duration")
    if entry.get("path") != audio_relative_path(exercise_id, text):
        return "audio path does not match the source-derived immutable path"
    if entry.get("sourceSha256") != hashlib.sha256(text.encode("utf-8")).hexdigest():
        return "source SHA-256 does not match"
    if entry.get("sectionWordRanges") != section_word_ranges(exercise):
        return "section word ranges do not match"
    if not is_finite_number(duration) or not 1 <= float(duration) <= 900:
        return "duration is missing, non-finite, or out of range"
    if not isinstance(words, list) or len(words) != len(expected_words):
        return "timed-word count does not match the displayed text"
    if entry.get("wordCount") != len(expected_words):
        return "wordCount does not match the timed-word array"

    previous_end = 0.0
    for index, row in enumerate(words):
        if not isinstance(row, list) or len(row) != 3:
            return f"timing row {index} is not a three-item array"
        if row[0] != expected_words[index]:
            return f"timing row {index} does not match the displayed word"
        if not is_finite_number(row[1]) or not is_finite_number(row[2]):
            return f"timing row {index} has a non-finite timestamp"
        start = float(row[1])
        end = float(row[2])
        if start < 0 or start < previous_end or end <= start:
            return f"timing row {index} is negative, overlapping, or zero-length"
        if end > float(duration) + AUDIO_DURATION_TOLERANCE_SECONDS:
            return f"timing row {index} extends beyond the declared duration"
        previous_end = end
    return None


def entry_matches_exercise(
    entry: object,
    exercise_id: str,
    exercise: dict[str, Any],
) -> bool:
    return entry_validation_error(entry, exercise_id, exercise) is None


def corpus_sha256(exercises: dict[str, dict[str, Any]]) -> str:
    return hashlib.sha256(
        "\n".join(
            f"{key}\0{exercises[key]['text']}"
            for key in sorted(exercises)
        ).encode("utf-8")
    ).hexdigest()


def recipe_payload() -> dict[str, Any]:
    """Return every setting that can change rendered audio or word timings."""
    return {
        "schemaVersion": RECIPE_SCHEMA_VERSION,
        "engine": "Kokoro-82M",
        "model": {
            "file": "kokoro-v1.0.onnx",
            "sha256": MODEL_SHA256,
            "voicesSha256": VOICES_SHA256,
        },
        "audio": {
            "buildVersion": AUDIO_BUILD_VERSION,
            "staticRoot": STATIC_AUDIO_ROOT,
            "voice": VOICE,
            "language": LANGUAGE,
            "speed": SPEED,
            "sampleRate": SAMPLE_RATE,
            "channels": 1,
            "format": "audio/mpeg",
            "subtype": "MPEG_LAYER_III",
            "bitrateMode": "variable",
            "compressionLevel": MP3_COMPRESSION_LEVEL,
            "sentencePause": SENTENCE_PAUSE_SECONDS,
            "sectionPause": SECTION_PAUSE_SECONDS,
        },
        "alignment": {
            "model": ALIGNMENT_MODEL,
            "computeType": "int8",
            "beamSize": 5,
            "vadFilter": False,
            "conditionOnPreviousText": False,
            "minimumWordDuration": MINIMUM_WORD_DURATION_SECONDS,
            "wordTiming": WORD_TIMING_VERSION,
        },
        "pronunciation": {
            "ellipsisReplacement": ", ",
            "ieltsReplacement": "eye elts",
            "spelledInitialisms": list(INITIALISM_OVERRIDES),
        },
    }


def recipe_sha256() -> str:
    encoded = json.dumps(
        recipe_payload(),
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.sha256(encoded.encode("utf-8")).hexdigest()


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
        "name": "Edmund Speaking Neural",
        "voice": VOICE,
        "language": LANGUAGE,
        "speed": SPEED,
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
        "sectionPause": SECTION_PAUSE_SECONDS,
        "sourceEnglishWordCount": source_english_word_count(exercises),
        "timedWordCount": sum(int(entry.get("wordCount", 0)) for entry in entries.values()),
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
        "/* Generated by tools/generate-speaking-audio.py. */\n"
        f"window.EDMUND_SPEAKING_AUDIO = Object.freeze({json.dumps(entries, sort_keys=True, separators=(',', ':'))});\n"
        f"window.EDMUND_SPEAKING_AUDIO_META = Object.freeze({json.dumps(meta, separators=(',', ':'))});\n"
        f"window.EDMUND_SPEAKING_AUDIO_RECIPE_SHA256 = {json.dumps(recipe_sha256())};\n"
        f"window.EDMUND_SPEAKING_AUDIO_SHA256 = Object.freeze({json.dumps(audio_sha256, sort_keys=True, separators=(',', ':'))});\n"
    )


def write_manifest(
    path: Path,
    exercises: dict[str, dict[str, Any]],
    entries: dict[str, dict[str, object]],
    audio_sha256: dict[str, str],
    *,
    complete: bool,
) -> None:
    if set(audio_sha256) != set(entries):
        raise ValueError("Speaking manifest entries and MP3 hashes do not have identical ids")
    content = manifest_content(
        exercises,
        entries,
        audio_sha256,
        complete=complete,
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    temp_path.write_text(content, encoding="utf-8")
    temp_path.replace(path)


def prune_orphans(output_root: Path, expected_paths: set[str]) -> int:
    audio_root = output_root / STATIC_AUDIO_ROOT
    removed = 0
    for path in audio_root.glob("*/*.mp3"):
        if path.relative_to(output_root).as_posix() not in expected_paths:
            path.unlink()
            removed += 1
    return removed


def load_soundfile_dependency() -> Any:
    try:
        import soundfile as sf
    except ImportError as error:
        raise SystemExit(
            "Speaking audio dependencies are missing. Install tools/requirements-tts.txt "
            "inside the repository TTS virtual environment."
        ) from error
    return sf


def load_generation_dependencies() -> tuple[Any, Any, Any]:
    try:
        import numpy as np
        from faster_whisper import WhisperModel
        from kokoro_onnx import Kokoro
    except ImportError as error:
        raise SystemExit(
            "Speaking audio dependencies are missing. Install tools/requirements-tts.txt "
            "inside the repository TTS virtual environment."
        ) from error
    return np, WhisperModel, Kokoro


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--output-root", type=Path, required=True)
    parser.add_argument("--model", type=Path)
    parser.add_argument("--voices", type=Path)
    parser.add_argument("--alignment-cache", type=Path)
    parser.add_argument(
        "--validate-source",
        action="store_true",
        help="Validate the corpus without importing audio dependencies",
    )
    parser.add_argument(
        "--write-placeholder",
        action="store_true",
        help="Write an incomplete empty manifest without synthesizing audio",
    )
    parser.add_argument(
        "--manifest-only",
        action="store_true",
        help="Strictly validate the complete manifest and MP3s without changing any files",
    )
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--prune-orphans", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    source_root = args.source_root.resolve()
    output_root = args.output_root.resolve()
    exercises = load_exercises(source_root)
    manifest_path = output_root / MANIFEST_NAME

    if args.manifest_only and (args.force or args.prune_orphans or args.write_placeholder):
        raise SystemExit(
            "--manifest-only is strictly read-only and cannot be combined with "
            "--force, --prune-orphans, or --write-placeholder"
        )

    if args.validate_source:
        print(
            f"Speaking source valid: {len(exercises)} exercises, "
            f"{len(exercises) * EXPECTED_SECTIONS_PER_EXERCISE} sections, "
            f"{source_english_word_count(exercises):,} English words."
        )
        return 0

    if args.write_placeholder:
        existing = load_manifest(manifest_path)
        if manifest_path.exists() and existing is None and not args.force:
            raise SystemExit(
                "Refusing to replace an unreadable speaking manifest; add --force if intentional"
            )
        if existing and existing["entries"] and not args.force:
            raise SystemExit(
                "Refusing to replace a non-empty speaking manifest; add --force if intentional"
            )
        write_manifest(manifest_path, exercises, {}, {}, complete=False)
        print(f"Wrote incomplete placeholder manifest for {len(exercises)} exercises.")
        return 0

    sf = load_soundfile_dependency()
    existing_manifest = load_manifest(manifest_path)
    if manifest_path.exists() and existing_manifest is None:
        raise SystemExit(
            "Speaking manifest is missing required entries, metadata, recipe hash, "
            "or MP3 hashes"
        )
    if existing_manifest and existing_manifest["recipeSha256"] != recipe_sha256():
        existing_version = existing_manifest["meta"].get("buildVersion")
        if existing_version == AUDIO_BUILD_VERSION:
            raise SystemExit(
                "Speaking audio recipe drift detected for the current build version. "
                "Bump AUDIO_BUILD_VERSION and rebuild instead of reusing or overwriting "
                "the current immutable audio paths."
            )
        if args.manifest_only:
            raise SystemExit(
                f"Speaking manifest is for build {existing_version!r}, not "
                f"{AUDIO_BUILD_VERSION!r}"
            )
        # A deliberate version bump starts a fresh manifest while leaving the
        # previous version's immutable MP3 tree untouched.
        existing_manifest = None

    existing_entries = existing_manifest["entries"] if existing_manifest else {}
    existing_audio_sha256 = existing_manifest["audioSha256"] if existing_manifest else {}
    complete_entries: dict[str, dict[str, object]] = {}
    complete_audio_sha256: dict[str, str] = {}
    pending: list[tuple[str, dict[str, Any], Path, str]] = []
    expected_paths: set[str] = set()

    for exercise_id, exercise in exercises.items():
        relative_path = audio_relative_path(exercise_id, str(exercise["text"]))
        expected_paths.add(relative_path)
        output_path = output_root / relative_path
        entry = existing_entries.get(exercise_id)
        entry_error = entry_validation_error(entry, exercise_id, exercise)
        audio_error = None
        if entry_error is None:
            assert isinstance(entry, dict)
            audio_error = audio_validation_error(
                output_path,
                sf,
                expected_sha256=existing_audio_sha256.get(exercise_id),
                expected_duration=entry.get("duration"),
            )
        reason = "forced regeneration" if args.force else entry_error or audio_error
        if reason:
            pending.append((exercise_id, exercise, output_path, reason))
            continue
        assert isinstance(entry, dict)
        audio_hash = existing_audio_sha256.get(exercise_id)
        assert isinstance(audio_hash, str)
        complete_entries[exercise_id] = entry
        complete_audio_sha256[exercise_id] = audio_hash

    if args.manifest_only:
        if pending:
            details = "; ".join(
                f"{exercise_id}: {reason}"
                for exercise_id, _, _, reason in pending[:3]
            )
            raise SystemExit(
                f"Speaking audio is incomplete or invalid: {len(pending)} item(s); {details}"
            )
        expected_content = manifest_content(
            exercises,
            complete_entries,
            complete_audio_sha256,
            complete=True,
        )
        if existing_manifest is None or existing_manifest["source"] != expected_content:
            raise SystemExit(
                "Speaking manifest metadata, completeness state, hashes, or serialization is stale"
            )
        print(
            f"Speaking audio valid: {len(exercises)} exercise(s), "
            f"{sum(int(entry['wordCount']) for entry in complete_entries.values()):,} timed words."
        )
        return 0

    if pending:
        if args.model is None or args.voices is None:
            raise SystemExit("--model and --voices are required when audio must be generated")
        model_path = args.model.resolve()
        voices_path = args.voices.resolve()
        verify_model_files(model_path, voices_path)
        np, WhisperModel, Kokoro = load_generation_dependencies()
        kokoro = Kokoro(str(model_path), str(voices_path))
        aligner = WhisperModel(
            ALIGNMENT_MODEL,
            device="cpu",
            compute_type="int8",
            download_root=(
                str(args.alignment_cache.resolve())
                if args.alignment_cache
                else None
            ),
        )
        write_manifest(
            manifest_path,
            exercises,
            complete_entries,
            complete_audio_sha256,
            complete=False,
        )

        for index, (exercise_id, exercise, output_path, _) in enumerate(pending, start=1):
            chunks: list[Any] = []
            word_timings: list[list[object]] = []
            section_ranges: list[dict[str, int]] = []
            elapsed_samples = 0

            for section_index, sentences in enumerate(exercise["sentences"]):
                word_start = len(word_timings)
                for sentence_index, sentence in enumerate(sentences):
                    audio, chunk_rate = kokoro.create(
                        spoken_text(str(sentence)),
                        voice=VOICE,
                        speed=SPEED,
                        lang=LANGUAGE,
                    )
                    if chunk_rate != SAMPLE_RATE:
                        raise ValueError(
                            f"Unexpected {chunk_rate} Hz sample rate while generating {exercise_id}"
                        )
                    chunk = np.asarray(audio, dtype=np.float32)
                    word_timings.extend(align_sentence_words(
                        str(sentence),
                        chunk,
                        SAMPLE_RATE,
                        elapsed_samples / SAMPLE_RATE,
                        aligner,
                        np,
                    ))
                    chunks.append(chunk)
                    elapsed_samples += len(chunk)
                    if sentence_index < len(sentences) - 1:
                        pause = np.zeros(
                            round(SAMPLE_RATE * SENTENCE_PAUSE_SECONDS),
                            dtype=np.float32,
                        )
                        chunks.append(pause)
                        elapsed_samples += len(pause)
                section_ranges.append({
                    "number": section_index + 1,
                    "wordStart": word_start,
                    "wordEnd": len(word_timings),
                })
                if section_index < len(exercise["sentences"]) - 1:
                    pause = np.zeros(
                        round(SAMPLE_RATE * SECTION_PAUSE_SECONDS),
                        dtype=np.float32,
                    )
                    chunks.append(pause)
                    elapsed_samples += len(pause)

            if section_ranges != section_word_ranges(exercise):
                raise ValueError(f"Word timing ranges do not match source text for {exercise_id}")
            output_path.parent.mkdir(parents=True, exist_ok=True)
            temp_path = output_path.with_name(f".{output_path.stem}.{os.getpid()}.tmp")
            sf.write(
                temp_path,
                np.concatenate(chunks),
                SAMPLE_RATE,
                format="MP3",
                subtype="MPEG_LAYER_III",
                compression_level=MP3_COMPRESSION_LEVEL,
                bitrate_mode="VARIABLE",
            )
            temp_path.replace(output_path)
            text = str(exercise["text"])
            complete_entries[exercise_id] = {
                "path": audio_relative_path(exercise_id, text),
                "sourceSha256": hashlib.sha256(text.encode("utf-8")).hexdigest(),
                "wordCount": len(word_timings),
                "duration": round(elapsed_samples / SAMPLE_RATE, 3),
                "sectionWordRanges": section_ranges,
                "words": word_timings,
            }
            audio_hash = sha256_file(output_path)
            entry_error = entry_validation_error(
                complete_entries[exercise_id],
                exercise_id,
                exercise,
            )
            audio_error = audio_validation_error(
                output_path,
                sf,
                expected_sha256=audio_hash,
                expected_duration=complete_entries[exercise_id]["duration"],
            )
            if entry_error or audio_error:
                raise ValueError(
                    f"Generated audio validation failed for {exercise_id}: "
                    f"{entry_error or audio_error}"
                )
            complete_audio_sha256[exercise_id] = audio_hash
            write_manifest(
                manifest_path,
                exercises,
                complete_entries,
                complete_audio_sha256,
                complete=False,
            )
            print(f"Generated {index}/{len(pending)}: {exercise_id}", flush=True)

    validation_errors: list[str] = []
    for exercise_id, exercise in exercises.items():
        entry = complete_entries.get(exercise_id)
        entry_error = entry_validation_error(entry, exercise_id, exercise)
        if entry_error:
            validation_errors.append(f"{exercise_id}: {entry_error}")
            continue
        assert isinstance(entry, dict)
        audio_error = audio_validation_error(
            output_root / str(entry["path"]),
            sf,
            expected_sha256=complete_audio_sha256.get(exercise_id),
            expected_duration=entry.get("duration"),
        )
        if audio_error:
            validation_errors.append(f"{exercise_id}: {audio_error}")
    if validation_errors:
        raise SystemExit(f"Speaking audio validation failed: {validation_errors[0]}")

    write_manifest(
        manifest_path,
        exercises,
        complete_entries,
        complete_audio_sha256,
        complete=True,
    )
    if args.prune_orphans:
        print(
            f"Pruned {prune_orphans(output_root, expected_paths)} orphan MP3 file(s).",
            flush=True,
        )
    print(f"Speaking audio ready: {len(exercises)} exercise(s).", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
