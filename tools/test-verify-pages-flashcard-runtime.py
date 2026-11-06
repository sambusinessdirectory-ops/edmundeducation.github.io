import importlib.util
import tempfile
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("verify-pages-flashcard-runtime.py")
SPEC = importlib.util.spec_from_file_location("verify_pages_flashcard_runtime", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class VerifyPagesFlashcardRuntimeTests(unittest.TestCase):
    def make_fixture(self):
        temporary = tempfile.TemporaryDirectory()
        root = Path(temporary.name)
        source = root / "source"
        site = root / "site"
        source.mkdir()
        site.mkdir()
        (source / "edmund-coins").mkdir()
        (site / "edmund-coins").mkdir()
        files = {
            "flashcards-data-catalog.js": 'window.C={"u":"flashcards-extra-data.js?v=1"};',
            "flashcards-ielts-reading-index.js": "window.I={};",
            "flashcards-audio-manifest.js": "window.A={};",
            "flashcards-dse-writing-part-b-audio.js": "window.B={};",
            "flashcards-core-data.js": "window.D={};",
            "flashcards-extra-data.js": "window.E={};",
        }
        for name, content in files.items():
            (source / name).write_text(content, encoding="utf-8")
            (site / name).write_text(content, encoding="utf-8")
        (site / "flashcards.html").write_text(
            '<script src="flashcards-data-catalog.js?v=1"></script>', encoding="utf-8"
        )
        coin = b"coin"
        (source / "edmund-coins" / "eddy-v3.webp").write_bytes(coin)
        (site / "edmund-coins" / "eddy-v3.webp").write_bytes(coin)
        return temporary, source, site

    def test_complete_runtime_passes(self):
        temporary, source, site = self.make_fixture()
        self.addCleanup(temporary.cleanup)
        checked = MODULE.verify(site, source)
        self.assertIn("flashcards-extra-data.js", checked)
        self.assertIn("edmund-coins/eddy-v3.webp", checked)

    def test_missing_catalog_bundle_fails(self):
        temporary, source, site = self.make_fixture()
        self.addCleanup(temporary.cleanup)
        (site / "flashcards-extra-data.js").unlink()
        with self.assertRaisesRegex(ValueError, "flashcards-extra-data.js"):
            MODULE.verify(site, source)

    def test_missing_coin_art_fails(self):
        temporary, source, site = self.make_fixture()
        self.addCleanup(temporary.cleanup)
        (site / "edmund-coins" / "eddy-v3.webp").unlink()
        with self.assertRaisesRegex(ValueError, "edmund-coins/eddy-v3.webp"):
            MODULE.verify(site, source)


if __name__ == "__main__":
    unittest.main()
