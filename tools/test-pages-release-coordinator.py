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

    def test_started_builds_are_not_cancelled_by_later_pushes(self):
        build_jobs = COORDINATOR.split("\n  standard:", 1)[1].split("\n  publish:", 1)[0]
        self.assertNotIn("concurrency:", build_jobs)
        self.assertNotIn("cancel-in-progress", build_jobs)

    def test_fast_releases_skip_slow_runner_disk_reclamation(self):
        standard = BUILDERS[0]
        marker = "- name: Reclaim runner disk for the website repository"
        step = standard.split(marker, 1)[1].split("\n      - name:", 1)[0]
        self.assertIn("!contains(inputs.release_tags, '[fast-deploy]')", step)

    def test_production_deployment_is_not_cancellable(self):
        self.assertIn("group: pages", PUBLISHER)
        self.assertIn("cancel-in-progress: false", PUBLISHER)
        self.assertNotIn("group: pages-candidate-main", PUBLISHER)

    def test_publisher_allows_only_forward_main_lineage_releases(self):
        self.assertIn("ref: 'pages-snapshot'", PUBLISHER)
        self.assertIn("`${deployedSha}...${context.sha}`", PUBLISHER)
        self.assertIn("`${context.sha}...${mainSha}`", PUBLISHER)
        self.assertIn("forward.status !== 'ahead'", PUBLISHER)
        self.assertIn("lineage.status !== 'ahead'", PUBLISHER)

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
        self.assertIn('git diff --name-only "${base_sha}" "${GITHUB_SHA}"', COORDINATOR)

    def test_standard_builder_uses_all_undeployed_release_tags(self):
        standard = BUILDERS[0]
        self.assertIn("release_tags: ${{ needs.route.outputs.release_tags }}", COORDINATOR)
        self.assertIn("tools/collect-pages-release-tags.py", COORDINATOR)
        self.assertIn("--paths-file /tmp/pages-release-paths.txt", COORDINATOR)
        self.assertIn("inputs.release_tags", standard)
        self.assertNotIn("github.event.head_commit.message", standard)
        self.assertIn("Validate focused Pages infrastructure release", standard)
        self.assertIn("[infrastructure-release]", standard)


if __name__ == "__main__":
    unittest.main()
