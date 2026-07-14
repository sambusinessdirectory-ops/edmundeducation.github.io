# Edmund model-essay download Worker

This Worker binds the private `edmund-model-essays-private` R2 bucket to
`edmund-model-essay-downloads.edmundeducation.workers.dev`. It validates the Flashcard student session,
forces single PDFs to download, and streams selected/all PDFs as a low-memory
ZIP without loading the archive into the browser or Worker memory.

Deployment notes:

1. The Worker reuses the existing Supabase `flashcard_session_student_id` RPC,
   so Flashcards, Writing Practice, and this portal share the same student login.
2. From this folder, set a long random signing secret with
   `npx wrangler@latest secret put SESSION_SIGNING_KEY`.
3. Deploy with `npx wrangler@latest deploy`.
4. Test the Worker URL, login, one PDF, 11 selected PDFs, and download-all.
5. Keep the Worker R2 bucket private so PDFs are only reachable after login.

The browser sends only catalog IDs to the ZIP endpoint. The Worker-owned
catalog fixes each ID to one exact R2 key, size, CRC-32 value, and archive name.
Regenerate it with `tools/build-model-essay-catalog.py` whenever PDFs change.
