#!/usr/bin/env bash

set -euo pipefail

site_dir=${1:?Usage: update-pages-snapshot.sh SITE_DIR SOURCE_SHA}
source_sha=${2:?Usage: update-pages-snapshot.sh SITE_DIR SOURCE_SHA}

: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
: "${RUNNER_TEMP:?RUNNER_TEMP is required}"
: "${SNAPSHOT_TOKEN:?SNAPSHOT_TOKEN is required}"

snapshot_dir="${RUNNER_TEMP}/pages-snapshot-${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-1}"
remote_url="https://github.com/${GITHUB_REPOSITORY}.git"
auth_header="AUTHORIZATION: basic $(printf 'x-access-token:%s' "${SNAPSHOT_TOKEN}" | base64 -w0)"

if git -c "http.https://github.com/.extraheader=${auth_header}" \
  ls-remote --exit-code "${remote_url}" refs/heads/pages-snapshot >/dev/null 2>&1; then
  git -c "http.https://github.com/.extraheader=${auth_header}" \
    clone --depth=1 --single-branch --branch pages-snapshot \
    "${remote_url}" "${snapshot_dir}"
else
  git init -q "${snapshot_dir}"
  git -C "${snapshot_dir}" checkout -q --orphan pages-snapshot
  git -C "${snapshot_dir}" remote add origin "${remote_url}"
fi

git -C "${snapshot_dir}" config http.https://github.com/.extraheader "${auth_header}"
git -C "${snapshot_dir}" config user.name github-actions
git -C "${snapshot_dir}" config user.email 41898282+github-actions[bot]@users.noreply.github.com

rsync -a --delete --exclude='.git' "${site_dir}/" "${snapshot_dir}/"
printf '%s\n' "${source_sha}" > "${snapshot_dir}/.source-sha"

git -C "${snapshot_dir}" add -A
if git -C "${snapshot_dir}" diff --cached --quiet; then
  exit 0
fi

git -C "${snapshot_dir}" commit -m "Publish snapshot ${source_sha}"
git -C "${snapshot_dir}" push origin HEAD:refs/heads/pages-snapshot
