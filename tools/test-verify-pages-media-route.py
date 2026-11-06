#!/usr/bin/env python3
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from urllib.error import HTTPError
from unittest.mock import patch


spec = importlib.util.spec_from_file_location(
    "media_route", Path(__file__).with_name("verify-pages-media-route.py")
)
media_route = importlib.util.module_from_spec(spec)
spec.loader.exec_module(media_route)


class Reply(io.BytesIO):
    def __init__(self, body=b"", status=200, headers=None, url="https://test.invalid/"):
        super().__init__(body)
        self.status = status
        self.headers = headers or {}
        self.url = url

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()


class MediaRouteTests(unittest.TestCase):
    def setUp(self):
        work = tempfile.TemporaryDirectory()
        self.addCleanup(work.cleanup)
        self.root = Path(work.name)
        self.payload = b"sample"
        self.oid = media_route.blob_id(self.payload)
        self.index = self.root / "media.json"
        self.index.write_text(json.dumps({
            "packs": ["pack"],
            "entries": {"song-media/song.mp3": [0, 0, len(self.payload), "audio/mpeg", self.oid]},
        }, separators=(",", ":")) + "\n")

    def response(self, req, timeout):
        del timeout
        if req.full_url.endswith("/.well-known/edmund-public-media.json"):
            raw = self.index.read_bytes().rstrip(b"\n")
            return Reply(json.dumps({"sha256": hashlib.sha256(raw).hexdigest(), "count": 1}).encode(),
                         headers={"Cache-Control": "no-store"})
        if req.full_url.endswith("/release.json"):
            return Reply(b'{"release":"abc"}', headers={"Content-Type": "application/json"})
        if req.method == "OPTIONS":
            return Reply(status=204, headers={"Access-Control-Allow-Origin": "*"})
        headers = {
            "Content-Type": "audio/mpeg", "Accept-Ranges": "bytes",
            "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=3600",
            "X-Content-Type-Options": "nosniff", "X-Edmund-Media-Blob": self.oid,
            "ETag": '"sample"',
        }
        if req.get_header("If-none-match"):
            raise HTTPError(req.full_url, 304, "Not Modified", headers, None)
        if req.get_header("Range"):
            headers.update({"Content-Length": "1", "Content-Range": "bytes 0-0/6"})
            return Reply(b"s", 206, headers)
        headers["Content-Length"] = "6"
        return Reply(self.payload, headers=headers)

    def test_exact_route_range_cors_complete_download_cache_and_fallback(self):
        with patch.object(media_route, "urlopen", side_effect=self.response):
            result = media_route.verify(
                self.index, "https://test.invalid", ["song-media/song.mp3"],
                "release.json", True,
            )
        self.assertEqual(result["entry_count"], 1)
        self.assertEqual(result["downloaded_bytes"], 6)

    def test_missing_saved_link_stops_cutover(self):
        with patch.object(media_route, "urlopen", side_effect=self.response):
            with self.assertRaisesRegex(ValueError, "Saved media paths"):
                media_route.verify(self.index, "https://test.invalid", ["old.pdf"], "release.json", True)

    def test_wrong_manifest_stops_cutover(self):
        def wrong(req, timeout):
            if req.full_url.endswith("/.well-known/edmund-public-media.json"):
                return Reply(b'{"sha256":"wrong","count":1}', headers={"Cache-Control": "no-store"})
            return self.response(req, timeout)
        with patch.object(media_route, "urlopen", side_effect=wrong):
            with self.assertRaisesRegex(ValueError, "exact repository index"):
                media_route.verify(self.index, "https://test.invalid", [], "release.json", True)


if __name__ == "__main__":
    unittest.main()
