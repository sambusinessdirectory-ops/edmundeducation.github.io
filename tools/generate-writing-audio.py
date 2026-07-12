#!/usr/bin/env python3
"""Generate one static Edmund Neural MP3 for every writing-practice essay.

The script reads the displayed essay data from writing-practice.html and its
small, page-specific data file, so the browser text remains the source of truth.
"""

from __future__ import annotations

import argparse
import difflib
import hashlib
import json
import os
import re
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro
from faster_whisper import WhisperModel


AUDIO_BUILD_VERSION = "v5"
STATIC_AUDIO_ROOT = f"assets/writing-practice/audio/edmund-neural/{AUDIO_BUILD_VERSION}"
DEFAULT_VOICE = "af_heart"
DEFAULT_LANGUAGE = "en-us"
DEFAULT_SPEED = 0.96
PARAGRAPH_PAUSE_SECONDS = 0.72
SENTENCE_PAUSE_SECONDS = 0.45
WORD_PATTERN = re.compile(r"[^\W_]+(?:[’'][^\W_]+)*(?:-[^\W_]+)*", re.UNICODE)
DEFAULT_ALIGNMENT_MODEL = "base.en"
WORD_TIMING_VERSION = "faster-whisper-base.en-audio-v1"


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


def essay_from_json(exercise_id: str, exercise: dict[str, object]) -> dict[str, object]:
    """Normalize one JSON-backed exercise into audio paragraphs and sentences."""
    paragraphs: list[str] = []
    sentence_groups: list[list[str]] = []

    for line in exercise.get("essayLeadLines", []) or []:
        clean = str(line).strip()
        if clean:
            paragraphs.append(clean)
            sentence_groups.append([clean])

    for paragraph in exercise.get("paragraphs", []) or []:
        if not isinstance(paragraph, dict):
            continue
        sentences: list[str] = []
        for sentence in paragraph.get("sentences", []) or []:
            if not isinstance(sentence, dict):
                continue
            parts = sentence.get("parts", []) or []
            text = "".join(
                str(part.get("answer", "")) if isinstance(part, dict) else str(part)
                for part in parts
            ).strip()
            if text:
                sentences.append(text)
        paragraph_text = " ".join(sentences).strip()
        if paragraph_text:
            paragraphs.append(paragraph_text)
            sentence_groups.append(sentences)

    for line in exercise.get("essayClosingLines", []) or []:
        clean = str(line).strip()
        if clean:
            paragraphs.append(clean)
            sentence_groups.append([clean])

    if not paragraphs:
        raise ValueError(f"No English essay paragraphs found for {exercise_id}")
    return {
        "title": str(exercise.get("title") or exercise_id),
        "paragraphs": paragraphs,
        "sentences": sentence_groups,
        "text": "\n\n".join(paragraphs),
    }


def extract_external_essays(source_root: Path) -> dict[str, dict[str, object]]:
    """Read optional JSON-compatible writing exercise data files."""
    essays: dict[str, dict[str, object]] = {}
    for path in sorted(source_root.glob("writing-practice-*-data.js")):
        source = path.read_text(encoding="utf-8")
        match = re.search(r"window\.[A-Z0-9_]+\s*=\s*(\{.*\});\s*$", source, re.S)
        if not match:
            continue
        payload = json.loads(match.group(1))
        if not isinstance(payload, dict):
            continue
        for exercise_id, exercise in payload.items():
            if isinstance(exercise, dict):
                essays[str(exercise_id)] = essay_from_json(str(exercise_id), exercise)
    return essays


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

    external_essays = extract_external_essays(source_root)
    duplicate_ids = sorted(set(essays) & set(external_essays))
    if duplicate_ids:
        raise ValueError(f"Duplicate writing exercise id(s): {', '.join(duplicate_ids)}")
    essays.update(external_essays)

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


def normalized_chars(value: str) -> str:
    return "".join(char for char in value.casefold() if char.isalnum())


def resample_for_alignment(audio: np.ndarray, sample_rate: int) -> np.ndarray:
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
    audio: np.ndarray,
    sample_rate: int,
    start_seconds: float,
    aligner: WhisperModel,
) -> list[list[object]]:
    """Derive visible-word timings from the generated sentence audio itself."""
    visible = display_words(sentence)
    if not visible:
        return []
    segments, _ = aligner.transcribe(
        resample_for_alignment(audio, sample_rate),
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
        mapped = [char_map[index] for index in range(cursor, cursor + length) if index in char_map]
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
        raw[index] = (previous_end + slot * slot_index, previous_end + slot * (slot_index + 1))

    timings: list[list[object]] = []
    previous_start = start_seconds
    for (word, _), timing in zip(visible, raw):
        assert timing is not None
        word_start = max(previous_start, start_seconds + timing[0])
        word_end = max(word_start, min(start_seconds + duration_seconds, start_seconds + timing[1]))
        timings.append([word, round(word_start, 3), round(word_end, 3)])
        previous_start = word_start
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
        "wordTiming": WORD_TIMING_VERSION,
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
    parser.add_argument("--alignment-model", default=DEFAULT_ALIGNMENT_MODEL)
    parser.add_argument("--alignment-cache", type=Path)
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
        aligner = WhisperModel(
            args.alignment_model,
            device="cpu",
            compute_type="int8",
            download_root=str(args.alignment_cache.resolve()) if args.alignment_cache else None,
        )
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
                        chunk,
                        sample_rate,
                        elapsed_samples / sample_rate,
                        aligner,
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
