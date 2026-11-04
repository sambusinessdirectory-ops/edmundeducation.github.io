import os
import subprocess
import tempfile
import unittest

from importlib.machinery import SourceFileLoader
from pathlib import Path


module = SourceFileLoader(
    "prepare_pages_incremental",
    str(Path(__file__).with_name("prepare-pages-incremental.py")),
).load_module()


class WorkingDirectory:
    def __init__(self, path):
        self.path = path

    def __enter__(self):
        self.previous = Path.cwd()
        os.chdir(self.path)

    def __exit__(self, *args):
        os.chdir(self.previous)


class PreparePagesIncrementalTests(unittest.TestCase):
    def setUp(self):
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary_directory.name)
        subprocess.run(["git", "init", "-q", "-b", "main"], cwd=self.root, check=True)
        subprocess.run(["git", "config", "user.name", "Pages Test"], cwd=self.root, check=True)
        subprocess.run(["git", "config", "user.email", "pages@example.test"], cwd=self.root, check=True)
        self.write("index.html", "old home")
        self.write("delete-me.html", "remove me")
        self.write("rename-me.html", "renamed")
        self.write("service-worker.js", "cache __EDMUND_RELEASE__")
        self.write("pwa-register.js", "release __EDMUND_RELEASE__")
        self.write("release.json", '{"release":"__EDMUND_RELEASE__"}')
        self.write("tools/internal.txt", "not public")
        self.commit("base")
        self.base = self.sha()

    def tearDown(self):
        self.temporary_directory.cleanup()

    def write(self, relative, content):
        path = self.root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")

    def commit(self, message):
        subprocess.run(["git", "add", "-A"], cwd=self.root, check=True)
        subprocess.run(["git", "commit", "-q", "-m", message], cwd=self.root, check=True)

    def sha(self):
        return subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=self.root, text=True).strip()

    def test_classifies_public_delta_and_applies_it_to_snapshot(self):
        self.write("index.html", "new home")
        (self.root / "delete-me.html").unlink()
        (self.root / "rename-me.html").rename(self.root / "renamed.html")
        self.write("added/app.js", "console.log('new')")
        self.write("tools/internal.txt", "still not public")
        self.commit("public changes")
        target = self.sha()

        site = self.root / "_site"
        site.mkdir()
        (site / "index.html").write_text("old home", encoding="utf-8")
        (site / "delete-me.html").write_text("remove me", encoding="utf-8")
        (site / "rename-me.html").write_text("renamed", encoding="utf-8")
        paths_file = self.root / "changed-paths.txt"

        with WorkingDirectory(self.root):
            self.assertEqual(module.classify(self.base, target), "incremental")
            module.apply_delta(self.root, site, self.base, target, paths_file)

        self.assertEqual((site / "index.html").read_text(encoding="utf-8"), "new home")
        self.assertFalse((site / "delete-me.html").exists())
        self.assertFalse((site / "rename-me.html").exists())
        self.assertEqual((site / "renamed.html").read_text(encoding="utf-8"), "renamed")
        self.assertEqual((site / "added/app.js").read_text(encoding="utf-8"), "console.log('new')")
        self.assertFalse((site / "tools").exists())
        for required in module.PWA_FILES:
            self.assertTrue((site / required).is_file())
        changed = set(paths_file.read_text(encoding="utf-8").splitlines())
        self.assertTrue({"index.html", "renamed.html", "added/app.js", *module.PWA_FILES} <= changed)

    def test_page_edit_keeps_verified_audio_and_service_worker_urls(self):
        self.write("literary-device.html", "New instructions")
        self.commit("page only")
        site = self.root / "_site"
        site.mkdir()
        worker = f'cache {self.base} https://cdn.example/audio.mp3'
        (site / "service-worker.js").write_text(worker)
        (site / "audio.json").write_bytes(b"verified audio output")
        paths = self.root / "paths.txt"
        with WorkingDirectory(self.root):
            module.apply_delta(self.root, site, self.base, self.sha(), paths)
        self.assertEqual((site / "service-worker.js").read_text(), worker.replace(self.base, "__EDMUND_RELEASE__"))
        self.assertEqual((site / "audio.json").read_bytes(), b"verified audio output")
        self.assertNotIn("service-worker.js", paths.read_text().splitlines())

    def test_sensitive_publication_rules_require_full_build(self):
        for path in (
            ".github/workflows/pages.yml",
            "paper3/2013-b1/index.html",
            "tools/rewrite-pages-assets.py",
            "ielts-reading-analysis-availability.js",
            "ielts-reading-analysis-data/locked.json",
            "workers/edmund-site-assets/src/site-pack-index-v1.json",
        ):
            with self.subTest(path=path):
                self.assertTrue(module.requires_full(path))

    def test_publication_exclusions_match_private_source_categories(self):
        for path in (
            "assets/private.mp3",
            "course-materials/lesson.pdf",
            "dse-argument-bank/source.md",
            "natural-english/imported-lessons.json",
            "news-discussion/news-1.json",
            "song-appreciation-data.js",
            "supabase/schema.sql",
            "synonyms/source/private.json",
            "workers/example/index.js",
        ):
            with self.subTest(path=path):
                self.assertFalse(module.is_publishable(path))


if __name__ == "__main__":
    unittest.main()
