#!/usr/bin/env python3
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


SCRIPT = Path(__file__).with_name("pages-artifact-inventory.py")


class ArtifactInventoryTests(unittest.TestCase):
    def test_removes_generated_editorial_ledgers(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            runtime = root / "index.html"
            runtime.write_text("student runtime", encoding="utf-8")
            inputs = [
                root / "course-materials" / "theme-finder" / "classification-audit.json",
                root / "course-materials" / "theme-finder" / "review.tsv",
                root / "content" / "idiom-super-curation-item-review-ledger-001-108.csv",
            ]
            for item in inputs:
                item.parent.mkdir(parents=True, exist_ok=True)
                item.write_text("editorial input", encoding="utf-8")

            subprocess.run([sys.executable, str(SCRIPT), str(root)], check=True, capture_output=True, text=True)

            self.assertTrue(runtime.exists())
            self.assertTrue(all(not item.exists() for item in inputs))

    def setUp(self):
        work = tempfile.TemporaryDirectory()
        self.addCleanup(work.cleanup)
        self.site = Path(work.name) / "_site"
        (self.site / "large").mkdir(parents=True)
        (self.site / "small").mkdir()
        (self.site / "large" / "asset.bin").write_bytes(b"a" * 20)
        (self.site / "small" / "page.html").write_bytes(b"b" * 5)

    def test_removes_editorial_source_duplicates_but_keeps_canonical_pdf(self):
        materials = self.site / "professional-english" / "materials"
        materials.mkdir(parents=True)
        canonical = materials / "lesson-4.pdf"
        source = materials / "lesson-4-source-1.pdf"
        canonical.write_bytes(b"canonical")
        source.write_bytes(b"duplicate")

        result = self.run_inventory("--budget", "100")

        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertTrue(canonical.exists())
        self.assertFalse(source.exists())

    def run_inventory(self, *args):
        return subprocess.run(
            ["python3", str(SCRIPT), str(self.site), *args], text=True,
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        )

    def test_reports_largest_directories_and_files(self):
        result = self.run_inventory("--budget", "100")
        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertIn("| large | 20 |", result.stdout)
        self.assertIn("| large/asset.bin | 20 |", result.stdout)

    def test_enforced_budget_stops_before_upload(self):
        result = self.run_inventory("--budget", "10", "--enforce")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("exceed the size budget", result.stdout)


if __name__ == "__main__":
    unittest.main()
