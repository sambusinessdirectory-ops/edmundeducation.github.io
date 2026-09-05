#!/usr/bin/env python3
"""Resume catalogue-wide narration using the approved Einstein voice recipe."""

from __future__ import annotations

import argparse
import concurrent.futures
import fcntl
import hashlib
import importlib.util
import inspect
import json
import multiprocessing
import os
import re
import subprocess
import sys
import time
from pathlib import Path

import numpy as np
import soundfile as sf


RELEASE = "v1-catalogue-20260829-pause065-1"
MANIFEST = "reading-comprehension-audio-manifest.js"
PRESERVED_ARTICLES = frozenset({"p1-069-albert-einstein"})
SYSTEM = "ielts"
MANIFEST_NAMES = ("EDMUND_READING_AUDIO", "EDMUND_READING_AUDIO_META")
TIMING_DIRECTORY = "reading-comprehension-audio-data"
MODEL_SHA256 = "7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5"
VOICES_SHA256 = "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d"
WORD_PATTERN = re.compile(r"[^\W_]+(?:[\u2019'][^\W_]+)*(?:-[^\W_]+)*", re.UNICODE)
WORKER = {}
DSE_SPOKEN_FORMS = {"BOOOOOOOOMMMM": "Boom", "Ermmm": "Erm", "urghh": "Ugh", "Arggghhhh": "Argh"}


def pronunciation_aliases(payload: dict) -> dict:
    if SYSTEM != "dse":
        return {}
    words = {word for paragraph in payload["paragraphs"] for word in WORD_PATTERN.findall(paragraph["text"])}
    return {word: spoken for word, spoken in DSE_SPOKEN_FORMS.items() if word in words}


def spoken_sentence(sentence: str) -> str:
    if SYSTEM != "dse":
        return sentence
    return WORD_PATTERN.sub(lambda match: DSE_SPOKEN_FORMS.get(match.group(), match.group()), sentence)


def display_word_timings(sentence: str, speech: str, words: list) -> list:
    display = WORD_PATTERN.findall(sentence)
    spoken = WORD_PATTERN.findall(speech)
    if len(display) != len(spoken) or [word[0] for word in words] != spoken:
        raise ValueError("Pronunciation aliases must retain one timing per printed word")
    return [[label, word[1], word[2]] for label, word in zip(display, words)]


def configure_system(system: str) -> None:
    global SYSTEM, RELEASE, MANIFEST, PRESERVED_ARTICLES, MANIFEST_NAMES, TIMING_DIRECTORY
    if system not in ("ielts", "dse"):
        raise ValueError(f"Unknown reading system: {system}")
    SYSTEM = system
    RELEASE = "v1-dse-20260904-pause065-1" if system == "dse" else "v1-catalogue-20260829-pause065-1"
    MANIFEST = "dse-reading-audio-manifest.js" if system == "dse" else "reading-comprehension-audio-manifest.js"
    PRESERVED_ARTICLES = frozenset() if system == "dse" else frozenset({"p1-069-albert-einstein"})
    MANIFEST_NAMES = ("EDMUND_DSE_READING_AUDIO", "EDMUND_DSE_READING_AUDIO_META") if system == "dse" else ("EDMUND_READING_AUDIO", "EDMUND_READING_AUDIO_META")
    TIMING_DIRECTORY = "dse-reading-audio-data" if system == "dse" else "reading-comprehension-audio-data"


def narration_paragraph_text(paragraph: dict) -> str:
    # Keep this projection aligned with readingNarrationParagraphText in the UI.
    table = paragraph.get("table")
    if not table:
        return paragraph["text"]
    parts = [paragraph["text"], table.get("caption", "")]
    parts.extend(cell if isinstance(cell, str) else cell.get("text", "")
                 for row in table.get("rows", []) for cell in row)
    return "\n".join(text.strip() if re.search(r"[.!?]$", text.strip()) else text.strip() + "."
                     for text in parts if text.strip())


def load_generator(root: Path):
    spec = importlib.util.spec_from_file_location("reading_voice", root / "tools/generate-reading-comprehension-audio.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def file_hash(path: Path) -> str:
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def atomic_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    temporary.replace(path)


def source_hash(payload: dict) -> str:
    text = "\n\n".join(paragraph["text"] for paragraph in payload["paragraphs"])
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def voice_recipe(generator, helpers) -> dict:
    return {
        "buildVersion": RELEASE, "voice": generator.VOICE, "language": generator.LANGUAGE,
        "speed": generator.SPEED, "sentencePause": generator.SENTENCE_PAUSE,
        "paragraphPause": generator.PARAGRAPH_PAUSE, "sampleRate": 24000,
        "compressionLevel": 0.55, "format": "audio/mpeg", "wordTiming": "faster-whisper-base.en-audio-v1",
        "modelSha256": MODEL_SHA256, "voicesSha256": VOICES_SHA256,
        "spokenTextSha256": hashlib.sha256(inspect.getsource(helpers.spoken_text).encode()).hexdigest(),
    }


def load_manifest(path: Path) -> tuple[dict, dict]:
    if SYSTEM == "dse" and not path.exists():
        return {}, {}
    source = path.read_text(encoding="utf-8")
    result = []
    for name in MANIFEST_NAMES:
        match = re.search(rf"window\.{name}\s*=\s*Object\.freeze\(\s*", source)
        if not match:
            raise ValueError(f"Missing {name} in {path}")
        value, _ = json.JSONDecoder().raw_decode(source, match.end())
        if not isinstance(value, dict):
            raise ValueError(f"Invalid {name} in {path}")
        result.append(value)
    return result[0], result[1]


def load_catalogue(root: Path) -> list[dict]:
    catalogue = json.loads((root / ("dse-reading-catalogue.json" if SYSTEM == "dse" else "reading-comprehension-catalogue.json")).read_text())
    rows = ([entry for year in catalogue["years"]
             for entry in year["sections"].values() if entry] if SYSTEM == "dse" else catalogue["articles"])
    seen, articles = set(), []
    for row in rows:
        article_id = row["id"]
        if not re.fullmatch(r"[a-z0-9-]+", article_id) or article_id in seen:
            raise ValueError(f"Invalid or duplicate article ID: {article_id}")
        seen.add(article_id)
        payload = json.loads((root / ("dse-reading-data" if SYSTEM == "dse" else "reading-comprehension-data") / f"{article_id}.json").read_text())
        if SYSTEM == "dse":
            payload["paragraphs"] = [{**paragraph, "text": narration_paragraph_text(paragraph)} for paragraph in payload["paragraphs"]]
        if payload.get("id") != article_id or not payload.get("paragraphs"):
            raise ValueError(f"Invalid article: {article_id}")
        for number, paragraph in enumerate(payload["paragraphs"], 1):
            if paragraph.get("number") != number or not isinstance(paragraph.get("text"), str) or not paragraph["text"].strip():
                raise ValueError(f"Invalid paragraph {article_id}:{number}")
        articles.append(payload)
    if not articles:
        raise ValueError("Empty reading catalogue")
    return articles


def expanded_entry(root: Path, article_id: str, entry: dict) -> dict:
    if "words" in entry or not entry.get("timingsSrc"):
        return entry
    path = (root / entry["timingsSrc"].lstrip("/")).resolve()
    if not path.is_relative_to(root.resolve() / TIMING_DIRECTORY):
        raise ValueError(f"Unexpected word timing path: {article_id}")
    timing = json.loads(path.read_text())
    if timing.get("articleId") != article_id or timing.get("sourceSha256") != entry.get("sourceSha256"):
        raise ValueError(f"Word timings belong to another narration: {article_id}")
    return {**entry, "words": timing["words"]}


def validate_entry(payload: dict, entry: dict, path: Path | None = None) -> None:
    if entry.get("sourceSha256") != source_hash(payload):
        raise ValueError(f"Narration source changed: {payload['id']}")
    expected = [word for paragraph in payload["paragraphs"] for word in WORD_PATTERN.findall(paragraph["text"])]
    words = entry.get("words", [])
    if [word.get("label") for word in words] != expected or entry.get("wordCount") != len(expected):
        raise ValueError(f"Narration words do not match the displayed passage: {payload['id']}")
    duration = entry.get("duration", 0)
    if not isinstance(duration, (int, float)) or not np.isfinite(duration) or duration <= 0:
        raise ValueError(f"Invalid duration: {payload['id']}")
    previous = 0
    for word in words:
        start, end = word["start"], word["end"]
        if not (0 <= previous <= start <= end <= duration + 0.002):
            raise ValueError(f"Non-monotonic word timing: {payload['id']}")
        previous = end
    ranges = entry.get("paragraphs", [])
    if len(ranges) != len(payload["paragraphs"]):
        raise ValueError(f"Missing paragraph timings: {payload['id']}")
    previous, cursor = 0, 0
    for paragraph, timing in zip(payload["paragraphs"], ranges):
        if timing["number"] != paragraph["number"] or not (previous <= timing["start"] < timing["end"] <= duration + 0.002):
            raise ValueError(f"Invalid paragraph range: {payload['id']}")
        count = len(WORD_PATTERN.findall(paragraph["text"]))
        selected = words[cursor:cursor + count]
        if selected and (selected[0]["start"] < timing["start"] - 0.002 or selected[-1]["end"] > timing["end"] + 0.002):
            raise ValueError(f"Word outside its paragraph: {payload['id']}")
        cursor += count
        previous = timing["end"]
    if path is not None:
        samples, rate = sf.read(path, dtype="float32")
        if rate != 24000 or samples.ndim != 1 or not len(samples) or not np.isfinite(samples).all():
            raise ValueError(f"Invalid MP3 waveform: {path}")
        if float(np.max(np.abs(samples))) < 0.001 or abs(len(samples) / rate - duration) > 0.15:
            raise ValueError(f"Silent or truncated narration: {path}")


def init_worker(root: str, output: str, model: str, voices: str, alignment_cache: str | None, threads: int, recipe_hash: str, system: str = "ielts") -> None:
    import onnxruntime as ort
    from faster_whisper import WhisperModel
    from kokoro_onnx import Kokoro

    configure_system(system)
    generator = load_generator(Path(root))
    options = ort.SessionOptions()
    options.intra_op_num_threads = threads
    options.inter_op_num_threads = 1
    options.add_session_config_entry("session.intra_op.allow_spinning", "0")
    options.add_session_config_entry("session.inter_op.allow_spinning", "0")
    session = ort.InferenceSession(model, sess_options=options, providers=["CPUExecutionProvider"])
    WORKER.update({
        "generator": generator, "helpers": generator.load_writing_audio_helpers(Path(root)),
        "kokoro": Kokoro.from_session(session, voices),
        "aligner": WhisperModel("base.en", device="cpu", compute_type="int8", cpu_threads=threads,
                                download_root=alignment_cache, local_files_only=True),
        "output": Path(output), "recipeHash": recipe_hash,
    })


def sentence_plan(payload: dict, generator, recipe_hash: str) -> tuple[list[list[str]], str]:
    original = [generator.sentences(paragraph["text"]) for paragraph in payload["paragraphs"]]
    paragraphs = []
    for parts in original:
        joined = []
        for part in parts:
            if joined and re.search(r"\b[A-Z]\.$", joined[-1]):
                joined[-1] += " " + part
            else:
                joined.append(part)
        paragraphs.append(joined)
    cache_key = f"{recipe_hash}\0{source_hash(payload)}"
    if paragraphs != original:
        # Changed sentence boundaries must not reuse old numbered WAV checkpoints.
        cache_key += "\0joined-initials-v1\0" + json.dumps(paragraphs, ensure_ascii=False, separators=(",", ":"))
    aliases = pronunciation_aliases(payload)
    if aliases:
        cache_key += "\0pronunciation-aliases-v1\0" + json.dumps(aliases, sort_keys=True)
    return paragraphs, hashlib.sha256(cache_key.encode()).hexdigest()


def generate_article(payload: dict) -> dict:
    started = time.monotonic()
    article_id = payload["id"]
    generator, helpers, output = WORKER["generator"], WORKER["helpers"], WORKER["output"]
    parts_by_paragraph, digest = sentence_plan(payload, generator, WORKER["recipeHash"])
    relative = f"assets/reading-comprehension/audio/edmund-neural/{RELEASE}/{digest[:2]}/{article_id}-{digest[:24]}.mp3"
    cache = output / "sentence-cache" / article_id / digest[:24]
    chunks, timings, ranges = [], [], []
    elapsed, sample_rate = 0, 24000
    for paragraph_index, paragraph in enumerate(payload["paragraphs"]):
        paragraph_start = elapsed / sample_rate
        parts = parts_by_paragraph[paragraph_index]
        for sentence_index, sentence in enumerate(parts):
            speech = spoken_sentence(sentence)
            chunk_key = f"{paragraph_index:03}-{sentence_index:03}"
            waveform, timed = cache / f"{chunk_key}.wav", cache / f"{chunk_key}.json"
            if waveform.is_file():
                chunk, rate = sf.read(waveform, dtype="float32")
            else:
                chunk, rate = WORKER["kokoro"].create(helpers.spoken_text(speech), voice=generator.VOICE, speed=generator.SPEED, lang=generator.LANGUAGE)
                chunk = np.asarray(chunk, dtype=np.float32)
                waveform.parent.mkdir(parents=True, exist_ok=True)
                temporary = waveform.with_name(f".{waveform.name}.{os.getpid()}.tmp")
                sf.write(temporary, chunk, rate, format="WAV", subtype="FLOAT")
                temporary.replace(waveform)
            if rate != sample_rate or chunk.ndim != 1 or not len(chunk) or not np.isfinite(chunk).all() or np.max(np.abs(chunk)) < 0.001:
                raise ValueError(f"Invalid sentence waveform: {article_id}:{chunk_key}")
            if timed.is_file():
                cached = json.loads(timed.read_text())
                if cached["sentence"] != sentence:
                    raise ValueError(f"Sentence checkpoint changed: {article_id}:{chunk_key}")
                words = cached["words"]
            else:
                context_audio = np.concatenate(chunks[-2:]) if chunks else None
                words = helpers.align_sentence_words(speech, chunk, rate, 0, WORKER["aligner"], context_audio=context_audio)
                words = display_word_timings(sentence, speech, words)
                atomic_json(timed, {"sentence": sentence, "words": words})
            if [word[0] for word in words] != WORD_PATTERN.findall(sentence):
                raise ValueError(f"Sentence word labels differ: {article_id}:{chunk_key}")
            offset = elapsed / sample_rate
            timings.extend({"label": word[0], "start": round(offset + word[1], 3), "end": round(offset + word[2], 3)} for word in words)
            chunks.append(chunk)
            elapsed += len(chunk)
            if sentence_index < len(parts) - 1:
                pause = np.zeros(round(sample_rate * generator.SENTENCE_PAUSE), dtype=np.float32)
                chunks.append(pause)
                elapsed += len(pause)
            atomic_json(output / "active" / f"{article_id}.json", {
                "article": article_id, "paragraph": paragraph_index + 1, "paragraphs": len(payload["paragraphs"]),
                "sentence": sentence_index + 1, "sentences": len(parts), "updatedAt": time.time(),
            })
        ranges.append({"number": paragraph["number"], "start": round(paragraph_start, 3), "end": round(elapsed / sample_rate, 3)})
        if paragraph_index < len(payload["paragraphs"]) - 1:
            pause = np.zeros(round(sample_rate * generator.PARAGRAPH_PAUSE), dtype=np.float32)
            chunks.append(pause)
            elapsed += len(pause)
    path = output / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    sf.write(temporary, np.concatenate(chunks), sample_rate, format="MP3", subtype="MPEG_LAYER_III", compression_level=0.55, bitrate_mode="VARIABLE")
    entry = {"src": f"/{relative}", "path": relative, "sourceSha256": source_hash(payload),
             "duration": round(elapsed / sample_rate, 3), "wordCount": len(timings), "paragraphs": ranges, "words": timings}
    validate_entry(payload, entry, temporary)
    temporary.replace(path)
    record = {"article": article_id, "recipeSha256": WORKER["recipeHash"], "audioSha256": file_hash(path),
              "bytes": path.stat().st_size, "entry": entry, "generationSeconds": round(time.monotonic() - started, 2),
              "pronunciationAliases": pronunciation_aliases(payload)}
    atomic_json(output / "articles" / f"{article_id}.json", record)
    return record


def checkpoint(payload: dict, output: Path, recipe_hash: str) -> dict | None:
    path = output / "articles" / f"{payload['id']}.json"
    if not path.is_file():
        return None
    record = json.loads(path.read_text())
    if record.get("recipeSha256") != recipe_hash:
        raise ValueError(f"Refusing to mix voice recipes: {path}")
    if record.get("pronunciationAliases", {}) != pronunciation_aliases(payload):
        raise ValueError(f"Pronunciation plan changed: {path}")
    entry = record["entry"]
    audio_path = output / entry["path"]
    if not audio_path.is_file() or file_hash(audio_path) != record["audioSha256"]:
        raise ValueError(f"Damaged audio checkpoint: {path}")
    validate_entry(payload, entry, audio_path)
    return record


def build_manifest(root: Path, output: Path, articles: list[dict], recipe_hash: str, require_complete: bool) -> dict:
    baseline, baseline_meta = load_manifest(root / MANIFEST)
    preserved = {article_id: entry for article_id, entry in baseline.items() if article_id in PRESERVED_ARTICLES}
    entries, missing = dict(preserved), []
    for payload in articles:
        article_id = payload["id"]
        if article_id in preserved:
            validate_entry(payload, expanded_entry(root, article_id, preserved[article_id]))
            continue
        record = checkpoint(payload, output, recipe_hash)
        if record:
            entries[article_id] = record["entry"]
        else:
            missing.append(article_id)
    if require_complete and missing:
        raise ValueError(f"Narration still missing for {len(missing)} articles")
    meta = {**baseline_meta, "buildVersion": RELEASE, "voice": "bf_isabella", "recipeSha256": recipe_hash,
            "count": len(entries), "catalogueCount": len(articles), "complete": not missing}
    content = "/* Generated by tools/generate-reading-catalogue-audio.py. */\n"
    content += f"window.{MANIFEST_NAMES[0]} = Object.freeze({json.dumps(entries, ensure_ascii=False, separators=(',', ':'))});\n"
    content += f"window.{MANIFEST_NAMES[1]} = Object.freeze({json.dumps(meta, separators=(',', ':'))});\n"
    temporary = output / f".{MANIFEST}.tmp"
    temporary.write_text(content, encoding="utf-8")
    temporary.replace(output / MANIFEST)
    return {"count": len(entries), "missingCount": len(missing), "complete": not missing}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--system", choices=("ielts", "dse"), default="ielts")
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--output-root", type=Path, required=True)
    parser.add_argument("--model", type=Path)
    parser.add_argument("--voices", type=Path)
    parser.add_argument("--alignment-cache", type=Path)
    parser.add_argument("--workers", type=int, default=2)
    parser.add_argument("--threads", type=int, default=4)
    parser.add_argument("--article", action="append", default=[])
    parser.add_argument("--manifest-only", action="store_true")
    parser.add_argument("--require-complete", action="store_true")
    parser.add_argument("--background", action="store_true", help="Start a resumable local batch with generation.log and build-progress.json")
    args = parser.parse_args()
    configure_system(args.system)
    if not 1 <= args.workers <= 4 or not 1 <= args.threads <= 8:
        parser.error("workers must be 1-4 and threads must be 1-8")
    if not args.manifest_only and (not args.model or not args.voices):
        parser.error("generation requires --model and --voices")
    root, output = args.source_root.resolve(), args.output_root.resolve()
    if output == root or output.is_relative_to(root):
        raise ValueError("Keep audio staging outside the public website repository")
    output.mkdir(parents=True, exist_ok=True)
    if args.background:
        with (output / "generation.log").open("ab", buffering=0) as log:
            child = subprocess.Popen([sys.executable, str(Path(__file__).resolve()), *[arg for arg in sys.argv[1:] if arg != "--background"]],
                                     cwd=root, stdin=subprocess.DEVNULL, stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
        atomic_json(output / "runner.json", {"pid": child.pid, "startedAt": time.time(), "log": str(output / "generation.log")})
        print(json.dumps({"startedPid": child.pid, "progress": str(output / "build-progress.json"), "log": str(output / "generation.log")}), flush=True)
        return 0
    # Keep the file handle alive for the whole run; only one producer may write checkpoints.
    lock = (output / ".generation.lock").open("a")
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        raise RuntimeError("A reading audio batch is already running in this output directory") from None
    generator = load_generator(root)
    recipe = voice_recipe(generator, generator.load_writing_audio_helpers(root))
    recipe_hash = hashlib.sha256(json.dumps(recipe, sort_keys=True).encode()).hexdigest()
    articles = load_catalogue(root)
    baseline, _ = load_manifest(root / MANIFEST)
    preserved = {article_id: entry for article_id, entry in baseline.items() if article_id in PRESERVED_ARTICLES}
    unknown = set(args.article) - {row["id"] for row in articles}
    if unknown:
        raise ValueError(f"Unknown articles: {sorted(unknown)}")
    pending = []
    for payload in articles:
        if payload["id"] in preserved:
            validate_entry(payload, expanded_entry(root, payload["id"], preserved[payload["id"]]))
        elif (not args.article or payload["id"] in args.article) and not checkpoint(payload, output, recipe_hash):
            pending.append(payload)
    atomic_json(output / "recipe.json", {**recipe, "recipeSha256": recipe_hash})
    if args.manifest_only:
        print(json.dumps(build_manifest(root, output, articles, recipe_hash, args.require_complete)), flush=True)
        return 0
    for path, expected in ((args.model, MODEL_SHA256), (args.voices, VOICES_SHA256)):
        if file_hash(path) != expected:
            raise ValueError(f"Voice model checksum mismatch: {path}")
    print(f"{len(articles)} articles; {len(preserved)} reference recording preserved; {len(pending)} queued; {args.workers} workers", flush=True)
    failures, started, finished = {}, time.monotonic(), 0
    def progress(status: str) -> None:
        atomic_json(output / "build-progress.json", {
            "status": status, "catalogueCount": len(articles), "preservedCount": len(preserved),
            "queued": len(pending), "completedThisRun": finished, "failures": failures,
            "elapsedSeconds": round(time.monotonic() - started), "updatedAt": time.time(), "pid": os.getpid(),
        })
    progress("running")
    initargs = (str(root), str(output), str(args.model.resolve()), str(args.voices.resolve()),
                str(args.alignment_cache.resolve()) if args.alignment_cache else None, args.threads, recipe_hash, args.system)
    with concurrent.futures.ProcessPoolExecutor(max_workers=args.workers, mp_context=multiprocessing.get_context("spawn"), initializer=init_worker, initargs=initargs) as pool:
        futures = {pool.submit(generate_article, payload): payload["id"] for payload in pending}
        for future in concurrent.futures.as_completed(futures):
            article_id = futures[future]
            try:
                record = future.result()
                finished += 1
                print(f"[{finished}/{len(pending)}] {article_id}: {record['entry']['duration']:.1f}s narration, {record['generationSeconds']:.1f}s build", flush=True)
            except Exception as error:
                failures[article_id] = str(error)
                print(f"FAILED {article_id}: {error}", flush=True)
            progress("running")
    result = build_manifest(root, output, articles, recipe_hash, False)
    progress("needs-attention" if failures else "complete" if result["complete"] else "partial")
    print(json.dumps({**result, "failedCount": len(failures)}), flush=True)
    return 1 if failures or (args.require_complete and not result["complete"]) else 0


if __name__ == "__main__":
    raise SystemExit(main())
