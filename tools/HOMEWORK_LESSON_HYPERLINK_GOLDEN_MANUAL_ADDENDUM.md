# Golden Manual Addendum — Lesson Hyperlinks in Homework

**System:** EdmundEducation Homework & Revision Schedule  
**Companion manual:** `tools/HOMEWORK_RESOURCE_CATALOG_SOP.md`  
**Effective date:** 19 September 2026  
**Reference implementations:** Polysemy and Native English

## 1. Purpose and completion standard

This procedure covers a lesson-based learning system that must appear in the Homework picker. A completed implementation lets an administrator type the system name, choose one exact lesson, save it in a Schedule slot, and let a logged-in or logged-out student reach that exact lesson. If login is required, the requested lesson must remain selected after login.

A portal homepage link does not meet the standard. A hand-written catalogue row does not meet the standard when the portal already has a canonical lesson catalogue. Completion requires all four layers:

1. The canonical portal catalogue owns stable lesson IDs and display names.
2. The Homework generator converts every valid lesson into a resource.
3. The Homework URL validator accepts only the exact portal and query contract.
4. The destination portal reads the deep link before or immediately after authentication.

## 2. Current reference contract

| Homework type | Trigger | Canonical source | Exact route | Current lessons |
|---|---|---|---|---:|
| `polysemy` | `Polysemy` | `polysemy-lab/catalogue.mjs` | `polysemy-lab.html?module=<id>` | 91 |
| `native-english` | `Native English` | `natural-english/catalogue.mjs` | `natural-english.html?module=<id>` | 6 |

`Natural English` remains an accepted typing alias for `Native English`. The visible taxonomy and picker use the requested name, Native English.

The 38 lesson links bring the generated Homework catalogue to 6,027 resources at the effective date. Counts are regression guards and must be updated whenever the canonical catalogues intentionally change.

## 3. Canonical lesson requirements

Every lesson needs:

- A permanent, human-readable ID such as `show` or `dressing`.
- A consecutive numeric position for predictable display and numeric search.
- A student-facing title.
- Content owned by the destination portal rather than duplicated in Homework.

IDs become stored Schedule data. Renaming an ID breaks previously saved homework unless the destination preserves an alias. Prefer adding a new display title while keeping the ID unchanged.

For module catalogues, IDs must match:

```text
^[a-z0-9][a-z0-9-]{0,79}$
```

Do not put student IDs, passwords, session tokens, signed URLs, storage paths, or other user-specific state in a lesson record.

## 4. Add or extend a lesson portal

### Step 1 — Prove the destination route

Choose one query parameter for the stable lesson ID. The reference portals use `module`:

```text
portal.html?module=stable-lesson-id
```

The portal must validate the ID against its own catalogue. Unknown IDs should fall back to the library or a safe default. It must never construct a file path or execute data directly from the query string.

### Step 2 — Preserve the requested lesson through login

Read the route when the authenticated application becomes ready, not only at initial script load. The required priority is:

1. A valid lesson in the current URL.
2. A valid lesson remembered for that student, if the URL has no lesson.
3. The portal default or lesson library.

This prevents the common failure in which a Homework link reaches the login screen and then loses its destination. Polysemy uses `routedModule()` during `enter()`. Native English reads the `module` parameter in `startReady()`.

### Step 3 — Keep browser navigation correct

Selecting a lesson should call `history.pushState()` with the exact deep link. A `popstate` handler must reopen the lesson represented by the URL. This makes Back, Forward, copied links, new tabs, and bookmarked Homework links behave consistently.

### Step 4 — Register the Homework type

Add one definition to `HOMEWORK_RESOURCE_TYPES` in `schedule-homework-links.mjs` with:

- A unique `type`.
- The exact autocomplete `trigger`.
- Optional legacy or alternate `aliases`.
- The visible `label`, picker title, picker noun, and colour.

Add the one permitted pathname to `ALLOWED_PAGES_BY_TYPE`. Add the exact query keys to `EXPECTED_PARAMETERS_BY_PAGE`.

### Step 5 — Enforce the URL contract

`normalizeHomeworkHref()` must accept only:

- The production origin or a relative same-origin URL.
- The exact allowed page.
- The exact expected query key count.
- A non-empty module ID matching the stable-ID pattern.
- No fragment, credentials, extra tracking parameter, student identifier, or external origin.

`normalizeHomeworkResource()` must also bind the resource type to its own page. A Native English resource pointing to Polysemy must be rejected even if the URL is otherwise well formed.

### Step 6 — Generate from the canonical source

Update `tools/generate-homework-resource-catalog.mjs`. Import the canonical catalogue and map each module to:

```js
{
  id: `${type}:${lesson.id}`,
  type,
  ordinal: lesson.number,
  label: `#${lesson.number} · ${studentFacingTitle}`,
  detail: `${systemName} #${lesson.number} · ${secondaryDescription}`,
  url: `${page}?module=${encodeURIComponent(lesson.id)}`
}
```

The generator must stop on an empty catalogue, a missing ID, an invalid ID, or a numbering mismatch. It must produce byte-for-byte identical output on repeated runs.

Never edit `homework-resource-catalog.mjs` by hand. Regenerate it:

```bash
node tools/generate-homework-resource-catalog.mjs
```

### Step 7 — Bust browser caches together

When the Homework types or catalogue changes, update the version strings for:

- `schedule-homework-links.mjs` imported by `schedule-system.js`.
- `homework-resource-catalog.mjs` loaded by `schedule-system.js`.
- `schedule-system.js` loaded by `schedule-system.html`.
- `schedule-homework-links.mjs` loaded by the Homework Hot Keys admin page.
- Any destination application script changed for deep-link routing.

Use one release identifier across related Schedule files so a browser cannot combine old validation code with a new catalogue.

## 5. Required tests

Update `tools/test-schedule-homework-links.mjs` with:

- The new total and per-type counts.
- The first and last lesson IDs.
- Exact expected deep-link URLs.
- Autocomplete trigger and alias checks.
- A valid normalization example.
- Rejections for a missing query, extra query, fragment, external origin, malformed ID, and wrong portal/type pairing.
- The new cache-version assertions.

Add a destination regression proving that the portal reads the query after login, updates browser history, and responds to Back/Forward. Run the portal's existing data and browser tests when available.

Minimum commands for these reference systems:

```bash
node tools/generate-homework-resource-catalog.mjs
node tools/test-schedule-homework-links.mjs
node tools/test-polysemy-lab.mjs
node tools/test-natural-english.mjs
node tools/test-natural-english-modules.mjs
git diff --check
```

The Pages workflow must run the generator before copying the deployment artifact. The tracked generated catalogue and a fresh temporary generation must match exactly.

## 6. Manual acceptance test

Test once as an administrator and once as a student:

1. Open Homework/Schedule and type the new trigger.
2. Confirm the picker shows every current lesson once and in numeric order.
3. Search by lesson number, English title, and Chinese title when present.
4. Choose a lesson and confirm its readable title is inserted in the slot.
5. Save, reload, and confirm the native link remains visible and keyboard focusable.
6. Open the link while logged out, log in, and confirm the exact requested lesson opens.
7. Open another lesson and use Back and Forward.
8. Repeat on a narrow mobile viewport and confirm the picker and lesson do not overflow.

After deployment, fetch the production catalogue with a unique cache-busting query and verify the first and last IDs for each new type. Then repeat the saved Homework link test on the public domain.

## 7. Common failures and fixes

| Problem | Cause | Required fix |
|---|---|---|
| Trigger appears but no lessons are listed | Type exists but the generator has no source mapping, or the deployed catalogue is stale | Add canonical generation, regenerate, update cache keys, and redeploy |
| Lesson exists in source but not Homework | Invalid or duplicate ID, numbering gap, or build not run | Correct the canonical record and run the generator; do not patch the generated file |
| Saved marker disappears | Type, ID prefix, page, or query fails normalization | Make the type and allowlist contract agree; retain strict URL validation |
| Link opens the login screen and then the wrong lesson | Destination reads the route too early or prefers local storage | Read the URL after authentication and give a valid URL route first priority |
| Back returns to the wrong lesson | Lesson clicks do not update history or no `popstate` handler exists | Push the exact module route and restore from the URL on `popstate` |
| New code is deployed but users see old choices | Mixed browser caches | Change all related version strings and verify production with a cache-busting query |
| Generated catalogue differs on the second run | Generator depends on time, filesystem order, or mutable data | Sort inputs and output, use stable imports, and remove nondeterministic fields |
| An external or parameter-injected link is accepted | URL allowlist is too broad | Require exact origin, path, parameter set, value format, and no fragment |

## 8. Maintenance and rollback

Adding a valid Polysemy or Native English module to its canonical catalogue automatically adds a Homework choice on the next build. Update count assertions, regenerate, test, and deploy. No Schedule code change is needed while the route contract remains unchanged.

Removing or renaming a lesson affects existing saved Schedule snapshots. Before removal, decide whether the destination should keep an ID alias or show a clear unavailable state. Never silently redirect an old lesson ID to unrelated content.

If a release fails, revert the generator, type contract, destination router, generated catalogue, and cache versions as one unit. Deploy the reverted unit and verify a previously saved Homework link. Do not roll back only the generated file because the validator and destination may then disagree with it.

## 9. Release record

For every lesson-hyperlink release, record:

- Portal name and resource type.
- Canonical source file.
- Route contract.
- Old and new lesson counts.
- Test commands and results.
- Pull request and merge commit.
- Production verification time and example lesson URLs.

This record makes later catalogue growth routine and makes a routing or cache regression diagnosable without rediscovering the architecture.
