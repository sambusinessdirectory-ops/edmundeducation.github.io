# Churchill speech audio synchronization (v2)

The radio plays `speech-curation-assets/churchill-council-of-europe-1949-ai-reconstruction-v2.mp3`. Its SHA-256 is `9614e4676de810a2b3b1573453ce802aed013b53bcf51bbb36a91653407b65e8`. The 221 visible lesson lines match the 111 generated segment scripts exactly. `churchill-sentence-timing-v2.json` maps the released MP3 to all 221 lines and 1,963 word groups. It stores character lengths and timestamps, not lesson text. The browser verifies the fetched lesson's SHA-256 before enabling the map.

Timing was made by aligning the known segment text against each generated WAV using Whisper `base.en` cross-attention, then adding the exact v2 assembly offsets. During a pause, the previous sentence remains highlighted until the next sentence begins. A seek updates the line and word immediately. The radio's “同步標示” switch is on by default; opting out is saved in local storage. The full MP3 was decoded and compared with the source WAV at 6, 300, 680 and 1,100 seconds. All four checks had a best offset of **0 ms**.

Each curation heading plays a separate, faded MP3 cut from the same v2 master WAV under `speech-curation-assets/churchill-lines-v2/`. Those clips use an independent audio element and never assign `currentTime` on the radio. The clip manifest lists source windows, durations and SHA-256 values. All 221 clips decoded and passed the duration/hash check. The browser does not expose the private annotations in the static timing or clip files.

To regenerate the clips after an approved audio or script change, rebuild the timing map against that exact version first, then run:

```sh
python tools/build-churchill-sentence-clips.py \
  --source /path/to/approved-v2-master.wav \
  --timing speech-curation-assets/churchill-sentence-timing-v2.json \
  --output speech-curation-assets/churchill-lines-v2
node tools/test-churchill-audio-timing.mjs
```

The timing asset is tied to a specific audio hash and lesson-text hash. Never reuse it after changing the narration or lesson without realignment. Automated alignment is a strong starting point but cannot certify every consonant onset or rhetorical pause by itself; a human listening pass remains the final check for any reported mismatch.
