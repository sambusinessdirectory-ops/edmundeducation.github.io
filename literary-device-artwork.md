# Literary Device student entrance artwork

Generated with the built-in ImageGen tool, generation mode, 5 November 2026.

## Login illustration — literary-device-login.webp

Prompt: Use case: stylized-concept. Asset type: literary education student login illustration. A beautifully hand-painted antique scholar's folio, closed navy blue leather book with delicate antique gold geometric diamond border, ivory quill and ink pot on parchment, soft cloudy icy blue background with weathered blue geometric edge motifs. Matches a fantasy field-guide interface: tactile painted paper, dark umber, muted navy and ivory, subtle gold. Portrait composition, decorative book and quill concentrated lower half, atmospheric empty upper half. Flat frontal editorial illustration, quiet scholarly mood. No people, monsters, weapons, text, lettering, logos or watermark.

## Control surface — literary-device-button.webp

Prompt: Use case: stylized-concept. Asset type: reusable website button surface. One single wide horizontal navy blue leather plaque with chamfered pointed short ends, delicate worn antique gold double-line rim and tiny diamond ornaments only at both tips. Center 75 percent is clean dark navy textured leather, blank for HTML text. Hand-painted fantasy scholarly ledger interface, tactile restrained craftsmanship, crisp symmetrical silhouette. Front view, width to height about 5:1, fills canvas width, isolated on transparent background. No text, icons, letters, shadows outside silhouette, monsters or weapons.

Exported to WebP; transparent padding trimmed from the control surface. Labels remain accessible HTML text. Used by login, logout, chapter buttons, recents, quiz controls, hints, close control and selected mode tab.

## Validation

Browser tests cover authenticated entry (mocked valid response), invalid credentials, network failure, deep-link gate, both quiz modes, feedback, retry, hints and Escape, chapter turns, search, recents, 390px layout and reduced motion. Existing database RPC definitions inspected; invalid login tested against database. No student records or database schema changed.

The student entrance validates accounts on the server and defers loading the learning application until validation succeeds. This static-site UI gate does not encrypt the publicly hosted lesson data files.

# Softer artwork revision

Built-in ImageGen: one reference edit and two new generated surfaces. Exported to WebP without altering the originals.

## literary-device-login-soft.webp — reference edit

Prompt: Simplify this literary login illustration into a natural, loose hand-painted watercolor. Keep portrait composition, navy book, ivory quill, inkpot in lower half and muted cloudy blue upper empty space. Remove all geometric diamond decorations, rigid border patterns, tiny engraving, dense scratches, intricate feather lines, and meticulous page lines. Use broad soft brush strokes, a simple book cover with one imperfect gold edge, a loosely painted feather, gentle paper grain, calm generous negative space. Warm ivory and muted blue. Organic and understated, recognizably the same subject and placement. No text, symbols, creatures or logos.

## literary-device-explanation-panel.webp — generation

Prompt: Create one blank rectangular reading explanation panel for a literary education website. Hand-painted watercolor ivory paper inset, softly irregular natural paper edge, understated muted blue-gray brushstroke along left edge, a very faint warm gold wash near corners. Spacious nearly solid ivory center covering 90 percent, absolutely empty for readable live text. Wide landscape 3:2 ratio, front view flat UI surface, fills canvas with no external margins. Refined natural painterly aesthetic, simple and restrained, no geometric motifs, no tiny detailed filigree, no text, symbols, objects, shadows or decorative illustrations. Opaque light background.

Used in both guide views, with CSS tints retaining the four information categories.

## literary-device-option-panel.webp — generation

Prompt: Create one blank wide answer-option panel surface for a literary education website. A softly hand-painted horizontal slip of warm ivory paper, subtle weathered navy-blue watercolor edging, very faint pale blue wash just inside the edges. Central 90 percent almost uniform warm white, empty for live multiline quiz text. Wide landscape 3:1 ratio, straight-on flat UI artwork, edge-to-edge canvas with no external margin. Elegant restrained scholar's notebook style, organic brush strokes, very low texture contrast, slightly imperfect edges. No text, emblems, geometry, objects, checkmarks, circles, shadows or illustrations. Opaque background.

Used for MC options in both practice modes; selected, correct and incorrect states retain distinct CSS colors.

The Chinese font family and local font-face definition now match the homepage. Sentence formatting includes translation parentheses before formatting, suppresses breaks after punctuation attached to a closing parenthesis, and omits trailing breaks. Verified desktop/mobile, sentence formatting, both practice modes and computed font family.

# Catalogue leaves and reading-size controls

Built-in ImageGen generation mode, two reusable assets; originals retained, exported as WebP. Transparent padding trimmed from button export.

## literary-device-catalogue-panel.webp

Prompt: One reusable blank accordion header panel for a scholarly literary field guide website. Wide horizontal ivory parchment strip, soft hand-painted watercolor, gently irregular paper edges. At left a small understated ink-blue wash with a delicate loose gold botanical sprig; far right a similarly restrained blue brush accent. Center 80 percent very light cream and completely empty for live English and Traditional Chinese headings. Warm ivory, muted navy, antique gold. Natural elegant painterly craftsmanship, very low detail, no geometric patterns, no letters, numbers, text, icons, symbols, monsters, weapons or watermark. Flat front view UI asset, 3:1 landscape, panel fills canvas with minimal margins.

Applied to every expandable guide entry, with live titles positioned clear of the artwork.

## literary-device-font-button.webp

Prompt: One blank compact horizontal font-size control button for a literary education website. Hand-painted navy leather inset plaque with softly irregular brushed antique gold rim, tiny ivory quill flourish only on far left edge. Elegant restrained watercolor fantasy scholar notebook aesthetic, softly rounded chamfered corners. Center 80 percent blank dark navy for accessible live text. Front view flat UI artwork, 3:1 aspect ratio, isolated transparent background, fill canvas. No text, letters, numbers, symbols, intricate patterns, monsters, weapons or watermark.

Used for the reading-size trigger and all nine size options (1–3× in 0.25 increments). Preference is stored locally. Reading content, chapter controls, exercise text and hint dialogs scale; the size selector stays compact for recovery. At 1.75× and above the guide uses one column. Browser checks cover every scale, persistence, Escape, mobile at 3×, both exercise modes and hint dialogs.

# Reference correction — supersedes catalogue leaves and ornate size control

The gold/quill control and botanical catalogue design were rejected. Their pending deployment was canceled and those two exported assets were removed. The size feature is retained. New built-in ImageGen assets follow the supplied Game 24 field-guide HUD: flat dark-brown pointed labels, pale rectangular insets, restrained blue-gray edges.

## literary-device-hud-label.webp

Prompt: Create a utilitarian flat game field-guide HUD button asset. A single very dark umber almost black horizontal label strip with simple pointed hexagonal ends, like a traditional adventure game's statistics menu labels. Flat matte ink surface with extremely subtle mottled painted texture. Straight edges, shallow angular points. Absolutely no gold, no metallic rim, no bevel, no leather, no quill, no botanical decoration, no fancy ornament, no luxury appearance. Blank with no text or icons. Entire shape is solid dark brown. Transparent outside silhouette. Wide landscape 3:1 canvas. Simple practical readable game menu style.

Used for the size control, buttons, selected navigation, chapter labels and catalogue English-name labels. Exported WebP with transparent padding trimmed.

## literary-device-hud-inset.webp

Prompt: One simple rectangular pale ivory inset panel texture for a practical adventure game field-guide HUD. Flat front view, clean straight rectangular edges, subtle cloudy off-white and cool gray painted-paper texture, uniform low contrast for live text. Very restrained desaturated blue-gray thin edge. No ragged parchment, gold, metallic materials, leather, feather, leaves, flowers, decorative illustrations, ornamental borders, shadows, bevels, words or icons. Reference visual language: flat light statistics rows beneath solid dark-brown pointed labels, on an icy-blue field guide screen. Wide landscape 3:1 asset, fill entire canvas, opaque.

Used for catalogue rows and size selector tray. Verified all nine reading sizes, persistence, keyboard dismissal and 3× mobile layouts in both practice modes and the field-guide dialog.
