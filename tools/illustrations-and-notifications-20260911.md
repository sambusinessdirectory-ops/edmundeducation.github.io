# 2024 DSE illustrations and grading notifications

The supplied 48-page 2024 Speaking PDF was audited across all 24 question sets. Fourteen contain 29 illustrations. Twenty-five lossless source crops preserve the individual photographs/icons, the three-mascot row and three-icon space-tourism column. `dse-2024-illustrations-audit.json` records page numbers, pixel bounds, source hash and placement. Main and Professional DSE use the same paragraph-aware renderer. Existing word bookmarks and source text remain unchanged.

Students can optionally register an email in the Writing Submission home page, change it, or cancel and delete their notification preference. Consent defaults off. Chinese text explains confidentiality and the benefit. The admin's save-and-send action publishes comments to the student's account; it queues a generic completion email only for opted-in students. Essays and comments are not copied into email. The existing sender and delivery queue are reused.

The service-only preference RPCs are behind verified student sessions. The private table denies direct API access. Publication and notification enqueue share a transaction; retries deduplicate by feedback/version. Address changes, withdrawal and opt-out cancel unsent jobs, and consent/publication are rechecked immediately before provider delivery. Existing delivery audits retain sent-mail history.

Validation: 114 Writing Worker tests, 45 portal checks, isolated database and DOM notification tests, all 282 source layouts/bookmark checks, all 24 2024-paper illustration checks, Professional UI regression, existing admin-email queue regression, and Worker deployment dry run. Source crops and desktop/mobile layouts were visually reviewed. No real test emails were sent.
