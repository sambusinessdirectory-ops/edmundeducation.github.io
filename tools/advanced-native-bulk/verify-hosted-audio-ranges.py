#!/usr/bin/env python3
"""Verify byte-range playback for every clip in a frozen audio queue."""
import argparse
import concurrent.futures
import datetime
import hashlib
import json
import re
import subprocess
import tempfile
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--queue', required=True, type=Path)
    parser.add_argument('--audio-dir', required=True, type=Path)
    parser.add_argument('--state-dir', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--jobs', type=int, default=8)
    args = parser.parse_args()
    if not 1 <= args.jobs <= 16:
        parser.error('Use 1–16 workers.')

    queue = json.loads(args.queue.read_text())
    metadata = json.loads((args.state_dir / 'metadata.json').read_text())
    public = json.loads((args.state_dir / 'public-manifest.json').read_text())
    by_key = {row['synthesisKey']: row for rows in metadata.values() for row in rows}

    def check(row):
        key = row['synthesisKey']
        result = {'synthesisKey': key, 'moduleId': row['moduleId'], 'role': row['role']}
        try:
            saved = by_key[key]
            local = args.audio_dir / (key + '.mp3')
            data = local.read_bytes()
            if hashlib.sha256(data).hexdigest() != saved['sha256']:
                raise ValueError('Local audio hash mismatch')
            url = public[row['moduleId']][row['text']]
            if not url.startswith('https://edmund-neural-audio.edmundeducation.workers.dev/assets/natural-english/audio/advanced-native/v1/'):
                raise ValueError('Unexpected asset origin or prefix')
            stop = min(len(data), 1024) - 1
            with tempfile.TemporaryDirectory(prefix='advanced-native-range-check-') as directory:
                headers = Path(directory) / 'headers.txt'
                body = Path(directory) / 'body.mp3'
                request = subprocess.run(
                    ['curl', '--fail', '--silent', '--show-error', '--retry', '2', '--max-time', '35',
                     '-H', f'Range: bytes=0-{stop}', '--dump-header', str(headers),
                     '--output', str(body), url],
                    capture_output=True, text=True, timeout=115,
                )
                if request.returncode:
                    raise ValueError('Range GET failed: ' + request.stderr[-250:])
                header = headers.read_text().lower()
                expected_range = f'content-range: bytes 0-{stop}/{len(data)}'
                if not re.search(r'http/[^\s]+ 206\b', header):
                    raise ValueError('Server did not return HTTP 206')
                for required in [expected_range, 'content-type: audio/mpeg',
                                 'access-control-allow-origin: *', 'accept-ranges: bytes']:
                    if required not in header:
                        raise ValueError('Missing range header: ' + required)
                if body.read_bytes() != data[:stop + 1]:
                    raise ValueError('Range bytes differ from verified local file')
                result.update(status='passed', checkedBytes=stop + 1)
        except Exception as error:
            result.update(status='failed', error=str(error))
        return result

    with concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs) as pool:
        results = []
        for result in pool.map(check, queue):
            results.append(result)
            if len(results) % 100 == 0:
                print(json.dumps({'checked': len(results), 'total': len(queue)}), flush=True)

    failures = [row for row in results if row['status'] != 'passed']
    report = {
        'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'queueSha256': hashlib.sha256(args.queue.read_bytes()).hexdigest(),
        'checked': len(results), 'failed': len(failures),
        'allRangeRequestsMatched': not failures,
        'humanListeningClaimed': False,
        'assets': results,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({key: value for key, value in report.items() if key != 'assets'}), flush=True)
    if failures:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
