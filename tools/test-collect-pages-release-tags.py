import unittest

from importlib.machinery import SourceFileLoader
from pathlib import Path


module = SourceFileLoader(
    "collect_pages_release_tags",
    str(Path(__file__).with_name("collect-pages-release-tags.py")),
).load_module()


class CollectPagesReleaseTagsTests(unittest.TestCase):
    def test_combines_focused_tags_from_multiple_changes(self):
        self.assertEqual(
            module.collect(
                [
                    "[fast-deploy] [writing-release] Update writing",
                    "[fast-deploy] [paper3-release] Update reader",
                ]
            ),
            "[fast-deploy] [paper3-release] [writing-release]",
        )

    def test_untagged_change_disables_fast_validation_bypass(self):
        tags = module.collect(
            [
                "[fast-deploy] [writing-release] Update writing",
                "Update shared security policy",
            ]
        )
        self.assertNotIn("[fast-deploy]", tags)
        self.assertIn("[writing-release]", tags)

    def test_empty_history_is_not_fast(self):
        self.assertEqual(module.collect([]), "")


if __name__ == "__main__":
    unittest.main()
