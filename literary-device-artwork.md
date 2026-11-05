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
