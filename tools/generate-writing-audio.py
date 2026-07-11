#!/usr/bin/env python3
"""Generate one static Edmund Neural MP3 for every writing-practice essay.

The script reads the English essay paragraphs directly from writing-practice.html,
so the displayed text remains the single source of truth.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro


AUDIO_BUILD_VERSION = "v3"
STATIC_AUDIO_ROOT = f"assets/writing-practice/audio/edmund-neural/{AUDIO_BUILD_VERSION}"
DEFAULT_VOICE = "af_heart"
DEFAULT_LANGUAGE = "en-us"
DEFAULT_SPEED = 0.96
PARAGRAPH_PAUSE_SECONDS = 0.72
SENTENCE_PAUSE_SECONDS = 0.34
WORD_PATTERN = re.compile(r"[A-Za-z0-9]+(?:[’'][A-Za-z0-9]+)*(?:-[A-Za-z0-9]+)*")


def matching_end(source: str, start: int, opener: str, closer: str) -> int:
    """Return the index after a balanced JavaScript object or array."""
    if source[start] != opener:
        raise ValueError(f"Expected {opener!r} at index {start}")
    depth = 0
    quote = ""
    escaped = False
    for index in range(start, len(source)):
        char = source[index]
        if quote:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = ""
            continue
        if char in {'"', "'", "`"}:
            quote = char
        elif char == opener:
            depth += 1
        elif char == closer:
            depth -= 1
            if depth == 0:
                return index + 1
    raise ValueError(f"Unclosed {opener!r} starting at index {start}")


def top_level_objects(array_source: str) -> list[str]:
    objects: list[str] = []
    index = 1
    while index < len(array_source) - 1:
        if array_source[index] == "{":
            end = matching_end(array_source, index, "{", "}")
            objects.append(array_source[index:end])
            index = end
        else:
            index += 1
    return objects


def decode_js_strings(array_source: str) -> str:
    tokens = re.findall(r'"(?:\\.|[^"\\])*"', array_source)
    return "".join(json.loads(token) for token in tokens)


def extract_essays(source_root: Path) -> dict[str, dict[str, object]]:
    html = (source_root / "writing-practice.html").read_text(encoding="utf-8")
    object_start = html.index("const writingExercises = {")
    object_start = html.index("{", object_start)
    object_end = matching_end(html, object_start, "{", "}")
    exercises_source = html[object_start:object_end]

    exercise_matches = list(re.finditer(
        r'(?m)^\s{6}"[^"]+":\s*\{\s*\n\s{8}id:\s*"([^"]+)"',
        exercises_source,
    ))
    essays: dict[str, dict[str, object]] = {}
    for match in exercise_matches:
        exercise_id = match.group(1)
        exercise_open = exercises_source.index("{", match.start())
        exercise_end = matching_end(exercises_source, exercise_open, "{", "}")
        exercise_source = exercises_source[exercise_open:exercise_end]
        title_match = re.search(r'\btitle:\s*"((?:\\.|[^"\\])*)"', exercise_source)
        paragraphs_marker = exercise_source.index("paragraphs:")
        paragraphs_open = exercise_source.index("[", paragraphs_marker)
        paragraphs_end = matching_end(exercise_source, paragraphs_open, "[", "]")
        paragraph_objects = top_level_objects(exercise_source[paragraphs_open:paragraphs_end])

        paragraphs: list[str] = []
        sentence_groups: list[list[str]] = []
        for paragraph_source in paragraph_objects:
            sentences: list[str] = []
            cursor = 0
            while True:
                parts_match = re.search(r"\bparts:\s*\[", paragraph_source[cursor:])
                if not parts_match:
                    break
                parts_open = cursor + parts_match.end() - 1
                parts_end = matching_end(paragraph_source, parts_open, "[", "]")
                sentences.append(decode_js_strings(paragraph_source[parts_open:parts_end]))
                cursor = parts_end
            paragraph = " ".join(sentence.strip() for sentence in sentences if sentence.strip()).strip()
            if paragraph:
                paragraphs.append(paragraph)
                sentence_groups.append([sentence.strip() for sentence in sentences if sentence.strip()])

        if not paragraphs:
            raise ValueError(f"No English essay paragraphs found for {exercise_id}")
        title = json.loads(f'"{title_match.group(1)}"') if title_match else exercise_id
        full_text = "\n\n".join(paragraphs)
        essays[exercise_id] = {
            "title": title,
            "paragraphs": paragraphs,
            "sentences": sentence_groups,
            "text": full_text,
        }

    if not essays:
        raise ValueError("No writing-practice essays found")
    return essays


def spoken_text(value: str) -> str:
    text = re.sub(r"(?:\.{3}|…+)", ", ", value)
    text = re.sub(r"\bIELTS\b", "eye elts", text)
    for initialism in ("DNA", "DSE", "UK", "US", "HK"):
        text = re.sub(rf"\b{initialism}\b", " ".join(initialism), text)
    return re.sub(r"\s+", " ", text).strip()


def display_words(value: str) -> list[tuple[str, str]]:
    """Return each visible word and the punctuation following it."""
    matches = list(WORD_PATTERN.finditer(value))
    return [
        (
            match.group(0),
            value[match.end() : matches[index + 1].start() if index + 1 < len(matches) else len(value)],
        )
        for index, match in enumerate(matches)
    ]


def syllable_weight(word: str) -> float:
    letters = re.sub(r"[^a-z]", "", word.casefold())
    if not letters:
        return 1.0
    groups = len(re.findall(r"[aeiouy]+", letters))
    if letters.endswith("e") and groups > 1 and not letters.endswith(("le", "ye")):
        groups -= 1
    return 0.75 + max(1, groups) * 0.72 + min(len(letters), 12) * 0.025


def punctuation_weight(separator: str, *, final_word: bool) -> float:
    if final_word:
        return 0.0
    if any(mark in separator for mark in (";", ":")):
        return 0.55
    if any(mark in separator for mark in (",", "—", "–")):
        return 0.34
    if any(mark in separator for mark in (".", "!", "?")):
        return 0.65
    return 0.08


def align_sentence_words(sentence: str, start_seconds: float, duration_seconds: float) -> list[list[object]]:
    words = display_words(sentence)
    if not words:
        return []
    lead = min(0.075, duration_seconds * 0.025)
    tail = min(0.09, duration_seconds * 0.035)
    weights = [syllable_weight(word) for word, _ in words]
    pauses = [
        punctuation_weight(separator, final_word=index == len(words) - 1)
        for index, (_, separator) in enumerate(words)
    ]
    usable = max(0.01, duration_seconds - lead - tail)
    unit = usable / max(0.01, sum(weights) + sum(pauses))
    cursor = start_seconds + lead
    timings: list[list[object]] = []
    for (word, _), weight, pause in zip(words, weights, pauses):
        word_start = cursor
        word_end = min(start_seconds + duration_seconds, word_start + weight * unit)
        timings.append([word, round(word_start, 3), round(word_end, 3)])
        cursor = word_end + pause * unit
    return timings


def audio_relative_path(exercise_id: str, text: str) -> str:
    source_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
    digest = source_hash[:24]
    safe_id = re.sub(r"[^a-z0-9-]+", "-", exercise_id.casefold()).strip("-")
    return f"{STATIC_AUDIO_ROOT}/{digest[:2]}/{safe_id}-{digest}.mp3"


def valid_existing_audio(path: Path) -> bool:
    if not path.exists() or path.stat().st_size <= 1000:
        return False
    try:
        info = sf.info(path)
    except Exception:
        return False
    return (
        info.format == "MP3"
        and info.samplerate == 24000
        and info.channels == 1
        and 1 <= info.duration <= 900
    )


def load_manifest_entries(path: Path) -> dict[str, dict[str, object]]:
    if not path.exists():
        return {}
    source = path.read_text(encoding="utf-8")
    match = re.search(r"window\.EDMUND_WRITING_AUDIO\s*=\s*Object\.freeze\((\{.*\})\);", source)
    if not match:
        return {}
    try:
        payload = json.loads(match.group(1))
    except json.JSONDecodeError:
        return {}
    return payload if isinstance(payload, dict) else {}


def entry_matches_essay(entry: object, exercise_id: str, essay: dict[str, object]) -> bool:
    if not isinstance(entry, dict):
        return False
    text = str(essay["text"])
    expected_words = [word for word, _ in display_words(text)]
    words = entry.get("words")
    return (
        entry.get("path") == audio_relative_path(exercise_id, text)
        and entry.get("sourceSha256") == hashlib.sha256(text.encode("utf-8")).hexdigest()
        and isinstance(words, list)
        and len(words) == len(expected_words)
        and all(
            isinstance(row, list)
            and len(row) == 3
            and row[0] == expected_words[index]
            and isinstance(row[1], (int, float))
            and isinstance(row[2], (int, float))
            and row[1] <= row[2]
            for index, row in enumerate(words)
        )
    )


def write_manifest(
    path: Path,
    essays: dict[str, dict[str, object]],
    entries: dict[str, dict[str, object]],
    *,
    voice: str,
    language: str,
    speed: float,
) -> None:
    corpus_hash = hashlib.sha256(
        "\n".join(f"{key}\0{essays[key]['text']}" for key in sorted(essays)).encode("utf-8")
    ).hexdigest()
    meta = {
        "engine": "Kokoro-82M",
        "buildVersion": AUDIO_BUILD_VERSION,
        "name": "Edmund Neural",
        "voice": voice,
        "language": language,
        "speed": speed,
        "count": len(entries),
        "complete": True,
        "corpusSha256": corpus_hash,
        "sampleRate": 24000,
        "format": "audio/mpeg",
        "wordTiming": "sentence-weighted-v1",
    }
    content = (
        "/* Generated by tools/generate-writing-audio.py. */\n"
        f"window.EDMUND_WRITING_AUDIO = Object.freeze({json.dumps(entries, sort_keys=True, separators=(',', ':'))});\n"
        f"window.EDMUND_WRITING_AUDIO_META = Object.freeze({json.dumps(meta, separators=(',', ':'))});\n"
    )
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


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--output-root", type=Path, required=True)
    parser.add_argument("--model", type=Path, required=True)
    parser.add_argument("--voices", type=Path, required=True)
    parser.add_argument("--voice", default=DEFAULT_VOICE)
    parser.add_argument("--lang", default=DEFAULT_LANGUAGE)
    parser.add_argument("--speed", type=float, default=DEFAULT_SPEED)
    parser.add_argument("--manifest-only", action="store_true")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--prune-orphans", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    source_root = args.source_root.resolve()
    output_root = args.output_root.resolve()
    essays = extract_essays(source_root)
    manifest_path = output_root / "writing-audio-manifest.js"
    existing_entries = load_manifest_entries(manifest_path)
    complete_entries: dict[str, dict[str, object]] = {}
    pending: list[tuple[str, dict[str, object], Path]] = []
    expected_paths: set[str] = set()

    for exercise_id, essay in essays.items():
        relative_path = audio_relative_path(exercise_id, str(essay["text"]))
        expected_paths.add(relative_path)
        output_path = output_root / relative_path
        entry = existing_entries.get(exercise_id)
        if args.force or not valid_existing_audio(output_path) or not entry_matches_essay(entry, exercise_id, essay):
            pending.append((exercise_id, essay, output_path))
        else:
            complete_entries[exercise_id] = entry

    if args.manifest_only and pending:
        raise SystemExit(f"Writing audio is incomplete: {len(pending)} MP3 file(s) missing or invalid")

    if pending:
        kokoro = Kokoro(str(args.model.resolve()), str(args.voices.resolve()))
        for index, (exercise_id, essay, output_path) in enumerate(pending, start=1):
            chunks: list[np.ndarray] = []
            word_timings: list[list[object]] = []
            sample_rate = 0
            elapsed_samples = 0
            sentence_groups = essay["sentences"]
            for paragraph_index, sentences in enumerate(sentence_groups):
                for sentence_index, sentence in enumerate(sentences):
                    audio, chunk_rate = kokoro.create(
                        spoken_text(str(sentence)),
                        voice=args.voice,
                        speed=args.speed,
                        lang=args.lang,
                    )
                    if sample_rate and chunk_rate != sample_rate:
                        raise ValueError(f"Sample rate changed while generating {exercise_id}")
                    sample_rate = chunk_rate
                    chunk = np.asarray(audio, dtype=np.float32)
                    word_timings.extend(align_sentence_words(
                        str(sentence),
                        elapsed_samples / sample_rate,
                        len(chunk) / sample_rate,
                    ))
                    chunks.append(chunk)
                    elapsed_samples += len(chunk)
                    if sentence_index < len(sentences) - 1:
                        pause = np.zeros(round(sample_rate * SENTENCE_PAUSE_SECONDS), dtype=np.float32)
                        chunks.append(pause)
                        elapsed_samples += len(pause)
                if paragraph_index < len(sentence_groups) - 1:
                    pause = np.zeros(round(sample_rate * PARAGRAPH_PAUSE_SECONDS), dtype=np.float32)
                    chunks.append(pause)
                    elapsed_samples += len(pause)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            temp_path = output_path.with_name(f".{output_path.stem}.{os.getpid()}.tmp")
            sf.write(
                temp_path,
                np.concatenate(chunks),
                sample_rate,
                format="MP3",
                subtype="MPEG_LAYER_III",
                compression_level=0.55,
                bitrate_mode="VARIABLE",
            )
            temp_path.replace(output_path)
            text = str(essay["text"])
            complete_entries[exercise_id] = {
                "path": audio_relative_path(exercise_id, text),
                "sourceSha256": hashlib.sha256(text.encode("utf-8")).hexdigest(),
                "wordCount": len(word_timings),
                "duration": round(elapsed_samples / sample_rate, 3),
                "words": word_timings,
            }
            print(f"Generated {index}/{len(pending)}: {exercise_id}", flush=True)

    if any(not valid_existing_audio(output_root / path) for path in expected_paths):
        raise SystemExit("Writing audio validation failed")
    write_manifest(
        manifest_path,
        essays,
        complete_entries,
        voice=args.voice,
        language=args.lang,
        speed=args.speed,
    )
    if args.prune_orphans:
        print(f"Pruned {prune_orphans(output_root, expected_paths)} orphan MP3 file(s).", flush=True)
    print(f"Writing audio ready: {len(essays)} essay(s).", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
