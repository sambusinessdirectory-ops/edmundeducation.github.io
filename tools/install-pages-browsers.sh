#!/usr/bin/env bash
set -euo pipefail
browser_dir="${RUNNER_TEMP:?}/pages-browser"
mkdir -p "$browser_dir"
npm install --prefix "$browser_dir" --no-save --no-package-lock playwright@1.56.1 http-server@14.1.1
"$browser_dir/node_modules/.bin/playwright" install --with-deps chromium firefox webkit
