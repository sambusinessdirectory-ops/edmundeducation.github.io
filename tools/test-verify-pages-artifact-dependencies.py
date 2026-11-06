import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


MODULE_PATH = Path(__file__).with_name("verify-pages-artifact-dependencies.py")
SPEC = importlib.util.spec_from_file_location("verify_pages_artifact_dependencies", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class VerifyPagesArtifactDependenciesTests(unittest.TestCase):
    def fixture(self):
        temporary = tempfile.TemporaryDirectory()
        root = Path(temporary.name)
        site = root / "site"
        source = root / "source"
        site.mkdir()
        source.mkdir()
        system_map = {"families": {"[one]": ["system.html"]}}
        (site / "index.html").write_text("<html>" + "x" * 120 + "</html>")
        (site / "system.html").write_text(
            '<html><link rel="stylesheet" href="system/style.css">'
            '<script src="system/app.mjs"></script>' + "x" * 120 + "</html>"
        )
        (site / "system").mkdir()
        (site / "system" / "style.css").write_text("body{}")
        (site / "system" / "app.mjs").write_text("export{}")
        (site / "flashcards-core-data.js").write_text("window.D={}")
        return temporary, site, source, system_map

    def verify(self, site, source, system_map):
        listing = "flashcards-core-data.js\nedmund-coins/eddy-v3.webp\n"
        with patch.object(subprocess, "check_output", return_value=listing):
            return MODULE.verify(site, source, system_map)

    def test_complete_artifact_passes(self):
        temporary, site, source, system_map = self.fixture()
        self.addCleanup(temporary.cleanup)
        (site / "edmund-coins").mkdir()
        (site / "edmund-coins" / "eddy-v3.webp").write_bytes(b"coin")
        result = self.verify(site, source, system_map)
        self.assertEqual(result["routes"], 2)

    def test_missing_direct_script_fails(self):
        temporary, site, source, system_map = self.fixture()
        self.addCleanup(temporary.cleanup)
        (site / "system" / "app.mjs").unlink()
        with self.assertRaisesRegex(ValueError, "system/app.mjs"):
            self.verify(site, source, system_map)

    def test_missing_inventory_file_fails(self):
        temporary, site, source, system_map = self.fixture()
        self.addCleanup(temporary.cleanup)
        with self.assertRaisesRegex(ValueError, "edmund-coins/eddy-v3.webp"):
            self.verify(site, source, system_map)


if __name__ == "__main__":
    unittest.main()
