# Pages release coordinator

GitHub Pages releases are coordinated by
`.github/workflows/pages-release-coordinator.yml`.

- Pushes arriving within 15 seconds are batched before a build starts.
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
- Artifact builders may run in parallel, so a newer push does not wait for an
  unrelated artifact to finish. The publisher owns the only production Pages
  lock and accepts only the current `main` SHA, so completed older artifacts
  are discarded instead of delaying or rolling back the newest release.
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
