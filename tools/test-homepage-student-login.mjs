import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const homepage = read("index.html");
const loginScript = read("homepage-student-login.js");
const sharedNav = read("shared-system-nav.js");
const sharedNavCss = read("shared-system-nav.css");
const migration = read("supabase/migrations/20261111075201_homepage_persistent_student_sessions.sql");
const rlsMigration = read("supabase/migrations/20261111075924_homepage_student_device_sessions_rls.sql");

test("homepage exposes an in-place student login and signed-in greeting", () => {
  assert.match(homepage, /data-homepage-student-login/);
  assert.match(homepage, /data-homepage-login-dialog/);
  assert.match(homepage, /data-homepage-student-greeting/);
  assert.match(homepage, /homepage-student-login\.js\?v=20261111-1/);
  assert.match(homepage, /@supabase\/supabase-js@2\.110\.8/);
  assert.match(loginScript, /return "早晨"/);
  assert.match(loginScript, /return "午安"/);
  assert.match(loginScript, /return "晚安"/);
  assert.match(homepage, /homepage-login-ornament/);
  assert.match(homepage, /src="homepage-login-eddy\.png"/);
  assert.ok(fs.statSync(path.join(root, "homepage-login-eddy.png")).size > 100_000);
});

test("device login uses the persistent Supabase auth session without persisting a student bearer token", () => {
  assert.match(loginScript, /persistSession: true/);
  assert.match(loginScript, /signInAnonymously\(\)/);
  assert.match(loginScript, /rpc\("homepage_student_login"/);
  assert.match(loginScript, /rpc\("homepage_student_resume"/);
  assert.match(loginScript, /rpc\("homepage_student_forget_device"/);
  assert.doesNotMatch(loginScript, /localStorage/);
  assert.doesNotMatch(sharedNav, /localStorage\.setItem\([^\n]*universal/i);
});

test("private device binding is password-change aware, authenticated-only, and protected by RLS", () => {
  assert.match(migration, /create schema if not exists student_device_private/);
  assert.match(migration, /password_hash_snapshot/);
  assert.match(migration, /auth\.uid\(\)/);
  assert.match(migration, /revoke all on function public\.homepage_student_login\(text, text\) from public, anon/);
  assert.match(migration, /grant execute on function public\.homepage_student_login\(text, text\) to authenticated/);
  assert.match(rlsMigration, /enable row level security/);
});

test("shared navigation restores a persistent device login behind the horse transition", () => {
  assert.match(sharedNav, /homepage_student_resume/);
  assert.match(sharedNav, /restorePersistentDeviceSession/);
  assert.match(sharedNav, /running-horse-loader\.webp/);
  assert.match(sharedNav, /location\?\.reload\(\)/);
  assert.match(sharedNavCss, /\.edmund-student-access-transition/);
  assert.match(sharedNavCss, /edmund-student-access-progress/);
});
