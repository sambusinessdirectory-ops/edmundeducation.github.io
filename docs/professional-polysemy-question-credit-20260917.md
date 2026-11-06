# Professional English: per-question polysemy credit

Each correctly completed polysemy question now earns one point per exercise attempt. Wrong attempts earn none. Retry, reload, offline replay and mixed old/new clients share identical per-question event keys, preventing duplicate credit. Explicit new practice attempts may earn credit again, consistent with the existing practice-history model.

The client records each correct answer immediately and resubmits proven answers from a valid resumed snapshot. Completion badges still indicate a fully completed word. Word-directory completion bars remain word-coverage indicators; personal learning progress and team effort count questions.

Migration `20260917072552_professional_polysemy_question_credit.sql` validates each answer against the server catalogue. Cached clients' full-word submissions expand into canonical question events. Previously verified whole-word events are expanded with their original timestamp and retained as zero-point audit markers. Before deployment there was one such live completion; it became nine question records (net +8). There were no timestamp mismatches. Historical partial drafts without completion events are credited when resumed; no original per-answer dates are invented.

Existing reporting JSON field names `words` and `polysemy_words` are retained for client compatibility but now contain question totals. UI labels and history detail parsing were updated accordingly. Flashcard and blank scoring is unchanged. Card 65 Polysemy Lab is unchanged.

Validation: PGlite verifies partial credit, 26 correct answers = 26 personal/team points, wrong/unknown answer rejection, migration reruns, original timestamps, old/new client deduplication, per-question history and course isolation. The polysemy resume test verifies immediate first-question credit, wrong-answer rounds and cloud/device resume. Learning sync, feedback, community and momentum regressions pass. Safari/WebKit momentum UI check passes.
