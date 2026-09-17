# Card 66 — Natural English

Published module: Scoop. Chinese-first surprise lesson with eight stages, four multiple-choice questions and seven fill-in questions. Hong Kong wording uses 雪糕、雲呢拿、朱古力 and 士多啤梨. Fill-in answers can be submitted together using the sticky bottom bar. Each first correct answer within a practice run earns one completed question; wrong attempts do not. Explicit restart creates a new run and preserves history.

Uses the existing homework/schedule student login and a separate natural_english_private event store. Professional English accounts and records are not used. Server validates answers and session ownership. Offline events retry idempotently.

Two collapsible dashboards show completed questions and active study time, with date drilldowns. Speaking is optional and does not add question credits. Recordings are cached in IndexedDB and uploaded through an owner-scoped RPC to a private account store. The header recording library supports playback, download and upload retry, including older device recordings. Model audio uses the same Aries American male endpoint as DSE Individual Response. No pronunciation score is claimed.

Validation: tools/test-natural-english.mjs (PGlite); tools/test-natural-english-browser.mjs (Chromium and WebKit, synthetic accounts); shared navigation, homepage and PWA regression checks. Migration: 20260917075707_natural_english_scoop.sql.
