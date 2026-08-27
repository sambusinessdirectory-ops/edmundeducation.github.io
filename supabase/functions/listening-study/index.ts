import { handleRequest } from './server.mjs';

// verify_jwt=false is intentional: every protected route verifies the existing
// canonical student token OR the separate hash-only Listening admin session.
Deno.serve(request => handleRequest(request, {
  url: Deno.env.get('SUPABASE_URL'),
  key: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
}));
