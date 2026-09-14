# Horsey trophies across learning portals

The shared `horsey-trophies.mjs` extends the Sentence Structure artwork and effects to Idiom, Phrasal Verb, Proverb, all six Common Expression portals, and IELTS Listening. Each portal keeps its own progress and visibility preference. The header counts gold trophies against the actual eligible catalogue, including lessons beyond a map's current illustrated area.

Bronze unlocks at 50%, silver at 80%, and gold at full completion, rounded up to whole questions. Separate partial attempts are not pooled. Common Expression uses its existing per-question mastered answers. A later practice attempt does not revoke an earlier award.

Trophies have the same ten sparkle particles, edge glow, masked repeating sheen, and click/keyboard lift-and-wiggle animation. Reduced-motion preferences suppress motion. Map trophies are sibling buttons so walking and lesson navigation remain independent. The normal/list view remains available. Proverb and Professional Message use the shared walkable meadow map; Business Speaking uses the airport map.

IELTS stores checked question IDs through `ielts_trophy_progress`, using the existing student token and authenticated connection. The private tables deny direct API access; the public wrapper is SECURITY INVOKER, with owner validation in the private function. Pending progress is also saved locally per student and retried at login and when checking answers. This does not alter Eddie Farm points. Previously unchecked or unsaved IELTS scores cannot be reconstructed; checking answers now records them. New IELTS practices must be added to both the frontend catalogue and `listening_rewards.practices`.

Validation:

- `node tools/test-horsey-portals.mjs`: varying thresholds, valid question IDs, stale attempts, monotonic awards, local restore and account isolation.
- `node tools/test-horsey-portals-browser.cjs`: all ten real portal pages with isolated fixture accounts and blocked external traffic; gold/silver/bronze placement, dynamic counters, sparkle elements, click animation, hide/show, normal/map switching, celebrations, and account switching.
- Existing Sentence Structure, Idiom, Proverb, Phrasal Verb, Common Expression, IELTS, map/navigation, and mobile exercise regression checks passed.
- Supabase rollback-only fixtures verified 20/40 progress, restoration, idempotent merging, student isolation, rejected invalid IDs, unknown practices, expired tokens, and missing authentication. Anonymous RPC execution and direct table access are denied.
- Security advisors report only the intentional no-policy INFO notices for the two private tables: all direct table grants are revoked and access is exclusively through the owner-checked function.

Map screenshots: `/tmp/horsey-portals-qa/` (one PNG for each portal).

## September 15 performance and award dates

Bronze now unlocks at 50%, silver at 80%, and gold at 100% of each lesson's total, rounding thresholds up. On 50-question lessons: bronze 25–39, silver 40–49, gold 50. Silver thresholds for 20/30/40-question lessons are 16/24/32.

Only the highest tier appears for each lesson. The map popup and collection show its acquisition date, derived from submitted rounds, checked-answer timestamps, or original IELTS check timestamps. Repeated completions retain the earliest known milestone date. Historical records without timestamps explicitly show that the date is unavailable. Individual visibility is stored per portal and student; Hide All temporarily hides trophies, while Show All restores every trophy including individually hidden ones.

Map trophies suspend sparkles, masked sheen, and edge shadows while walking. IntersectionObserver removes particle and sheen work outside the viewport. Opening the closet suspends the underlying map animation and CSS effects; closing resumes it.

The closet batches opaque static surfaces by material and uses Standard materials like the speaking classroom. Shadow and environment maps remain cached. Idle rendering is capped around 30 fps; movement and dragging use the normal animation loop. Resolution starts at maximum device pixel ratio 1.25 and reduces under sustained load to a floor of 0.65. Hidden tabs stop rendering; closing disposes WebGL resources.

A local headless Chromium comparison (tools/measure-closet-performance.cjs) reduced draw calls from 297 to 68 (77%) and geometry objects from 522 to 85. In this software-rendered environment, median frame interval improved from 184 ms to 116 ms and p95 from 267 ms to 167 ms. These are relative software-renderer measurements, not a claim of hardware 60 fps. Before/after screenshots preserve room geometry and furnishings, with softer rendering at reduced resolution.

The ten-portal browser checks verify walking disables sheen, closet WASD works while the background map is stopped, closing resumes the map, individual hiding and Show All agree with the collection, and dates are present. tools/test-horsey-award-dates.mjs checks tier boundaries, first/highest-tier dates, unknown history, old IELTS cache migration, and owner isolation.

The ielts_trophy_progress_v2 endpoint returns original check timestamps; v1 remains available to cached clients. Its migration passed rollback-only date preservation, owner isolation, invalid-question, and missing-auth checks. Security advisor notices are the existing intentional private-table no-policy INFO notices.
