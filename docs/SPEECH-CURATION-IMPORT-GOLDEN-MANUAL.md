# The Golden Manual: Speech Curation Import and Learning-Reader SOP

**Edition:** 1.0  
**Reference specimen:** Winston Churchill, *The Council of Europe, 1949*  
**System:** EdmundEducation / 名人・偉人演講精選  
**Evidence cut-off:** 6 October 2026, Hong Kong time  
**Status:** Operational editorial and design standard; future-speech engineering work is explicitly flagged  
**Maintainer:** Speech curation editor and site maintainer  
**Document ID:** SC-GM-001  
**Applies to:** New speech curation lessons, their archival galleries, bilingual reading notes, search, reader state, and any later companion exercises.

> **Interpretation key.** **Observed** means verified in the current Churchill code or public source. **Requested** means explicitly specified by the owner in the project conversation. **Normative** means a forward-looking rule of this manual, derived from those requirements. **Open** means a decision or verification still required. A request is never silently described as implemented. A numeric value marked *reference value* describes the current page; a *target* is a quality gate for the next import, not a claim about an existing feature.

## 00. Executive operating contract

This manual exists so an editor, historian, designer, developer, and reviewer can create a new speech lesson without rediscovering the Churchill project's decisions. Its first layer records the Churchill implementation exactly enough to reproduce its look and behavior. Its second layer extracts transferable principles that preserve the experience without copying Churchill-specific dates, copy, section counts, colors, or code constants blindly. The output is a source-grounded, readable speech, with faithful Traditional Chinese support, concise language-and-idea curation, optional depth, visible reading progress, searchable access, and clearly attributed documentary imagery.

The reader must always know **what was said**, **who said it**, **when and where**, **which words belong to the historical speech**, **which words are editorial explanation**, **what an image actually documents**, and **what action is available next**. The interface should feel like entering an archival reading room: paper, restrained blue-teal navigation, warm historical materials, measured motion, and precise typographic hierarchy. Beauty is subordinate to legibility and truth. Decorative framing must never imply that an adjacent event is a photograph of the exact speech.

The current Churchill page is a **guided reader, not a scored exercise**. No default quiz, answer key, or automated grading is evidenced in the page. Sections 15-16 specify a future companion-exercise contract so the owner's requested exercise/answer/rationale standard is operational, but they must not be represented as live behavior until implemented and tested.

**Release gate:** An import is complete only after source verification, transcript alignment, bilingual review, note and example review, archival provenance review, visual and interaction QA on desktop/tablet/mobile, accessibility and reduced-motion checks, privacy/access checks, publication, and a live smoke test. Passing a build or deployment alone does not satisfy the gate.

## 01. Scope, roles, authority, and precedence

### 01.1 Inclusions and exclusions

Included: selecting and licensing a speech; documenting provenance; extracting the authentic text; segmenting speech lines and paragraphs; writing Traditional Chinese translation; preparing context cards; curating language, rhetoric, and ideas; writing examples and collocations; validating a structured lesson; sourcing the gallery; adapting the reader template; configuring protected storage, search, bookmarks and progress; reviewing visual design; publishing and maintaining a versioned record. A printable companion PDF or exercise pack may use the same content standards, but is a separate deliverable.

Excluded unless separately commissioned: inventing missing transcript passages, composing fictional archival captions, presenting generated images as documentary photographs, silently correcting a historical speaker's words, fabricating a recording or quotation, adding a new exam or score to an unscored reader, or sharing private lesson JSON as a public asset. System administration, general student provisioning, and cross-site deployment tooling have their own procedures; this manual records the speech-specific checkpoints.

### 01.2 Decision order

1. The owner's explicit instruction for this speech controls product behavior and style within lawful, technically possible bounds.
2. Primary transcript and institution/archive metadata control historical facts. A source error is documented rather than quietly inherited.
3. Verified code and database behavior control statements about what the current system does.
4. The reusable rules here control routine editorial and design decisions for new speeches.
5. If two sources disagree, identify both, record a decision with evidence, and do not publish an unsupported certainty.

### 01.3 Minimum roles and handoffs

**Source researcher** records authoritative transcript, event date and archival claims. **Bilingual editor** aligns each English unit with Chinese and checks nuance. **Curation editor** selects teachable features and writes notes, examples and collocations. **Designer** maintains the reading-room system and tests real layouts. **Developer** validates schema, access, rendering, interaction and data migration. **Independent reviewer** checks at least a representative sample and every high-risk fact. One person may perform several roles; the *review action* still must be distinct from the draft action, even if performed in a later pass.

The handoff object is a versioned speech manifest plus the content payload and QA record. Every source claim must have a URL or archival identifier, access date, claim type, and confidence. Every editorial correction must be traceable to a specific line or item. A reviewer should be able to reconstruct why a date, phrase, translation, image, or UI behavior appears.

## 02. Churchill reference specimen: exact observable architecture

### 02.1 Current entry and content sequence

The library entry is at `speech-curation.html`; the lesson is at `speech-curation-churchill.html`. The lesson page begins with the shared system header and blue breadcrumb: archive / Winston Churchill filtered archive / current title. The hero reads **WINSTON CHURCHILL · 1949** over **The Council of** / **Europe, 1949**, with **歐洲理事會演說** and a route to the complete address. A staged loading panel appears while the private lesson and saved marks load. A speech-wide search shelf follows, then **先認識這篇演說**, then **偉人真蹟**, then **演說英文全文**, then **逐句細讀**. This ordering is deliberate: identity and search; context; documentary evidence; uninterrupted original text; sentence-level exploration.

The context section has five cards in the importer: **歷史背景**, **演說的重要性**, **演說之後**, **語言與修辭**, and **人物與事件**. These are *reference categories*, not a universal requirement that every speech have exactly five cards. The reader constructs cards from introduction data and supplies matching contextual imagery. Context must explain the event before it interprets the language. The owner removed the filler line **選一冊打開導讀；內容會隨閱讀逐段顯現。**; do not restore it in future templates.

The present importer expects 222 annotation blocks in its source DOCX, discards a duplicated complete **We must feel our way forward** block, and emits **221 lines**. It verifies the first line begins **Mr. President** and the last ends **worst of misery.**. The complete address renderer uses paragraph starts `[0,10,22,35,50,61,74,86,106,128,141,145,153,170,177,187,206]` and seven navigation chapter starts `1,11,36,87,107,129,207`. These numbers describe only this edition. A future speech must derive its own line, paragraph and chapter map; do not paste these values into a new lesson.

Each line has `english`, `chinese`, `notes[]`, and `collocations`. The current note renderer parses a title before the first early colon, a description, and optional `Examples:` pairs in full-width Chinese parentheses. It renders numbered idea blocks, an English title, the bracketed Chinese on its own line, prose, example table, and a vocabulary/collocation table. This legacy string convention is fragile. The target future schema should represent those fields explicitly and test every render path (section 11).

### 02.2 Two reading modes and their relationship

**Complete address:** The original text is presented in flowing paragraphs on textured paper. Individual English sentence spans are keyboard-focusable and clickable. Selecting one places its curation immediately *after that span*, on the next line. The current line is highlighted. Opening a different sentence closes the earlier note. If the expanded note grows and the original sentence scrolls above the progress ruler while the note is still visible, an unobtrusive copy of the original sentence appears directly below the progress ruler. The label **正在導讀的原句** was explicitly removed; the sentence alone supplies context. The copy leaves when the original line is visible again or the note leaves view. It is context, not a second transcript.

**逐句細讀:** The same underlying lines appear as numbered raised-paper cards within chapter sections. Opening a card reveals its Chinese translation and the same curated content. The translation can be shown for all cards on demand. Each line and each idea can be bookmarked; viewed lines are marked. Search filters English and Chinese line text; a speech-wide search near the top also searches notes and jumps to a line. The same speech data, index and curation should remain aligned between modes. An editor cannot fix one mode and leave the other with different wording.

**Floating paper toolbar:** In the complete address, the font switches, reading guide lines, show/hide full Chinese translation, **逐句細讀** jump, progress ruler, banker lamp and pinned source sentence remain grouped in the sticky textured bar. The owner explicitly asked that 逐句細讀 join the floating bar. The chapter rail must sit beneath its actual height; the current code uses a `ResizeObserver`-driven CSS height variable rather than assuming a fixed bar height. At narrow widths, navigation becomes a separate reachable control.

### 02.3 Reader state, access and loading

The private lesson is returned through a session-checked RPC. The current page requests `speech_curation_lesson('churchill-1949')`, renders content, requests `speech_curation_reader_state`, restores marks, then exposes the reader. The loading panel reports staged progress (about 10%, 48%, 78%, 100% at milestones) with a moving bar. These values are **phase indicators**, not byte-level transfer measurements; copy must not imply exact network completion. Session storage keeps an optional last line, while persistent marks live in the private database. Account-linked students should see the same marks from speech login and mapped student login. Invalid/expired access must yield a clear route back to login and must not expose private content.

The private `reader_marks` table currently constrains line indices to **0-220**, idea indices to **0-30**, and mark kinds to `view`, `line`, `idea`. Its RPC validates against the stored line and note counts. This fixed line check blocks longer future speeches even though the RPC has a dynamic count check. The lesson RPC also explicitly rejects any slug other than `churchill-1949`. The source importer hard-codes Churchill's heading, source structure, and 221-line total. These are **migration tasks, not reusable import rules** (section 12).

## 03. Churchill visual reference: documented tokens and spatial grammar

### 03.1 Design intent and material hierarchy

The page combines a quiet archive with a practical educational interface. The outer canvas is pale parchment/blue-grey, not a saturated theatrical backdrop. The hero is a deep blue-teal archival banner with warm gold type accents; the title is exceptionally large Georgia-style serif. The complete address uses a paper texture and strong dark ink. The reader cards are white-to-ivory raised sheets with a cool-teal edge. The gallery has a pale brown leather header that slides open onto dark burgundy velvet. Ornate dark walnut frames distinguish historical items from ordinary content cards. These materials should read as *layers*: archive room → paper → evidence wall, while blue-teal continues to identify action and navigation.

Reference CSS values, measured in the 6 October 2026 stylesheet: body base `#f4f1e8`, ink `#193b45`, teal interaction around `#00839c` / `#006d87`, hero gradient `#102838` → `#244e59` → `#4d6170`, warm gold `#e8c590` / `#e7be80`, gallery leather border `#b08a5e`, velvet border `#7b3d43`, idea excerpt red `#a73529`, idea title brown `#8b4c2b`, soft card edge `#afc8c8`. These are **reference values**, not permission to hard-code the entire site in a new speech. Keep the relationships: dark ink on pale paper; bright action blue on adequate contrast; warm gold for archival or completion accents; red only for the first English excerpt in explanation; burgundy behind documentary frames.

The hero title uses `Georgia, "Noto Serif TC", serif`, weight 700, `clamp(2.8rem,6.4vw,6.4rem)` and 1.06 line height. Section headings use the same literary family around `clamp(2rem,3.4vw,3.15rem)`. Body controls use Inter / Helvetica Neue / Arial / PingFang TC. In the complete address the default is **Courier New Bold**; Courier regular and Times New Roman remain optional. The bold default was a direct owner refinement; do not reset it while adding a new font. Chinese explanations remain a clean UI sans face rather than imitating typewriter text. The reading line uses generous leading near 1.85; title typography is emphatic, body typography restrained.

Reference container values: main reader shell maximum width approximately **1500px**; hero radius **28px**; page gutters respond to viewport width; context cards auto-fit at about **270px** minimum; gallery items use two balanced columns on wide screens; mobile collapses them to one column. The complete-address floating bar is a narrower centered band (about **980px** maximum). Reference is responsive behavior, not a pixel-perfect fixed screenshot: no horizontal overflow at ordinary phone widths, and neither text nor controls may be clipped by the sticky bar.

### 03.2 Spacing, borders, shadows and rules

Cards and notes must look intentional, not flat blocks. The final line-card treatment uses a light raised-paper gradient, a visible cool left edge (5px when refined), an ivory highlight, multiple restrained shadows, and a tiny top-right corner rule. Hover lifts by roughly 3px; open state strengthens the teal edge and shadow. The user specifically said the earlier white blocks still looked too flat, so merely adding a barely visible shadow is inadequate. The effect should remain subtle: it must not suggest a clickable card where no action exists, obscure text, or make dozens of consecutive cards visually noisy.

The full-address paper has warm, repeated texture and optional horizontal reading rules. The rules are a reading aid, toggleable and correctly spaced for either Courier or Times. The selected sentence has a restrained warm highlight and dotted underline. Expanded curation is an ivory inset panel with teal left rule, thin warm outline and layered shadow. Inside, individual note blocks are separated and numbered. English example cells use pale yellow; Chinese cells remain white or near-white; table headers are cool pale blue-grey with clear borders. Table row height grows to fit content; no clipped translation, forced equal line count, or decorative shading that weakens contrast.

The gallery's walnut frame is a generated **frame asset**, not a generated historical image. Current CSS uses a `border-image` with thick responsive width about 28-52px and a deep shadow; the inner archival photograph is fitted with `object-fit:contain`, never cropped to imply a different event. Burgundy velvet is a background texture beneath the frames; descriptions sit in darker burgundy caption cards with ivory text and gold links. The leather header and reveal affordance are distinct from an illustrated closed book: the owner rejected the book cover and asked to slide the leather down to reveal the gallery. The entire row order on wide screens is **image right / left / right / left**. On mobile, image then caption in one column takes priority over side alternation.

### 03.3 Motion and progress

The owner rejected instant pop-ins. Opening curation should animate height, opacity and a small vertical offset over roughly **0.5-0.6 seconds** in the current page, with gentle sequential arrival of idea blocks; collapsing should be comparably smooth. The gallery reveal takes about **0.85 seconds**. The pinned sentence moves into the toolbar in about **0.38 seconds**. Motion must support reading continuity: no large bounce, abrupt scroll jump, or animation that repeats every time the page rerenders. Respect `prefers-reduced-motion: reduce` by removing nonessential transitions and still exposing the final content. `aria-expanded`, focus and inert/hidden state must match the visual state.

The reading progress ruler fills in blue-teal. At **100%** the banker lamp emits a gentle warm glow and pulsing aura; before completion, it does not glow. This is a low-key completion cue, not a flashing reward. The percent text remains visible. The load bar is separate from reading progress and never masquerades as a score. A newly imported speech needs its own reliable progress boundary logic; reaching 100% must be reproducible by normal reading/scrolling rather than requiring an invisible pixel-perfect position.

### 03.4 Contrast and typography acceptance

At 100%, 125%, 150% and 200% browser text scaling, all headings, notes, controls, captions and tables must remain readable. Body text and captions should meet **at least 4.5:1** WCAG-style contrast for ordinary text; large bold headings at least **3:1**. These are *manual targets*, not audited claims about every current pixel. Check the actual textured composite, not only the flat CSS color: photo, parchment and leather can locally reduce contrast. If texture competes with characters, add a translucent solid reading surface or reduce texture contrast. Never use pale gold for long paragraphs on pale paper or white over a light patch of photography.

## 04. Documentary evidence and the Churchill gallery

### 04.1 Reference evidence map

The first gallery entry is the Council of Europe photograph captioned as Churchill addressing the Consultative Assembly on **17 August 1949**; this is the direct visual evidence for this speech. The second is CVCE / Council of Europe imagery of Churchill seated with Frans van Cauwelaert and Mario Cingolani on **11 August 1949**, six days earlier, from the same assembly. The third is a Council of Europe photograph of Churchill addressing a crowd at **Place Kléber on 12 August 1949**, a different speech. The fourth is a British Pathé 1949 Strasbourg newsreel showing assembly and crowd scenes, but its record does not date *each shot* to 17 August. The captions must state these distinctions plainly and compactly. The user explicitly asked to remove a long defensive sentence about the newsreel not being a complete recording; the final concise caption states the actual limit without that cumbersome formula.

The current gallery has four entries and alternates right-left-right-left on wide screens. It is collapsed by default; the leather control reveals it with a smooth downward motion. Each item has a date/status eyebrow, a short factual Chinese title, a two- or three-sentence description, an external source link, and an image or embedded video in an ornate frame. Source names are visible. A local copy of the 11 August image was supplied by the owner after a third-party image hotlink failed; its archival link still identifies the source. A local file path is not itself provenance or license evidence.

The National Churchill Museum transcript page's body names **17 August 1949** and Strasbourg; its surrounding navigation labels the speech **11/17/1949**. Treat this as a recorded source inconsistency. The event date used in the lesson follows the body and the Council of Europe archival caption, not the navigation label. Log such conflicts for every future speech; never infer that a page's menu metadata is more accurate than the signed/date-bearing content or archive catalogue.

### 04.2 Evidence grades and image rules

**A - direct:** the institution/archive explicitly identifies the person, event and exact date/speech. **B - same event window:** the person and relevant assembly or venue are verified, but it is another day or an undated shot. **C - contextual:** place, document or era supports background but does not show the speaker delivering this speech. **D - decorative/generated:** design-only asset; must not be captioned as historic proof. Put A first. Label B and C in normal reader language and include actual dates. Do not upgrade a B/C image through suggestive composition, vague titles, or proximity to the A image. If only one A image exists, show one; do not stretch to a count by mislabelling others. Use generated images for frames/textures only, never as evidence of a historical event.

For each archival item record: stable URL, holding institution, catalogue title/ID, original caption, event date, image creation date if different, photographer/rights credit where available, precise claim supported, confidence grade, reuse status, local asset hash if stored, access date, alt text, and approved on-page caption. Where image rights are unclear, link to the institution rather than copying the image. Where hotlinking fails, acquire a permitted copy or use a source-linked document tile; never remove the citation to hide the issue. Test every image URL and video embed on the published origin.

## 05. Editorial standard for the original English speech

### 05.1 Source selection and transcript integrity

Choose the most authoritative complete text available: institutional archive, official transcript, library collection or speaker estate, then reputable secondary transcript. Prefer a source with stable URL and event metadata. Capture exact title, speaker, date, venue, occasion, language, original source URL and access date. Preserve the source's spelling, punctuation, capitalization and rhetorical repetition unless a demonstrable transcription error is documented. Distinguish the speaker's original wording from editorial headings, silent OCR correction and translation. Never silently modernize politically or historically uncomfortable language; explain where teaching context requires it.

Compare the beginning, middle and ending against a second source when available. Record whether a source is a full speech, excerpt, prepared text, contemporaneous report, reconstruction, or later publication. The 1949 museum page contains probable typographic anomalies; an import must not automatically treat every oddity as intentional speech. Create a discrepancy log with source snippets, candidate correction, rationale and reviewer decision. Do not alter quoted original solely to make modern grammar smoother. If the page will display a normalized reading text, preserve the diplomatic source text in the manifest and mark each change.

An actual speech should remain coherent as a whole. The complete-address reading mode must not be a stitched list of excerpts that omits transitions. Validate first/last paragraph, all major topic shifts, paragraph order and total word count. A segmentation count is a checksum for one edition, not proof of completeness by itself. For the Churchill edition, the importer checks 221 lines and endpoints; a reviewer must still compare paragraph sequence to the source.

### 05.2 Segmentation and alignment

Break at linguistic and teaching boundaries, balancing one meaningful idea against screen length. A "line" may be a sentence, clause or rhetorical fragment if the source's cadence warrants it. Never split inside a proper noun, a clause whose interpretation depends on its complement, or a quotation without a clear continuation marker. Preserve original order. Each line receives a stable ID independent of its display number; future edits should map old IDs or migrate marks. Paragraph boundaries and chapter starts are separately recorded. There is one English unit and one Chinese translation unit per line; no line may be left with a blank translation just because the English is short.

Segmenting a long rhetorical sentence into several visual lines may aid study but can weaken syntactic coherence. The complete-address mode therefore must reconstitute paragraph flow while allowing selection of the exact underlying line. Test a sample of long paragraphs to ensure clicking a line inserts its note immediately below it and does not destroy the surrounding reading order. Search results, bookmarks, progress and chapter boundaries must point to the same stable unit. Duplicated blocks from a source DOCX, as with **We must feel our way forward**, must be reconciled by source comparison, not removed merely because the strings are identical; an orator may intentionally repeat a phrase. In this reference, the *complete annotation block* was duplicated in the supplied document, while the speech did not repeat that whole block.

### 05.3 English style rules for editorial material

The historical transcript keeps its authentic lexical level. The **editorial** English (headings, example sentences, exercise instructions) should be concise, natural, specific and pedagogically direct. Prefer one teachable claim per sentence. Use a precise label such as **Content clause**, **Formal verb**, **Speech transition**, **Procedural urgency**, or **Institutional phrase**; avoid vague labels like "interesting language". A label is not a thesis paragraph. Do not fill a title with a whole explanation. Use British/Hong Kong English conventions consistently unless the source requires another form; preserve the source's own orthography in quotations. Define unfamiliar institutional terms before using them in instructions.

For an example sentence, keep the target structure visible, syntax correct, and context plausible. It should demonstrate transfer rather than restate the Churchill sentence with only one noun changed. Prefer normal lexical difficulty around upper-secondary English when explaining a hard original; do not add unnecessary C2 vocabulary to a note about a single phrase. Complex original vocabulary may be retained and explained in plain English/Chinese. Do not pretend a new example is a quotation from the speech. Avoid culturally obscure filler, implausible collocations, or examples that accidentally teach a different sense.

## 06. Traditional Chinese translation and bilingual quality

The audience-facing Chinese is **Traditional Chinese**, using natural Hong Kong educational phrasing where appropriate. Translate the proposition, logic, rhetorical force and historical register, not merely each English word in order. Preserve negation, modal force, contrast, condition, dates, institutional relationships and pronoun referents. If the English is an incomplete rhetorical fragment, use Chinese punctuation or a continuation marker to show it is a fragment; do not silently invent a complete claim. A formal Churchill clause may need dignified Chinese, but the *teaching explanation* should be simpler than the original speech and immediately comprehensible to a senior secondary reader.

Separate three bilingual layers: **translation** tells what the line says; **explanation** tells how wording or argument works; **example translation** tells what a new example means. Do not copy an explanation into the translation field. Do not make the Chinese longer than necessary by adding facts that the English does not say. Named entities receive consistent Traditional Chinese names with original English on first substantive mention if identification matters. Maintain a glossary for Council of Europe, Consultative Assembly, Committee of Ministers, European Court, Article 34, the Hague, Strasbourg, and any future speech-specific institution. Check terms against credible bilingual institutional usage when possible.

The Chinese title in brackets follows the English main-idea title on its **own line**, not dangling after it. The pattern is an English label, then `（繁體中文名稱）`; the body begins below. For example, **Procedural urgency / （程序迫切感）** is the title, while **這個短子句把時間壓力具體化。** is a separate explanation. Do not absorb the latter into the heading. An explanation that begins with an English quoted excerpt should show the first occurrence in red and 5% larger; if the same quote is repeated immediately in the source string, remove only the duplicate rendering. This is a typographic cue, not a license to rewrite the speech.

Chinese prose should be short, cohesive and specific. Prefer one explanatory paragraph of one to three sentences before examples. Explain a lexical or rhetorical mechanism and its effect in context; avoid empty praise such as "很有力量" without saying why. Use Chinese full-width punctuation consistently. Use accurate distinctions such as **法律條文**, **程序正當性**, **轉題**, **承諾**, **隱喻**, **語域** only where the mechanism actually fits. If a technical label is necessary, add a plain explanation. Review Chinese aloud for awkward literal calques and English-word order. Do not translate "you" or "we" without checking whom the speaker addresses in that passage.

## 07. Curation idea: unit structure and intellectual standard

Each note must have a **target span**, **main idea**, **short mechanism explanation**, **contextual effect**, and, where useful, **one or two transfer examples with Chinese translations**. An editor should be able to answer: Why was this span selected? What exactly is the learner meant to notice? Which words create the effect? Does the explanation help read this historical passage rather than generic English? What transferable expression or habit results? A note with only paraphrase belongs in translation, not curation.

Preferred sequence: first concrete language observation, then its meaning in the sentence, then its role in the broader argument. Example: `“Then there is...”` -> an unobtrusive transition to a new agenda item -> the speaker shifts from institutional powers to human rights. Distinguish a **language mechanism** from a **historical interpretation**; source or qualify the latter. Do not claim access to the speaker's private intention from one phrase. Use "creates", "signals", "frames" or "suggests" where evidence supports that level of interpretation. If a claim is disputed, identify the interpretive nature rather than presenting it as fact.

Title length target: **2-6 English words**, with a concise Traditional Chinese rendering; make an exception for a term of art that cannot be shortened safely. Body target: **25-80 Chinese characters per idea** for routine mechanisms, with longer notes only when historical context demands it. These are editorial targets, not automatic cutoffs. Example target: **one or two independent English sentences**, each paired with a complete Chinese translation. Too many notes under one short line create a wall that defeats reading; choose the most instructive insights. Some lines need no note beyond translation; the data model should permit zero notes without manufacturing filler. The current source happens to have notes attached throughout, but that is not a universal quota.

**Quotation discipline:** Quote the exact English words being discussed. Detect curly/straight quote variants and leading punctuation, but do not delete legitimate rhetorical repetition. The 2026 defect displayed `“the Hague”“the Hague”` and similar doubled excerpts. The rendering rule is: if a note begins with a quoted English span, show the first quote as a single visually highlighted excerpt, compare the next immediately adjacent quote after whitespace normalization, and suppress it only if text-identical. Keep surrounding Chinese intact. Never strip a second quotation elsewhere in a paragraph without semantic review.

**Examples and collocations:** Each example must instantiate the named mechanism and be grammatical. The Chinese translation must convey that example, not the speech line. Collocations must be attested or idiomatic, and meanings must fit the local sense. Avoid listing random synonyms. Table cells hold one expression/meaning pair; long entries wrap. If parsing fails, show a safe text fallback during review but fail publication until the data is normalized. Empty meaning cells, dangling separators or escaped quote codes are blockers.

## 08. Context section: research, sequence and writing

Context should equip the reader to understand the speech without replacing it. The Churchill reference categories can be generalized to: **before** (historical conditions), **occasion** (why this audience and institution), **stakes** (what the speech asks or changes), **after** (what followed, clearly distinguished from what the speaker knew then), and **people/terms/style** (only what is necessary for comprehension). A future speech may combine or split categories. Put dates and relationships where a reader needs them. Do not write an encyclopaedia before the speech; each card should have a clear question or purpose.

All context claims require a source in the internal manifest. External source links may be made visible to readers where helpful, but the internal record must always preserve them. Distinguish historical outcome from prediction or rhetoric. Never imply that the later existence of an institution proves a particular sentence directly caused it. Avoid teleological phrases such as "inevitably led to" unless a historian's source makes the causal argument. Keep a neutral, academically literate voice. In Chinese, write short paragraphs rather than dense textbook-style blocks. Use exact dates when verified; otherwise say "同年", "翌年" or "約" only as evidence warrants.

The five Churchill context images are editorial illustrations of categories, not proof of the 17 August event. Their alt text may be empty if decorative. Archival gallery items, by contrast, need factual alt text. Do not use a generated portrait in a context card in a way that suggests a genuine historical photograph. Whenever imagery has provenance significance, promote it to the gallery with a source and date.

## 09. Search, navigation, bookmarks and reading mechanics

The library search must help a reader identify which speech contains a selected phrase. Search title, speaker, description and, where access permits, transcript text. The individual lesson has an upper search across English, Chinese and notes, returning line hits with sentence numbers; the lower 逐句細讀 filter searches only English and Chinese lines in that list. These are separate purposes and should not be mislabeled. A selected result opens or scrolls to the matching line with the query still intelligible. An empty query restores the normal view. A zero-result state says what was searched and offers a way back. Search must not expose protected transcript content to unauthenticated visitors through a public index.

The blue breadcrumb path must allow return from an individual speech to the front archive and the speaker's filtered list. A link to a mere pathname that loses the speaker filter does not satisfy the reference. A full-address **逐句細讀** jump belongs in the floating bar and should land below any sticky header. Chapters must not overlap the floating bar as it wraps at intermediate widths. Search, bookmark, chapter and back navigation must work with keyboard focus and screen readers. Avoid focus loss when notes are inserted or removed.

Bookmark semantics: `view` is automatic exposure, `line` is a chosen saved line, `idea` is a chosen saved note. Do not conflate viewed with mastered. The current UI shows **已瀏覽** as a view marker; it is not a correctness claim. Server validation should check line and idea indices against the current lesson. A lesson revision that reorders lines must migrate marks by stable IDs or clearly document reset behavior. Saved state failure should not erase the visible note; present a non-alarming retry indicator if persistence is material to the feature. Account-bound state must never leak across students.

## 10. Accessibility and interaction requirements

Every interactive control has a visible focus state, discernible name and semantic button/link role. An expanding sentence has `aria-expanded`; its note's relationship should be announced or at least be adjacent in reading order. A collapsed gallery must be excluded from keyboard traversal (`inert` or equivalent) and accurately marked hidden; when opened, its links become reachable. Loading has status text and a progressbar label. Search results should announce count without reading a massive list on each keystroke. Images conveying evidence need alt text describing subject, event/date if known; purely decorative paper/leather/frame textures do not.

Animation must not be the only signal of state. Icons, text and selected styling show what happened. Respect reduced motion. On touch screens, targets should be at least approximately 44px high where practical, with sufficient separation. Check the sticky bar under system font enlargement and browser zoom, not only a fixed 100% desktop screenshot. The pinned source line must never cover curation, block search, or trap scroll. The line-level card's blue edge/raised treatment is supportive but its open/closed state must also be legible via text/icon and `aria-expanded`.

Do not force translation permanently on or permanently off. The owner has previously wanted a control to decline Chinese translation; here both complete address and line reader expose show/hide controls. Preserve reader choice in the current view and avoid hidden text still being read as visible by assistive technology. Do not present Chinese as an answer to a future scored exercise before the learner has attempted it unless that is the explicitly chosen supported mode.

## 11. Canonical import package and content schema

The current private payload shape is a compact JSON object with `title`, `speaker`, `source_url`, `introduction[]`, and `lines[]`, each line containing `english`, `chinese`, `notes[]`, `collocations`. This is the **observed legacy shape**. The next-import package should separate data from presentation and carry durable metadata. The specification below is a **normative target**, not a claim that today's RPC already accepts it:

```text
speech_id / slug             stable, unique, human-readable; never reused
edition_id                   increments when transcript alignment changes
title_original/title_display exact source title and editorial display title
speaker                      canonical name, aliases, authority URL
event                        date, time if known, venue, occasion, uncertainty
source[]                     transcript, translation, context, media sources
rights                       transcript/media reuse basis and restrictions
introduction[]               id, title_en?, title_zh, body_zh, citations[]
chapters[]                   id, first_line_id, title_zh, short_title_zh
paragraphs[]                 id, ordered line_ids
lines[]                      id, order, english_diplomatic, english_display,
                             chinese_traditional, notes[], collocations[]
notes[]                      id, target_quote, label_en, label_zh,
                             explanation_zh, contextual_effect_zh?,
                             examples[{english,chinese}], citations[]
collocations[]               expression, sense_zh, register?, source?
gallery[]                    id, medium, URL/local path, grade, exact date,
                             source, caption_zh, alt_zh, rights, order
search_text                  generated, access-controlled, not public leakage
review                       owner, reviewers, status, dates, decisions
```

Stable IDs should be opaque enough to survive display-number changes. Never use array index as the only durable identity for saved user marks. An edition revision affecting sentence boundaries must include a migration map from old to new IDs. Content validation checks that every paragraph references existing line IDs exactly once in source order; each chapter starts at a valid line; every line has nonblank English and Chinese; note quote appears in its target line after documented normalization; all example pairs have both languages; gallery captions have source IDs; URLs are syntactically valid; and no known duplicate annotation block remains. An empty notes array is valid; a missing translation is not.

The importer should be **source-format-adaptive**. The Churchill DOCX parser currently assumes positions 3, 6-8, 10, 13, 16 for introductions, detects groups by `Collocations 配詞:`, insists on 222 groups, removes one named duplicate, and outputs 221 lines. That should become a one-off migration adapter retained for audit, with a general intermediate review file. A new DOCX, PDF, HTML or TEI source requires its own extraction strategy plus the same normalized output schema. Never feed a new speech through Churchill's positional parser just because it happens to produce JSON. The editor must inspect extraction previews, source text, Unicode punctuation, tables, footnotes, headers/footers, and out-of-order text before upload.

**Import-stage artifacts:** (1) source manifest; (2) raw source capture or link and checksum; (3) discrepancy log; (4) normalized transcript with paragraph/line IDs; (5) translation and notes; (6) gallery provenance register; (7) JSON validation report; (8) preview screenshots/PDF; (9) reviewer sign-off; (10) release/rollback record. Keep private licensed content and credentials out of the public repository. Do not put a full restricted transcript in a public build artifact merely to simplify deployment.

## 12. Required engineering generalization before speech number two

**Blocking item E-01: generic lesson access.** `public.speech_curation_lesson` currently rejects any slug except `churchill-1949`. Change it to look up an approved published lesson by slug while retaining the existing authenticated-session checks and nonpublic private schema. Test authorized student, admin, expired session, inactive account, nonexistent slug, and unpublished lesson. Do not broaden access by granting direct `SELECT` on private lesson tables or relying on a public front-end filter.

**Blocking item E-02: variable line counts.** `speech_curation_private.reader_marks` has `line_index between 0 and 220`; lift the Churchill bound and validate against each lesson's actual lines within the RPC. Preserve checks for nonnegative index, note index, mark kind and ownership. Plan how old marks map if line IDs become stable keys. A longer speech must not silently fail to save marks above line 220.

**Blocking item E-03: data-driven renderer.** `CHAPTERS`, `PARAGRAPH_STARTS`, context images, `churchill-1949` calls, title/search strings, document title and hero labels are hard-coded in the Churchill page. Move speech-specific data to the private payload or a public metadata manifest. The reader template should render any approved speech without copying and renaming a page containing Churchill-specific values. Keep only presentation invariants in shared code. A distinct URL may remain for search discoverability, but it should resolve to the same generic engine.

**Blocking item E-04: structured notes.** The present renderer parses string conventions for colon, Chinese parentheses and `Examples:`. Replace with explicit note fields or validate input so strictly that a malformed note cannot be published. The procedural-urgency title/body defect proves that regex-only parsing is easy to get wrong. The duplicate-excerpt defect proves that display logic cannot repair every content mistake. Add a migration/parser test with cases for English title + Chinese bracket, trailing explanatory Chinese, repeated quote, straight/curly quotation, no examples, multiple examples, punctuation abbreviations and quoted colons.

**Blocking item E-05: archival/media policy.** Implement gallery data rather than hard-coded HTML. Record source, grade, rights, alt text and date per item. Derive alternation by index for wide screens; preserve image-then-caption on mobile. Embed only trusted providers through an allowlist and explicit CSP updates. A missing media asset should show an accurate linked fallback, not an empty black frame presented as evidence.

**Blocking item E-06: authorization and publishing state.** Public library metadata and private lesson content have different exposure. A published metadata record should not guarantee that lesson JSON exists; release checks must verify both and surface a meaningful unavailable state. Avoid exposing private notes through client-side static JSON, search endpoints or logs. Follow the existing session model; do not place service credentials in browser code. Database migration must be reviewed and applied through the project's normal migration/deployment route, then queried to confirm role restrictions and expected rows.

**Blocking item E-07: reusable QA harness.** Add data validation, search indexing tests, line/paragraph bijection tests, critical UI interaction tests and a mobile visual review checklist. Do not test only the happy Churchill constants. Include one short speech, one long speech (>221 lines), empty optional notes, long Chinese text, missing archive item, note with a quote followed by Chinese, and a multi-line paragraph that opens a note in its middle. These are meaningful tests because they probe generalization failures.

The engineering work above is explicitly not represented as completed in this manual. A future importer should check the live schema and code revision again; do not assume this 6 October 2026 inventory stays current.

## 13. End-to-end import SOP: 24 controlled steps

### Phase A - authorize and identify

**01. Open an import record.** Assign speech ID, editor, reviewer, desired audience, publication target and version. Record the user's exact request, any design exceptions, and which current template revision is the reference. *Output:* manifest stub.

**02. Verify eligibility.** Confirm the speech is suitable for the target age and objective, the complete text or selected excerpt can be used, and there is an honest way to describe its historical context. *Stop if:* speaker/event identity is uncertain or rights cannot be resolved for intended use.

**03. Establish event identity.** Record speaker, canonical speech title, date, venue, occasion, audience, original language and source catalogue identifiers. Record conflicting dates separately. *Churchill example:* use 17 August 1949 from the dated body and archive caption; retain the museum menu's 11/17 inconsistency in the discrepancy log.

**04. Collect sources.** Save URLs, institution names, access dates, checksums or archive snapshots where permitted. Rank sources for transcript, context, translations, and images independently. A strong photo source is not automatically a strong transcript source.

### Phase B - transcribe and segment

**05. Acquire full text.** Extract a diplomatic transcript, preserving line breaks and punctuation. Do not treat OCR output as verified. Compare opening, middle, closing and paragraph count to primary source.

**06. Resolve discrepancies.** Build a table of questionable spelling, punctuation, omitted words, duplicate blocks and date labels. Mark each as preserve/correct/annotate/open, with source evidence and reviewer. *Stop if:* a correction changes the meaning and remains unresolved.

**07. Decide edition policy.** State whether display text is diplomatic or normalized. Define how corrections, ellipses, quotation marks and archaic spelling are shown. Keep original alongside normalized display if any changes are made.

**08. Split into paragraphs, then reading lines.** Preserve source order. Give stable IDs. Check every original word appears once in reconstructed full address, except documented formatting normalization. Build chapter starts from argument shifts, not an arbitrary fixed number of cards.

**09. Confirm alignment.** Run line-to-paragraph and paragraph-to-line checks; manually sample every chapter boundary and every long sentence. Count units and compare beginning/end; do not equate matching counts with textual proof.

### Phase C - write bilingual teaching content

**10. Translate every line.** Draft in Traditional Chinese; align proposition and modality. Review names, institutions, temporal clauses, irony, quotation and incomplete fragments. Resolve glossary terms before bulk translation.

**11. Draft context.** Write only the background needed to understand this speech; separate "before", "on the day" and "after". Attach citations to factual claims. Keep the context-card sequence coherent.

**12. Select curation spans.** Choose language, rhetoric and thought mechanisms with actual transfer value. Prioritize clarity over note quantity. Record target quote and why it matters; avoid generic observations.

**13. Write notes.** Use short English label, Traditional Chinese label on its own line, precise Chinese mechanism and contextual effect. Keep title and body structurally separate. Quote exact target phrase once.

**14. Write examples and collocations.** Give grammatical, authentic examples distinct from the source and paired Traditional Chinese translations. Tag register and special sense if needed. Do not imply examples are Churchill quotations.

**15. Bilingual second pass.** A reviewer reads English speech and Chinese without the draft explanation, checks all negation/referents, then reviews the teaching notes for hallucinated intent or overstated history. Track fixes by line ID.

### Phase D - evidence and media

**16. Research archival evidence.** Seek exact-event imagery first. Record documentary grade A/B/C/D, dates, source, rights, caption and alt text. If exact images are scarce, state that scarcity; do not fill the gallery by relabeling nearby events.

**17. Prepare assets.** Preserve aspect ratio and visible context; optimize file size without turning faces/text unreadable. Keep generated frame/texture assets separate from historical assets. Test external links and embed policies.

**18. Compose gallery captions.** Lead with actual date and relationship to this speech. Use compact factual Chinese, source link and accurate alt text. Arrange alternating right-left-right-left on wide screens and sensible single-column order on small screens.

### Phase E - validate and stage

**19. Validate package.** Schema, IDs, line order, complete bilingual pairs, note quote membership, examples, collocations, dates, URLs, rights, duplicate blocks, paragraph reconstruction and cross-mode consistency must pass. Produce a machine-readable report and an editor-readable error list.

**20. Stage privately.** Upload content to protected storage using authorized credentials and an idempotent versioned process. Do not publish a link until private RPC and metadata record agree. Snapshot prior version for rollback.

**21. Build preview.** Inspect full address, 逐句細讀, context, search and gallery with actual content. Test extreme note length, longest line, dense Chinese and all gallery images; do not review only the first viewport.

**22. Run interaction QA.** Use keyboard, touch, tablet, narrow phone, zoom and reduced motion. Check sticky toolbar/chapter rail, smooth reveals, pinned sentence, translation toggles, font changes, reading lines, lamp completion, navigation, bookmarks, loading, empty/error states and session expiry.

### Phase F - release and maintain

**23. Publish and verify live.** Confirm the new library entry, protected lesson load, exact source links, search result, saved marks, image/embed loads and accessibility basics from the production URL. If the owner has already authorized live deployment, publish after the reviewable artifact and tests are ready; record commit and deploy identifiers.

**24. Archive decisions and monitor.** Save source manifest, discrepancy log, accepted screenshots, review record, release hash and rollback plan. Recheck broken archival links, rights notices, speech text corrections and regression reports. Update this manual when a new generalizable decision is made, with date, rationale and evidence.

## 14. Detailed release acceptance matrix

**Historical identity:** title/speaker/date/venue/occasion match a primary source or explicitly qualified record; all date conflicts documented. **Transcript:** complete source sequence, no dropped or duplicated blocks, every segment reconstructs in order, corrections traceable. **Translation:** 100% of published lines have reviewed Traditional Chinese; no untranslated technical term that blocks understanding. **Notes:** each claim points to a visible quote or sourced history; title/body and bilingual label separation pass; no repeated quoted excerpt. **Examples:** every English example is grammatical, distinct from source where appropriate, and translated accurately. **Gallery:** every item has source and documentary grade; no adjacent-day image described as exact speech; links and media load.

**Search/navigation:** front search identifies speech, internal search returns correct line, zero state and clear work, breadcrumb returns to archive and speaker, chapter links land below sticky controls. **Interaction:** notes animate without content jump, selected sentence remains reachable, pinned line appears only when original line leaves view while its note remains, reduced-motion state works, Chinese toggles and font switches keep content stable. **State/security:** valid user sees protected lesson and own marks; another user cannot see those marks; expired/inactive session denied; database rejects invalid line/idea marks. **Visual:** line cards have visible depth, table cells wrap, text stays legible on texture, gallery sequence is correct, framed images retain aspect ratio. **Production:** live URL and version match staged review.

For each gate, record `pass`, `fail`, or `not applicable`, who checked it, date, device/browser where relevant, link to evidence, and defect ID. A failed mandatory gate blocks publication. A nonblocking limitation must be visible in the release record, not buried in chat. The acceptance sheet should include representative screenshots at desktop (about 1440px), tablet (about 768px) and phone (about 390px), plus a 200% zoom/reflow check. These are *recommended test widths*, not design breakpoints.

## 15. Companion exercise standard - proposed, not live in the Churchill reader

The user requested requirements for exercise, answer and rationale. The current Churchill speech page does **not** show a scored exercise or answer model. The following standard governs an optional companion module if commissioned. It must remain visibly separate from the historical transcript and should not alter the reading modes' default purpose.

**Learning progression:** (1) locate evidence in a sentence; (2) recognize meaning/structure with a short multiple-choice or matching task; (3) explain the effect in context in one or two sentences; (4) apply a phrase to a new situation; (5) optionally write a brief synthesis across a paragraph. A learner should not be forced directly from a difficult nineteenth/twentieth-century parliamentary sentence into an unguided full-sentence conversion. The owner's separate idiom-project correction established a useful general principle: when sentence conversion is too hard, make a scaffolded fill-in task the major mode and full rewrite optional challenge. Apply that *only where pedagogically appropriate* to speech exercises, not as proof that this speech currently uses idiom modes.

**Question quality:** One primary construct per item; quote only the necessary speech span; ask a determinate question; avoid answers that require unstated historical knowledge or guesswork about authorial intention. Match difficulty to senior-secondary learners: source speech may be advanced, but prompt should be clear. Include accessible vocabulary support when the obstacle is lexical rather than interpretive. A multiple-choice distractor must be plausible from a specific misunderstanding, not absurd. Ensure one defensible key for closed questions; if more than one reading is valid, use a rubric rather than forced single-key grading.

**Answer quality:** Give the exact acceptable response or a transparent range. For text entry, define case, punctuation, spelling, synonyms, word order, and whether partial credit applies. Do not reject a correct paraphrase merely because it differs from a model sentence. For historical interpretations, name the evidence and the scope of the claim. Keep the model answer shorter than the rationale unless a full worked example is the learning goal. Traditional Chinese answers must be natural and semantically equivalent, not word-for-word calques.

**Rationale quality:** Explain *why* the answer is right by pointing to the quoted words and the mechanism; explain a common tempting wrong answer when useful. A rationale should teach something not already explicit in the answer. For a short recognition item, about **2-4 compact sentences** is a target; a complex argument item may need a short paragraph. Distinguish fact, inference and teaching simplification. Avoid "because it says so" and avoid revealing a later item's answer in an earlier feedback panel.

**Feedback and agency:** First attempt should be possible before showing the key. On error, give a bounded hint about where to reread; after a second attempt or explicit reveal, show model and rationale. Preserve a route back to the full source line. Make optional challenge clearly optional, not a hidden condition for completion. If scoring exists, state what it measures; reading progress and viewed lines are not exam performance. Store only necessary student data and document retention/visibility. Test correct, near-correct, wrong, empty and repeated attempts.

## 16. Printable learning-textbook adaptation and pagination

The reference product is a responsive website, not an existing paginated textbook. A future printable workbook or PDF should translate its information hierarchy rather than imitate sticky bars on paper. Use **A4 portrait** unless the commissioned format differs. Recommended margins: **18-22mm inner/outer, 16-20mm top, 18-22mm bottom**; increase inner margin for binding. Use one dominant serif for speech and headings, one clean sans for instructions/Chinese, and a mono face sparingly for archival/typewriter motif. Body size target **10.5-12pt English**, **10-11pt Chinese** with generous line spacing; footnotes/captions should remain comfortably legible, generally **8.5pt or larger**. These are *print targets* to validate with actual proof sheets, not observed website values.

Suggested page sequence: cover with speech identity/date; one-page contents and provenance note; 1-3 pages of context; a distinct gallery spread if licensed; full original speech with paragraph/chapter markers; aligned bilingual annotations in manageable batches; optional exercises after the related passage; answer/rationale section separated from questions; source register and glossary. Do not split an English line from its Chinese translation or a question from all of its options. Keep a curation note and its example table together when feasible; if a table must break, repeat the header and indicate continuation. Avoid orphan headings and lone last lines. A section opening page should announce the question it answers, not become a nearly blank divider unless intentional in a premium edition.

Target density: one principal learning action per spread; about **3-6 curated idea blocks per A4 page** depending on length; one archival item per half or full page when detail is needed. These are *starting bands*; preserve readability over quotas. For a long speech, the full text may span many pages without side annotations; use unobtrusive line/chapter IDs and page references to related curation. For side-by-side bilingual layout, verify English and Chinese baselines at each block; when alignment becomes cramped, stack translation below English with a thin teal rule. Avoid a giant two-column table that forces 7pt text.

Print palette derives from the digital relationship: ivory paper, deep teal headings/action markers, muted warm gold for dates or archival labels, pale yellow for example English cells, red for the first target excerpt only. Burgundy velvet and walnut frame can appear in a gallery spread, but must not use so much ink that faces, captions or photocopies become unreadable. In monochrome print, hierarchy must survive using rule weight, type weight and texture contrast rather than color alone. Set a maximum of two major type families plus mono motif; use bold/italic consistently. Captions include credit and documentary relation (exact day/adjacent day/contextual). A generated frame may surround a real photo, but the caption must unambiguously credit the photo source.

Include running head with speaker/short title, page number, section and version/date in the footer, and a compact source key where quotations or images occur. Tables need labelled columns, sufficiently contrasted header, hairlines that survive print, alternating row shading only if it helps tracing, and adequate cell padding. Footnotes must not carry essential answers that students need mid-exercise. A proof print at 100% and a grayscale proof are required. The web's smooth animations become explicit print state labels and spacing, never arbitrary still frames of half-open content.

## 17. Defect-and-decision ledger from the Churchill development record

The ledger is chronological at the level supported by the conversation and repository history. It does not claim exact minute-by-minute sequence beyond the dated commits. Each entry states the owner's observation, the adopted rule, and what future work must test.

**D-01 - fragmented control bar.** The owner found **逐句細讀** outside the floating bar. It was grouped with font, rule, translation and progress controls. *Regression:* after responsive wrapping, it remains visible and reaches `#transcript` below sticky UI.

**D-02 - abrupt content reveal.** Curation appeared instantly in both modes. Opening now animates panel height/opacity/offset, with slightly staggered idea blocks and a reduced-motion escape. *Regression:* no jump, clipping or blank interactive area.

**D-03 - curation obscured by a long paragraph.** Clicking a sentence originally placed notes in a way that competing text blocked their relation. Notes now insert on the next line after the exact selected span. When long notes push that span out of view, a copy clings under the progress bar until no longer needed. The label **正在導讀的原句** was removed. *Regression:* opening sentence 200+ in a long paragraph still yields correct line and correct note.

**D-04 - accidental doubled quotation.** Notes displayed `“Then there is...”“Then there is...”`, `“this Continent”“Continent”`, `“bondage”“bondage”`, and `“the Hague”“the Hague”`. The first English quote is now red and 5% larger; adjacent duplicate quote is suppressed when identical. *Regression:* legitimate two different quotations are both preserved, and the original speech remains unchanged.

**D-05 - dangling bilingual title.** An English idea label and Chinese bracket crowded one line. The Chinese bracket now has a separate line. The owner then caught **Procedural urgency（程序迫切感）這個短子句把時間壓力具體化** misparsed as one heading; the Chinese explanation was moved into body prose. *Regression:* title parser handles trailing Chinese and colon correctly.

**D-06 - chapter rail overlap.** The vertical 段落導覽 covered the upper settings bar. Its top offset now follows measured toolbar height rather than an old constant. *Regression:* test desktop, tablet, browser zoom and Chinese font enlargement.

**D-07 - missing navigation/search.** The owner could not return from individual speech to the archive; a blue breadcrumb now links to archive and filtered speaker view. Library and individual search were added to find which speech contains text and then its sentence. *Regression:* search result target and breadcrumb state are correct when entering from a filtered library.

**D-08 - year lacked prominence.** The year was only an eyebrow. Hero now gives **The Council of / Europe, 1949** one large title. *Regression:* year remains part of the title at narrow widths and does not clip.

**D-09 - photographic evidence scarcity.** At first the gallery had one exact-event image. The owner asked to find more. Additional images and a newsreel were added only with dates and explicit relation to the 17 August speech. A local 11 August photo replaced a failed hotlink; the source link remains. *Regression:* no caption implies the 11/12 August media document the exact 17 August speech.

**D-10 - stiff gallery/book styling.** A leather album treatment was built, but the owner rejected the book object. The final mechanism is a leather section that slides down to a gallery, collapsed initially. A generated ornate walnut frame and burgundy velvet backdrop replaced flat white gallery cards. Wide-screen order is right-left-right-left. *Regression:* fourth item and video follow alternation; mobile order is coherent; hidden links are inert before reveal.

**D-11 - flat sentence cards.** Earlier white blocks still appeared flat after a weak shadow. Final 逐句細讀 cards use layered paper depth, more visible edge, subtle corner ornament and lifted open state. *Regression:* contrast and scanability remain good over a long run of cards.

**D-12 - waiting without feedback.** The page initially made users wait without a visible progress bar. A staged loading bar now reports connection, rendering, bookmarks and completion. *Regression:* it does not jump to 100% before required state arrives; errors show an understandable action.

**D-13 - font and lamp behavior.** Courier Bold became default for full address while other font choices remain. The banker lamp now warms and gently pulses at 100% reading progress. *Regression:* changing fonts does not break line insertion/progress; completion effect respects reduced motion.

**D-14 - overly defensive caption.** The owner requested removal of the sentence **因此作為同次會期的影像背景，不當作本篇演說的完整錄影。** The caption now states the precise evidence limit more concisely. *Regression:* remove verbose legalistic phrasing without erasing the truthful distinction.

Repository milestones: `0b34feded` added the interactive lesson; `07766e0bc` and `3c995adde` refined archive reading; `38ededd3d` expanded navigation/preferences/bookmarks; `e2b700c3d` improved reading and search; `20ca51dd1` expanded gallery and reading; `aafa8d369` introduced the leather album; `3032b7cd7` changed it to the final framed velvet gallery. This is a code-history index, not a claim that every user request was fully and permanently solved in those commits.

## 18. Common failure modes and recovery playbook

**Wrong date or event:** freeze publication; compare body/date line, archive caption and independent source; label discrepancy; revise title, gallery and context together; record decision. **Duplicate transcript block:** verify against source; remove duplicated extraction block only after confirming it is not genuine rhetorical repetition; rebuild indices and migrate saved marks. **Missing Chinese line:** fail validation; translate/review before staging. **Malformed note title:** inspect structured fields, not CSS; separate label from prose; add parser fixture. **Double excerpt:** check content and normalization; suppress only immediately identical quote. **Table too dense:** shorten example, wrap cells, allow row growth or stack on mobile; never shrink below readable size.

**Gallery hotlink fails:** keep source link; obtain permitted local copy or linked placeholder; verify attribution and rights. **Generated art looks like evidence:** move it to decorative layer and mark it as generated in internal asset register; never caption it as archive media. **Sticky overlap:** measure toolbar after fonts/content load and on resize; set chapter rail offset from actual height; test zoom. **Animation hides content:** provide immediate final state under reduced motion and keep DOM order logical. **Progress stuck below 100%:** inspect boundary calculation and viewport geometry; use an attainable completion threshold tied to actual reading end; do not force 100% on page load. **Marks vanish:** inspect access identity, RPC error and index constraints; check cross-login account mapping; avoid discarding local UI state on transient server failure. **Lesson exposes content before auth:** remove static payload, review grants/RLS/RPC; test unauthenticated and invalid sessions.

Every recovery creates a regression case and an entry in the change log. Do not solve a local visual bug by removing a user-facing feature without the owner's explicit instruction. The owner's earlier writing-system complaint about a removed model-essay button illustrates a cross-project governance rule: preserve existing functions while redesigning nearby UI, and inventory controls before release.

## 19. Governance, versioning and change control

This manual uses `major.minor`: major when content schema, access model or core reader experience changes; minor for new tested rules, copy/design refinements or source corrections that do not alter the contract. Each lesson separately carries transcript edition, curation revision, gallery revision and release hash. Change log entries must contain date, affected item IDs, before/after, reason, evidence, reviewer, test result and rollback note. Corrections to historical facts trigger re-review of every place the fact appears: context, caption, alt text, search metadata, print adaptation and source register.

Treat a screenshot as evidence of a visible defect, not as evidence that underlying content or source facts are correct. Treat a deployment commit as evidence of what code was shipped, not proof every interaction works. Treat a primary archival caption as evidence for the caption's claim, not for adjacent events it does not identify. Periodically audit external links and media rights; record the last check date. If a new source contradicts a published claim, label the claim under review until reconciled. For future speeches, update this manual only after deciding whether the new behavior is a general standard or a speech-specific exception.

## 20. Master principles transferable to other speeches and learning textbooks

1. **Provenance before polish.** Establish the object, source and date before designing its presentation.
2. **Evidence grades travel with media.** The interface may be elegant, but must not upgrade contextual imagery into exact-event proof.
3. **One canonical content model, multiple views.** Full text, line view, search, bookmark and print output derive from the same aligned units.
4. **Authentic original, accessible explanation.** Do not dilute the source; lower the cognitive barrier through translation, targeted notes and examples.
5. **A note earns its space.** Teach a specific mechanism and contextual effect. Omit weak filler.
6. **Quote once, explain once, exemplify separately.** Separate source words, editorial prose and transfer examples visibly and structurally.
7. **Bilingual symmetry without forced literalism.** Preserve meaning and rhetorical relationship while writing natural Traditional Chinese.
8. **Progressive disclosure with orientation.** Let readers open depth when needed; preserve the original line and current location in view.
9. **Motion supports causality.** Smooth reveals show what changed; reduced-motion alternatives keep all content available.
10. **Material metaphor serves legibility.** Parchment, leather, velvet and wood create atmosphere only when contrast, hierarchy and truth survive.
11. **Navigation is part of comprehension.** Search, breadcrumb and chapter paths help readers locate evidence and return to the whole.
12. **State describes behavior accurately.** Viewed is not mastered; reading progress is not a score; loading phase is not a transfer percentage.
13. **Responsive means reflowed, not merely smaller.** Reorder gallery and tables for narrow screens; do not shrink dense text into illegibility.
14. **Validate the future case, not only the specimen.** A reusable template must survive a different speech length, structure, media set and note distribution.
15. **Ship with a recovery path.** Preserve prior content, identifiers and version; release is incomplete until live verification and rollback are possible.

## 21. Working templates and copy patterns

### 21.1 Source manifest minimum

```text
Speech ID: __________  Edition: ______  Owner: ______  Reviewers: ______
Speaker canonical name / aliases: ______________________________
Original title / display title: ________________________________
Event date/time/venue/occasion: ________________________________
Transcript source URL/catalogue ID: ____________________________
Source type: full transcript / excerpt / prepared text / report
Source access date, checksum, reuse basis: _____________________
Independent comparison source: ________________________________
Known discrepancies and decisions: ____________________________
Original/display normalization policy: ________________________
Line / paragraph / chapter counts: ____________________________
Translation glossary version: _________________________________
Gallery A/B/C/D counts and rights review: ____________________
Staging, production and rollback IDs: _________________________
```

### 21.2 Curation item template

```text
Line ID: S001-L017        Exact target quote: "..."
Mechanism type: language / rhetoric / argument / historical context
English label: 2-6 precise words
Traditional Chinese label: （short, natural label）
Explanation (ZH): What the words do, in 1-3 clear sentences.
Contextual effect (ZH): Why it matters here; qualify inference.
Transfer example 1 (EN): A natural sentence with the same mechanism.
Translation 1 (ZH): Faithful Traditional Chinese.
Transfer example 2 (optional): ...
Collocations (optional): expression -> local sense / register
Citation or editorial basis: source ID / reviewer decision
Review: quote exact? grammar? Chinese? no duplicate? one clear insight?
```

### 21.3 Gallery item template

```text
Item ID / order: ______  Documentary grade: A / B / C / D
Medium: photo / document / film / audio / design-only texture
Subject and exact event relation: _____________________________
Actual capture date; uncertainty: ____________________________
Institution/catalogue URL and rights: ________________________
Visible date eyebrow: ________________________________________
Chinese title: _______________________________________________
Chinese caption (facts only): ________________________________
Alt text: ___________________________________________________
Local file / hash or external embed: _________________________
Link and media tested on production: yes / no
```

### 21.4 Better and worse microcopy

**Better:** `“convoke” 表示正式召集會議；語氣比 “call” 更制度化，常用於議會或委員會。` **Worse:** `這個字非常有力量，十分重要。` The better version identifies register and context. **Better:** `1949 年 8 月 11 日，丘吉爾在同一諮詢議會席上；這不是 17 日發言時的照片。` **Worse:** `丘吉爾發表著名演說的珍貴照片。` The better version states evidence limits. **Better instruction:** `找出表示「正式召集」的動詞，再說明它比 call 正式在哪裏。` **Worse:** `試分析此修辭的深層意義。` The better prompt names the action and evidence. All examples here illustrate style; source quotations and spelling must be checked before reuse.

## 22. Source register and verification notes

**S-01 transcript:** America’s National Churchill Museum, *The Council of Europe, 1949*, `https://www.nationalchurchillmuseum.org/the-council-of-europe.html`, accessed 6 October 2026. Body identifies Winston Churchill, 17 August 1949, Strasbourg. The site's speech navigation labels the item 11/17/1949; preserve that inconsistency in the discrepancy log rather than silently copying it.

**S-02 exact-day image:** Council of Europe Flickr, `https://www.flickr.com/photos/councilofeurope/3047610865/`, cited in current gallery as the 17 August address. Verify original catalogue/caption and rights before reusing the image in a new medium.

**S-03 adjacent assembly image:** CVCE, *Van Cauwelaert, Churchill and Cingolani, members of the Consultative Assembly (Strasbourg, 11 August 1949)*, `https://www.cvce.eu/en/obj/van_cauwelaert_churchill_and_cingolani_members_of_the_consultative_assembly_strasbourg_11_august_1949-en-d6f1a455-d630-468c-92c1-9a7f8823606c.html`. Current page uses an owner-supplied local reproduction after hotlink failure and links back to this record.

**S-04 adjacent public address:** Council of Europe Flickr, `https://www.flickr.com/photos/councilofeurope/3055896186/`, cited in the current gallery as 12 August at Place Kléber; verify catalogue and rights for any export.

**S-05 moving image:** British Pathé, *Churchill Speaks At Strasbourg And Council Of Europe*, `https://www.youtube.com/watch?v=udY-JfOb0IA`; the current caption intentionally does not claim each shot is 17 August.

**Implementation evidence:** `tools/import-speech-curation-docx.py`; `speech-curation-churchill.html`, `.css`, `.mjs`; `speech-curation.html`, `.mjs`; Supabase migrations `20261005164000_speech_curation_churchill_lesson.sql` and `20261005191500_speech_reader_marks.sql`; Git commits listed in section 17. These files establish current behavior as of this edition. The actual private lesson payload and original owner-provided DOCX were not available in the checked public repository, so this manual does **not** assert that every individual translation or note was independently re-reviewed. That source audit is required for any new release or content-level correction.

## 23. Final operator checklist

- [ ] Identity, date, venue, transcript edition and rights are recorded; conflicts reconciled.
- [ ] Complete English text compared with primary source; no unreviewed OCR or duplicate blocks.
- [ ] Every line has stable ID, correct order, paragraph/chapter membership and Traditional Chinese translation.
- [ ] Context claims are cited, chronologically clear, concise and separate from later outcomes.
- [ ] Notes teach a precise mechanism; label/body/excerpt/example fields are separate and reviewed.
- [ ] Every example and collocation is idiomatic, sense-appropriate and bilingually complete.
- [ ] Archival items have documentary grades, truthful dates, captions, alt text, rights and working source links.
- [ ] The generic importer/RPC/reader supports this speech's slug and line count; protected access holds.
- [ ] Complete address, line reader, search, breadcrumb, bookmarks, progress and translation agree on line IDs.
- [ ] Desktop/tablet/mobile/zoom/reduced-motion QA passes; no sticky overlap, clipped notes or flat unreadable cards.
- [ ] The gallery begins collapsed, reveals smoothly, and alternates right-left-right-left on wide screens.
- [ ] Loading and reading progress are distinct; the lamp activates only at true completion.
- [ ] Production smoke test, screenshots, version, rollback path and reviewer sign-off are recorded.

**Completion statement:** The editor may mark a speech `READY` only when all mandatory lines above pass or an exception is documented with owner acceptance and visible limitation. The Churchill page remains the reference for style and interaction, while its content counts, institutional history, media dates and hard-coded database bounds remain local to that edition.

**Operator sign-off record**

```text
Speech ID and edition: ______________________________________________
Transcript source and source-review date: __________________________
Editor / bilingual reviewer / history reviewer: ____________________
Accessibility and device QA reviewer: ______________________________
Mandatory gates passed: ______ / ______    Exceptions: _____________
Staging version and production commit: _____________________________
Live smoke-test date, device, browser and URL: _____________________
Rollback snapshot/location: ________________________________________
Decision: READY / HOLD              Owner: __________  Date: ________
```
