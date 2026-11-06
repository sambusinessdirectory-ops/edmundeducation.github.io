# Pages release coordinator

GitHub Pages releases are coordinated by
`.github/workflows/pages-release-coordinator.yml`.

- Pushes are coordinated from routing through live verification and snapshot
  completion. One release runs uninterrupted; at most one newer candidate waits.
  A still newer push replaces that pending candidate, consolidating every commit
  into the latest `main` descendant instead of building intermediate trees.
- The router compares `main` with the deployed `pages-snapshot` source SHA and
  selects one standard, Paper 3, or homepage artifact builder.
- Focused validation tags come from all changed paths since the deployed snapshot.
  Homepage card markup and numeric deck-counter edits can share the standard
  focused build with other covered systems. Other homepage edits and unknown
  files require full validation.
- The route summary names the owner of every changed path and lists every commit
  consolidated into the candidate. Unclassified paths are named and force full
  validation; release-system files belong to the infrastructure scope instead
  of silently broadening an otherwise focused release.
- `tools/pages-system-release-map.json` owns the union of the homepage learning
  cards and `shared-system-nav.js` destinations. Every exposed route must map
  to a versioned scope in `tools/pages-release-scopes.json`; the build fails if
  a new system is exposed without focused validation ownership.
- The active release finishes when newer pushes arrive. A validated intermediate
  commit can publish if it advances the deployed snapshot, belongs to main,
  and the public release agrees with the snapshot. GitHub retains only the latest
  pending run. When it starts, it computes the remaining changes from the newly
  deployed snapshot; a canceled pending run is therefore linked by ancestry to
  the descendant candidate that contains it rather than treated as discarded work.
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
The coordinator checks these contracts before starting a builder. Candidate
commits are pushed to a `codex/**` branch first, where the `contracts` job
verifies the exact commit against its current `main` merge base. The `main`
ruleset requires that green status but does not require a pull request, review,
approval, merge click, or restart commit. A verified candidate can therefore be
fast-forwarded directly to `main`; any changed commit must pass again under its
own identity. Changes to the build environment also launch all three browsers
on that runner.

## Operating a release

Use one coordinator run as the shared status record. Record feature commit, request time
and expected public behavior there or in the candidate check summary. Follow the structured build,
deploy and verify steps. An active or skipped job does not prove publication. A later
candidate may contain the feature; use `pages-release-report.py --feature FULL_SHA` to
name that containing release, then check the student's actual route.

The operational targets are verified production within 10 minutes for focused releases
and 20 minutes for full releases, with ordinary queue wait below 5 minutes. Treat these as
end-to-end limits, not build-only limits. A release is complete only after the public SHA,
affected student journey, and snapshot are verified.

After the public SHA changes, the publisher runs `verify-pages-live-journeys.py`.
Focused releases fetch the mapped route for every affected dependency scope. Full,
shared-header and cross-catalogue releases fetch the complete public system map. A
matching release hash is not student-visible success when an affected document is
missing, incomplete or unstamped.

Avoid empty restart commits and manual cancellations for ordinary pushes. For a transient
failure use GitHub's **Re-run failed jobs** on the owning run. The three-day artifact
retention window allows publication, verification and snapshot failures to be retried
with the original artifact. If production already shows the candidate, the publisher
skips redeployment and repairs the snapshot. When snapshot and public SHA disagree,
repair the run owning the public SHA first. Never overwrite the snapshot from an older
retry. During a known bad release, record the reason and recovery owner before cancelling.
Each builder retries a failed artifact upload once inside the already validated job,
using a new immutable artifact name. Dispatch `pages-recovery-rehearsal.yml` with each
failure stage and use **Re-run failed jobs**; the later attempt must reuse the one stored
artifact while the successful validation job remains untouched.

Use `python3 tools/pages-release-report.py --feature FULL_SHA --requested-at ISO_TIME`
with authenticated GitHub CLI access. It reports verified timing and publication evidence
across recent runs; public behavior still needs its feature-specific check. Group routine
and full releases separately, report sample counts, include queued and discarded work, and
compare both push-to-verified time and runner time before claiming improvement. The incident
baseline is 19m23s build, 21m35s until verified, and 160m14s of unpublished builder
time across attempts #123–140. The three feature turns overlapped.

For scheduling changes dispatch `pages-queue-rehearsal.yml` three times with the same
unique batch identifier and labels A, B and C. Submit B and then C while A is active.
A must finish, B must be canceled before its build begins, and C must start only after A
finishes. This proves active-work preservation and latest-pending consolidation without
touching the production group. The rehearsal has read-only permissions.

Public media that was already on Pages is mirrored in the edmund-assets R2 bucket.
`tools/stage-pages-media.py` reads the deployed snapshot, verifies source Git object IDs,
writes content-addressed packs, and reads every pack back before writing the worker index.
The edmund-public-media Worker supports indexed paths on its existing workers.dev hostname,
including byte ranges. The artifact inventory reports the interim size warning.

### Enabling R2 media delivery without changing authoritative DNS

The optional repository variable `PAGES_R2_CUTOVER` defaults to off. It does not require
a nameserver or authoritative-DNS change. When enabled, every prepared artifact rewrites
indexed media references to `edmund-public-media.edmundeducation.workers.dev`, extends
document CSP for that origin, verifies the exact R2 index and byte ranges, retains the
explicit compatibility paths in `pages-media-saved-links.txt`, and only then removes the
other verified replicas from the disposable Pages artifact. A marker in the deployed
snapshot forces the first activation and any rollback through a full build; later focused
releases can safely overlay the pruned snapshot.

Run `pages-media-cutover.yml` against the workers.dev origin before activation. The verifier checks
the exact repository index, representative complete downloads, every routed top-level
family, byte ranges, content types, cache validation, CORS, and saved song/PDF/image links.
Do not enable `PAGES_R2_CUTOVER` until that run succeeds.

After a disposable artifact rehearsal, enable the variable for a full release.
Every builder compares present media with the verified blob index before
rewriting references and removing replicas from its temporary upload directory. A stale index, a failed
range request, or an artifact over 1,000,000,000 bytes stops publication. When
changing or withdrawing media, coordinate a new version of the index and its
references with the content release. To roll back, disable the variable and rebuild
the full artifact from source. The snapshot marker prevents a focused overlay from
being mistaken for a complete rollback.
