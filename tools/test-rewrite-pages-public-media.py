#!/usr/bin/env python3
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest


spec = importlib.util.spec_from_file_location(
    "rewrite_public_media", Path(__file__).with_name("rewrite-pages-public-media.py")
)
rewrite = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rewrite)


class RewritePublicMediaTests(unittest.TestCase):
    def setUp(self):
        work = tempfile.TemporaryDirectory()
        self.addCleanup(work.cleanup)
        self.root = Path(work.name)
        self.site = self.root / "_site"
        (self.site / "lesson").mkdir(parents=True)
        self.index = self.root / "media.json"
        self.index.write_text(json.dumps({"entries": {
            "song-media/song/album.mp3": [0, 0, 6, "audio/mpeg", "oid"],
            "manuals/saved guide.pdf": [0, 6, 4, "application/pdf", "oid2"],
            "Static Images/sound-button.png": [0, 10, 4, "image/png", "oid3"],
            "sentence-celeste/celeste-sentence-lab.gif": [0, 14, 4, "image/gif", "oid4"],
        }}))

    def test_relative_root_absolute_and_encoded_references_use_worker(self):
        page = self.site / "lesson" / "index.html"
        page.write_text("""<meta http-equiv="Content-Security-Policy" content="default-src 'self'; media-src 'self'">
<audio src="../song-media/song/album.mp3"></audio>
<a href="/manuals/saved%20guide.pdf?download=1">PDF</a>
<a href="https://edmundeducation.com/song-media/song/album.mp3#t=2">Song</a>
<a href="/manuals/not-indexed.pdf">Local</a>""")
        result = rewrite.rewrite(self.site, self.index, rewrite.DEFAULT_ORIGIN)
        output = page.read_text()
        self.assertEqual(result["references"], 3)
        self.assertIn(rewrite.DEFAULT_ORIGIN + "/song-media/song/album.mp3", output)
        self.assertIn(rewrite.DEFAULT_ORIGIN + "/manuals/saved%20guide.pdf?download=1", output)
        self.assertIn('/manuals/not-indexed.pdf', output)
        self.assertIn("media-src 'self' " + rewrite.DEFAULT_ORIGIN, output)

    def test_unquoted_css_url_is_rewritten(self):
        css = self.site / "style.css"
        css.write_text("audio { src: url(song-media/song/album.mp3); }")
        result = rewrite.rewrite(self.site, self.index, rewrite.DEFAULT_ORIGIN)
        self.assertEqual(result["references"], 1)
        self.assertIn(rewrite.DEFAULT_ORIGIN, css.read_text())

    def test_literal_space_in_quoted_media_path_is_encoded_and_rewritten(self):
        page = self.site / "flashcards.html"
        page.write_text('<img src="Static Images/sound-button.png">')
        result = rewrite.rewrite(self.site, self.index, rewrite.DEFAULT_ORIGIN)
        self.assertEqual(result["references"], 1)
        self.assertIn(
            rewrite.DEFAULT_ORIGIN + "/Static%20Images/sound-button.png",
            page.read_text(),
        )

    def test_keep_list_paths_remain_same_origin(self):
        page = self.site / "sentence-structure.html"
        page.write_text(
            '<img src="sentence-celeste/celeste-sentence-lab.gif?v=20261022-3">'
        )
        result = rewrite.rewrite(
            self.site,
            self.index,
            rewrite.DEFAULT_ORIGIN,
            keep={"sentence-celeste/celeste-sentence-lab.gif"},
        )
        self.assertEqual(result["references"], 0)
        self.assertEqual(
            page.read_text(),
            '<img src="sentence-celeste/celeste-sentence-lab.gif?v=20261022-3">',
        )


if __name__ == "__main__":
    unittest.main()
