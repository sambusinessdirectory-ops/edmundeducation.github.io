#!/usr/bin/env python3
"""Verify student-visible routes selected by the release dependency scopes."""

from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
import re
from urllib.parse import urljoin
from urllib.request import Request, urlopen


TAG = re.compile(r"\[[a-z0-9-]+\]")
OVERRIDES = {
    "[audio-contract-release]": ["flashcards.html"],
    "[catalog-contract-release]": ["index.html"],
    "[classroom-release]": ["speaking-system.html"],
    "[infrastructure-release]": ["index.html"],
    "[italian-release]": ["index.html"],
    "[listening-release]": ["listening-system.html"],
    "[listening-search-release]": ["listening-system.html"],
    "[paper3-release]": ["paper3/2023-b2/curation/"],
    "[release-gate-repair]": ["flashcards.html"],
    "[study-release]": ["index.html"],
}


def selected_routes(release_tags: str, system_map: dict) -> list[str]:
    families = system_map["families"]
    raw_tags = set(TAG.findall(release_tags))
    tags = raw_tags - {"[fast-deploy]", "[full-artifact]"}
    all_routes = sorted({route for routes in families.values() for route in routes})
    if "[fast-deploy]" not in raw_tags or "[shared-header-release]" in tags or "[catalog-contract-release]" in tags:
        return sorted(set(all_routes) | {"index.html"})
    routes = set()
    for tag in tags:
        routes.update(families.get(tag, OVERRIDES.get(tag, ["index.html"])))
    return sorted(routes)


def verify_route(origin: str, route: str) -> tuple[str, int]:
    url = urljoin(origin.rstrip("/") + "/", route)
    request = Request(url, headers={
        "Cache-Control": "no-cache",
        "User-Agent": "EdmundEducation-Live-Journey/1.0",
    })
    with urlopen(request, timeout=30) as response:
        body = response.read()
        content_type = response.headers.get("Content-Type", "").lower()
        if response.status != 200 or len(body) < 100:
            raise ValueError(f"Student journey failed for {url}: HTTP {response.status}, {len(body)} bytes")
        if b"__EDMUND_RELEASE__" in body:
            raise ValueError(f"Unstamped release placeholder is public at {url}")
        if "text/html" in content_type and b"</html>" not in body.lower():
            raise ValueError(f"Incomplete HTML document at {url}")
    return route, len(body)


def verify(origin: str, release_tags: str, map_file: Path) -> dict:
    system_map = json.loads(map_file.read_text())
    routes = selected_routes(release_tags, system_map)
    with ThreadPoolExecutor(max_workers=12) as pool:
        results = list(pool.map(lambda route: verify_route(origin, route), routes))
    return {
        "release_tags": release_tags or "full validation",
        "journey_count": len(results),
        "bytes_checked": sum(size for _, size in results),
        "routes": [route for route, _ in results],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--origin", default="https://edmundeducation.com")
    parser.add_argument("--release-tags", default="")
    parser.add_argument(
        "--system-map", type=Path,
        default=Path(__file__).with_name("pages-system-release-map.json"),
    )
    args = parser.parse_args()
    print(json.dumps(verify(args.origin, args.release_tags, args.system_map), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
