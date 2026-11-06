const test = require('node:test');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');

const script = execFileSync('ruby', ['-ryaml', '-e',
  'print YAML.load_file(ARGV.first).fetch("jobs").fetch("publish").fetch("steps").find { |s| s["id"] == "release" }.fetch("with").fetch("script")',
  '.github/workflows/publish-pages-artifact.yml'], {encoding: 'utf8'});
const execute = new (Object.getPrototypeOf(async function () {}).constructor)('github', 'context', 'core', 'fetch', script);
const old = 'a'.repeat(40), candidate = 'b'.repeat(40), latest = 'c'.repeat(40);
async function decide({live = old, snapshot = old, main = latest, forward = 'ahead', ancestry = 'ahead'} = {}) {
  const outputs = {};
  const github = {rest: {
    git: {getRef: async () => ({data: {object: {sha: main}}})},
    repos: {
      getContent: async () => ({data: {type: 'file', content: Buffer.from(snapshot).toString('base64')}}),
      compareCommitsWithBasehead: async ({basehead}) => ({data: {status: basehead === candidate + '...' + main ? ancestry : forward}})
    }
  }};
  const core = {summary: {addRaw() {return this}, async write() {}}, setOutput(k,v) {outputs[k] = v}};
  await execute(github, {repo: {}, sha: candidate, runId: 1}, core, async () => ({ok: true, json: async () => ({release: live})}));
  return outputs;
}
test('forward candidate publishes despite a newer main commit', async () => assert.deepEqual(await decide(), {deploy:'true',current:'true'}));
test('duplicate and old releases cannot roll production back', async () => {
  for (const state of [{live:candidate,snapshot:candidate},{forward:'behind'},{ancestry:'diverged'}])
    assert.deepEqual(await decide(state), {deploy:'false',current:'false'});
});
test('lost deployment response reconciles snapshot using the prepared artifact', async () =>
  assert.deepEqual(await decide({live:candidate}), {deploy:'false',current:'true'}));
test('inconsistent public baseline blocks a fresh deployment', async () => assert.rejects(decide({live:latest}), /snapshot differ/));
