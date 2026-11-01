# IELTS Chart Teaching — homepage card 79

Entry: `/ielts-chart-teaching.html`. Browser-local teaching workspace; no backend or account changes.

The first lesson reconstructs the user's T1-005 electricity chart: 10 countries, production and consumption in billion kWh, 2014. Data lives in `data.mjs`. Bars share a zero baseline and a 6,000 maximum scale. Consumption retains hatching when coloured.

Each bar, value, country, rank, chart heading, axis label and legend can belong to multiple of five named colour groups. The first group supplies the fill; additional groups add coloured glow outlines. Clicking an active group toggles only that membership. Older single-group browser saves migrate without loss. Names and marks persist in localStorage in this browser. Erasing, clearing and a 50-step undo are supported. Calculator selection is separate from colouring and is not persisted. A bar and its number represent the same operand. Values are ordered by selection; editable operations run left to right, shown explicitly with parentheses. Manual operands support calculations such as a ratio multiplied by 100. Division by zero and non-finite results show an error; output is formatted to six decimal places.

Checks:
- `node tools/test-ielts-chart-teaching.mjs`
- Serve the repo on localhost:8799, then `node tools/test-ielts-chart-teaching-browser.cjs` (uses bundled Playwright).

The browser check covers actual homepage card numbering, all values, Germany's reversed comparison, persistence, undo, keyboard activation, calculator editing, division by zero and mobile overflow. Mobile uses a horizontally scrollable chart to preserve proportions and legibility.

Years in the title and chart heading share a clickable year annotation. A dialog offers Past tense, Present tense, Future tense, Present perfect and Past perfect. The selected tense appears beside every occurrence of that year, persists with colour marks, and supports removal, erase and undo.

Observation and Overview each support arbitrary editable rows, adding/removing rows and browser-local autosave. Notes are independent from colour clearing and calculator clearing.

Organization provides a separate pick-data mode. Clicking a bar or value toggles that datum in an ordered paragraph plan. Desktop drag/drop, touch handles, and keyboard-friendly up/down buttons reorder entries; ordering persists in browser storage independently of calculations and colour groups.

The searchable vocabulary library imports 611 vocabulary, phrase, example and usage entries in 21 scenarios from the user-provided 110-page Skills Overview Book 1. It includes source page references and all extracted page text and 123 tables. Mistake examples are labelled and cannot be inserted into notes. Search supports English and Chinese; useful entries can be inserted into Observation or Overview. The panel is draggable and fits mobile screens.

Rebuild with `python3 tools/build-ielts-chart-vocabulary.py`; the checked-in extraction under `tools/content-sources/ielts-chart-vocabulary/` preserves provenance. The builder corrects page 77 reading order. Validate with `node tools/test-ielts-vocabulary.mjs` and `node tools/test-ielts-vocabulary-browser.cjs` (local server required).

## Full Task 1 catalogue

The lesson selector reads the 60-entry `ielts-writing-preview/task1-diagrams.json` catalogue and uses the same original images as the question preview. T1-005 retains its exact reconstructed electricity bars. For every other chart, students can click any location in the original visual to create a named point, optionally record a value shown by the source, and then use colour groups, calculation, Observation, Overview, and Organization on that point. Points can be edited, moved using percentage coordinates, or deleted. Keyboard users can add points with the button below the image. All work is saved independently for each question and student in browser localStorage. Numeric entry is optional so maps and process steps can also be grouped and ordered.

This approach keeps the source visuals faithful and permits any feature to be compartmentalized. It does not claim that raster pixels contain machine-readable exact values; students enter values only when the source provides them.

Catalogue browser check: serve the repository locally, then run `PORT=8799 node tools/test-ielts-chart-catalog-browser.cjs`. The check mocks only the student login gate and verifies all 60 entries, representative images from each category, point interactions, persistence, and mobile layout.
