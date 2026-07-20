#!/usr/bin/env python3
"""Generate immutable British-boy MP3s for IELTS Speaking Part 3, Books 1-16.

This is a deliberately thin Part 3 adapter around the proven Part 2 rendering,
alignment, hashing, checkpoint, and validation helpers.  It does not modify the
Part 2 generator or manifest.  Each Part 3 exercise receives one continuous
MP3 containing Sample 1's four IEEC steps followed by Sample 2's four IEEC
steps, producing eight ordered timing ranges per exercise.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import importlib.util
import json
import re
from pathlib import Path
from types import ModuleType
from typing import Any


TOOLS_DIR = Path(__file__).resolve().parent
PART2_GENERATOR_PATH = TOOLS_DIR / "generate-speaking-audio.py"
PART3_BUILDER_PATH = TOOLS_DIR / "build-speaking-part3-data.py"

AUDIO_BUILD_VERSION = "v2"
STATIC_AUDIO_ROOT = (
    f"assets/speaking-system/audio/edmund-neural/part3/{AUDIO_BUILD_VERSION}"
)
SOURCE_DATA_PATH = "tools"
MANIFEST_NAME = "speaking-part3-audio-manifest.js"

# Keep Part 3 on the same approved British-boy performance used by Part 2.
VOICE = "bm_fable"
LANGUAGE = "en-gb"
SPEED = 0.98
SUPPORTED_BOOKS = tuple(range(1, 17))
SELECTED_BOOKS = SUPPORTED_BOOKS
# Preserve the already-published v2 recipe fingerprint. Corpus membership is
# validated separately by the pinned structured-source hashes and manifest
# corpus hash, so adding new exercises with the same voice does not rewrite
# Book 1's immutable v2 files.
RECIPE_SEED_EXERCISES = 23
EXPECTED_MODELS_PER_EXERCISE = 2
EXPECTED_SECTIONS_PER_MODEL = 4
EXPECTED_SECTIONS_PER_EXERCISE = 8
SECTION_LAYOUT = "model-major-2x4-v1"
EXPECTED_STAGES = ("idea", "explanation", "example", "conclusion")
EXPECTED_RUNTIME_VERSIONS = {
    "kokoro-onnx": "0.5.0",
    "numpy": "2.5.1",
    "soundfile": "0.14.0",
    "faster-whisper": "1.2.1",
}
# These two Book 1 fixes were present when the published v2 recipe was sealed.
# Keep that seed immutable so adding an exact spoken-only fix for a brand-new,
# never-published exercise does not invalidate Book 1's existing v2 files.
RECIPE_SEED_SPOKEN_OVERRIDES = {
    # Kokoro drops the clause before the colon for this exact sentence.  The
    # spoken-only conjunction keeps every displayed word audible and gives
    # Whisper a stable alignment without changing the lesson transcript.
    "It is a bit like planting seeds: the results may not appear overnight, but with the right environment, they gradually take root.":
        "It is a bit like planting seeds, and the results may not appear overnight, but with the right environment, they gradually take root.",
    # The curly possessive mark causes this stock voice to truncate after
    # "stronger".  Straightening that mark and adding a prosodic comma keeps
    # every visible word while allowing the final clause to render.
    "I think the first thing we should do is protect animals’ natural habitats and enforce stronger laws against hunting and illegal trade.":
        "I think the first thing we should do is protect animals' natural habitats, and enforce stronger laws against hunting and illegal trade.",
}

PART3_SPOKEN_OVERRIDES = {
    **RECIPE_SEED_SPOKEN_OVERRIDES,
    # Kokoro truncates immediately after "which" when this compound adjective
    # is hyphenated. Removing only the spoken hyphen renders the complete
    # sentence while preserving every displayed word and its timing target.
    "So, one major type of food people eat in Hong Kong is traditional Cantonese-style food, which is still very much the backbone of local eating habits.":
        "So, one major type of food people eat in Hong Kong is traditional Cantonese style food, which is still very much the backbone of local eating habits.",
    # Kokoro stops after "when" unless the final coordinated clause receives a
    # spoken pause. The added comma keeps all displayed tokens and allows the
    # complete sentence to align deterministically.
    "So yes, I would say a lot of people do like expressing political opinions, particularly when the topic strikes a nerve or feels personally relevant.":
        "So yes, I would say a lot of people do like expressing political opinions, particularly when the topic strikes a nerve, or feels personally relevant.",
    # This hyphen makes Kokoro truncate after "does" in the following clause.
    # Removing it only from the spoken form produces the complete sentence and
    # preserves every displayed word for timing and highlighting.
    "So, overall, I would say future generations may become more health-conscious, but that does not necessarily mean they will all live more healthily in practice.":
        "So, overall, I would say future generations may become more health conscious, but that does not necessarily mean they will all live more healthily in practice.",
    # The comma immediately before the closing curly quote makes the engine
    # skip the opening words and hallucinate an ending. Removing that spoken
    # comma yields the complete quotation while retaining all display tokens.
    "It tells people, “This should be good,” even before they try it.":
        "It tells people, “This should be good” even before they try it.",
    # A short spoken pause between the coordinated conditions prevents Kokoro
    # from truncating after "style". The comma is audio-only and preserves the
    # complete visible wording and order.
    "So, one major factor is practicality, because if clothes do not feel right or last well, the style alone usually will not carry the day.":
        "So, one major factor is practicality, because if clothes do not feel right, or last well, the style alone usually will not carry the day.",
    # A spoken pause after "I think" keeps the final judgement from being
    # truncated. This punctuation-only override retains every display token.
    "So, in daily face-to-face situations, people may seem less willing to help than before, but I think that impression can be a little misleading.":
        "So, in daily face-to-face situations, people may seem less willing to help than before, but I think, that impression can be a little misleading.",
    # The pause after this compound adjective makes the voice stop at "rather".
    # Removing only that spoken comma retains every visible word and produces
    # the complete sentence deterministically.
    "So, one very obvious change is that shopping has become far more online and on-demand, rather than mainly based on visiting physical shops.":
        "So, one very obvious change is that shopping has become far more online and on-demand rather than mainly based on visiting physical shops.",
    # A full spoken pause between the two coordinated thoughts prevents the
    # engine from stopping at "waterways". The display sentence and its word
    # sequence remain unchanged.
    "Cities and towns produce huge amounts of waste, and if that waste is not managed properly, waterways often end up paying the price.":
        "Cities and towns produce huge amounts of waste. And if that waste is not managed properly, waterways often end up paying the price.",
    # The opening discourse-marker pause causes the engine to stop after "and".
    # Removing that spoken comma preserves all displayed words and completes
    # the sentence reliably.
    "So, one major reason people move to cities is that city life promises upward mobility and a stronger sense of possibility.":
        "So one major reason people move to cities is that city life promises upward mobility and a stronger sense of possibility.",
    # A full spoken pause between the contrasted kinds of work prevents the
    # engine from stopping at "mental". The displayed sentence is untouched.
    "So, broadly speaking, physical work is often paid for visible labour and endurance, while mental work is more often paid for knowledge, judgment, and responsibility.":
        "So, broadly speaking, physical work is often paid for visible labour and endurance. While mental work is more often paid for knowledge, judgment, and responsibility.",
    # The pause after this discourse marker makes the audio stop at "sounds".
    # Removing the spoken comma preserves every displayed word and completes
    # the example reliably.
    "For example, two friends may argue over a text message simply because one sentence sounds colder or harsher than it was meant to.":
        "For example two friends may argue over a text message simply because one sentence sounds colder or harsher than it was meant to.",
    # Kokoro truncates after "especially" when this final adjective is
    # hyphenated. Removing only the spoken hyphen preserves the UI wording and
    # yields the complete sentence.
    "I think people usually share good news when it feels both real and emotionally fresh, especially right after something happy, meaningful, or hard-earned has happened.":
        "I think people usually share good news when it feels both real and emotionally fresh, especially right after something happy, meaningful, or hard earned has happened.",
    # The pause before the reason clause makes the voice stop at "because".
    # Removing only that spoken comma keeps all display tokens and completes
    # the sentence without an ASR hallucination.
    "So, generally speaking, people should apologise when they have caused real harm or discomfort, because saying sorry is often the first step towards putting things right.":
        "So, generally speaking, people should apologise when they have caused real harm or discomfort because saying sorry is often the first step towards putting things right.",
    # A stronger spoken break after the first clause prevents truncation after
    # "meaningful". The semicolon is audio-only; display text stays unchanged.
    "Small happy moments may fly through messages and social media, while bigger and more meaningful ones are often shared more personally, because joy is sweetest when it is truly felt, not just announced.":
        "Small happy moments may fly through messages and social media; while bigger and more meaningful ones are often shared more personally, because joy is sweetest when it is truly felt, not just announced.",
    # Curly quote marks make this sentence produce empty or garbled speech.
    # Straightening only the spoken quotes preserves all visible words and
    # yields a complete, stable reading.
    "It may feel as though they would rather dig their heels in than simply admit, “Yes, that was my fault.”":
        'It may feel as though they would rather dig their heels in than simply admit, "Yes, that was my fault."',
}

ENTRIES_GLOBAL = "EDMUND_SPEAKING_PART3_AUDIO"
META_GLOBAL = "EDMUND_SPEAKING_PART3_AUDIO_META"
RECIPE_GLOBAL = "EDMUND_SPEAKING_PART3_AUDIO_RECIPE_SHA256"
SHA256_GLOBAL = "EDMUND_SPEAKING_PART3_AUDIO_SHA256"


def load_python_file(path: Path, module_name: str) -> ModuleType:
    spec = importlib.util.spec_from_file_location(module_name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load Python module from {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


shared = load_python_file(PART2_GENERATOR_PATH, "edmund_speaking_audio_shared")
part3_data = load_python_file(PART3_BUILDER_PATH, "edmund_speaking_part3_data")

# Preserve direct references before installing Part 3 adapters into the loaded
# helper module.  Python functions resolve their module globals at call time,
# so shared.main() then uses this isolated Part 3 configuration end-to-end.
base_recipe_payload = shared.recipe_payload
base_spoken_text = shared.spoken_text
base_manifest_meta = shared.manifest_meta
base_load_soundfile_dependency = shared.load_soundfile_dependency
base_load_generation_dependencies = shared.load_generation_dependencies


def stable_exercise_id(book: int, index: int) -> str:
    return f"ielts-part-3-book-{book}-exercise-{index:02d}"


def spoken_text(value: str) -> str:
    """Apply audited Part 3 pronunciation-only fixes before shared expansions."""
    return base_spoken_text(PART3_SPOKEN_OVERRIDES.get(value, value))


def load_exercises(source_root: Path) -> dict[str, dict[str, Any]]:
    exercises: dict[str, dict[str, Any]] = {}
    sources = part3_data.load_sources(
        source_root / SOURCE_DATA_PATH,
        tuple(SELECTED_BOOKS),
    )
    for payload in sources:
        book = int(payload["book"])
        for expected_index, source_exercise in enumerate(payload["exercises"], start=1):
            section_texts: list[str] = []
            sentence_groups: list[list[str]] = []
            section_metadata: list[dict[str, object]] = []
            models = source_exercise["response_models"]
            if len(models) != EXPECTED_MODELS_PER_EXERCISE:
                raise ValueError(
                    f"Part 3 Book {book}, exercise {expected_index} does not contain two models"
                )

            for expected_model, model in enumerate(models, start=1):
                if model["model_number"] != expected_model:
                    raise ValueError(
                        f"Part 3 Book {book}, exercise {expected_index} models are out of order"
                    )
                components = model["components"]
                if len(components) != EXPECTED_SECTIONS_PER_MODEL:
                    raise ValueError(
                        f"Part 3 Book {book}, exercise {expected_index}, model {expected_model} "
                        "does not contain four IEEC steps"
                    )
                for model_step, (component, expected_stage) in enumerate(
                    zip(components, EXPECTED_STAGES), start=1
                ):
                    source_number = (
                        (expected_model - 1) * EXPECTED_SECTIONS_PER_MODEL + model_step
                    )
                    if (
                        component["source_number"] != source_number
                        or component["stage"] != expected_stage
                    ):
                        raise ValueError(
                            f"Part 3 Book {book}, exercise {expected_index}, "
                            f"model {expected_model}, step {model_step} is out of IEEC order"
                        )
                    english = str(component["english"])
                    if english != english.strip() or re.search(r"\s{2,}", english):
                        raise ValueError(
                            f"Part 3 Book {book}, exercise {expected_index}, "
                            f"source component {source_number} has unexpected whitespace"
                        )
                    section_texts.append(english)
                    sentence_groups.append(shared.split_sentences(english))
                    section_metadata.append({
                        "number": source_number,
                        "modelNumber": expected_model,
                        "modelStep": model_step,
                        "sourceNumber": source_number,
                        "stage": expected_stage,
                    })

            if len(section_texts) != EXPECTED_SECTIONS_PER_EXERCISE:
                raise ValueError(
                    f"Part 3 Book {book}, exercise {expected_index} does not contain eight sections"
                )
            exercise_id = stable_exercise_id(book, expected_index)
            if exercise_id in exercises:
                raise ValueError(f"Duplicate Part 3 exercise id {exercise_id}")
            full_text = "\n\n".join(section_texts)
            exercises[exercise_id] = {
                "part": 3,
                "book": book,
                "index": expected_index,
                "title": source_exercise["question"]["english"],
                "sections": section_texts,
                "sectionMetadata": section_metadata,
                "sentences": sentence_groups,
                "text": full_text,
            }
    return exercises


def section_word_ranges(exercise: dict[str, Any]) -> list[dict[str, int]]:
    # The existing renderer writes positional range objects while it streams
    # each section.  Positions 1–4 are Sample 1 and 5–8 are Sample 2; the
    # versioned SECTION_LAYOUT in metadata makes that contract explicit.
    ranges: list[dict[str, int]] = []
    cursor = 0
    for number, text in enumerate(exercise["sections"], start=1):
        count = len(shared.display_words(str(text)))
        ranges.append({"number": number, "wordStart": cursor, "wordEnd": cursor + count})
        cursor += count
    return ranges


def load_manifest(path: Path) -> dict[str, Any] | None:
    if not path.is_file():
        return None
    source = path.read_text(encoding="utf-8")
    entries = shared.manifest_json_object(source, ENTRIES_GLOBAL)
    meta = shared.manifest_json_object(source, META_GLOBAL)
    audio_sha256 = shared.manifest_json_object(source, SHA256_GLOBAL)
    recipe_match = re.search(
        rf'window\.{re.escape(RECIPE_GLOBAL)}\s*=\s*("[0-9a-f]{{64}}");',
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


def recipe_payload() -> dict[str, Any]:
    payload = base_recipe_payload()
    payload["corpus"] = {
        "exam": "IELTS",
        "part": 3,
        "book": 1,
        "expectedExercises": RECIPE_SEED_EXERCISES,
        "modelsPerExercise": EXPECTED_MODELS_PER_EXERCISE,
        "sectionsPerModel": EXPECTED_SECTIONS_PER_MODEL,
        "sectionsPerExercise": EXPECTED_SECTIONS_PER_EXERCISE,
        "sectionLayout": SECTION_LAYOUT,
        "structuredSourceSha256": part3_data.EXPECTED_STRUCTURED_JSON_SHA256_BY_BOOK[1],
        "spokenOverrides": RECIPE_SEED_SPOKEN_OVERRIDES,
    }
    payload["runtime"] = dict(EXPECTED_RUNTIME_VERSIONS)
    return payload


def manifest_meta(
    exercises: dict[str, dict[str, Any]],
    entries: dict[str, dict[str, object]],
    *,
    complete: bool,
) -> dict[str, object]:
    meta = base_manifest_meta(exercises, entries, complete=complete)
    books = sorted({int(exercise["book"]) for exercise in exercises.values()})
    meta.update({
        "name": "Edmund Speaking Part 3 Neural",
        "part": 3,
        "bookCount": len(books),
        "books": books,
        "responseModelsPerExercise": EXPECTED_MODELS_PER_EXERCISE,
        "sectionsPerModel": EXPECTED_SECTIONS_PER_MODEL,
        "sectionsPerExercise": EXPECTED_SECTIONS_PER_EXERCISE,
        "sectionLayout": SECTION_LAYOUT,
        "sourceComponentCount": len(exercises) * EXPECTED_SECTIONS_PER_EXERCISE,
        "sourceDisplayWordCount": sum(
            len(shared.display_words(str(section)))
            for exercise in exercises.values()
            for section in exercise["sections"]
        ),
        "spokenOverrideCount": len(PART3_SPOKEN_OVERRIDES),
        "spokenOverridesSha256": hashlib.sha256(json.dumps(
            PART3_SPOKEN_OVERRIDES,
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
        ).encode("utf-8")).hexdigest(),
    })
    return meta


def manifest_content(
    exercises: dict[str, dict[str, Any]],
    entries: dict[str, dict[str, object]],
    audio_sha256: dict[str, str],
    *,
    complete: bool,
) -> str:
    meta = manifest_meta(exercises, entries, complete=complete)
    return (
        "/* Generated by tools/generate-speaking-part3-audio.py. */\n"
        f"window.{ENTRIES_GLOBAL} = Object.freeze("
        f"{json.dumps(entries, sort_keys=True, separators=(',', ':'))});\n"
        f"window.{META_GLOBAL} = Object.freeze("
        f"{json.dumps(meta, separators=(',', ':'))});\n"
        f"window.{RECIPE_GLOBAL} = {json.dumps(shared.recipe_sha256())};\n"
        f"window.{SHA256_GLOBAL} = Object.freeze("
        f"{json.dumps(audio_sha256, sort_keys=True, separators=(',', ':'))});\n"
    )


def assert_runtime_version(distribution: str) -> None:
    expected = EXPECTED_RUNTIME_VERSIONS[distribution]
    try:
        actual = importlib.metadata.version(distribution)
    except importlib.metadata.PackageNotFoundError as error:
        raise SystemExit(
            f"Required Part 3 audio package {distribution}=={expected} is not installed"
        ) from error
    if actual != expected:
        raise SystemExit(
            f"Part 3 audio runtime drift: expected {distribution}=={expected}, "
            f"found {actual}"
        )


def load_soundfile_dependency() -> Any:
    assert_runtime_version("soundfile")
    return base_load_soundfile_dependency()


def load_generation_dependencies() -> tuple[Any, Any, Any]:
    assert_runtime_version("numpy")
    assert_runtime_version("kokoro-onnx")
    assert_runtime_version("faster-whisper")
    return base_load_generation_dependencies()


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
        raise argparse.ArgumentTypeError("Books must be a non-empty subset of 1-16")
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
        help="Books to process, for example 2-6 or 2,4,6 (default: 1-16)",
    )
    parser.add_argument(
        "--validate-source",
        action="store_true",
        help="Validate the Part 3 corpus without importing audio dependencies",
    )
    parser.add_argument(
        "--write-placeholder",
        action="store_true",
        help="Write an incomplete empty Part 3 manifest without synthesizing audio",
    )
    parser.add_argument(
        "--manifest-only",
        "--check",
        dest="manifest_only",
        action="store_true",
        help="Strictly validate the complete Part 3 manifest and MP3s without writes",
    )
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--prune-orphans", action="store_true")
    args = parser.parse_args()
    if args.validate_source and (
        args.manifest_only or args.write_placeholder or args.force or args.prune_orphans
    ):
        parser.error(
            "--validate-source is read-only and cannot be combined with manifest, "
            "placeholder, force, or pruning modes"
        )
    if args.write_placeholder and args.prune_orphans:
        parser.error("--write-placeholder cannot be combined with --prune-orphans")
    if args.prune_orphans and tuple(args.books) != SUPPORTED_BOOKS:
        parser.error("--prune-orphans requires the complete 1-16 book selection")
    return args


def install_part3_configuration() -> None:
    shared.__doc__ = __doc__
    shared.AUDIO_BUILD_VERSION = AUDIO_BUILD_VERSION
    shared.STATIC_AUDIO_ROOT = STATIC_AUDIO_ROOT
    shared.SOURCE_DATA_PATH = SOURCE_DATA_PATH
    shared.MANIFEST_NAME = MANIFEST_NAME
    shared.VOICE = VOICE
    shared.LANGUAGE = LANGUAGE
    shared.SPEED = SPEED
    shared.EXPECTED_BOOKS = SUPPORTED_BOOKS
    shared.EXPECTED_SECTIONS_PER_EXERCISE = EXPECTED_SECTIONS_PER_EXERCISE
    shared.load_exercises = load_exercises
    shared.spoken_text = spoken_text
    shared.section_word_ranges = section_word_ranges
    shared.load_manifest = load_manifest
    shared.recipe_payload = recipe_payload
    shared.manifest_meta = manifest_meta
    shared.manifest_content = manifest_content
    shared.load_soundfile_dependency = load_soundfile_dependency
    shared.load_generation_dependencies = load_generation_dependencies
    shared.parse_args = parse_args


def main() -> int:
    global SELECTED_BOOKS
    install_part3_configuration()
    args = parse_args()
    SELECTED_BOOKS = tuple(args.books)
    if args.manifest_only:
        # Validate the immutable source before inspecting the manifest.  An
        # explicit placeholder can then fail clearly as incomplete even on a
        # machine where the pinned decoding runtime has not been installed yet.
        load_exercises(args.source_root.resolve())
        manifest_path = args.output_root.resolve() / MANIFEST_NAME
        manifest = load_manifest(manifest_path)
        if manifest is None:
            raise SystemExit("Part 3 audio manifest is missing or unreadable")
        meta = manifest["meta"]
        if meta.get("complete") is not True:
            raise SystemExit(
                "Part 3 audio is incomplete: manifest is an explicit placeholder "
                f"with {len(manifest['entries'])}/{len(load_exercises(args.source_root.resolve()))} entries"
            )
    # The proven shared main owns all subsequent validation/generation logic.
    # Supplying the already-validated namespace avoids parsing command-line
    # arguments twice.
    shared.parse_args = lambda: args
    return int(shared.main())


if __name__ == "__main__":
    raise SystemExit(main())
