import unittest

from importlib.machinery import SourceFileLoader
from pathlib import Path


module = SourceFileLoader(
    "classify_pages_release",
    str(Path(__file__).with_name("classify-pages-release.py")),
).load_module()


class ClassifyPagesReleaseTests(unittest.TestCase):
    def test_empty_release_does_not_build(self):
        self.assertEqual(module.classify([]), "none")

    def test_homepage_artwork_uses_site_builder(self):
        self.assertEqual(
            module.classify(["index.html", "homepage-selector-frame.webp"]),
            "site",
        )

    def test_paper3_sources_and_builder_use_paper3_builder(self):
        self.assertEqual(
            module.classify(
                [
                    ".github/workflows/pages-paper3-fast.yml",
                    "paper3/2023-b2/curation/index.html",
                    "tools/paper3/layouts/2023-b2-page-03.html",
                    "tools/build-2023-b2-reader.py",
                    "tools/check-2023-b2-v7.cjs",
                    "tools/classify-pages-release.py",
                    "tools/manuals/build-paper3-super-curation-golden-manual-v7.py",
                    "tools/test-classify-pages-release.py",
                ]
            ),
            "paper3",
        )

    def test_multiple_systems_use_combined_standard_builder(self):
        self.assertEqual(
            module.classify(
                ["paper3/2023-b2/curation/index.html", "dse-practical-writing.html"]
            ),
            "standard",
        )

    def test_non_paper3_workflow_and_publication_changes_use_standard_builder(self):
        for path in (
            ".github/workflows/pages.yml",
            "tools/rewrite-pages-assets.py",
            "workers/edmund-site-assets/src/site-pack-index-v1.json",
        ):
            with self.subTest(path=path):
                self.assertEqual(module.classify([path]), "standard")

    def test_unsafe_path_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "Unsafe changed path"):
            module.classify(["../outside.html"])


if __name__ == "__main__":
    unittest.main()
