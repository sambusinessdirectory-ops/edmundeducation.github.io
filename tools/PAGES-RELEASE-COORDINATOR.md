# Pages release coordinator

GitHub Pages releases are coordinated by
`.github/workflows/pages-release-coordinator.yml`.

- Pushes queue from routing through live verification and snapshot completion.
- The router compares `main` with the deployed `pages-snapshot` source SHA and
  selects one standard, Paper 3, or homepage artifact builder.
- Focused validation tags come from all changed paths since the deployed snapshot.
  Homepage card markup and numeric deck-counter edits can share the standard
  focused build with other covered systems. Other homepage edits and unknown
  files require full validation.
- `tools/pages-system-release-map.json` owns the union of the homepage learning
  cards and `shared-system-nav.js` destinations. Every exposed route must map
  to a versioned scope in `tools/pages-release-scopes.json`; the build fails if
  a new system is exposed without focused validation ownership.
- The active release finishes when newer pushes arrive. A validated intermediate
  commit can publish if it advances the deployed snapshot, belongs to main,
  and the public release agrees with the snapshot. GitHub retains up to 100
  pending runs. Each release computes its changes from the deployed baseline.
- After publication, `pages-snapshot` records the deployed artifact and source
  SHA under its own non-cancellable lock. Ordinary content changes are applied
  to that snapshot as a delta, while workflow, Paper 3, and R2-index changes
  intentionally request a full rebuild.
- Unchanged public media, including verified audio output, stays in the
  deployed snapshot. Focused releases fetch and replace only changed media and
  the small source set needed by that system's contract checks.
- Live SHA verification runs inside the publisher alongside the snapshot update,
  so it uses the same publication-slot decision and cannot be skipped by a
  missing reusable-workflow output in the coordinator.

The release regression gates are `tools/test-pages-release-coordinator.py` and
`tools/test-pages-system-release-map.py`.

## Adding a validation step

Every Pages artifact builder uses Ubuntu 24.04. Browser steps call
`bash tools/install-pages-browsers.sh` from the source checkout. It installs
the shared Playwright version and its Chromium, Firefox and WebKit dependencies
under `$RUNNER_TEMP/pages-browser`.

Each sparse source checkout appends `tools/pages-validation-paths` before
materializing files. Add a small file or directory there when validators on
multiple routes read it. Keep large fixtures in their system's checkout rules.
The coordinator checks these contracts before starting a builder. Pull requests
that change the build environment also launch all three browsers on that runner.

## Operating a release

Use one coordinator run as the shared status record. Record feature commit, request time
and expected public behavior there or in the feature's PR. Follow the structured build,
deploy and verify steps. An active or skipped job does not prove publication. A later
candidate may contain the feature; check ancestry and the student's actual route.

Avoid empty restart commits and manual cancellations for ordinary pushes. For a transient
failure use GitHub's **Re-run failed jobs** on the owning run. The three-day artifact
retention window allows publication, verification and snapshot failures to be retried
with the original artifact. If production already shows the candidate, the publisher
skips redeployment and repairs the snapshot. When snapshot and public SHA disagree,
repair the run owning the public SHA first. Never overwrite the snapshot from an older
retry. During a known bad release, record the reason and recovery owner before cancelling.

Use `python3 tools/pages-release-report.py --feature FULL_SHA --requested-at ISO_TIME`
with authenticated GitHub CLI access. It reports verified timing and publication evidence
across recent runs; public behavior still needs its feature-specific check. Group routine
and full releases separately, report sample counts, include queued and discarded work, and
compare both push-to-verified time and runner time before claiming improvement. The incident
baseline is 19m23s build, 21m35s until verified, and 160m14s of unpublished builder
time across attempts #123–140. The three feature turns overlapped.

For scheduling changes dispatch `pages-queue-rehearsal.yml` three times with the same
unique batch identifier and labels A, B and C. Submit B during A's build and C during A's
snapshot phase. Inspect job times and conclusions; only one rehearsal may occupy the group
at a time. The rehearsal has read-only permissions and its own group.

Public media that was already on Pages is mirrored in the edmund-assets R2 bucket.
`tools/stage-pages-media.py` reads the deployed snapshot, verifies source Git object IDs,
writes content-addressed packs, and reads every pack back before writing the worker index.
The edmund-public-media Worker supports legacy paths on its own hostname and byte ranges.
Keep the original paths on Pages until those same URLs on edmundeducation.com can be
verified through the new service. The artifact inventory reports the interim size warning.

### Enabling media delivery at the existing public address

The optional repository variable `PAGES_R2_CUTOVER` defaults to off. The
workers.dev hostname is available for rehearsal. To activate, the school domain
must first route the indexed media paths and
`/.well-known/edmund-public-media.json` to the same Worker, preserving the
original Pages origin for other requests. Verify the exact index and range
responses on the school domain, including saved song URLs, PDF downloads, and
cached clients. Keep immutable packs available throughout rollback.

After a disposable artifact rehearsal, enable the variable for a full release.
Every builder compares present media with the verified blob index before
removing replicas from its temporary upload directory. A stale index, a failed
range request, or an artifact over 1,000,000,000 bytes stops publication. When
changing or withdrawing media, coordinate a new version of the index and its
routes with the content release. To roll back, disable the variable, rebuild
the full artifact from source, verify it on the Pages origin, then return
the media paths to Pages. A focused overlay based on a pruned snapshot is
insufficient to restore removed files.
