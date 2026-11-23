# 2016 B2 Super Curation — Stage 3 source inventory

## Exam sources

- Existing 2016 Data File reconstruction, page 3: the four authentic note fields are reused in place.
- Complete 2016 Part B MP3: `paper3/2016-b2/part-b-podcast.mp3`.
- Existing timed transcript: `dse-listening-2016-transcript.js`, 44 turns from 0:00 to 13:50.86.
- 2016 line-by-line Factline analysis: used to distinguish Task A/B evidence from listening-only notes and rejected noise.

## Design and behaviour references

- 2025 Golden Manual, especially the source-faithful podcast, stable-cue, native-field, transcript, state-owner and validation requirements.
- 2025 Stage 3 code-annotated reference: used for the floating player/transcript relationship, red Type 6 strikes, selective task colour, and native note-writing behaviour.

## Provenance and normalisation

- Audio SHA-256: `1e32a9f8d57cc8a27c72edeead5cbb6c6be04cfee37e339d25a1c482d6c676de`.
- Duration: `831.630000` seconds; 9,980,375 bytes; mono 44.1 kHz; approximately 96 kbps.
- Display spellings are normalised to the printed Data File: `Indi` → `Indy`, `Gao` → `Gau`, and `Chang Yi Tak` → `Chang Yee Tak`. Every transcript object preserves its original `sourceText`.
- Reed Street follows the answer-sheet/recording confirmation even though the letter-by-letter transcript is inconsistent.

No synthetic note sheet, alternate audio, or replacement transcript is introduced.
