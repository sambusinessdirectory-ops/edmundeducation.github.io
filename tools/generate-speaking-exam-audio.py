#!/usr/bin/env python3
"""Generate immutable British-examiner MP3s for IELTS Speaking Exam Mode.

The generated browser payloads are the corpus source because they are the
exact normalized records consumed by Exam Mode.  Every stable question
sourceKey and every fixed examiner exchange receives one independently cached
MP3.  This product deliberately has no word-alignment data.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import math
import os
import re
from pathlib import Path
from typing import Any


AUDIO_BUILD_VERSION = "v1"
STATIC_AUDIO_ROOT = (
    "assets/speaking-system/audio/edmund-neural/exam/"
    f"{AUDIO_BUILD_VERSION}"
)
MANIFEST_NAME = "speaking-exam-audio-manifest.js"

PART1_DATA_PATH = "speaking-system-part1-data.js"
PART2_DATA_PATH = "speaking-system-data.js"
PART3_DATA_PATH = "speaking-system-part3-data.js"
PART1_DATA_GLOBAL = "EDMUND_SPEAKING_PART1_DATA"
PART2_DATA_GLOBAL = "EDMUND_SPEAKING_DATA"
PART3_DATA_GLOBAL = "EDMUND_SPEAKING_PART3_DATA"

ENTRIES_GLOBAL = "EDMUND_SPEAKING_EXAM_AUDIO"
META_GLOBAL = "EDMUND_SPEAKING_EXAM_AUDIO_META"
RECIPE_GLOBAL = "EDMUND_SPEAKING_EXAM_AUDIO_RECIPE_SHA256"
SHA256_GLOBAL = "EDMUND_SPEAKING_EXAM_AUDIO_SHA256"

VOICE = "bm_fable"
LANGUAGE = "en-gb"
SPEED = 0.98
SAMPLE_RATE = 24000
CHANNELS = 1
MP3_COMPRESSION_LEVEL = 0.55
SEGMENT_PAUSE_SECONDS = 0.45
RECIPE_SCHEMA_VERSION = 1
AUDIO_DURATION_TOLERANCE_SECONDS = 0.01

MODEL_SHA256 = "7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5"
VOICES_SHA256 = "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d"
EXPECTED_RUNTIME_VERSIONS = {
    "kokoro-onnx": "0.5.0",
    "numpy": "2.5.1",
    "soundfile": "0.14.0",
}

EXPECTED_BOOK_COUNTS = {1: 14, 2: 16, 3: 16}
EXPECTED_ITEM_COUNTS = {1: 828, 2: 153, 3: 564}
EXPECTED_PART1_MODULE_COUNT = 70

# These strings are the exact English strings used by the current Exam Mode
# opening, transitions, and Part 2 exchange.
FIXED_MESSAGES: tuple[tuple[str, str], ...] = (
    ("fixed:opening-begin", "Okay, let's begin."),
    ("fixed:opening-full-name", "Could you tell me your full name please?"),
    (
        "fixed:part1-to-part2",
        "Perfect. All right, that will do for Part 1. We'll go on to Part 2 now.",
    ),
    (
        "fixed:part1-to-part3",
        "Perfect. All right, that will do for Part 1. We'll go on to Part 3 now.",
    ),
    (
        "fixed:part2-instructions",
        "So here is your question. I'll give you a pencil there as well. "
        "I'll give you one minute to take some notes. Okay?",
    ),
    ("fixed:part2-ready", "Okay, you can begin."),
    ("fixed:part2-finished", "Great. Really nice."),
    (
        "fixed:part2-to-part3",
        "Perfect. All right, that will do for Part 2. We'll go on to Part 3 now.",
    ),
    (
        "fixed:part3-opening",
        "Okay, so now we'll go on to Part 3 of the test. Okay? Okay. "
        "So, the first question.",
    ),
)

INITIALISM_OVERRIDES = ("DSE", "QR", "UK", "US", "HK")
SENTENCE_BOUNDARY_PATTERN = re.compile(
    r"(?P<end>[.!?]+[”\"’']?)(?P<space>\s+)"
)
ABBREVIATION_PATTERN = re.compile(
    r"\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|e\.g|i\.e)\.$",
    re.IGNORECASE,
)


def canonical_json(value: object) -> str:
    return json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    )


def sha256_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def browser_payload(path: Path, global_name: str) -> dict[str, Any]:
    if not path.is_file():
        raise ValueError(f"Browser data file is missing: {path}")
    source = path.read_text(encoding="utf-8")
    match = re.search(
        rf"window\.{re.escape(global_name)}\s*=\s*Object\.freeze\((\{{.*\}})\);\s*$",
        source,
        re.DOTALL,
    )
    if match is None:
        raise ValueError(f"Could not parse {global_name} from {path}")
    try:
        value = json.loads(match.group(1))
    except json.JSONDecodeError as error:
        raise ValueError(f"Invalid JSON payload in {path}: {error}") from error
    if not isinstance(value, dict):
        raise ValueError(f"{global_name} must be a JSON object")
    return value


def require_nonempty_string(value: object, where: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{where} is missing or empty")
    if value != value.strip() or re.search(r"\s{2,}", value):
        raise ValueError(f"{where} has unexpected outer or repeated whitespace")
    return value


def source_row(
    source_key: str,
    text: str,
    *,
    kind: str,
    part: int,
    book: int | None,
    source_id: str,
    question_number: int | None,
) -> dict[str, object]:
    if not re.fullmatch(r"(?:fixed|p[123]):[a-z0-9:-]+", source_key):
        raise ValueError(f"Invalid exam sourceKey: {source_key!r}")
    require_nonempty_string(text, f"{source_key} speech text")
    return {
        "sourceKey": source_key,
        "kind": kind,
        "part": part,
        "book": book,
        "sourceId": source_id,
        "questionNumber": question_number,
        "text": text,
    }


def validate_payload_header(
    payload: dict[str, Any],
    *,
    part: int,
    expected_schema: int,
) -> list[dict[str, Any]]:
    metadata = payload.get("metadata")
    if not isinstance(metadata, dict):
        raise ValueError(f"Part {part} browser data has no metadata object")
    expected = {
        "schemaVersion": expected_schema,
        "exam": "IELTS",
        "part": part,
        "bookCount": EXPECTED_BOOK_COUNTS[part],
    }
    for key, expected_value in expected.items():
        if metadata.get(key) != expected_value:
            raise ValueError(
                f"Part {part} metadata {key} must be {expected_value!r}"
            )
    books = payload.get("books")
    if not isinstance(books, list):
        raise ValueError(f"Part {part} browser data has no books array")
    numbers = [book.get("book") if isinstance(book, dict) else None for book in books]
    if numbers != list(range(1, EXPECTED_BOOK_COUNTS[part] + 1)):
        raise ValueError(f"Part {part} books must be complete and ordered")
    return books


def load_part1_rows(payload: dict[str, Any]) -> list[dict[str, object]]:
    books = validate_payload_header(payload, part=1, expected_schema=1)
    metadata = payload["metadata"]
    if metadata.get("moduleCount") != EXPECTED_PART1_MODULE_COUNT:
        raise ValueError("Part 1 moduleCount is not the approved 70-module corpus")
    if metadata.get("questionCount") != EXPECTED_ITEM_COUNTS[1]:
        raise ValueError("Part 1 questionCount is not the approved 828-question corpus")

    rows: list[dict[str, object]] = []
    module_count = 0
    for expected_book, book in enumerate(books, start=1):
        if not isinstance(book, dict) or book.get("part") != 1:
            raise ValueError(f"Part 1 Book {expected_book} is invalid")
        exercises = book.get("exercises")
        if not isinstance(exercises, list) or not exercises:
            raise ValueError(f"Part 1 Book {expected_book} has no modules")
        if book.get("exerciseCount") != len(exercises):
            raise ValueError(f"Part 1 Book {expected_book} exerciseCount is stale")
        module_count += len(exercises)
        for expected_index, exercise in enumerate(exercises, start=1):
            where = f"Part 1 Book {expected_book}, module {expected_index}"
            if not isinstance(exercise, dict) or exercise.get("index") != expected_index:
                raise ValueError(f"{where} is invalid or out of order")
            module_id = require_nonempty_string(exercise.get("id"), f"{where} id")
            if not module_id.startswith(f"ielts-part-1-book-{expected_book}-"):
                raise ValueError(f"{where} has an unexpected stable id")
            questions = exercise.get("questions")
            if not isinstance(questions, list) or not questions:
                raise ValueError(f"{where} has no questions")
            if exercise.get("questionCount") != len(questions):
                raise ValueError(f"{where} questionCount is stale")
            for expected_number, question in enumerate(questions, start=1):
                question_where = f"{where}, question {expected_number}"
                if not isinstance(question, dict) or question.get("number") != expected_number:
                    raise ValueError(f"{question_where} is invalid or out of order")
                text = require_nonempty_string(
                    question.get("questionEn"), f"{question_where} English"
                )
                rows.append(source_row(
                    f"p1:{module_id}:q{expected_number}",
                    text,
                    kind="question",
                    part=1,
                    book=expected_book,
                    source_id=module_id,
                    question_number=expected_number,
                ))
    if module_count != EXPECTED_PART1_MODULE_COUNT or len(rows) != EXPECTED_ITEM_COUNTS[1]:
        raise ValueError("Part 1 browser payload does not cover the complete corpus")
    return rows


def exam_part2_speech_text(exercise: dict[str, Any]) -> str:
    cue = exercise.get("cue")
    if not isinstance(cue, dict):
        raise ValueError(f"{exercise.get('id', 'Part 2 exercise')} has no cue object")
    # This intentionally mirrors examQuestionSpeechText() and buildPart2Item().
    prompt = str(cue.get("promptEn") or exercise.get("title") or "")
    raw_hints = cue.get("hints")
    if not isinstance(raw_hints, list):
        raise ValueError(f"{exercise.get('id', 'Part 2 exercise')} hints are invalid")
    hints = [
        str(hint.get("en") or "").strip()
        for hint in raw_hints
        if isinstance(hint, dict) and str(hint.get("en") or "").strip()
    ]
    hint_text = f"You should say: {'. '.join(hints)}." if hints else ""
    return ". ".join(value for value in (prompt, hint_text) if value)


def load_part2_rows(payload: dict[str, Any]) -> list[dict[str, object]]:
    books = validate_payload_header(payload, part=2, expected_schema=2)
    if payload["metadata"].get("exerciseCount") != EXPECTED_ITEM_COUNTS[2]:
        raise ValueError("Part 2 exerciseCount is not the approved 153-card corpus")
    rows: list[dict[str, object]] = []
    for expected_book, book in enumerate(books, start=1):
        if not isinstance(book, dict) or book.get("part") != 2:
            raise ValueError(f"Part 2 Book {expected_book} is invalid")
        exercises = book.get("exercises")
        if not isinstance(exercises, list) or not exercises:
            raise ValueError(f"Part 2 Book {expected_book} has no exercises")
        if book.get("exerciseCount") != len(exercises):
            raise ValueError(f"Part 2 Book {expected_book} exerciseCount is stale")
        for expected_index, exercise in enumerate(exercises, start=1):
            where = f"Part 2 Book {expected_book}, exercise {expected_index}"
            if not isinstance(exercise, dict) or exercise.get("index") != expected_index:
                raise ValueError(f"{where} is invalid or out of order")
            expected_id = f"ielts-part-2-book-{expected_book}-exercise-{expected_index:02d}"
            if exercise.get("id") != expected_id:
                raise ValueError(f"{where} has an unexpected stable id")
            rows.append(source_row(
                f"p2:{expected_id}",
                exam_part2_speech_text(exercise),
                kind="question",
                part=2,
                book=expected_book,
                source_id=expected_id,
                question_number=None,
            ))
    if len(rows) != EXPECTED_ITEM_COUNTS[2]:
        raise ValueError("Part 2 browser payload does not cover the complete corpus")
    return rows


def load_part3_rows(payload: dict[str, Any]) -> list[dict[str, object]]:
    books = validate_payload_header(payload, part=3, expected_schema=1)
    if payload["metadata"].get("exerciseCount") != EXPECTED_ITEM_COUNTS[3]:
        raise ValueError("Part 3 exerciseCount is not the approved 564-question corpus")
    rows: list[dict[str, object]] = []
    for expected_book, book in enumerate(books, start=1):
        if not isinstance(book, dict) or book.get("part") != 3:
            raise ValueError(f"Part 3 Book {expected_book} is invalid")
        exercises = book.get("exercises")
        if not isinstance(exercises, list) or not exercises:
            raise ValueError(f"Part 3 Book {expected_book} has no exercises")
        if book.get("exerciseCount") != len(exercises):
            raise ValueError(f"Part 3 Book {expected_book} exerciseCount is stale")
        for expected_index, exercise in enumerate(exercises, start=1):
            where = f"Part 3 Book {expected_book}, exercise {expected_index}"
            if not isinstance(exercise, dict) or exercise.get("index") != expected_index:
                raise ValueError(f"{where} is invalid or out of order")
            expected_id = f"ielts-part-3-book-{expected_book}-exercise-{expected_index:02d}"
            if exercise.get("id") != expected_id:
                raise ValueError(f"{where} has an unexpected stable id")
            question = exercise.get("question")
            fallback = question.get("english") if isinstance(question, dict) else ""
            text = require_nonempty_string(
                exercise.get("title") or exercise.get("topic") or fallback,
                f"{where} English",
            )
            rows.append(source_row(
                f"p3:{expected_id}",
                text,
                kind="question",
                part=3,
                book=expected_book,
                source_id=expected_id,
                question_number=None,
            ))
    if len(rows) != EXPECTED_ITEM_COUNTS[3]:
        raise ValueError("Part 3 browser payload does not cover the complete corpus")
    return rows


def load_corpus(source_root: Path) -> tuple[dict[str, dict[str, object]], dict[str, str]]:
    payloads = {
        1: browser_payload(source_root / PART1_DATA_PATH, PART1_DATA_GLOBAL),
        2: browser_payload(source_root / PART2_DATA_PATH, PART2_DATA_GLOBAL),
        3: browser_payload(source_root / PART3_DATA_PATH, PART3_DATA_GLOBAL),
    }
    rows = [
        source_row(
            source_key,
            text,
            kind="examiner",
            part=0,
            book=None,
            source_id=source_key.removeprefix("fixed:"),
            question_number=None,
        )
        for source_key, text in FIXED_MESSAGES
    ]
    rows.extend(load_part1_rows(payloads[1]))
    rows.extend(load_part2_rows(payloads[2]))
    rows.extend(load_part3_rows(payloads[3]))
    corpus: dict[str, dict[str, object]] = {}
    for row in rows:
        source_key = str(row["sourceKey"])
        if source_key in corpus:
            raise ValueError(f"Duplicate exam sourceKey: {source_key}")
        corpus[source_key] = row
    expected_count = len(FIXED_MESSAGES) + sum(EXPECTED_ITEM_COUNTS.values())
    if len(corpus) != expected_count:
        raise ValueError(
            f"Exam corpus has {len(corpus)} entries; expected {expected_count}"
        )
    payload_hashes = {
        f"part{part}": sha256_text(canonical_json(payload))
        for part, payload in payloads.items()
    }
    return corpus, payload_hashes


def split_render_segments(text: str) -> list[str]:
    """Split at real punctuation while preserving the exact source string."""
    segments: list[str] = []
    cursor = 0
    for match in SENTENCE_BOUNDARY_PATTERN.finditer(text):
        candidate = text[cursor : match.start("space")]
        if ABBREVIATION_PATTERN.search(candidate):
            continue
        clean = candidate.strip()
        if clean:
            segments.append(clean)
        cursor = match.end("space")
    tail = text[cursor:].strip()
    if tail:
        segments.append(tail)
    if not segments or " ".join(segments) != text:
        raise ValueError(f"Sentence splitting changed exam source text: {text!r}")
    return segments


def spoken_text(value: str) -> str:
    """Apply audio-only pronunciation normalization; manifest text is unchanged."""
    text = re.sub(r"(?:\.{3}|…+)", ", ", value)
    text = re.sub(r"\.{2,}", ".", text)
    text = re.sub(r"\bIELTS\b", "eye elts", text)
    for initialism in INITIALISM_OVERRIDES:
        text = re.sub(rf"\b{initialism}\b", " ".join(initialism), text)
    return re.sub(r"\s+", " ", text).strip()


def recipe_payload() -> dict[str, object]:
    return {
        "schemaVersion": RECIPE_SCHEMA_VERSION,
        "engine": "Kokoro-82M",
        "model": {
            "file": "kokoro-v1.0.onnx",
            "sha256": MODEL_SHA256,
            "voicesFile": "voices-v1.0.bin",
            "voicesSha256": VOICES_SHA256,
        },
        "audio": {
            "buildVersion": AUDIO_BUILD_VERSION,
            "staticRoot": STATIC_AUDIO_ROOT,
            "voice": VOICE,
            "language": LANGUAGE,
            "speed": SPEED,
            "sampleRate": SAMPLE_RATE,
            "channels": CHANNELS,
            "format": "audio/mpeg",
            "subtype": "MPEG_LAYER_III",
            "bitrateMode": "variable",
            "compressionLevel": MP3_COMPRESSION_LEVEL,
            "segmentPause": SEGMENT_PAUSE_SECONDS,
            "audioUnit": "one-mp3-per-source-key",
        },
        "alignment": None,
        "pronunciation": {
            "ellipsisReplacement": ", ",
            "repeatedFullStopReplacement": ".",
            "ieltsReplacement": "eye elts",
            "spelledInitialisms": list(INITIALISM_OVERRIDES),
        },
        "runtime": dict(EXPECTED_RUNTIME_VERSIONS),
    }


def recipe_sha256() -> str:
    return sha256_text(canonical_json(recipe_payload()))


def render_sha256(text: str) -> str:
    return sha256_text(f"{recipe_sha256()}\0{text}")


def audio_relative_path(source_key: str, text: str) -> str:
    digest = render_sha256(text)
    safe_key = re.sub(r"[^a-z0-9-]+", "-", source_key.casefold()).strip("-")
    return f"{STATIC_AUDIO_ROOT}/{digest[:2]}/{safe_key}-{digest[:24]}.mp3"


def corpus_sha256(corpus: dict[str, dict[str, object]]) -> str:
    return sha256_text("\n".join(
        f"{key}\0{corpus[key]['text']}" for key in sorted(corpus)
    ))


def expected_entry(source_key: str, row: dict[str, object]) -> dict[str, object]:
    text = str(row["text"])
    return {
        "path": audio_relative_path(source_key, text),
        "sourceKey": source_key,
        "kind": row["kind"],
        "part": row["part"],
        "book": row["book"],
        "sourceId": row["sourceId"],
        "questionNumber": row["questionNumber"],
        "text": text,
        "sourceSha256": sha256_text(text),
        "renderSha256": render_sha256(text),
    }


def is_finite_number(value: object) -> bool:
    return (
        isinstance(value, (int, float))
        and not isinstance(value, bool)
        and math.isfinite(float(value))
    )


def entry_validation_error(
    entry: object,
    source_key: str,
    row: dict[str, object],
) -> str | None:
    if not isinstance(entry, dict):
        return "manifest entry is missing or is not an object"
    for key, expected_value in expected_entry(source_key, row).items():
        if entry.get(key) != expected_value:
            return f"{key} does not match the current corpus and recipe"
    duration = entry.get("duration")
    if not is_finite_number(duration) or not 0.25 <= float(duration) <= 120:
        return "duration is missing, non-finite, or out of range"
    byte_size = entry.get("byteSize")
    if not isinstance(byte_size, int) or isinstance(byte_size, bool) or byte_size <= 1000:
        return "byteSize is missing or too small"
    if set(entry) != set(expected_entry(source_key, row)) | {"duration", "byteSize"}:
        return "manifest entry has missing or unexpected fields"
    return None


def assert_runtime_version(distribution: str) -> None:
    expected = EXPECTED_RUNTIME_VERSIONS[distribution]
    try:
        actual = importlib.metadata.version(distribution)
    except importlib.metadata.PackageNotFoundError as error:
        raise SystemExit(
            f"Required exam-audio package {distribution}=={expected} is not installed"
        ) from error
    if actual != expected:
        raise SystemExit(
            f"Exam-audio runtime requires {distribution}=={expected}; found {actual}"
        )


def load_soundfile_dependency() -> Any:
    assert_runtime_version("soundfile")
    try:
        import soundfile as sf
    except ImportError as error:
        raise SystemExit(
            "Exam audio dependencies are missing. Install tools/requirements-tts.txt "
            "inside the repository TTS virtual environment."
        ) from error
    return sf


def load_generation_dependencies() -> tuple[Any, Any]:
    for distribution in ("kokoro-onnx", "numpy"):
        assert_runtime_version(distribution)
    try:
        import numpy as np
        from kokoro_onnx import Kokoro
    except ImportError as error:
        raise SystemExit(
            "Exam audio dependencies are missing. Install tools/requirements-tts.txt "
            "inside the repository TTS virtual environment."
        ) from error
    return np, Kokoro


def verify_model_files(model_path: Path, voices_path: Path) -> None:
    for label, path, expected_hash in (
        ("Kokoro model", model_path, MODEL_SHA256),
        ("Kokoro voices", voices_path, VOICES_SHA256),
    ):
        if not path.is_file():
            raise SystemExit(f"{label} file not found: {path}")
        actual_hash = sha256_file(path)
        if actual_hash != expected_hash:
            raise SystemExit(
                f"{label} checksum mismatch: expected {expected_hash}, found {actual_hash}"
            )


def audio_validation_error(
    path: Path,
    sf: Any,
    *,
    expected_sha256: object,
    expected_duration: object,
    expected_byte_size: object,
) -> str | None:
    if not path.is_file() or path.stat().st_size <= 1000:
        return "MP3 file is missing or too small"
    if path.stat().st_size != expected_byte_size:
        return "MP3 byte size does not match the manifest"
    if not isinstance(expected_sha256, str) or not re.fullmatch(
        r"[0-9a-f]{64}", expected_sha256
    ):
        return "manifest has no valid MP3 SHA-256"
    if not is_finite_number(expected_duration):
        return "manifest has no valid duration"
    try:
        info = sf.info(path)
    except Exception as error:  # noqa: BLE001 - decoder detail belongs in the error
        return f"MP3 cannot be decoded ({error})"
    if info.format != "MP3":
        return f"expected MP3 format, found {info.format}"
    if info.samplerate != SAMPLE_RATE:
        return f"expected {SAMPLE_RATE} Hz, found {info.samplerate} Hz"
    if info.channels != CHANNELS:
        return f"expected mono audio, found {info.channels} channels"
    if not 0.25 <= info.duration <= 120:
        return f"decoded duration is out of range ({info.duration:.3f}s)"
    if abs(info.duration - float(expected_duration)) > AUDIO_DURATION_TOLERANCE_SECONDS:
        return (
            f"decoded duration {info.duration:.3f}s does not match manifest "
            f"duration {float(expected_duration):.3f}s"
        )
    if sha256_file(path) != expected_sha256:
        return "MP3 SHA-256 does not match the manifest"
    return None


def manifest_json_object(source: str, variable: str) -> dict[str, Any] | None:
    match = re.search(
        rf"window\.{re.escape(variable)}\s*=\s*Object\.freeze\((\{{[^\n]*\}})\);",
        source,
    )
    if match is None:
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
    if entries is None or meta is None or audio_sha256 is None or recipe_match is None:
        return None
    return {
        "source": source,
        "entries": entries,
        "meta": meta,
        "audioSha256": audio_sha256,
        "recipeSha256": json.loads(recipe_match.group(1)),
    }


def manifest_meta(
    corpus: dict[str, dict[str, object]],
    payload_hashes: dict[str, str],
    entries: dict[str, dict[str, object]],
    *,
    complete: bool,
) -> dict[str, object]:
    return {
        "engine": "Kokoro-82M",
        "model": "kokoro-v1.0.onnx",
        "name": "Edmund Speaking Exam Mode Neural",
        "buildVersion": AUDIO_BUILD_VERSION,
        "staticRoot": STATIC_AUDIO_ROOT,
        "voice": VOICE,
        "language": LANGUAGE,
        "speed": SPEED,
        "count": len(entries),
        "expectedCount": len(corpus),
        "complete": complete,
        "questionCount": sum(EXPECTED_ITEM_COUNTS.values()),
        "fixedMessageCount": len(FIXED_MESSAGES),
        "partCounts": {str(part): count for part, count in EXPECTED_ITEM_COUNTS.items()},
        "corpusSha256": corpus_sha256(corpus),
        "sourcePayloadSha256": payload_hashes,
        "sampleRate": SAMPLE_RATE,
        "channels": CHANNELS,
        "format": "audio/mpeg",
        "bitrateMode": "variable",
        "compressionLevel": MP3_COMPRESSION_LEVEL,
        "segmentPause": SEGMENT_PAUSE_SECONDS,
        "wordAlignment": False,
    }


def manifest_content(
    corpus: dict[str, dict[str, object]],
    payload_hashes: dict[str, str],
    entries: dict[str, dict[str, object]],
    audio_sha256: dict[str, str],
    *,
    complete: bool,
) -> str:
    if set(entries) != set(audio_sha256):
        raise ValueError("Exam manifest entries and MP3 hashes have different sourceKeys")
    meta = manifest_meta(corpus, payload_hashes, entries, complete=complete)
    return (
        "/* Generated by tools/generate-speaking-exam-audio.py. */\n"
        f"window.{ENTRIES_GLOBAL} = Object.freeze("
        f"{json.dumps(entries, ensure_ascii=False, sort_keys=True, separators=(',', ':'))});\n"
        f"window.{META_GLOBAL} = Object.freeze("
        f"{json.dumps(meta, ensure_ascii=False, separators=(',', ':'))});\n"
        f"window.{RECIPE_GLOBAL} = {json.dumps(recipe_sha256())};\n"
        f"window.{SHA256_GLOBAL} = Object.freeze("
        f"{json.dumps(audio_sha256, sort_keys=True, separators=(',', ':'))});\n"
    )


def write_manifest(
    path: Path,
    corpus: dict[str, dict[str, object]],
    payload_hashes: dict[str, str],
    entries: dict[str, dict[str, object]],
    audio_sha256: dict[str, str],
    *,
    complete: bool,
) -> None:
    content = manifest_content(
        corpus,
        payload_hashes,
        entries,
        audio_sha256,
        complete=complete,
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    temporary.write_text(content, encoding="utf-8")
    temporary.replace(path)


def validate_complete_manifest(
    source_root: Path,
    output_root: Path,
    sf: Any,
) -> tuple[
    dict[str, dict[str, object]],
    dict[str, str],
    dict[str, Any],
]:
    corpus, payload_hashes = load_corpus(source_root)
    manifest = load_manifest(output_root / MANIFEST_NAME)
    if manifest is None:
        raise SystemExit("Exam audio manifest is missing or unreadable")
    if manifest["recipeSha256"] != recipe_sha256():
        raise SystemExit("Exam audio manifest recipe does not match this v1 generator")
    entries = manifest["entries"]
    audio_hashes = manifest["audioSha256"]
    if manifest["meta"].get("complete") is not True:
        raise SystemExit(
            f"Exam audio manifest is incomplete ({len(entries)}/{len(corpus)} entries)"
        )
    if set(entries) != set(corpus) or set(audio_hashes) != set(corpus):
        raise SystemExit("Exam audio manifest does not cover the exact current corpus")
    for source_key, row in corpus.items():
        entry = entries.get(source_key)
        entry_error = entry_validation_error(entry, source_key, row)
        if entry_error:
            raise SystemExit(f"Invalid exam manifest entry {source_key}: {entry_error}")
        assert isinstance(entry, dict)
        audio_error = audio_validation_error(
            output_root / str(entry["path"]),
            sf,
            expected_sha256=audio_hashes.get(source_key),
            expected_duration=entry.get("duration"),
            expected_byte_size=entry.get("byteSize"),
        )
        if audio_error:
            raise SystemExit(f"Invalid exam MP3 {source_key}: {audio_error}")
    expected_source = manifest_content(
        corpus,
        payload_hashes,
        entries,
        audio_hashes,
        complete=True,
    )
    if manifest["source"] != expected_source:
        raise SystemExit("Exam audio manifest metadata or serialization is stale")
    return corpus, payload_hashes, manifest


def prune_orphans(output_root: Path, expected_paths: set[str]) -> int:
    audio_root = output_root / STATIC_AUDIO_ROOT
    if not audio_root.is_dir():
        return 0
    removed = 0
    for path in audio_root.rglob("*.mp3"):
        if path.relative_to(output_root).as_posix() not in expected_paths:
            path.unlink()
            removed += 1
    return removed


def parse_args() -> argparse.Namespace:
    repository_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, default=repository_root)
    parser.add_argument("--output-root", type=Path, default=repository_root)
    parser.add_argument("--model", type=Path)
    parser.add_argument("--voices", type=Path)
    parser.add_argument(
        "--validate-source",
        action="store_true",
        help="Validate and count the complete Exam Mode corpus without audio imports",
    )
    parser.add_argument(
        "--write-placeholder",
        action="store_true",
        help="Write an explicit incomplete empty manifest without synthesizing audio",
    )
    parser.add_argument(
        "--manifest-only",
        "--check",
        dest="manifest_only",
        action="store_true",
        help="Strictly validate the complete manifest and all MP3s without writes",
    )
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--prune-orphans", action="store_true")
    args = parser.parse_args()
    exclusive = sum(bool(value) for value in (
        args.validate_source,
        args.write_placeholder,
        args.manifest_only,
    ))
    if exclusive > 1:
        parser.error(
            "--validate-source, --write-placeholder, and --manifest-only are mutually exclusive"
        )
    if (args.validate_source or args.manifest_only) and (
        args.force or args.prune_orphans
    ):
        parser.error("read-only validation cannot be combined with force or pruning")
    if args.write_placeholder and args.prune_orphans:
        parser.error("--write-placeholder cannot be combined with --prune-orphans")
    return args


def main() -> int:
    args = parse_args()
    source_root = args.source_root.resolve()
    output_root = args.output_root.resolve()
    corpus, payload_hashes = load_corpus(source_root)
    manifest_path = output_root / MANIFEST_NAME

    if args.validate_source:
        counts = ", ".join(
            f"Part {part}: {count}" for part, count in EXPECTED_ITEM_COUNTS.items()
        )
        print(
            f"Exam audio source valid: {len(corpus)} sourceKeys "
            f"({counts}; fixed examiner messages: {len(FIXED_MESSAGES)})."
        )
        return 0

    existing_manifest = load_manifest(manifest_path)
    if manifest_path.exists() and existing_manifest is None:
        raise SystemExit("Exam audio manifest exists but is unreadable")
    if existing_manifest and existing_manifest["recipeSha256"] != recipe_sha256():
        raise SystemExit(
            "Exam audio recipe drift detected for immutable v1. Bump "
            "AUDIO_BUILD_VERSION before rebuilding."
        )

    if args.write_placeholder:
        if existing_manifest and existing_manifest["entries"] and not args.force:
            raise SystemExit(
                "Refusing to replace a non-empty exam manifest; add --force if intentional"
            )
        write_manifest(
            manifest_path,
            corpus,
            payload_hashes,
            {},
            {},
            complete=False,
        )
        print(f"Wrote incomplete Exam Mode placeholder for {len(corpus)} sourceKeys.")
        return 0

    sf = load_soundfile_dependency()
    if args.manifest_only:
        validated_corpus, _, manifest = validate_complete_manifest(
            source_root, output_root, sf
        )
        total_bytes = sum(
            int(entry["byteSize"]) for entry in manifest["entries"].values()
        )
        print(
            f"Exam audio valid: {len(validated_corpus)} MP3s, "
            f"{total_bytes / (1024 * 1024):.1f} MiB, no word alignment."
        )
        return 0

    existing_entries = existing_manifest["entries"] if existing_manifest else {}
    existing_hashes = existing_manifest["audioSha256"] if existing_manifest else {}
    complete_entries: dict[str, dict[str, object]] = {}
    complete_hashes: dict[str, str] = {}
    pending: list[tuple[str, dict[str, object], Path, str]] = []
    expected_paths: set[str] = set()
    for source_key, row in corpus.items():
        relative = audio_relative_path(source_key, str(row["text"]))
        expected_paths.add(relative)
        entry = existing_entries.get(source_key)
        entry_error = entry_validation_error(entry, source_key, row)
        audio_error = None
        if entry_error is None:
            assert isinstance(entry, dict)
            audio_error = audio_validation_error(
                output_root / relative,
                sf,
                expected_sha256=existing_hashes.get(source_key),
                expected_duration=entry.get("duration"),
                expected_byte_size=entry.get("byteSize"),
            )
        reason = "forced regeneration" if args.force else entry_error or audio_error
        if reason:
            pending.append((source_key, row, output_root / relative, reason))
            continue
        assert isinstance(entry, dict)
        audio_hash = existing_hashes.get(source_key)
        assert isinstance(audio_hash, str)
        complete_entries[source_key] = entry
        complete_hashes[source_key] = audio_hash

    if pending:
        if args.model is None or args.voices is None:
            details = "; ".join(
                f"{source_key}: {reason}"
                for source_key, _, _, reason in pending[:3]
            )
            raise SystemExit(
                f"--model and --voices are required for {len(pending)} pending MP3s; "
                f"{details}"
            )
        model_path = args.model.resolve()
        voices_path = args.voices.resolve()
        verify_model_files(model_path, voices_path)
        np, Kokoro = load_generation_dependencies()
        kokoro = Kokoro(str(model_path), str(voices_path))
        write_manifest(
            manifest_path,
            corpus,
            payload_hashes,
            complete_entries,
            complete_hashes,
            complete=False,
        )

        for index, (source_key, row, output_path, _) in enumerate(pending, start=1):
            chunks: list[Any] = []
            text = str(row["text"])
            segments = split_render_segments(text)
            for segment_index, segment in enumerate(segments):
                audio, sample_rate = kokoro.create(
                    spoken_text(segment),
                    voice=VOICE,
                    speed=SPEED,
                    lang=LANGUAGE,
                )
                if sample_rate != SAMPLE_RATE:
                    raise ValueError(
                        f"Unexpected {sample_rate} Hz sample rate while generating {source_key}"
                    )
                chunk = np.asarray(audio, dtype=np.float32).reshape(-1)
                if not len(chunk) or not np.isfinite(chunk).all():
                    raise ValueError(f"Kokoro returned invalid audio for {source_key}")
                chunks.append(chunk)
                if segment_index < len(segments) - 1:
                    chunks.append(np.zeros(
                        round(SAMPLE_RATE * SEGMENT_PAUSE_SECONDS),
                        dtype=np.float32,
                    ))
            rendered = np.concatenate(chunks)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            temporary = output_path.with_name(
                f".{output_path.stem}.{os.getpid()}.tmp"
            )
            sf.write(
                temporary,
                rendered,
                SAMPLE_RATE,
                format="MP3",
                subtype="MPEG_LAYER_III",
                compression_level=MP3_COMPRESSION_LEVEL,
                bitrate_mode="VARIABLE",
            )
            temporary.replace(output_path)
            info = sf.info(output_path)
            entry = expected_entry(source_key, row)
            entry.update({
                "duration": round(float(info.duration), 3),
                "byteSize": output_path.stat().st_size,
            })
            audio_hash = sha256_file(output_path)
            entry_error = entry_validation_error(entry, source_key, row)
            audio_error = audio_validation_error(
                output_path,
                sf,
                expected_sha256=audio_hash,
                expected_duration=entry["duration"],
                expected_byte_size=entry["byteSize"],
            )
            if entry_error or audio_error:
                raise ValueError(
                    f"Generated exam audio validation failed for {source_key}: "
                    f"{entry_error or audio_error}"
                )
            complete_entries[source_key] = entry
            complete_hashes[source_key] = audio_hash
            write_manifest(
                manifest_path,
                corpus,
                payload_hashes,
                complete_entries,
                complete_hashes,
                complete=False,
            )
            print(
                f"Generated {index}/{len(pending)}: {source_key}",
                flush=True,
            )

    if set(complete_entries) != set(corpus) or set(complete_hashes) != set(corpus):
        raise SystemExit("Exam audio generation ended with an incomplete corpus")
    write_manifest(
        manifest_path,
        corpus,
        payload_hashes,
        complete_entries,
        complete_hashes,
        complete=True,
    )
    validate_complete_manifest(source_root, output_root, sf)
    if args.prune_orphans:
        print(
            f"Pruned {prune_orphans(output_root, expected_paths)} orphan MP3 file(s).",
            flush=True,
        )
    print(f"Exam audio ready: {len(corpus)} immutable MP3s.", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
