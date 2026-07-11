# Writing Practice Learning Content: Golden Design Specification

## 1. Status and authority

`Model Essay 9 - IELTS - Advantage / Disadvantage` is the golden standard for every model-essay learning tab in the Writing Practice System.

This specification governs:

- visual hierarchy;
- card segmentation;
- bilingual headings;
- colour sequencing;
- term, excerpt, example and explanation formatting;
- red emphasis;
- content-density limits;
- browser validation; and
- acceptance criteria for future essay imports.

Content completeness and visual parity are separate requirements. An import is not complete merely because all source words are present.

## 2. Why Essay 19 originally looked wrong

Essay 19 had been made content-complete, but the imported material was stored in a few oversized blocks:

| Tab | Essay 9 golden hierarchy | Essay 19 before redesign |
|---|---:|---:|
| Thematic vocabulary | 6 topic cards | 1 card containing 90 units |
| Verbs | 1 chip overview + 1 detailed card | 2 cards, but no chip overview and numbered report formatting |
| Adjectives/adverbs | 1 chip overview + 1 detailed card | 1 card containing overview and all details |
| Collocations | 1 grouped overview + 1 detailed card | Overview split into 43 small cards |
| Grammar | 1 grammar card with one overview unit and numbered structures | 1 card, but with duplicate internal headings and extra structural fragments |
| Logical reasoning | 5 coloured argument-stage cards | 2 very large cards |
| Literary devices | 6 rhetorical-family cards | 1 purple card |

The renderer was working correctly. The input hierarchy was wrong. A `learning-block` is not merely a container: it is a semantic section with its own colour, bilingual title and visual rhythm.

## 3. Global page composition

### 3.1 Tab navigation

- Tabs are rounded white pills.
- The active tab is dark blue with white lettering.
- Chinese is the primary label; English appears beneath it in smaller type.
- Tabs wrap naturally rather than forcing horizontal overflow.

### 3.2 Learning-content column

- Maximum width: `1080px`.
- Centred horizontally.
- Vertical gap between major cards: `22px`.
- No single card should represent several unrelated semantic categories.

### 3.3 Major learning card

Every major section uses `.learning-block`:

- `18px` corner radius;
- soft translucent tinted background;
- an `8px` vertical accent stripe on the left;
- subtle border and shadow;
- clipped overflow so the header and body form one object.

The accent is semantic, not decorative. It helps students distinguish topic families and argument stages.

### 3.4 Bilingual card header

Every block header contains:

1. a concise English title;
2. the Chinese title directly beneath it;
3. no words such as “Complete”, “Imported”, “PDF”, or implementation notes.

Typography:

- English heading: `clamp(19px, 1.6vw, 26px)`, weight `950`;
- Chinese subtitle: `0.68em`, weight `850`;
- dark navy heading colour;
- semi-transparent white header background;
- clear bottom divider.

### 3.5 Inner learning unit

Each concept is a `.learning-unit`:

- white translucent background;
- `14px` radius;
- `13px 15px` padding;
- `7px` internal gap;
- one concept, pattern, chain or device per unit.

Do not put an entire PDF page or an entire learning tab into one inner unit.

## 4. Colour system

Use only the established tones:

| Tone | Accent | Background | Typical role |
|---|---|---|---|
| Blue | `#2563eb` | pale blue | introduction, grammar, core rules |
| Green | `#059669` | pale green | benefits, solutions, verb overview |
| Cyan | `#0891b2` | pale cyan | belonging, individual action, supporting categories |
| Purple | `#7c3aed` | pale violet | modifiers, figurative language |
| Orange | `#ea580c` | pale orange | disadvantages, causes, collocation overview |
| Red | `#dc2626` | pale red | pressure, cost, negative consequences |
| Gold | `#ca8a04` | pale gold | argument language, detailed collocations, high-value phrases |

Adjacent blocks should normally change tone. Repeating one colour for an entire long tab removes the navigational benefit of the card system.

## 5. Tab-specific design grammar

### 5.1 Thematic vocabulary

Golden pattern:

- one major block per semantic category;
- 5-10 compact term units per block;
- bilingual category heading;
- alternating meaningful tones;
- each unit contains:
  1. `term = Chinese meaning`;
  2. `Example: ...`;
  3. Chinese translation.

The term or target phrase must be highlighted red inside the example. If exact matching fails, the complete example is highlighted rather than silently showing no emphasis.

Essay 19 now uses nine semantic cards:

1. Work-Life Balance / Personal Life - blue;
2. Workplace Expectations / Job Demands - green;
3. Boundaries / Separation Between Work and Life - cyan;
4. Technology / Constant Connectivity - purple;
5. Financial Pressure / Economic Causes - orange;
6. Health / Efficiency / Productivity - red;
7. Employer Solutions - green;
8. Individual Solutions / Time Management - cyan;
9. Argument / Essay Vocabulary - gold.

### 5.2 Verbs

Golden pattern:

- Block 1: green `Verbs Overview / 動詞概覽`;
- overview rendered as short chips, one phrase per line;
- Block 2: blue `Verbs and Verb Phrases / 動詞和動詞短語`;
- one unit per verb phrase;
- no numbered report headings in the detailed card;
- term first, essay excerpt second, Chinese support and student imitation after it;
- the phrase is red-highlighted in the excerpt or student example.

### 5.3 Adjectives and adverbs

Golden pattern:

- Block 1: purple overview;
- two chip groups: `Adjectives 形容詞` and `Adverbs 副詞`;
- Block 2: cyan detailed analysis;
- two labelled sections followed by compact term/example/translation units;
- never combine the overview and all detailed entries in one major card.

### 5.4 Collocations

Golden pattern:

- Block 1: orange collocation overview;
- one inner overview unit per semantic family;
- collocation lines remain together inside their family; they are not separated into dozens of individual overview cards;
- Block 2: gold detailed analysis;
- one numbered unit per collocation;
- standard order:
  1. numbered pair heading;
  2. `Collocation:`;
  3. `Meaning:`;
  4. `In the essay:` when available;
  5. `Student example:`;
  6. Chinese translation.

### 5.5 Grammar and sentence structures

Golden pattern:

- one blue major block;
- exact heading: `Grammar and Sentence Structures / 語法與句式分析`;
- first inner unit contains V1, V2, V3 and V-ing definitions plus the overview label;
- every grammar pattern after that is a separate numbered unit;
- the pattern is presented as a green capsule;
- the essay excerpt is placed in a pale blue row with red emphasis;
- explanations and student examples stay inside the same pattern unit;
- duplicate internal copies of the block title are prohibited.

### 5.6 Logical reasoning

Golden pattern:

- one major card per argument stage or logic chain;
- Chinese title first and English subtitle second;
- causal chains use repeated arrow rows;
- English and Chinese steps alternate;
- example vocabulary appears in a distinct examples row;
- analytical commentary remains in the same card but in a separate unit;
- negative chains use orange or red; solutions use green or cyan.

Essay structure and memorisable phrases may follow the reasoning cards, but they must use the same card grammar rather than one large appendix.

### 5.7 Literary and rhetorical devices

Golden pattern:

- one major card per device family;
- family title is the block header, not a line inside a generic container;
- one inner unit per device;
- each device unit follows:
  1. device name;
  2. essay phrase;
  3. Chinese translation;
  4. `Device:` classification;
  5. reason, use and/or effect;
  6. Chinese explanation;
- the essay phrase is red-highlighted;
- recognised device headings must include metaphor, imagery, concrete examples, contrast, lexical repetition, balanced responsibility and evaluative language.

Essay 19 now uses:

- purple Figurative Language;
- cyan Imagery-Based Devices;
- orange Contrast-Based Devices;
- green Rhetorical Devices;
- blue Tone and Style Devices.

## 6. Formatting tokens used by the renderer

The content strings form a small formatting language. These prefixes are contracts:

| Prefix or shape | Rendering |
|---|---|
| `term = meaning` | term row, often compact |
| `Example:` | example row with red target emphasis |
| `Excerpt:` | essay-excerpt row with red target emphasis |
| `In the essay:` | treated as an excerpt |
| `Student example:` | secondary example row |
| `1. ...` | numbered analysis heading |
| `→ ...` | logic-chain arrow row |
| `推理路線`, `核心概念`, `邏輯鏈...` | coloured label pill |
| `Function 功能：`, `Key sentence:`, `Why it works:` | coloured structure label |
| Chinese-only parenthetical line | indented Chinese support row |

New content must follow these tokens exactly. Plain paragraphs do not automatically receive the golden formatting.

## 7. Red-emphasis rules

Red emphasis identifies the precise reusable language, not arbitrary decoration.

Priority order:

1. explicit essay excerpt;
2. collocation or verb phrase;
3. vocabulary term inside an example;
4. rhetorical phrase being analysed;
5. full example only when the intended substring cannot be matched safely.

Requirements:

- every thematic example has at least one red mark;
- every verb entry has a highlighted excerpt or highlighted phrase;
- every detailed collocation highlights the collocation in an excerpt, label or example;
- every grammar structure has an excerpt and visible emphasis;
- every literary-device unit highlights the analysed phrase;
- highlights must never depend only on an English/Chinese heading accidentally matching the sentence.

## 8. Content-density rules

- A semantic category must become a major block.
- A single major block should not contain several unrelated PDF chapters.
- An overview list of short items becomes chips.
- Detailed vocabulary becomes compact term units.
- Detailed numbered analysis remains one full-width unit per item.
- A category heading must never be left as an ordinary line inside a parent block when it can serve as the block header.
- Internal headings duplicated by the major block header must be removed.

## 9. Required import workflow

1. Inventory the source document by page and category.
2. Record expected counts before editing.
3. Map each source category to a golden-standard block.
4. Choose a semantic tone for every block.
5. Convert overview lists to chips.
6. Convert every detailed item to the correct unit template.
7. Add explicit `Example:`, `Excerpt:` or `In the essay:` prefixes.
8. Split logic into stages and device analysis into families.
9. Remove duplicate internal section headings.
10. Validate item counts against the source.
11. Render every tab in a browser.
12. Compare block count, title order, tone order, unit count and highlight coverage with the golden essay.
13. Test desktop and narrow viewport layouts.
14. Confirm zero browser-console errors.
15. Confirm Essay 9 data and unrelated systems are unchanged.

## 10. Definition of done

An essay import is complete only when all conditions pass:

- all source items are present;
- block hierarchy follows this specification;
- headings are bilingual and concise;
- overview chips render correctly;
- detailed items use the correct unit type;
- colour tones vary by semantic section;
- all required red highlights render;
- there are no duplicate headings;
- the first and last item of every tab were checked;
- desktop and mobile layouts were checked;
- browser console has no errors;
- `git diff --check` passes;
- the golden essay remains unchanged.

## 11. Anti-patterns

Never repeat these failures:

- importing a complete PDF into one giant block;
- using “Complete ...” as a user-facing title;
- treating category names as ordinary body lines;
- making every overview item its own card;
- retaining PDF report numbering in a tab whose golden form uses term cards;
- relying on plain text without renderer prefixes;
- declaring success after checking only that the tab opens;
- measuring content count but not visual hierarchy;
- measuring red marks globally without checking coverage by unit.

## 12. Golden comparison checklist

For every future essay, answer yes to all:

- Does each tab have the same kind of block hierarchy as Essay 9?
- Are bilingual titles in the block header?
- Are the accent colours semantically varied?
- Are overview lists chips where Essay 9 uses chips?
- Are term entries compact cards?
- Are grammar entries numbered full-width cards?
- Are logic chains separated by argument stage?
- Are literary devices separated by family and by device?
- Does every intended phrase receive red emphasis?
- Does the page feel scannable before the student begins reading?

