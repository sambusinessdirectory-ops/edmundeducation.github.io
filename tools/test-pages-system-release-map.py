import json
import re
import unittest
import xml.etree.ElementTree as ET
from urllib.parse import urlsplit

from importlib.machinery import SourceFileLoader
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MAP_PATH = ROOT / "tools" / "pages-system-release-map.json"
SCOPE_PATH = ROOT / "tools" / "pages-release-scopes.json"

collector = SourceFileLoader(
    "collect_pages_release_tags_for_system_map",
    str(ROOT / "tools" / "collect-pages-release-tags.py"),
).load_module()


def homepage_system_routes() -> set[str]:
    source = (ROOT / "index.html").read_text(encoding="utf-8")
    marker = source.index("data-system-card-start")
    start = source.rfind("<a", 0, marker)
    end = source.index("\n      </div>\n    </section>", marker)
    card_source = source[start:end]
    return set(re.findall(r'<a\b[^>]*\bhref="([^"]+)"', card_source))


def shared_navigation_routes() -> set[str]:
    source = (ROOT / "shared-system-nav.js").read_text(encoding="utf-8")
    systems = source.split("const SYSTEMS = Object.freeze([", 1)[1].split("\n  ]);", 1)[0]
    return set(re.findall(r'\bhref:\s*"([^"]+)"', systems))


class PagesSystemReleaseMapTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        payload = json.loads(MAP_PATH.read_text(encoding="utf-8"))
        if payload.get("version") != 1:
            raise AssertionError("Unsupported Pages system release map version")
        cls.families = payload["families"]
        cls.policy = collector.load_policy(SCOPE_PATH)
        cls.route_owners: dict[str, str] = {}
        for scope, routes in cls.families.items():
            if scope not in cls.policy:
                raise AssertionError(f"Unknown release scope in system map: {scope}")
            for route in routes:
                if route in cls.route_owners:
                    raise AssertionError(
                        f"System route has multiple release owners: {route}"
                    )
                cls.route_owners[route] = scope

    def test_map_is_the_union_of_homepage_and_shared_navigation_systems(self):
        exposed = homepage_system_routes() | shared_navigation_routes()
        self.assertSetEqual(set(self.route_owners), exposed)

    def test_sitemap_has_unique_canonical_destinations(self):
        sitemap = ET.parse(ROOT / "sitemap.xml")
        urls = [item.text for item in sitemap.findall("{*}url/{*}loc")]
        self.assertIn("https://edmundeducation.com/", urls)
        self.assertEqual(len(set(urls)), len(urls))
        for url in urls:
            with self.subTest(url=url):
                parsed = urlsplit(url)
                self.assertEqual((parsed.scheme, parsed.netloc), ("https", "edmundeducation.com"))
                self.assertFalse(parsed.fragment or parsed.query)
                self.assertNotIn("..", Path(parsed.path).parts)

    def test_homepage_card_positions(self):
        source = (ROOT / "index.html").read_text(encoding="utf-8")
        cards = re.findall(r'<a\b(?=[^>]*\bclass="[^"]*\bcategory\b)[^>]*>[\s\S]*?</a>', source)
        expected = {59: "eddie-farm.html", 61: "background-music.html",
                    64: "excellent-learning-system.html", 65: "polysemy-lab.html",
                    66: "natural-english.html", 82: "news-reader.html",
                    83: "daily-reading.html"}
        for position, href in expected.items():
            with self.subTest(position=position):
                self.assertIn(f'href="{href}"', cards[position - 1])
        self.assertIn("日常聆聽系統", cards[81])
        self.assertIn("日常閱讀理解系統", cards[82])
        self.assertIn(f"data-system-card-deck-position>01 / {len(cards)}</strong>", source)
        self.assertRegex(source, rf'data-system-card-deck-last[^>]*>{len(cards)}</button>')

    def test_every_route_exists_in_the_repository(self):
        for route in self.route_owners:
            with self.subTest(route=route):
                target = ROOT / route
                self.assertTrue(target.exists(), f"Missing mapped route: {route}")
                if target.is_dir():
                    self.assertTrue((target / "index.html").is_file())
                else:
                    self.assertEqual(target.suffix, ".html")

    def test_every_route_selects_its_focused_release_gate(self):
        for route, owner in self.route_owners.items():
            with self.subTest(route=route, owner=owner):
                tags, uncovered = collector.collect_path_scopes([route], self.policy)
                self.assertEqual(uncovered, [])
                self.assertIn("[fast-deploy]", tags.split())
                self.assertIn(owner, tags.split())

    def test_the_matrix_covers_every_current_learning_or_service_route(self):
        homepage = homepage_system_routes()
        navigation = shared_navigation_routes()
        self.assertGreaterEqual(len(homepage), 73)
        self.assertGreaterEqual(len(navigation), 69)
        self.assertGreaterEqual(len(self.route_owners), 75)


if __name__ == "__main__":
    unittest.main()
