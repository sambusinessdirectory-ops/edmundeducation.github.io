import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../supabase/functions/writing-submission-proxy/index.ts', import.meta.url), 'utf8');
const origin = 'https://edmundeducation.com';
const token = '11111111-1111-4111-8111-111111111111';
const id = '22222222-2222-4222-8222-222222222222';
const record = {version: 1, checkedIds: ['articles'], touchedIds: ['articles', 'plural'], toggleCount: 3};

function setup() {
  const calls = [];
  let handler;
  const context = {
    Deno: {env: {get: key => key === 'SUPABASE_URL' ? 'https://project.supabase.co' : key === 'SUPABASE_SERVICE_ROLE_KEY' ? 'private-test-key' : undefined}, serve: fn => {handler = fn;}},
    Request, Response, Headers, URL, TextDecoder, ArrayBuffer, Set, Object, String, Number, JSON, console,
    fetch: async (url, options) => {
      calls.push({url: String(url), options});
      if (String(url).includes('/rest/v1/rpc/writing_submission_proofread_checklist_save')) return Response.json(record);
      if (String(url).includes('/rest/v1/rpc/writing_submission_admin_get_submission_v3')) return Response.json([{proofread_checklist: record}]);
      if (String(url).includes('/v1/admin/submissions/')) return Response.json({submission: {id, answer: 'Essay'}, grammarOccurrences: []});
      if (String(url).includes('/v1/submissions/')) return Response.json({submission: {id, answer: 'Essay'}});
      throw new Error(`Unexpected URL ${url}`);
    }
  };
  vm.runInNewContext(source, context);
  return {handler, calls};
}

test('student submission keeps the existing Worker contract and saves checklist usage', async () => {
  const {handler, calls} = setup();
  const response = await handler(new Request(`https://project.supabase.co/functions/v1/writing-submission-proxy?submissionId=${id}`, {
    method: 'PUT', headers: {Origin: origin, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({topic: 'Topic', answer: 'Essay', proofreadChecklist: record})
  }));
  assert.equal(response.status, 200);
  assert.equal(calls.length, 2);
  assert.deepEqual(JSON.parse(calls[0].options.body), {topic: 'Topic', answer: 'Essay'});
  assert.equal(calls[1].url.endsWith('/rpc/writing_submission_proofread_checklist_save'), true);
  assert.deepEqual(JSON.parse(calls[1].options.body).p_record, record);
});

test('admin detail adds the stored checklist only after authenticated Worker detail succeeds', async () => {
  const {handler, calls} = setup();
  const response = await handler(new Request(`https://project.supabase.co/functions/v1/writing-submission-proxy?operation=admin-submission-detail&submissionId=${id}`, {
    headers: {Origin: origin, Authorization: `Bearer ${token}`}
  }));
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).submission.proofreadChecklist, record);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url.endsWith(`/v1/admin/submissions/${id}`), true);
});

test('invalid checklist never reaches either backend', async () => {
  const {handler, calls} = setup();
  const response = await handler(new Request(`https://project.supabase.co/functions/v1/writing-submission-proxy?submissionId=${id}`, {
    method: 'PUT', headers: {Origin: origin, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({topic: 'Topic', answer: 'Essay', proofreadChecklist: {...record, checkedIds: ['not-an-item']}})
  }));
  assert.equal(response.status, 400);
  assert.equal(calls.length, 0);
});
