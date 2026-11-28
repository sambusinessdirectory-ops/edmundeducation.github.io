# 2014 B2 Stage 3 — source and destination mapping

## Authority chain

1. The actual 2014 Part B MP3 is authoritative for audible content and cue boundaries.
2. The site timed transcript supplies turn-level timing aligned to that MP3.
3. `2014 DSE Paper 3 - Podcast Recording Transcript.pdf` supplies speaker labels and source wording.
4. `2014_B2_Fact_Line_Deep_Analysis.md` supplies the Task A/C relevance audit and the warning that the provided transcript omitted the definition exchange.
5. `Paper_3_Super_Curation_Golden_Manual_2025_B2_v8.2_2026-11-05.pdf` supplies the continuous-playback, single-owner, authentic-textarea, learner-note-preservation and real-media test requirements.
6. The 2025 Stage 3 annotated reference supplies the established visual interaction model. Its 2025 answers and timestamps were not reused.

## Logged source discrepancy

The supplied five-page speaker-labelled transcript jumps from Freeman’s introduction directly to Wendy’s “Yes, snakes…”. The actual MP3 and the existing timed transcript contain a definition exchange at `448.01–476.98`, including Neelay’s definition, the dog/cat contrast, and the snake example. Stage 3 labels turns 16–20 as `audio-backed-repair`; it does not misattribute them to the PDF.

The PDF also contains a visible speaker-label anomaly before “But I expect there’s more than that, right, Wendy?” The actual dialogue context and timed sequence establish Freeman as the speaker. This is corrected in the runtime transcript and documented here.

## Printed field mapping

| Printed textarea | Cue count | Task route | Notes |
|---|---:|---|---|
| `3-1` Exotic pets — Definition | 1 | Listening-only | Complete definition exchange; not writing evidence |
| `3-2` Reasons to have an exotic pet | 4 | Listening-only | Unusual, impress friends, learn something new, beautiful |
| `3-3` Examples of exotic pets in Hong Kong | 4 | Listening-only | Wolf spider, small pigs, frogs/turtles, sugar gliders with space warning |
| `3-4` Email 1 | 2 | Listening-only | Some snakes legal; feeding and pet-shop help |
| `3-5` Email 2 | 4 | Task A | Like animals, communication, handling animals, clinical duties/taking blood |
| `3-6` Advice for exotic pet owners | 5 | Task C | No release, return shop, contact hospital, free Orphan Programme, 10 years |

No podcast material is routed to Task B.

## Transcript language policy

No complete, source-verifiable, line-aligned Traditional Chinese transcript was available. The UI therefore exposes English source text and Traditional Chinese teaching explanations, while the Chinese-transcript control is disabled with an explicit “not provided” label. No translation is fabricated.

## Runtime ownership

`super-curation-v2.js` is the single Stage 3 media-state owner. It controls the audio element, continuous cue boundaries, replay/next behavior, transcript projection, generated-note transactions, learner-text preservation, playback-rate state, persistence and restoration. No interval timer or second player owns cue boundaries.

