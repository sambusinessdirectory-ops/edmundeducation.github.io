#!/usr/bin/env bash
# Run independent cheap contracts even when an earlier contract fails.
set -u
failed=0
check() {
  if ! "$@"; then
    printf 'Release check failed: %s\n' "$*" >&2
    failed=1
  fi
}
check node tools/generate-system-pwa-manifests.mjs --check
check node --test --test-name-pattern='registered writing topics expose guarded Open Book' tools/test-writing-submission-portal.mjs
check node --test --test-name-pattern='all six Common Expression portals carry their identity' tools/test-common-expression-system.mjs
exit "$failed"
