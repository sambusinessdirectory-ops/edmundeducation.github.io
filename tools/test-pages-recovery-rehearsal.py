#!/usr/bin/env python3
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = (ROOT / ".github/workflows/pages-recovery-rehearsal.yml").read_text()


class RecoveryRehearsalTests(unittest.TestCase):
    def test_validated_artifact_is_created_once_and_reused_by_every_later_stage(self):
        self.assertEqual(WORKFLOW.count("actions/upload-artifact@"), 1)
        self.assertEqual(WORKFLOW.count("actions/download-artifact@"), 3)
        self.assertIn("validated-pages-${{ github.run_id }}", WORKFLOW)
        self.assertGreaterEqual(WORKFLOW.count("sha256sum -c validated/SHA256SUMS"), 3)

    def test_each_recoverable_stage_can_fail_only_on_first_attempt(self):
        for stage in ("publish", "verify", "snapshot"):
            self.assertIn(f"inputs.failure_stage == '{stage}' && github.run_attempt == 1", WORKFLOW)

    def test_rehearsal_cannot_write_or_deploy_production(self):
        self.assertNotIn("pages: write", WORKFLOW)
        self.assertNotIn("contents: write", WORKFLOW)
        self.assertNotIn("actions/deploy-pages", WORKFLOW)


if __name__ == "__main__":
    unittest.main()
