# Edmund model-essay download Worker

This Worker binds the private `edmund-model-essays-private` R2 bucket to
`edmund-model-essay-downloads.edmundeducation.workers.dev`. It validates the Flashcard student session,
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
6. Test the Worker URL, login, one PDF, 11 selected PDFs, download-all, and the
   matching admin audit rows.
7. Keep the Worker R2 bucket private so PDFs are only reachable after login.

The browser sends only catalog IDs to the ZIP endpoint. The Worker-owned
catalog fixes each ID to one exact R2 key, size, CRC-32 value, and archive name.
Regenerate it with `tools/build-model-essay-catalog.py` whenever PDFs change.
