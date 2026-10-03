#!/usr/bin/env python3
"""Launch resumable, detached voice renderers for the second mass import."""

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def alive(pid):
    try:
        os.kill(pid, 0)
        return True
    except (OSError, ValueError):
        return False


def worker(batch, build):
    config = json.loads((build / "runner-config.json").read_text())
    command = [
        config["python"], str(ROOT / "tools/generate-polysemy-audio.py"),
        "--model", config["model"], "--voices", config["voices"],
        "--sentences", str(build / f"local-{batch}.json"),
        "--audio-dir", str(build / "clips"),
        "--manifest-file", str(build / f"local-{batch}-manifest.json"),
        "--kind", "local", "--threads", "1", "--checkpoint-every", "100",
    ]
    result = subprocess.run(command, cwd=ROOT).returncode
    (build / f"batch-{batch}.done.json").write_text(json.dumps({
        "returncode": result,
        "at": datetime.now(timezone.utc).isoformat(),
    }) + "\n")
    return result


def launch(build, model, voices, python, batches):
    build.mkdir(parents=True, exist_ok=True)
    (build / "runner-config.json").write_text(json.dumps({
        "model": str(model), "voices": str(voices), "python": str(python),
    }) + "\n")
    for batch in range(batches):
        complete = build / f"batch-{batch}.done.json"
        if complete.exists() and json.loads(complete.read_text())["returncode"] == 0:
            print(f"Batch {batch}: already complete")
            continue
        pid_file = build / f"batch-{batch}.pid"
        if pid_file.exists() and alive(int(pid_file.read_text())):
            print(f"Batch {batch}: already running as {pid_file.read_text().strip()}")
            continue
        complete.unlink(missing_ok=True)
        with (build / f"batch-{batch}.log").open("a") as log:
            process = subprocess.Popen(
                [str(python), str(Path(__file__).resolve()), "--worker", str(batch),
                 "--build-dir", str(build)],
                cwd=ROOT, stdin=subprocess.DEVNULL, stdout=log, stderr=subprocess.STDOUT,
                start_new_session=True, close_fds=True,
            )
        pid_file.write_text(str(process.pid) + "\n")
        print(f"Batch {batch}: started as {process.pid}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--build-dir", type=Path, default=Path("/private/tmp/polysemy-batch2-audio"))
    parser.add_argument("--model", type=Path)
    parser.add_argument("--voices", type=Path)
    parser.add_argument("--python", type=Path, default=Path(sys.executable))
    parser.add_argument("--batches", type=int, default=8)
    parser.add_argument("--worker", type=int)
    args = parser.parse_args()
    if args.worker is not None:
        raise SystemExit(worker(args.worker, args.build_dir))
    if not args.model or not args.voices:
        parser.error("--model and --voices are required when launching")
    launch(args.build_dir, args.model, args.voices, args.python, args.batches)
