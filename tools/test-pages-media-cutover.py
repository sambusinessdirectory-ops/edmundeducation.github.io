#!/usr/bin/env python3
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("cutover", Path(__file__).with_name("prune-verified-pages-media.py"))
cutover = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cutover)


class CutoverTest(unittest.TestCase):
    def setUp(self):
        work = tempfile.TemporaryDirectory()
        self.addCleanup(work.cleanup)
        self.root = Path(work.name)
        self.site = self.root / "_site"
        self.site.mkdir()
        self.song = self.site / "song.wav"
        self.song.write_bytes(b"sample")
        self.oid = cutover.blob_id(self.song)
        self.index = self.root / "index.json"
        self.index.write_text(json.dumps({"entries": {"song.wav": [0, 0, 6, "audio/wav", self.oid]}}))

    def response(self, request, timeout):
        if ".well-known" in request.full_url:
            sha = hashlib.sha256(self.index.read_bytes()).hexdigest()
            return io.BytesIO(json.dumps({"sha256": sha}).encode())
        reply = io.BytesIO(b"s")
        reply.status = 206
        reply.headers = {"Content-Range":"bytes 0-0/6", "X-Edmund-Media-Blob": self.oid}
        return reply

    def run_cutover(self, response):
        with patch.object(cutover, "urlopen", side_effect=response):
            cutover.prune(self.site, self.index, "https://test.invalid")

    def test_verified_replica(self):
        self.run_cutover(self.response)
        self.assertFalse(self.song.exists())

    def test_wrong_public_index(self):
        with self.assertRaisesRegex(ValueError, "exact verified index"):
            self.run_cutover(lambda *a, **kw: io.BytesIO(b"{}"))
        self.assertTrue(self.song.exists())

    def test_changed_source(self):
        self.song.write_bytes(b"newest")
        with self.assertRaisesRegex(ValueError, "Restage"):
            self.run_cutover(self.response)
        self.assertEqual(self.song.read_bytes(), b"newest")

    def test_range_failure(self):
        def no_range(request, timeout):
            result = self.response(request, timeout)
            result.status = 200
            return result
        with self.assertRaisesRegex(ValueError, "byte-range"):
            self.run_cutover(no_range)
        self.assertTrue(self.song.exists())

    def test_symlink_is_preserved(self):
        target = self.root / "external.wav"
        self.song.rename(target)
        self.song.symlink_to(target)
        with self.assertRaisesRegex(ValueError, "symlink"):
            self.run_cutover(self.response)
        self.assertEqual(target.read_bytes(), b"sample")


if __name__ == "__main__":
    unittest.main()
