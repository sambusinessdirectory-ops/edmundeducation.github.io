# 2016 B2 Super Curation — Stage 3 source inventory

## Exam sources

- Existing 2016 Data File reconstruction, page 3: the four authentic note fields are reused in place.
- Complete 2016 Part B MP3: the player uses the verified permanent public-audio relay directly, avoiding a duplicate 9.98 MB Pages binary; the original worker URL remains in the provenance record.
- Existing timed transcript: `dse-listening-2016-transcript.js`, 44 speaker turns from 0:00 to 13:50.86, segmented into 107 sentence decisions with proportional timing inside each source turn.
- 2016 line-by-line Factline analysis: used to distinguish Task A/B evidence from listening-only notes and rejected noise.

## Design and behaviour references

- `Paper_3_Super_Curation_Golden_Manual_2025_B2_v8.2_2026-11-05.pdf` (183 pages) was reread completely and relevant pages were visually rendered. The implementation follows pp. 28–29 (copy-only rejection line, endpoint reveal and visible active utterance), 65–66 (Hong Kong Traditional Chinese and complete Type 6 sweep), 127–128 (per-heading stamps and exact-span transcript review), 157/163 (per-heading ownership and prohibited duplicate stamps), and 170 (speaker/copy and translation-toggle contract). V8.2's one-source-unit/one-step rule requires separate sentence decisions even when neighbouring sentences share a classification.
- `2025 DSE Paper 3 B2 Super Curation - Stage 3 - No Spotlight - Code Annotated.pdf` (157 pages) was reread completely and 28 relevant pages were rendered across the sequence. Its sentence endpoint timeline and pages 120, 140 and 157 confirm that each sentence reveals independently and that non-point, superseded and closing speech remains visibly crossed in red while speakers remain intact.
- `2025 DSE Paper 3 B2 Super Curation - Full - No Spotlight - Code Annotated.pdf` (615 pages) was reread completely for the full sentence-level implementation context and stage-preservation contract.
- User-supplied correction screenshots were inspected for the duplicate B/B and A/A podcast-subheading stamps, the expected single-badge result, and the missing active colour/red rejection ink at 7:05 in the programme-preview sentence.

## Provenance and normalisation

- Audio SHA-256: `1e32a9f8d57cc8a27c72edeead5cbb6c6be04cfee37e339d25a1c482d6c676de`.
- Duration: `831.630000` seconds; 9,980,375 bytes; mono 44.1 kHz; approximately 96 kbps.
- Display spellings are normalised to the printed Data File: `Indi` → `Indy`, `Gao` → `Gau`, and `Chang Yi Tak` → `Chang Yee Tak`. Every transcript object preserves its original `sourceText`.
- Reed Street follows the answer-sheet/recording confirmation even though the letter-by-letter transcript is inconsistent.

No synthetic note sheet, alternate audio, or replacement transcript is introduced.
