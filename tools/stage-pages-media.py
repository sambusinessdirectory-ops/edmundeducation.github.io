#!/usr/bin/env python3
"""Stage published media in immutable R2 packs. Verify every byte before writing the serving index."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import mimetypes
from pathlib import Path
import subprocess
import tempfile

ROOTS = ("song-media", "polysemy-lab/manuals", "polysemy-lab/audio")
EXTENSIONS = {".mp3", ".wav", ".m4a", ".ogg", ".webp", ".jpg", ".jpeg", ".png", ".pdf"}
LIMIT = 48 * 1024 * 1024

def upload_verified(job):
    cli, local, key, digest = job
    remote = "edmund-assets/" + key
    with tempfile.TemporaryDirectory() as work:
        downloaded = Path(work) / "remote.bin"
        def download():
            result = subprocess.run([cli, "r2", "object", "get", remote, "--remote", "--file", str(downloaded)], capture_output=True)
            return result.returncode == 0 and hashlib.sha256(downloaded.read_bytes()).hexdigest() == digest
        if not download():
            subprocess.run([cli, "r2", "object", "put", remote, "--remote", "--file", str(local), "--content-type", "application/octet-stream"], check=True, stdout=subprocess.DEVNULL)
            if not download():
                raise ValueError(f"R2 readback failed: {key}")
    print("Verified", key, flush=True)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--snapshot", required=True, help="Git ref for the actual deployed snapshot")
    parser.add_argument("--wrangler", required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    rows = subprocess.check_output(["git","ls-tree","-rz",args.snapshot,"--",*ROOTS]).split(b"\0")
    entries = {}
    jobs = []
    with tempfile.TemporaryDirectory() as work:
        data = bytearray()
        def finish():
            digest = hashlib.sha256(data).hexdigest()
            key = f"site-assets/public-media/{digest}.bin"
            local = Path(work) / digest
            local.write_bytes(data)
            jobs.append((args.wrangler,local,key,digest))
            data.clear()
        for line in rows:
            if not line:
                continue
            header, raw_path = line.split(b"\t",1)
            path = Path(raw_path.decode())
            if path.suffix.lower() not in EXTENSIONS:
                continue
            content = path.read_bytes()
            oid = hashlib.sha1(f"blob {len(content)}\0".encode()+content).hexdigest()
            if oid != header.split()[2].decode():
                raise ValueError(f"Working file differs from deployed snapshot: {path}")
            if data and len(data)+len(content)>LIMIT:
                finish()
            entries[str(path)] = [len(jobs),len(data),len(content),mimetypes.guess_type(path)[0] or "application/octet-stream"]
            data.extend(content)
        if data:
            finish()
        if not jobs:
            raise ValueError("No published media found")
        with ThreadPoolExecutor(max_workers=4) as pool:
            list(pool.map(upload_verified,jobs))
        index = {"packs":[row[2] for row in jobs],"entries":entries}
        args.output.write_text(json.dumps(index,ensure_ascii=False,separators=(",",":"))+"\n")
        print("Verified",len(entries),"files,",sum(row[2] for row in entries.values()),"bytes")
if __name__ == "__main__":
    main()
