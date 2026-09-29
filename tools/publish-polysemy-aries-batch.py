#!/usr/bin/env python3
"""Validate generated Aries clips and prepare the two Polysemy manifests.

Upload new mass-module clips to R2 before running this script. The older clips
are copied into Pages' existing audio directory. Existing immutable audio URLs
are never changed.
"""

import argparse
import hashlib
import json
import shutil
from pathlib import Path


RELEASE = "v2-aries-20260930-1"
BASE_URL = "https://edmund-neural-audio.edmundeducation.workers.dev/"
R2_PREFIX = f"assets/polysemy-lab/audio/{RELEASE}/"


def read(path):
    return json.loads(path.read_text())


def write(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--build-dir", type=Path, default=Path("/private/tmp/polysemy-mass-audio"))
    parser.add_argument("--repository", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--apply", action="store_true", help="write site files after R2 upload")
    args = parser.parse_args()
    build, site = args.build_dir, args.repository / "polysemy-lab"
    expected = {row["id"]: row for row in read(build / "cloud-pending.json")}
    pending = read(site / "audio-pending.json")
    old_source = read(site / "audio-missing-cloud.json")
    older = set(pending["questions"]) | set(old_source)
    mass_manifest = read(site / "audio-mass.json")
    generated = {}
    for path in sorted(build.glob("aries-*-manifest.json")):
        for question_id, row in read(path).items():
            if question_id in generated and generated[question_id] != row:
                raise SystemExit(f"Conflicting manifests for {question_id}")
            generated[question_id] = row
    for question_id, row in generated.items():
        source = expected.get(question_id)
        if source is None or row["voice"] != "american-male" or row["text"] != source["en"]:
            raise SystemExit(f"Source or voice mismatch: {question_id}")
        if row["sourceSha256"] != hashlib.sha256(source["en"].encode()).hexdigest():
            raise SystemExit(f"Source hash mismatch: {question_id}")
        clip = build / "clips" / Path(row["path"]).name
        if not clip.is_file() or clip.stat().st_size < 1000:
            raise SystemExit(f"Missing generated clip: {clip}")
    older_rows = {key: row for key, row in generated.items() if key in older}
    mass_rows = {key: row for key, row in generated.items() if key not in older}
    for question_id, row in mass_rows.items():
        if question_id in mass_manifest and mass_manifest[question_id]["voice"] != "american-male":
            raise SystemExit(f"Would replace existing mass audio: {question_id}")
    print(f"Validated {len(generated)} clips: {len(older_rows)} older, {len(mass_rows)} mass")
    if not args.apply:
        print("R2 upload keys for mass clips:")
        for row in mass_rows.values():
            print(R2_PREFIX + Path(row["path"]).name)
        return
    for question_id, row in older_rows.items():
        name = Path(row["path"]).name
        destination = site / "audio" / name
        source = build / "clips" / name
        if destination.exists() and destination.read_bytes() != source.read_bytes():
            raise SystemExit(f"Refusing to replace existing clip: {destination}")
        shutil.copyfile(source, destination)
        old_source[question_id] = row
    pending["questions"] = [id_ for id_ in pending["questions"] if id_ not in older_rows]
    for question_id, row in mass_rows.items():
        mass_manifest[question_id] = {
            "path": BASE_URL + R2_PREFIX + Path(row["path"]).name,
            "voice": "american-male",
        }
    write(site / "audio-missing-cloud.json", old_source)
    write(site / "audio-pending.json", pending)
    (site / "audio-mass.json").write_text(json.dumps(mass_manifest, separators=(",", ":"), sort_keys=True) + "\n")
    print("Prepared site manifests; run build-polysemy-audio-manifest.mjs for older modules")


if __name__ == "__main__":
    main()
