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

    def test_traces_both_tagged_parents_of_untagged_merge_resolution(self):
        blobs = {
            ("base", "page.html"): "old",
            ("infra", "page.html"): "infra",
            ("writing", "page.html"): "writing",
            ("merge", "page.html"): "combined",
        }
        commits = {
            "base": ([], "old release"),
            "infra": (["base"], "[fast-deploy] [infrastructure-release] infra"),
            "writing": (["base"], "[fast-deploy] [writing-release] writing"),
            "merge": (["infra", "writing"], "automatic merge"),
        }
        tags = module.collect_changed_path_tags(
            "base",
            "merge",
            ["page.html"],
            lambda commit, path: blobs.get((commit, path)),
            lambda commit: commits[commit],
        )
        self.assertEqual(
            tags,
            "[fast-deploy] [infrastructure-release] [writing-release]",
        )

    def test_untagged_non_merge_file_origin_disables_fast_validation(self):
        blobs = {
            ("base", "page.html"): "old",
            ("target", "page.html"): "new",
        }
        commits = {
            "base": ([], "old release"),
            "target": (["base"], "untagged content change"),
        }
        self.assertEqual(
            module.collect_changed_path_tags(
                "base",
                "target",
                ["page.html"],
                lambda commit, path: blobs.get((commit, path)),
                lambda commit: commits[commit],
            ),
            "",
        )


if __name__ == "__main__":
    unittest.main()
