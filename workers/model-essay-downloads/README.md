# Edmund model-essay download Worker

This Worker exposes the private `edmund-model-essays-private` R2 bucket and the
`DSE Writing Part A/`, `IELTS Writing Task 1/`, `IELTS Speaking All Parts/`, and `IELTS Reading/` prefixes in the `edmund-assets`
R2 bucket through `edmund-model-essay-downloads.edmundeducation.workers.dev`.
It validates the Flashcard student session,
rate-limits and proxies the admin password check, forces single PDFs to download,
and streams selected/all PDFs as a low-memory ZIP without loading the archive
into the browser or Worker memory.

Deployment notes:

1. Run `supabase-model-essay-downloads.sql`. The portal still uses the shared
   Flashcard student account, while the model-essay permission and audit tables
   remain isolated from Flashcard/Writing state.
2. In a private deployment session, provision the initial administrator and
   audit-secret hash. Never commit either credential:

   ```sql
   insert into public.model_essay_admin_accounts (name, password_hash)
   values ('Sam Admin', extensions.crypt('<ADMIN_PASSWORD>', extensions.gen_salt('bf', 12)))
   on conflict (name) do nothing;

   insert into public.model_essay_worker_secrets (name, secret_hash)
   values ('download-worker', decode('<WORKER_SECRET_SHA256_HEX>', 'hex'))
   on conflict (name) do nothing;
   ```

   The SHA-256 value must be calculated from the exact plaintext supplied to
   the Worker in step 4.
3. From this folder, set a long random signing secret with
   `npx wrangler@latest secret put SESSION_SIGNING_KEY`.
4. Set the separate audit secret with
   `npx wrangler@latest secret put MODEL_ESSAY_SERVICE_SECRET`, using the exact
   plaintext whose SHA-256 was provisioned in step 2.
5. Deploy with Wrangler 4.36.0 or later so the configured admin-login rate
   limiting binding is available: `npx wrangler@latest deploy`.
6. Test the Worker URL, login, one PDF, 11 selected PDFs, and download-all for
   DSE Writing Part A, IELTS Task 1, Task 2, IELTS Speaking, and each IELTS Reading passage, plus the matching
   admin audit rows.
7. Keep the Task 2 bucket private. The existing IELTS Speaking objects may
   remain on the public `r2.dev` domain, as may the IELTS Reading objects, but
   the portal deliberately routes downloads through this Worker to force
   attachment downloads, build ZIPs, apply the shared IELTS permission, and
   record audit events. Both public collections use the existing
   `SPEAKING_ASSETS` binding for the `edmund-assets` bucket.

The browser sends only catalog IDs to the ZIP endpoints. The Worker-owned
catalogs fix each ID to one exact R2 key, size, CRC-32 value, and archive name.
Regenerate DSE Writing Part A with `tools/build-dse-writing-part-a-download-catalog.py`,
IELTS Task 1 with `tools/build-ielts-task1-download-catalog.py`,
Task 2 with `tools/build-model-essay-catalog.py`, and IELTS Speaking
with `tools/build-ielts-speaking-download-catalog.py` whenever PDFs change.
Regenerate all three IELTS Reading passage catalogs with
`tools/build-ielts-reading-download-catalog.py` whenever their PDFs or passage
titles change.

Reading downloads use passage-scoped endpoints so that IDs and download-all
archives cannot cross passage boundaries:

- `/v1/reading/passage-1/files/:id` and `/v1/reading/passage-1/zip`
- `/v1/reading/passage-2/files/:id` and `/v1/reading/passage-2/zip`
- `/v1/reading/passage-3/files/:id` and `/v1/reading/passage-3/zip`

DSE Writing Part A downloads use:

- `/v1/dse/writing-part-a/files/:id`
- `/v1/dse/writing-part-a/zip`

IELTS Writing Task 1 downloads use:

- `/v1/task1/files/:id`
- `/v1/task1/zip`
