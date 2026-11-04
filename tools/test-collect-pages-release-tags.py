import unittest

from importlib.machinery import SourceFileLoader
from pathlib import Path


module = SourceFileLoader(
    "collect_pages_release_tags",
    str(Path(__file__).with_name("collect-pages-release-tags.py")),
).load_module()


class CollectPagesReleaseTagsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.policy = module.load_policy()

    def test_combines_scopes_from_changed_paths_without_commit_history(self):
        tags, uncovered = module.collect_path_scopes(
            ["dse-practical-writing.mjs", "paper3/2023-b2/curation/lesson.js"],
            self.policy,
        )
        self.assertEqual(uncovered, [])
        self.assertEqual(
            tags,
            "[fast-deploy] [paper3-release] [practical-writing-release]",
        )

    def test_exact_release_that_misrouted_is_now_focused(self):
        paths = """\
dse-practical-writing.html
dse-practical-writing.mjs
error-identifier-indefinite.js
error-identifier-jayden.js
error-identifier-system.html
homework-resource-catalog.mjs
schedule-homework-export.mjs
schedule-homework-hotkeys-admin.html
schedule-homework-hotkeys-admin.js
schedule-homework-links.mjs
schedule-system.html
schedule-system.js
supabase/migrations/20261104093633_mirror_error_identifier_module_feedback.sql
supabase/migrations/20261104094733_index_indefinite_pronouns_progress_number.sql
tools/generate-homework-resource-catalog.mjs
tools/test-dse-practical-writing.mjs
tools/test-error-identifier-indefinite-feedback.mjs
tools/test-error-identifier-jayden.mjs
tools/test-homework-course-links.mjs
tools/test-indefinite-pronouns-import.mjs
tools/test-schedule-homework-links.mjs
tools/test-schedule-system.mjs
""".splitlines()
        tags, uncovered = module.collect_path_scopes(paths, self.policy)
        self.assertEqual(uncovered, [])
        self.assertEqual(
            tags,
            "[error-id-release] [fast-deploy] [homework-release] [practical-writing-release]",
        )

    def test_unknown_path_forces_full_validation(self):
        tags, uncovered = module.collect_path_scopes(
            ["dse-practical-writing.mjs", "new-system/security-policy.mjs"],
            self.policy,
        )
        self.assertNotIn("[fast-deploy]", tags)
        self.assertIn("[practical-writing-release]", tags)
        self.assertEqual(uncovered, ["new-system/security-policy.mjs"])

    def test_listening_question_types_do_not_pull_broad_ielts_curation(self):
        tags, uncovered = module.collect_path_scopes(
            ["listening-system.js", "tools/test-dse-listening-question-types.mjs"],
            self.policy,
        )
        self.assertEqual(uncovered, [])
        self.assertIn("[listening-types-release]", tags)
        self.assertNotIn("[listening-release]", tags)

    def test_shared_change_mixed_with_page_uses_full_build(self):
        for shared in ("service-worker.js", "shared-companion.mjs", ".github/workflows/pages-new.yml"):
            tags, _ = module.collect_path_scopes(["literary-device.html", shared], self.policy)
            self.assertIn("[literary-release]", tags)
            self.assertNotIn("[fast-deploy]", tags)

    def test_tested_build_infrastructure_keeps_the_focused_route(self):
        paths = [
            ".github/workflows/pages.yml",
            "tools/prepare-pages-incremental.py",
            "tools/rewrite-pages-assets.py",
        ]
        tags, uncovered = module.collect_path_scopes(paths, self.policy)
        self.assertEqual(uncovered, [])
        self.assertEqual(tags, "[fast-deploy] [full-artifact] [infrastructure-release]")

    def test_verified_audio_pin_repairs_use_the_test_only_gate(self):
        paths = [
            "tools/test-government-civics-book1-flashcards.mjs",
            "tools/test-hkfsd-incident-report-flashcards.mjs",
            "tools/test-ielts-writing-task1-audio.mjs",
        ]
        tags, uncovered = module.collect_path_scopes(paths, self.policy)
        self.assertEqual(uncovered, [])
        self.assertEqual(tags, "[fast-deploy] [release-gate-repair]")

    def test_homework_assets_and_worker_changes_keep_the_focused_route(self):
        paths = [
            "assets/model-essays/essay-cover.webp",
            "assets/schedule/weekdays/monday-walking-to-school.webp",
            "homework-eddy/poster.png",
            "workers/schedule-system/src/index.js",
        ]
        tags, uncovered = module.collect_path_scopes(paths, self.policy)
        self.assertEqual(uncovered, [])
        self.assertEqual(tags, "[fast-deploy] [homework-release]")

    def test_known_workflow_uses_focused_infrastructure_checks(self):
        tags, uncovered = module.collect_path_scopes([".github/workflows/pages.yml", "literary-device.html"], self.policy)
        self.assertFalse(uncovered)
        self.assertEqual(set(tags.split()), {"[fast-deploy]", "[infrastructure-release]", "[literary-release]"})

    def test_real_audio_manifest_change_keeps_the_full_artifact_gate(self):
        tags, uncovered = module.collect_path_scopes(["flashcards-audio-manifest.js"], self.policy)
        self.assertFalse(uncovered)
        self.assertEqual(
            set(tags.split()),
            {"[audio-contract-release]", "[fast-deploy]", "[flashcard-release]", "[full-artifact]"},
        )

    def test_empty_path_set_is_not_fast(self):
        self.assertEqual(module.collect_path_scopes([], self.policy), ("", []))

    def test_too_many_paths_are_not_fast(self):
        paths = [f"dse-practical-writing-{index}.mjs" for index in range(501)]
        tags, uncovered = module.collect_path_scopes(paths, self.policy)
        self.assertEqual(tags, "")
        self.assertEqual(len(uncovered), 501)

    def test_unsafe_path_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "Unsafe changed path"):
            module.collect_path_scopes(["../outside.html"], self.policy)


if __name__ == "__main__":
    unittest.main()
