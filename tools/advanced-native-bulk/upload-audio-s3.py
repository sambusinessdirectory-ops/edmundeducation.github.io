#!/usr/bin/env python3
"""Upload a frozen, hash-verified audio queue to the single approved R2 bucket.

Credentials come from an AWS profile outside the repository. A successful upload
is checked with HeadObject before its resumable checkpoint is written. This
does not stage lessons or approve a course release.
"""
import argparse
import concurrent.futures
import hashlib
import json
import subprocess
import threading
from pathlib import Path

BUCKET = 'edmund-assets'
PREFIX = 'assets/natural-english/audio/advanced-native/v1/'
ENDPOINT = 'https://bb52550c9a10ce282a09d742d800c06e.r2.cloudflarestorage.com'
HOST = 'https://edmund-neural-audio.edmundeducation.workers.dev/'
LOCK = threading.Lock()


def digest(filename):
    sha = hashlib.sha256()
    with filename.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            sha.update(block)
    return sha.hexdigest()


def aws(args, command):
    call = ['aws', 's3api', *command, '--endpoint-url', ENDPOINT,
            '--profile', args.profile, '--output', 'json']
    result = subprocess.run(call, capture_output=True, text=True, timeout=180)
    if result.returncode:
        raise RuntimeError(f'AWS S3 operation failed ({result.returncode}): {result.stderr.strip()[:300]}')
    return json.loads(result.stdout)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--queue', type=Path, required=True)
    parser.add_argument('--audio-dir', type=Path, required=True)
    parser.add_argument('--state-dir', type=Path, required=True)
    parser.add_argument('--profile', required=True)
    parser.add_argument('--jobs', type=int, default=8)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    if not 1 <= args.jobs <= 8:
        parser.error('Use 1–8 workers.')
    queue = json.loads(args.queue.read_text())
    summary = json.loads((args.state_dir / 'summary.json').read_text())
    metadata = json.loads((args.state_dir / 'metadata.json').read_text())
    manifest = json.loads((args.state_dir / 'manifest.json').read_text())
    if summary['failed'] or summary['pending'] or summary['requests'] != len(queue):
        raise SystemExit('Exact audio queue is not fully generated and verified.')
    records = {row['synthesisKey']: row for rows in metadata.values() for row in rows}
    if len(records) != len(queue):
        raise SystemExit('Audio metadata does not exactly match queue length.')
    manifested = [Path(local_path).stem for mapping in manifest.values()
                  for local_path in mapping.values()]
    if len(manifested) != len(queue) or set(manifested) != set(records):
        raise SystemExit('The frozen public manifest does not exactly match the audio queue.')
    pending = []
    checkpoint = args.state_dir / 'r2-uploaded.json'
    uploaded = json.loads(checkpoint.read_text()) if checkpoint.exists() else {}
    for request in queue:
        key = request['synthesisKey']
        row = records.get(key)
        if not row or any(row[field] != request[field] for field in ('moduleId', 'role', 'text', 'voice', 'lang', 'speed')):
            raise SystemExit(f'Audio metadata mismatch for {key}.')
        audio = args.audio_dir / f'{key}.mp3'
        if not audio.is_file() or digest(audio) != row['sha256']:
            raise SystemExit(f'Audio file is missing or changed: {audio}.')
        object_key = PREFIX + audio.name
        if uploaded.get(object_key) != row['sha256']:
            pending.append((object_key, row['sha256'], audio))
    print(json.dumps({'verifiedLocalFiles': len(queue), 'remainingUploads': len(pending),
                      'bytes': sum((args.audio_dir / (row['synthesisKey'] + '.mp3')).stat().st_size for row in queue),
                      'releaseApproved': False}), flush=True)
    if args.check:
        return

    def upload(item):
        object_key, sha, audio = item
        aws(args, ['put-object', '--bucket', BUCKET, '--key', object_key,
                   '--body', str(audio), '--content-type', 'audio/mpeg',
                   '--cache-control', 'public, max-age=31536000, immutable',
                   '--metadata', f'sha256={sha}'])
        head = aws(args, ['head-object', '--bucket', BUCKET, '--key', object_key])
        if head.get('Metadata', {}).get('sha256') != sha or head.get('ContentLength') != audio.stat().st_size or head.get('ContentType') != 'audio/mpeg':
            raise RuntimeError(f'Remote object metadata mismatch: {object_key}')
        with LOCK:
            uploaded[object_key] = sha
            temporary = checkpoint.with_suffix('.tmp')
            temporary.write_text(json.dumps(uploaded, indent=2) + '\n')
            temporary.replace(checkpoint)
            print(json.dumps({'uploaded': object_key, 'completed': len(uploaded)}), flush=True)

    errors = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs) as pool:
        futures = {pool.submit(upload, item): item[0] for item in pending}
        for future in concurrent.futures.as_completed(futures):
            try:
                future.result()
            except Exception as error:
                errors.append({'object': futures[future], 'error': str(error)})
    (args.state_dir / 'r2-upload-failures.json').write_text(json.dumps(errors, indent=2) + '\n')
    if errors:
        raise SystemExit(f'{len(errors)} objects failed; successful uploads are checkpointed for resume.')
    if any(uploaded.get(PREFIX + key + '.mp3') != records[key]['sha256'] for key in records):
        raise SystemExit('Not all exact queue objects have upload evidence.')
    public = {
        module: {sentence: HOST + PREFIX + Path(local_path).name
                 for sentence, local_path in mapping.items()}
        for module, mapping in manifest.items()
    }
    public_file = args.state_dir / 'public-manifest.json'
    temporary = public_file.with_suffix('.tmp')
    temporary.write_text(json.dumps(public, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(public_file)
    print(json.dumps({'uploadedObjects': len(uploaded), 'remainingUploads': 0, 'releaseApproved': False}))


if __name__ == '__main__':
    main()
