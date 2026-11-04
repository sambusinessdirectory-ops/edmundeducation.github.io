# Pages release coordinator

GitHub Pages releases are coordinated by
`.github/workflows/pages-release-coordinator.yml`.

- Pushes arriving within 15 seconds are batched before a build starts.
- The router compares `main` with the deployed `pages-snapshot` source SHA and
  selects one standard, Paper 3, or homepage artifact builder.
- Focused validation tags are recovered from the commits that produced each
  changed file, including files combined through concurrent merge commits.
- Builds that already started may finish in parallel; later pushes do not
  cancel them or force all work into a single build queue.
- The publisher owns the only production Pages lock. It publishes only
  forward commits on the current `main` lineage, so intermediate progress is
  allowed but an older artifact can never roll back production.
- After publication, `pages-snapshot` records the deployed artifact and source
  SHA. Ordinary content changes are applied to that snapshot as a delta, while
  workflow, Paper 3, and R2-index changes intentionally request a full rebuild.

The release regression gate is `tools/test-pages-release-coordinator.py`.
