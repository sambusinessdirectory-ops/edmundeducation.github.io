#!/usr/bin/env python3
"""Compute exact public bytes using the repository's real Pages rewriter.

Read-only: no source or artifact files are changed. This deliberately imports the
publisher rather than reimplementing or loosening its asset/CSP transformations.
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', required=True, type=Path)
    parser.add_argument('--files-json', required=True)
    args = parser.parse_args()
    root = args.root.resolve()
    script = root / 'tools/rewrite-pages-assets.py'
    spec = importlib.util.spec_from_file_location('published_pages_asset_rewriter', script)
    publisher = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(publisher)
    root_keys = publisher.load_keys('site-pack-index-v1.json')
    root_keys.update(publisher.load_flashcard_keys())
    eddy_keys = publisher.load_keys('eddy-pack-index-v1.json')
    root_dirs = publisher.directories(root_keys)
    eddy_dirs = publisher.directories(eddy_keys)
    hashes = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
    inputs = [script, *[publisher.INDEX_DIR / name for name in ('site-pack-index-v1.json', 'flashcard-pack-index-v1.json', 'eddy-pack-index-v1.json')]]
    files = {}
    for relative in json.loads(args.files_json):
        source = Path(relative)
        path = (root / source).resolve()
        if not path.is_relative_to(root) or not path.is_file():
            raise ValueError(f'Expected a repository file: {relative}')
        raw = path.read_bytes()
        # Match Path.read_text + conditional Path.write_text in publisher.main.
        # If no rewrite occurs, original bytes (including line endings) remain.
        original = path.read_text(encoding='utf-8')
        updated = publisher.rewrite(original, source, root_keys, eddy_keys, root_dirs, eddy_dirs)
        if source.suffix.lower() == '.html':
            updated = publisher.allow_asset_origin_in_csp(updated)
        public = updated.encode('utf-8') if updated != original else raw
        files[relative] = {'rawSha256': hashlib.sha256(raw).hexdigest(), 'pagesSha256': hashlib.sha256(public).hexdigest(), 'rawBytes': len(raw), 'pagesBytes': len(public), 'rewritten': updated != original}
    print(json.dumps({'method': 'Exact publisher.rewrite + allow_asset_origin_in_csp; same conditional UTF8 write semantics as Pages workflow.', 'publishingInputsSha256': {str(p.relative_to(root)): hashes(p) for p in inputs}, 'files': files}, ensure_ascii=False))


if __name__ == '__main__':
    main()
