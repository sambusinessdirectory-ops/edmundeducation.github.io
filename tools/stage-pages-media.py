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
COURSE_MEDIA = (
    "paper3", "professional-english", "speech-curation-assets", "natural-english",
    "dse-reading-analysis", "ielts-writing-preview", "Static Images", "news-reader",
    "irregular-verbs", "fonts", "junior-exam-prep", "homework-eddy", "language-audio",
    "Mascot Directory", "writing-audio", "country-name-spelling-audio", "polysemy-noir",
    "synonyms", "grammar-eddy-dialogues", "sentence-celeste", "flashcards-eddy",
    "speaking-eddy", "junior-quiz-review", "listening-elsie",
)
EXTENSIONS = {".mp3", ".wav", ".m4a", ".ogg", ".webp", ".jpg", ".jpeg", ".png", ".pdf", ".mp4", ".gif", ".ttf"}
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
    def files(roots):
        return subprocess.check_output(["git", "ls-tree", "-rz", args.snapshot, "--", *roots]).split(b"\0")
    # Keep the original packs stable when additional course families are mirrored.
    art = [line for line in subprocess.check_output(["git", "ls-tree", "-z", args.snapshot]).split(b"\0")
           if b"\teddy-" in line and line.endswith(b".png")]
    rows = (files(ROOTS) + [b"boundary"] + files(COURSE_MEDIA)
            + [b"boundary"] + art)
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
            if line == b"boundary":
                if data:
                    finish()
                continue
            if not line:
                continue
            header, raw_path = line.split(b"\t",1)
            path = Path(raw_path.decode())
            if path.suffix.lower() not in EXTENSIONS:
                continue
            oid = header.split()[2].decode()
            # Source readers may differ from their generated published files.
            # Always stage the exact deployed blob; use the worktree only as a fast path.
            content = path.read_bytes() if path.is_file() else b""
            if hashlib.sha1(f"blob {len(content)}\0".encode()+content).hexdigest() != oid:
                content = subprocess.check_output(["git","cat-file","blob",oid])
            oid = hashlib.sha1(f"blob {len(content)}\0".encode()+content).hexdigest()
            if oid != header.split()[2].decode():
                raise ValueError(f"Working file differs from deployed snapshot: {path}")
            if data and len(data)+len(content)>LIMIT:
                finish()
            entries[str(path)] = [len(jobs),len(data),len(content),mimetypes.guess_type(path)[0] or "application/octet-stream", oid]
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
