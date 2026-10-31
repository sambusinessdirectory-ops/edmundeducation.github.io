# IELTS Chart Teaching — homepage card 79

Entry: `/ielts-chart-teaching.html`. Browser-local teaching workspace; no backend or account changes.

The first lesson reconstructs the user's T1-005 electricity chart: 10 countries, production and consumption in billion kWh, 2014. Data lives in `data.mjs`. Bars share a zero baseline and a 6,000 maximum scale. Consumption retains hatching when coloured.

Each bar, value, country, rank, chart heading, axis label and legend can receive one of five named colour groups. Names and marks persist in localStorage in this browser. Erasing, clearing and a 50-step undo are supported. Calculator selection is separate from colouring and is not persisted. A bar and its number represent the same operand. Values are ordered by selection; editable operations run left to right, shown explicitly with parentheses. Manual operands support calculations such as a ratio multiplied by 100. Division by zero and non-finite results show an error; output is formatted to six decimal places.

Checks:
- `node tools/test-ielts-chart-teaching.mjs`
- Serve the repo on localhost:8799, then `node tools/test-ielts-chart-teaching-browser.cjs` (uses bundled Playwright).

The browser check covers actual homepage card numbering, all values, Germany's reversed comparison, persistence, undo, keyboard activation, calculator editing, division by zero and mobile overflow. Mobile uses a horizontally scrollable chart to preserve proportions and legibility.
