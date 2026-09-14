# Horsey trophies across learning portals

The shared `horsey-trophies.mjs` extends the Sentence Structure artwork and effects to Idiom, Phrasal Verb, Proverb, all six Common Expression portals, and IELTS Listening. Each portal keeps its own progress and visibility preference. The header counts gold trophies against the actual eligible catalogue, including lessons beyond a map's current illustrated area.

Silver unlocks at half the lesson's actual question count (rounded up); gold requires full completion. This is 25/50 for Idiom, Phrasal Verb and Proverb; 10/20 or 15/30 for Common Expression; and 20/40 for IELTS. Separate partial attempts are not pooled. Common Expression uses its existing per-question mastered answers. A later practice attempt does not revoke an earlier award.

Trophies have the same ten sparkle particles, edge glow, masked repeating sheen, and click/keyboard lift-and-wiggle animation. Reduced-motion preferences suppress motion. Map trophies are sibling buttons so walking and lesson navigation remain independent. The normal/list view remains available. Proverb, Professional Message, and Business Speaking now also use the shared walkable meadow map.

IELTS stores checked question IDs through `ielts_trophy_progress`, using the existing student token and authenticated connection. The private tables deny direct API access; the public wrapper is SECURITY INVOKER, with owner validation in the private function. Pending progress is also saved locally per student and retried at login and when checking answers. This does not alter Eddie Farm points. Previously unchecked or unsaved IELTS scores cannot be reconstructed; checking answers now records them. New IELTS practices must be added to both the frontend catalogue and `listening_rewards.practices`.

Validation:

- `node tools/test-horsey-portals.mjs`: varying thresholds, valid question IDs, stale attempts, monotonic awards, local restore and account isolation.
- `node tools/test-horsey-portals-browser.cjs`: all ten real portal pages with isolated fixture accounts and blocked external traffic; gold/silver placement, dynamic counters, sparkle elements, click animation, hide/show, normal/map switching, celebrations, and account switching.
- Existing Sentence Structure, Idiom, Proverb, Phrasal Verb, Common Expression, IELTS, map/navigation, and mobile exercise regression checks passed.
- Supabase rollback-only fixtures verified 20/40 progress, restoration, idempotent merging, student isolation, rejected invalid IDs, unknown practices, expired tokens, and missing authentication. Anonymous RPC execution and direct table access are denied.
- Security advisors report only the intentional no-policy INFO notices for the two private tables: all direct table grants are revoked and access is exclusively through the owner-checked function.

Map screenshots: `/tmp/horsey-portals-qa/` (one PNG for each portal).
