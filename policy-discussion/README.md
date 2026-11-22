# Policy Discussion

Mirrors News Discussion at `/policy-discussion.html`. News and policy content, bookmarks and learning checks use separate tables; the existing student and discussion-admin authentication is reused.

The construction-safety article retains the source news title/photo and asks how site management should balance progress with safety. `tools/build-policy-discussion.py` imports that supplied manuscript and checks 141 proposals, 25 objections, 830 glossary pairs, 20 structures and 42 alternative-expression groups.

The Repulse Bay pigeon article is built from `tools/content-sources/policy-repulse-bay-pigeon-b1-b2.md` by `tools/build-policy-discussion-pigeon.py`. It preserves 139 proposals, 24 objections, 815 glossary pairs, 20 structures, 59 thematic vocabulary groups and every supplementary section. `tools/build-policy-discussion-pigeon-migration.py` produces the idempotent article/image seed. The original News Discussion content is unchanged.

Database setup is in `supabase-policy-discussion.sql`. It was applied as `create_policy_discussion`; initial article ID is `ea7f1a04-a918-4d23-8ada-bb62d8494a5b`. RLS is enabled, direct table access and anonymous RPC access are revoked, and authenticated RPCs validate account-bound sessions. Security-advisor flags for RPC-only access are intentional; all entry points use the existing validated account/admin helpers.

Validation: `node tools/test-policy-discussion-browser.cjs`; `python3 tools/build-policy-discussion.py`; syntax checks for both modules. Live rollback-only database tests cover unauthenticated/cross-session rejection, article/image retrieval, learning/bookmark saves and teacher create/edit/hide/remove operations. Shared-navigation's broad suite has the same five failures on the unmodified baseline (stale release/card expectations and an existing writing-session assertion).
