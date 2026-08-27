#!/usr/bin/env python3
"""Bind explicitly reviewed audio ranges to the exact audio and transcript text."""
import argparse,hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--audio-cache',type=Path,required=True)
args=p.parse_args()
reviews=json.loads((Path(__file__).parent/'timing-review-decisions.json').read_text())
for review in reviews:
    practice,part,row=review['practice'],review['part'],review['row']
    recording=json.loads((args.audio_cache/f'practice-{practice}-part-{part}.json').read_text())
    data=json.loads((ROOT/f'assets/listening/practices/practice-{practice}.json').read_text())
    review['audioSha256']=recording['audioSha256']
    review['transcriptText']=data['transcript'][str(part)][row]['en']
    if not 0<=review['start']<review['end']<=recording['duration']:raise ValueError(review)
(Path(__file__).parent/'timing-reviews.json').write_text(json.dumps(reviews,ensure_ascii=False,indent=2)+'\n')
print(f'Sealed {len(reviews)} timing reviews against their source text and audio hashes.')
