#!/usr/bin/env python3
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch


spec = importlib.util.spec_from_file_location(
    "live_journeys", Path(__file__).with_name("verify-pages-live-journeys.py")
)
live = importlib.util.module_from_spec(spec)
spec.loader.exec_module(live)


class Reply(io.BytesIO):
    status = 200
    headers = {"Content-Type": "text/html; charset=utf-8"}

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()


class LiveJourneyTests(unittest.TestCase):
    def setUp(self):
        work = tempfile.TemporaryDirectory()
        self.addCleanup(work.cleanup)
        self.map = Path(work.name) / "map.json"
        self.map.write_text(json.dumps({"families": {
            "[writing-release]": ["writing.html"],
            "[reading-release]": ["reading.html"],
        }}))

    def response(self, request, timeout):
        del request, timeout
        return Reply(b"<html>" + b"x" * 100 + b"</html>")

    def test_focused_scope_checks_only_its_student_route(self):
        self.assertEqual(
            live.selected_routes("[fast-deploy] [writing-release]", json.loads(self.map.read_text())),
            ["writing.html"],
        )

    def test_full_and_shared_releases_check_every_mapped_route(self):
        payload = json.loads(self.map.read_text())
        expected = ["index.html", "reading.html", "writing.html"]
        self.assertEqual(live.selected_routes("", payload), expected)
        self.assertEqual(live.selected_routes("[fast-deploy] [shared-header-release]", payload), expected)

    def test_public_journey_requires_complete_stamped_html(self):
        with patch.object(live, "urlopen", side_effect=self.response):
            result = live.verify("https://test.invalid", "[fast-deploy] [writing-release]", self.map)
        self.assertEqual(result["routes"], ["writing.html"])

        with patch.object(live, "urlopen", return_value=Reply(b"<html>__EDMUND_RELEASE__" + b"x" * 100 + b"</html>")):
            with self.assertRaisesRegex(ValueError, "Unstamped"):
                live.verify("https://test.invalid", "[fast-deploy] [writing-release]", self.map)


if __name__ == "__main__":
    unittest.main()
