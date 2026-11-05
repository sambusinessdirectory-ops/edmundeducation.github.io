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
