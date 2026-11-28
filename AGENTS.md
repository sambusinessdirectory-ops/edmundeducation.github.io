# Repository operating rules

## Paper 3: mandatory source fidelity and proof

These rules apply to every agent, worker, conversation, and human-authored change that modifies a Paper 3 implementation, including files under `paper3/`, the root `dse-paper3-*` runtime, and Paper 3 build helpers.

Before modifying any Paper 3 implementation, the agent must read the applicable Golden Manual requirements, inspect `2025_B2_Super_Curation_Line_by_Line.md`, and examine the corresponding actual 2025 source code. When uncertain, it must inspect the reference implementation rather than invent or simplify. Every mandatory feature must have traceable implementation evidence and verification before being marked complete.

The following requirements are release-blocking:

1. Select and read the Golden Manual material applicable to the change. For V7-covered work, this includes `tools/paper3/v7-requirements.json` and the normative content in `tools/manuals/build-paper3-super-curation-golden-manual-v7.py`. If the applicable authority is unclear or conflicting, stop and resolve the authority before editing.
2. Read `2025_B2_Super_Curation_Line_by_Line.md` and inspect the corresponding files under `paper3/2025-b2/`. A missing or inaccessible reference is a blocker; do not infer, recreate, or simplify its requirements.
3. Inspect the actual reference implementation for every uncertain behavior. Documentation summaries and memory are not substitutes for source inspection.
4. Update `docs/paper3/PAPER3_COMPLIANCE_REPORT.md` and `tools/paper3/paper3-compliance.json` in the same change. Every changed implementation file must have requirement citations, implementation evidence, a current SHA-256 digest, verification commands, and a `verified` status.
5. Run `node tools/paper3/verify-paper3-compliance.mjs --changed-files <path-list>` plus the relevant Paper 3 tests. Do not mark the work complete or release it while any mandatory requirement, test, evidence item, or variance remains unresolved.

CI is the independent enforcement layer. Do not weaken, skip, condition away, or replace the Paper 3 compliance gates to make a change pass.
