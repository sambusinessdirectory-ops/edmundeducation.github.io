import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WORKFLOWS = ROOT / ".github" / "workflows"
COORDINATOR = (WORKFLOWS / "pages-release-coordinator.yml").read_text(encoding="utf-8")
PUBLISHER = (WORKFLOWS / "publish-pages-artifact.yml").read_text(encoding="utf-8")
BUILDERS = [
    (WORKFLOWS / name).read_text(encoding="utf-8")
    for name in ("pages.yml", "pages-paper3-fast.yml", "pages-fast.yml")
]
SCOPE_POLICY = json.loads(
    (ROOT / "tools" / "pages-release-scopes.json").read_text(encoding="utf-8")
)


class PagesReleaseCoordinatorTests(unittest.TestCase):
    def test_coordinator_is_the_only_push_trigger(self):
        self.assertRegex(COORDINATOR, r"(?m)^  push:$")
        for workflow in BUILDERS:
            self.assertRegex(workflow, r"(?m)^  workflow_call:$")
            self.assertNotRegex(workflow, r"(?m)^  push:$")

    def test_only_publisher_can_deploy_pages(self):
        all_workflows = [
            path.read_text(encoding="utf-8")
            for path in WORKFLOWS.glob("*.yml")
        ]
        self.assertEqual(
            sum(text.count("actions/deploy-pages@") for text in all_workflows),
            1,
        )
        self.assertIn("actions/deploy-pages@v5", PUBLISHER)

    def test_builders_cannot_request_deployment_permissions(self):
        for workflow in BUILDERS:
            top_level_permissions = workflow.split("\njobs:\n", 1)[0]
            self.assertNotIn("contents: write", top_level_permissions)
            self.assertNotIn("pages: write", top_level_permissions)
            self.assertNotIn("id-token: write", top_level_permissions)

    def test_nearby_pushes_are_batched_before_building(self):
        self.assertEqual(COORDINATOR.count("group: pages-candidate-main"), 1)
        self.assertEqual(COORDINATOR.count("cancel-in-progress: true"), 1)
        self.assertIn("Batch nearby pushes before expensive work", COORDINATOR)
        self.assertIn("sleep 15", COORDINATOR)

    def test_only_builders_share_the_cancellable_build_slot(self):
        for workflow in BUILDERS:
            job = workflow.split("  build:\n", 1)[1]
            self.assertIn("github.run_attempt == 1 && 'pages-build-main' || format('pages-build-retry-{0}', github.run_id)", job)
            self.assertIn("      cancel-in-progress: true", job)
        self.assertNotIn("pages-build-main", PUBLISHER)
        self.assertNotIn("cancel-in-progress: true", PUBLISHER)

    def test_focused_writing_runs_the_completed_question_regression(self):
        step = BUILDERS[0].split("- name: Validate focused Writing release", 1)[1].split("\n      - name:", 1)[0]
        self.assertIn("completed writing questions are matched by canonical resource or exact normalized prompt", step)

    def test_fast_releases_skip_slow_runner_disk_reclamation(self):
        standard = BUILDERS[0]
        marker = "- name: Reclaim runner disk for the website repository"
        step = standard.split(marker, 1)[1].split("\n      - name:", 1)[0]
        self.assertIn("!contains(inputs.release_tags, '[fast-deploy]')", step)

    def test_fast_releases_use_blobless_sparse_checkout(self):
        standard = BUILDERS[0]
        marker = "- name: Fetch focused release files without R2-backed source trees"
        step = standard.split(marker, 1)[1].split("\n      - name:", 1)[0]
        self.assertIn("--filter=blob:none", step)
        self.assertIn("!/*/", step)
        self.assertIn("git diff --name-only", step)
        self.assertIn("/assets/dse-practical-writing/", step)
        self.assertIn("/country-name-spelling-audio/", step)
        self.assertIn("/course-materials/error-identifier/", step)
        self.assertIn("/grammar-eddy-dialogues/", step)
        self.assertIn("/supabase/migrations/20260827103531_eddie_farm_points.sql", step)

    def test_every_build_validates_the_canonical_system_release_map(self):
        standard = BUILDERS[0]
        self.assertIn("Validate complete learning-system release coverage", standard)
        self.assertIn("tools/test-pages-system-release-map.py", standard)
        self.assertIn("/professional-english/index.html", standard)
        self.assertIn("/professional-english/recall.html", standard)

    def test_worker_backed_system_scopes_fetch_only_their_dependencies(self):
        standard = BUILDERS[0]
        for path in (
            "/common-expression-system-imported-data.js",
            "/irregular-verbs/",
            "/natural-english/",
            "/junior-quiz-review/",
            "/news-discussion/",
            "/dse-argument-bank/",
            "/ielts-chart-teaching/",
            "/workers/model-essay-downloads/",
            "/workers/student-progress/",
            "/workers/membership/",
            "/workers/video-class/",
            "/news-reader/",
            "/speech-curation-assets/churchill-sentence-timing-v2.json",
        ):
            with self.subTest(path=path):
                self.assertIn(path, standard)

    def test_writing_preview_fetches_complete_cross_system_validation_inputs(self):
        steps = BUILDERS[0].split("- name: ")
        for name in ("Reclaim runner disk", "Checkout complete repository"):
            step = next(s for s in steps if s.startswith(name))
            self.assertIn("|| contains(inputs.release_tags, '[writing-preview-release]')", step)
        focused = next(s for s in steps if s.startswith("Fetch focused release files"))
        self.assertIn("&& !contains(inputs.release_tags, '[writing-preview-release]')", focused)

    def test_practical_writing_scope_alone_checks_out_public_art_and_provenance(self):
        step = BUILDERS[0].split("*'[practical-writing-release]'*)", 1)[1].split(";;", 1)[0]
        self.assertIn("/dse-practical-writing-art/", step)
        self.assertIn("/assets/dse-practical-writing/", step)

    def test_full_validation_keeps_complete_checkout(self):
        standard = BUILDERS[0]
        marker = "- name: Checkout complete repository"
        step = standard.split(marker, 1)[1].split("\n      - name:", 1)[0]
        self.assertIn("!contains(inputs.release_tags, '[fast-deploy]')", step)
        self.assertIn("actions/checkout@v6", step)

    def test_test_only_gate_repairs_do_not_run_unrelated_product_suites(self):
        standard = BUILDERS[0]
        marker = "- name: Validate focused release-gate repair"
        step = standard.split(marker, 1)[1].split("\n      - name:", 1)[0]
        self.assertIn("tools/test-eddie-farm.mjs", step)
        self.assertIn("tools/test-ielts-reading-passage2-flashcards.mjs", step)
        self.assertNotIn("tools/test-character-coins.mjs", step)

    def test_standard_paper3_gate_runs_real_chromium_and_firefox_journey(self):
        standard = BUILDERS[0]
        marker = "- name: Validate focused Paper 3 curation release"
        step = standard.split(marker, 1)[1].split("\n      - name:", 1)[0]
        self.assertIn("/paper3/2023-b2/curation/", standard)
        self.assertIn("bash tools/install-pages-browsers.sh", step)
        self.assertIn("tools/check-2023-b2-v7.cjs", step)
        self.assertIn("127.0.0.1", step)

    def test_fast_releases_do_not_run_unrelated_song_quality_gate(self):
        standard = BUILDERS[0]
        marker = "- name: Check song exercise quality"
        step = standard.split(marker, 1)[1].split("\n      - name:", 1)[0]
        self.assertIn("!contains(inputs.release_tags, '[fast-deploy]')", step)
        self.assertIn("contains(inputs.release_tags, '[song-release]')", step)

    def test_focused_homework_gate_skips_only_corpus_regeneration(self):
        standard = BUILDERS[0]
        marker = "- name: Validate focused Homework export release"
        step = standard.split(marker, 1)[1].split("\n      - name:", 1)[0]
        self.assertIn("EDMUND_SKIP_HOMEWORK_CATALOG_REGENERATION=1", step)
        self.assertIn("tools/test-schedule-homework-links.mjs", step)

    def test_production_deployment_is_not_cancellable(self):
        self.assertIn("group: pages", PUBLISHER)
        self.assertIn("cancel-in-progress: false", PUBLISHER)
        self.assertIn("group: pages-snapshot", PUBLISHER)
        self.assertNotIn("group: pages-candidate-main", PUBLISHER)

    def test_live_verification_runs_inside_the_publisher(self):
        self.assertIn("verify-live:", PUBLISHER)
        self.assertIn("Verify the coordinated release is live", PUBLISHER)
        self.assertIn("needs.publish.outputs.current == 'true'", PUBLISHER)
        self.assertNotIn("verify-live:", COORDINATOR)

    def test_publisher_allows_only_forward_current_main_releases(self):
        self.assertIn("ref: 'pages-snapshot'", PUBLISHER)
        self.assertIn("`${deployedSha}...${context.sha}`", PUBLISHER)
        self.assertIn("forward.status !== 'ahead'", PUBLISHER)
        self.assertIn("mainSha !== context.sha", PUBLISHER)
        self.assertIn("Skipping superseded release", PUBLISHER)
        self.assertNotIn("Publishing forward intermediate", PUBLISHER)

    def test_one_selected_artifact_reaches_publisher(self):
        self.assertEqual(COORDINATOR.count("uses: ./.github/workflows/publish-pages-artifact.yml"), 1)
        self.assertIn(
            "needs.standard.outputs.artifact_name || needs.paper3.outputs.artifact_name || needs.site.outputs.artifact_name",
            COORDINATOR,
        )
        for workflow in BUILDERS:
            self.assertNotIn(
                "uses: ./.github/workflows/publish-pages-artifact.yml",
                workflow,
            )

    def test_router_compares_against_deployed_snapshot(self):
        self.assertIn("refs/heads/pages-snapshot", COORDINATOR)
        self.assertIn('git show "${snapshot_commit}:.source-sha"', COORDINATOR)
        self.assertIn('git diff --no-renames --name-only "${base_sha}" "${GITHUB_SHA}"', COORDINATOR)

    def test_standard_builder_uses_all_undeployed_release_tags(self):
        standard = BUILDERS[0]
        self.assertIn("base_sha: ${{ needs.route.outputs.base_sha }}", COORDINATOR)
        self.assertIn("release_tags: ${{ needs.route.outputs.release_tags }}", COORDINATOR)
        self.assertIn("tools/collect-pages-release-tags.py", COORDINATOR)
        self.assertIn("/tools/pages-release-scopes.json", COORDINATOR)
        self.assertIn("--paths-file /tmp/pages-release-paths.txt", COORDINATOR)
        self.assertNotIn('--base "${base_sha}"', COORDINATOR)
        self.assertNotIn('--target "${GITHUB_SHA}"', COORDINATOR)
        self.assertIn("inputs.release_tags", standard)
        self.assertNotIn("github.event.head_commit.message", standard)
        self.assertIn("Validate focused Pages infrastructure release", standard)
        self.assertIn("[infrastructure-release]", standard)

    def test_every_deterministic_scope_has_a_validation_gate(self):
        standard = BUILDERS[0]
        for tag in SCOPE_POLICY["scopes"]:
            with self.subTest(tag=tag):
                self.assertIn(tag, standard)


if __name__ == "__main__":
    unittest.main()
