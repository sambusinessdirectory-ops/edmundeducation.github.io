# Card 66 — Natural English

Published module: Scoop. Chinese-first surprise lesson with eight stages, four multiple-choice questions and seven fill-in questions. Each first correct answer within a practice run earns one completed question; wrong attempts do not. Explicit restart creates a new run and preserves history.

Uses the existing homework/schedule student login and a separate natural_english_private event store. Professional English accounts and records are not used. Server validates answers and session ownership. Offline events retry idempotently.

Two collapsible dashboards show completed questions and active study time, with date drilldowns. Speaking is optional and does not add question credits. Recordings remain in the device browser (IndexedDB); only recorded/skipped status synchronizes. Model reading uses the device English speech voice. No pronunciation score is claimed.

Validation: tools/test-natural-english.mjs (PGlite); tools/test-natural-english-browser.mjs (Chromium and WebKit, synthetic accounts); shared navigation, homepage and PWA regression checks. Migration: 20260917075707_natural_english_scoop.sql.
