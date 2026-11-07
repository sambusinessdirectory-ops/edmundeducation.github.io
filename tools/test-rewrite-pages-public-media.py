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
    AUDIO_ORIGIN = (
        "https://ookkxzgpdclzrrhfmvqx.supabase.co/functions/v1/public-audio-relay/public"
    )
    NEURAL_AUDIO_ORIGIN = (
        "https://ookkxzgpdclzrrhfmvqx.supabase.co/functions/v1/public-audio-relay"
    )
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

    def test_audio_uses_immutable_origin_while_other_media_uses_worker(self):
        page = self.site / "lesson" / "index.html"
        page.write_text("""<meta http-equiv="Content-Security-Policy" content="default-src 'self'; media-src 'self'">
<audio src="../song-media/song/album.mp3"></audio>
<a href="/manuals/saved%20guide.pdf?download=1">PDF</a>
<a href="https://edmundeducation.com/song-media/song/album.mp3#t=2">Song</a>
<a href="/manuals/not-indexed.pdf">Local</a>""")
        result = rewrite.rewrite(
            self.site, self.index, rewrite.DEFAULT_ORIGIN, audio_origin=self.AUDIO_ORIGIN
        )
        output = page.read_text()
        self.assertEqual(result["references"], 3)
        self.assertEqual(result["audio_references"], 2)
        self.assertIn(self.AUDIO_ORIGIN + "/song-media/song/album.mp3", output)
        self.assertIn(rewrite.DEFAULT_ORIGIN + "/manuals/saved%20guide.pdf?download=1", output)
        self.assertIn('/manuals/not-indexed.pdf', output)
        self.assertIn("media-src 'self' " + rewrite.DEFAULT_ORIGIN, output)
        self.assertIn("https://ookkxzgpdclzrrhfmvqx.supabase.co", output)

    def test_manifest_only_audio_rewrite_extends_page_csp(self):
        manifest = self.site / "lesson" / "manifest.mjs"
        manifest.write_text("export default '../song-media/song/album.mp3';")
        page = self.site / "index.html"
        page.write_text(
            '<meta http-equiv="Content-Security-Policy" '
            'content="default-src \'self\'; script-src \'self\'">'
        )
        result = rewrite.rewrite(
            self.site, self.index, rewrite.DEFAULT_ORIGIN, audio_origin=self.AUDIO_ORIGIN
        )
        self.assertEqual(result["audio_references"], 1)
        self.assertIn(self.AUDIO_ORIGIN + "/song-media/song/album.mp3", manifest.read_text())
        output = page.read_text()
        self.assertIn("connect-src 'self' https://ookkxzgpdclzrrhfmvqx.supabase.co", output)
        self.assertIn("media-src 'self' https://ookkxzgpdclzrrhfmvqx.supabase.co", output)

    def test_neural_audio_worker_is_replaced_across_every_artifact_file(self):
        manifest = self.site / "lesson" / "manifest.json"
        manifest.write_text(json.dumps({
            "short": (
                "https://edmund-neural-audio.edmundeducation.workers.dev/"
                "assets/polysemy-lab/audio/example.mp3"
            ),
            "long": (
                "https://edmund-neural-audio.edmundeducation.workers.dev/"
                "assets/dse-listening/audio/example.mp3"
            ),
        }))
        page = self.site / "index.html"
        page.write_text(
            '<meta http-equiv="Content-Security-Policy" '
            'content="default-src \'self\'; script-src \'self\'">'
        )
        result = rewrite.rewrite(
            self.site,
            self.index,
            rewrite.DEFAULT_ORIGIN,
            neural_audio_origin=self.NEURAL_AUDIO_ORIGIN,
        )
        self.assertEqual(result["neural_audio_references"], 2)
        self.assertEqual(result["remaining_neural_worker_references"], 0)
        self.assertNotIn(rewrite.DEFAULT_NEURAL_AUDIO_ORIGIN, manifest.read_text())
        self.assertEqual(manifest.read_text().count(self.NEURAL_AUDIO_ORIGIN), 2)
        output = page.read_text()
        self.assertIn(
            "connect-src 'self' https://ookkxzgpdclzrrhfmvqx.supabase.co", output
        )
        self.assertIn(
            "media-src 'self' https://ookkxzgpdclzrrhfmvqx.supabase.co", output
        )

    def test_neural_audio_rewrite_replaces_worker_in_existing_csp(self):
        page = self.site / "index.html"
        page.write_text(
            '<meta http-equiv="Content-Security-Policy" '
            'content="media-src \'self\' '
            'https://edmund-neural-audio.edmundeducation.workers.dev">'
            '<audio src="https://edmund-neural-audio.edmundeducation.workers.dev/'
            'assets/listening/example.mp3"></audio>'
        )
        rewrite.rewrite(
            self.site,
            self.index,
            rewrite.DEFAULT_ORIGIN,
            neural_audio_origin=self.NEURAL_AUDIO_ORIGIN,
        )
        output = page.read_text()
        self.assertNotIn(rewrite.DEFAULT_NEURAL_AUDIO_ORIGIN, output)
        self.assertIn(self.NEURAL_AUDIO_ORIGIN, output)

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
