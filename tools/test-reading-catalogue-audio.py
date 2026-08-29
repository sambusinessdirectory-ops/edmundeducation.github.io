#!/usr/bin/env python3
"""Offline regression tests for reading narration checkpoints and publication."""

import copy
import hashlib
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock

import numpy as np
import soundfile as sf


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("reading_batch", ROOT / "tools/generate-reading-catalogue-audio.py")
batch = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(batch)


class SentencePlanTests(unittest.TestCase):
    def setUp(self):
        self.generator = batch.load_generator(ROOT)

    def test_ordinary_sentences_keep_existing_checkpoint_keys(self):
        payload = {"paragraphs": [{"text": "One sentence. Another sentence! A question?"}]}
        parts, digest = batch.sentence_plan(payload, self.generator, "recipe")
        self.assertEqual(parts, [["One sentence.", "Another sentence!", "A question?"]])
        legacy = hashlib.sha256(f"recipe\0{batch.source_hash(payload)}".encode()).hexdigest()
        self.assertEqual(digest, legacy)

    def test_initials_and_scientific_names_stay_with_their_sentence(self):
        text = "Studies by H. F. R. Prechtl showed a link. E. coli was removed. Results held."
        payload = {"paragraphs": [{"text": text}]}
        parts, digest = batch.sentence_plan(payload, self.generator, "recipe")
        self.assertEqual(parts, [["Studies by H. F. R. Prechtl showed a link.", "E. coli was removed.", "Results held."]])
        self.assertEqual([word for part in parts[0] for word in batch.WORD_PATTERN.findall(part)], batch.WORD_PATTERN.findall(text))
        legacy = hashlib.sha256(f"recipe\0{batch.source_hash(payload)}".encode()).hexdigest()
        self.assertNotEqual(digest, legacy)
        self.assertEqual(batch.sentence_plan(payload, self.generator, "recipe"), (parts, digest))

    def test_joining_never_crosses_paragraphs(self):
        payload = {"paragraphs": [{"text": "The label is R."}, {"text": "Next paragraph."}]}
        parts, _ = batch.sentence_plan(payload, self.generator, "recipe")
        self.assertEqual(parts, [["The label is R."], ["Next paragraph."]])


class SentenceAlignmentTests(unittest.TestCase):
    def setUp(self):
        self.helpers = batch.load_generator(ROOT).load_writing_audio_helpers(ROOT)
        self.audio = np.full(24000, 0.1, dtype=np.float32)
        self.segment = SimpleNamespace(words=[
            SimpleNamespace(word="One", start=0.1, end=0.4),
            SimpleNamespace(word="word", start=0.4, end=0.9),
        ])

    def test_empty_prompted_transcript_retries_without_prompt(self):
        aligner = Mock()
        aligner.transcribe.side_effect = [([], None), ([self.segment], None)]
        words = self.helpers.align_sentence_words("One word.", self.audio, 24000, 0, aligner)
        self.assertEqual(words, [["One", 0.1, 0.4], ["word", 0.4, 0.9]])
        calls = aligner.transcribe.call_args_list
        self.assertIn("initial_prompt", calls[0].kwargs)
        self.assertNotIn("initial_prompt", calls[1].kwargs)

    def test_successful_prompted_transcript_does_not_retry(self):
        aligner = Mock()
        aligner.transcribe.return_value = ([self.segment], None)
        self.helpers.align_sentence_words("One word.", self.audio, 24000, 0, aligner)
        aligner.transcribe.assert_called_once()

    def test_empty_retry_still_fails(self):
        aligner = Mock()
        aligner.transcribe.return_value = ([], None)
        with self.assertRaisesRegex(ValueError, "returned no words"):
            self.helpers.align_sentence_words("One word.", self.audio, 24000, 0, aligner)
        self.assertEqual(aligner.transcribe.call_count, 3)

    def test_incorrect_retry_still_fails_confidence_check(self):
        aligner = Mock()
        incorrect = SimpleNamespace(words=[SimpleNamespace(word="One", start=0.1, end=0.9)])
        aligner.transcribe.return_value = ([incorrect], None)
        with self.assertRaisesRegex(ValueError, "Low-confidence"):
            self.helpers.align_sentence_words("One word.", self.audio, 24000, 0, aligner)

    def test_greedy_retry_can_recover_missing_words(self):
        aligner = Mock()
        aligner.transcribe.side_effect = [([], None), ([], None), ([self.segment], None)]
        words = self.helpers.align_sentence_words("One word.", self.audio, 24000, 0, aligner)
        self.assertEqual(words, [["One", 0.1, 0.4], ["word", 0.4, 0.9]])
        self.assertEqual(aligner.transcribe.call_args.kwargs["beam_size"], 1)

    def test_context_retry_offsets_timings_and_excludes_other_audio(self):
        aligner = Mock()
        segment = SimpleNamespace(words=[
            SimpleNamespace(word="Earlier", start=0.05, end=0.3),
            SimpleNamespace(word="One", start=0.45, end=0.9),
            SimpleNamespace(word="word", start=0.9, end=1.4),
            SimpleNamespace(word="Later", start=1.6, end=1.8),
        ])
        aligner.transcribe.side_effect = [([], None), ([], None), ([], None), ([segment], None)]
        original = self.audio.copy()
        words = self.helpers.align_sentence_words("One word.", self.audio, 24000, 0, aligner,
                                                  context_audio=np.zeros(12000, dtype=np.float32))
        self.assertEqual(words, [["One", 0.0, 0.4], ["word", 0.4, 0.9]])
        self.assertEqual(len(aligner.transcribe.call_args.args[0]), 24000)
        self.assertNotIn("initial_prompt", aligner.transcribe.call_args.kwargs)
        np.testing.assert_array_equal(self.audio, original)

    def test_context_cannot_supply_missing_sentence_words(self):
        aligner = Mock()
        segment = SimpleNamespace(words=[
            SimpleNamespace(word="One", start=0.05, end=0.15),
            SimpleNamespace(word="word", start=0.15, end=0.3),
            SimpleNamespace(word="Unrelated", start=0.6, end=1.1),
        ])
        aligner.transcribe.side_effect = [([], None), ([], None), ([], None), ([segment], None)]
        with self.assertRaisesRegex(ValueError, "Low-confidence"):
            self.helpers.align_sentence_words("One word.", self.audio, 24000, 0, aligner,
                                              context_audio=np.zeros(12000, dtype=np.float32))


class ReadingAudioTests(unittest.TestCase):
    def setUp(self):
        self.payload = {"id": "p1-test", "paragraphs": [{"number": 1, "text": "One word."}, {"number": 2, "text": "Another word."}]}
        self.entry = {
            "src": "/test.mp3", "path": "test.mp3", "sourceSha256": batch.source_hash(self.payload),
            "duration": 2.0, "wordCount": 4,
            "paragraphs": [{"number": 1, "start": 0, "end": 0.9}, {"number": 2, "start": 1.1, "end": 2.0}],
            "words": [{"label": "One", "start": 0, "end": 0.4}, {"label": "word", "start": 0.4, "end": 0.9},
                      {"label": "Another", "start": 1.1, "end": 1.5}, {"label": "word", "start": 1.5, "end": 2.0}],
        }

    def test_all_catalogue_sources_and_preserved_einstein(self):
        articles = batch.load_catalogue(ROOT)
        self.assertEqual(len(articles), 437)
        entries, meta = batch.load_manifest(ROOT / batch.MANIFEST)
        original = next(row for row in articles if row["id"] == "p1-069-albert-einstein")
        batch.validate_entry(original, entries[original["id"]], ROOT / entries[original["id"]]["path"])
        self.assertEqual(meta["language"], "en-gb")
        self.assertEqual(meta["speed"], 1.05)

    def test_same_approved_recipe(self):
        generator = batch.load_generator(ROOT)
        recipe = batch.voice_recipe(generator, generator.load_writing_audio_helpers(ROOT))
        self.assertEqual((recipe["voice"], recipe["language"], recipe["speed"]), ("bf_isabella", "en-gb", 1.05))
        self.assertEqual((recipe["sentencePause"], recipe["paragraphPause"]), (0.65, 0.76))

    def test_matching_words_and_monotonic_timestamps(self):
        batch.validate_entry(self.payload, self.entry)
        for change in ("label", "time", "paragraph", "source", "count"):
            entry = copy.deepcopy(self.entry)
            if change == "label":
                entry["words"][2]["label"] = "Different"
            elif change == "time":
                entry["words"][2]["start"] = 0.1
            elif change == "paragraph":
                entry["paragraphs"][1]["end"] = 1.4
            elif change == "source":
                entry["sourceSha256"] = "0" * 64
            else:
                entry["wordCount"] = 3
            with self.subTest(change=change), self.assertRaises(ValueError):
                batch.validate_entry(self.payload, entry)

    def test_checkpoint_rejects_wrong_recipe_or_damaged_audio(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            samples = (np.sin(np.arange(48000) * 0.1) * 0.1).astype(np.float32)
            sf.write(root / "test.mp3", samples, 24000, format="MP3", subtype="MPEG_LAYER_III")
            record = {"recipeSha256": "correct", "entry": self.entry, "audioSha256": batch.file_hash(root / "test.mp3")}
            batch.atomic_json(root / "articles/p1-test.json", record)
            self.assertEqual(batch.checkpoint(self.payload, root, "correct"), record)
            with self.assertRaisesRegex(ValueError, "mix voice recipes"):
                batch.checkpoint(self.payload, root, "wrong")
            (root / "test.mp3").write_bytes(b"broken")
            with self.assertRaisesRegex(ValueError, "Damaged audio"):
                batch.checkpoint(self.payload, root, "correct")

    def test_silent_audio_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "silent.mp3"
            sf.write(path, np.zeros(48000), 24000, format="MP3", subtype="MPEG_LAYER_III")
            with self.assertRaisesRegex(ValueError, "Silent"):
                batch.validate_entry(self.payload, self.entry, path)

    def test_incomplete_build_never_claims_complete(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source, output = root / "source", root / "output"
            source.mkdir()
            output.mkdir()
            (source / batch.MANIFEST).write_text("window.EDMUND_READING_AUDIO = Object.freeze({});\nwindow.EDMUND_READING_AUDIO_META = Object.freeze({});\n")
            result = batch.build_manifest(source, output, [self.payload], "correct", False)
            self.assertEqual(result, {"count": 0, "missingCount": 1, "complete": False})
            with self.assertRaisesRegex(ValueError, "still missing"):
                batch.build_manifest(source, output, [self.payload], "correct", True)

    def test_only_reference_recording_is_preserved(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source, output = root / "source", root / "output"
            source.mkdir()
            output.mkdir()
            payload = {**self.payload, "id": "p1-069-albert-einstein"}
            reference = {**self.entry, "sourceSha256": batch.source_hash(payload)}
            original = {payload["id"]: reference, "older-article": {"src": "/old.mp3"}}
            (source / batch.MANIFEST).write_text("window.EDMUND_READING_AUDIO = Object.freeze(" + json.dumps(original) + ");\nwindow.EDMUND_READING_AUDIO_META = Object.freeze({});\n")
            batch.build_manifest(source, output, [payload], "correct", True)
            entries, meta = batch.load_manifest(output / batch.MANIFEST)
            self.assertEqual(entries, {payload["id"]: reference})
            self.assertTrue(meta["complete"])

    def test_non_reference_recording_requires_new_recipe_checkpoint(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source, output = root / "source", root / "output"
            source.mkdir()
            output.mkdir()
            (source / batch.MANIFEST).write_text("window.EDMUND_READING_AUDIO = Object.freeze(" + json.dumps({self.payload["id"]: self.entry}) + ");\nwindow.EDMUND_READING_AUDIO_META = Object.freeze({});\n")
            result = batch.build_manifest(source, output, [self.payload], "new-recipe", False)
            self.assertEqual(result, {"count": 0, "missingCount": 1, "complete": False})

    def test_lazy_published_entries_can_resume_without_mutation(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            entry = copy.deepcopy(self.entry)
            words = entry.pop("words")
            entry["timingsSrc"] = "/reading-comprehension-audio-data/p1-test.json"
            timing = {"articleId": "p1-test", "sourceSha256": entry["sourceSha256"], "words": words}
            batch.atomic_json(root / entry["timingsSrc"].lstrip("/"), timing)
            batch.validate_entry(self.payload, batch.expanded_entry(root, "p1-test", entry))
            self.assertNotIn("words", entry)
            timing["articleId"] = "another-article"
            batch.atomic_json(root / entry["timingsSrc"].lstrip("/"), timing)
            with self.assertRaisesRegex(ValueError, "another narration"):
                batch.expanded_entry(root, "p1-test", entry)


if __name__ == "__main__":
    unittest.main()
