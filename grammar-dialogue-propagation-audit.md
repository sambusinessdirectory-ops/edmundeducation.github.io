# Grammar dialogue propagation — 5 November 2026

Scope: migrate five existing curation guides to the accepted Indefinite Pronouns composition. Existing exercise banks, answer keys and progress keys are retained. This is not a new independent editorial audit of all historical exercises.

## Coverage

| Guide | Cards | Caption source |
|---|---:|---|
| Tense | 61 | Existing rule-specific check field |
| Articles | 66 | Explicit notes keyed to source rules 1–66 |
| Advanced Articles | 31 | Explicit notes keyed to source rules 67–97 |
| So / So that / So as to | 30 | Final teaching paragraphs plus reviewed list-ending notes |
| Modal verbs | 42 | Final teaching paragraphs plus note for rule 39 |
| Total | 230 | No empty or generic greeting captions |

## Manual checklist

- [x] Original rule IDs, chapter order, routes and source paragraphs preserved.
- [x] Selectable HTML teaching text, approved green board, cream caption and Eddy label.
- [x] Current approved 33-pose cycle retained; manual describes an older 32-pose version.
- [x] Rule-specific Traditional Chinese notes and separate bright/dark emphasis palettes.
- [x] Portrait follows actual caption top with reference 10px seam overlap.
- [x] Desktop aside placement only on measured text collision.
- [x] Narrow vertical reserve and content-sized board growth; no truncating height cap.
- [x] Layout reruns on opening, font readiness, viewport changes and explanation expansion.
- [x] Tables preserve English words with accessible horizontal scrolling.
- [x] Captions fully visible without inner scrolling.
- [x] Existing checkpoint handlers and exercise links retained and tested.
- [x] All 230 cards checked at 390, 768, 1024 and 1440 pixels, including expanded explanations: zero detected text/portrait collision, caption overlap, clipping, empty notes, missing artwork or page-width overflow.
- [x] Desktop and narrow screenshots inspected; mobile grid overflow and broken inline highlight wrapping repaired.
- [x] Tense extension, Articles, Advanced Articles, new-curation and 33-pose regression checks passed.
- [x] New content-preservation and interaction test: tools/test-grammar-dialogue-propagation.mjs.
- [ ] Public deployment and all five live routes verified; final release gate.

## Defects repaired

Two consecutive introductory paragraphs could both become the focus, losing one during composition. The renderer now keeps a single focus and preserves subsequent paragraphs. Fixed-height boards now grow with content. Highlight spans no longer inherit block display from translations. Closed details and clipped table columns no longer cause false portrait collisions. The Articles grid uses minmax(0,1fr) to avoid phone overflow. Summary controls are excluded from chalk decoration to prevent text inheriting icon rotation.

## Verification limits

Browser checks used Chromium with actual page assets. The login panel was hidden locally for inspection without changing accounts or stored progress. Physical devices and independent re-solving of every historical exercise are outside this design migration. No claim of either is made.
