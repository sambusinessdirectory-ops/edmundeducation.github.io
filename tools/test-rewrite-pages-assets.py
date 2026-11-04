import unittest
import tempfile

from importlib.machinery import SourceFileLoader
from pathlib import Path


module = SourceFileLoader("rewrite_pages_assets", str(Path(__file__).with_name("rewrite-pages-assets.py"))).load_module()
BASE = module.BASE
ROOT = {"assets/icons/favicon.png", "assets/music/a.mp3", "assets/scene.jpg", "assets/x.png", "assets/schedule/Background for Schedule System.jpg", "assets/sentence-structure/seaside/chapter-shell.svg", "assets/flashcards/audio/edmund-neural/v1/00/0000f48902bbf1d26ee3ce21.mp3"}
EDDY = {"eddy-carrot-patch/assets/production-v2/eddy.png"}


def rewrite(value, source=Path("index.html")):
    return module.rewrite(value, source, ROOT, EDDY)


class RewriteTests(unittest.TestCase):
    def test_local_urls(self):
        for original in ('"/assets/icons/favicon.png"', '"assets/music/a.mp3"', 'url(../assets/scene.jpg)', 'url(../../assets/scene.jpg)', 'url(./assets/scene.jpg)'):
            self.assertIn(BASE, rewrite(original))

    def test_existing_cloud_urls_preserved(self):
        original = 'https://edmund-neural-audio.edmundeducation.workers.dev/assets/flashcards/a.mp3'
        self.assertEqual(original, rewrite(original))

    def test_absolute_site_url(self):
        self.assertEqual(BASE + "x.png", rewrite("https://edmundeducation.com/assets/x.png"))

    def test_idempotent(self):
        original = '"/assets/x.png"'
        self.assertEqual(rewrite(original), rewrite(rewrite(original)))

    def test_nested_paper_assets_stay_relative(self):
        self.assertEqual('src="assets/page-01.webp"', rewrite('src="assets/page-01.webp"', Path("paper3/2013-b1/index.html")))

    def test_eddy_assets_use_eddy_pack(self):
        self.assertEqual('"' + module.EDDY_BASE + 'production-v2/eddy.png"', rewrite('"assets/production-v2/eddy.png"', Path("eddy-carrot-patch/asset-registry.js")))

    def test_packed_flashcard_audio(self):
        self.assertEqual('"' + BASE + 'flashcards/audio/edmund-neural/v1/00/0000f48902bbf1d26ee3ce21.mp3"', rewrite('"assets/flashcards/audio/edmund-neural/v1/00/0000f48902bbf1d26ee3ce21.mp3"'))

    def test_dynamic_prefix_and_encoded_space(self):
        self.assertIn(BASE + 'sentence-structure/seaside/chapter-${name}', rewrite('"assets/sentence-structure/seaside/chapter-${name}"'))
        self.assertIn(BASE + 'schedule/Background%20for%20Schedule%20System.jpg', rewrite('"assets/schedule/Background%20for%20Schedule%20System.jpg"'))

    def test_existing_neural_audio_worker(self):
        self.assertEqual('"' + module.AUDIO_BASE + 'speaking-system/audio/edmund-neural/exam/test.mp3"', rewrite('"assets/speaking-system/audio/edmund-neural/exam/test.mp3"'))

    def test_csp_origin_added_once(self):
        original = '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; img-src \'self\' data:; media-src \'self\' blob:; object-src \'none\'">'
        updated = module.allow_asset_origin_in_csp(original)
        self.assertEqual(updated.count(module.ORIGIN), 3)
        self.assertEqual(updated, module.allow_asset_origin_in_csp(updated))
        self.assertIn("object-src 'none'", updated)

    def test_paths_file_is_scoped_to_safe_relative_paths(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            paths_file = root / "paths.txt"
            paths_file.write_text("index.html\nnested/app.js\n", encoding="utf-8")
            self.assertEqual(
                module.paths_from_file(root, paths_file),
                [root / "index.html", root / "nested/app.js"],
            )

            paths_file.write_text("../outside.html\n", encoding="utf-8")
            with self.assertRaisesRegex(RuntimeError, "Unsafe Pages path"):
                module.paths_from_file(root, paths_file)


if __name__ == "__main__":
    unittest.main()
