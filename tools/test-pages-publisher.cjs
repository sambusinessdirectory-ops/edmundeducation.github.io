const test = require('node:test');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');

const workflow = '.github/workflows/publish-pages-artifact.yml';
function stepScript(id) {
  return execFileSync('ruby', ['-ryaml', '-e',
    `print YAML.load_file(ARGV.first).fetch("jobs").fetch("publish").fetch("steps").find { |s| s["id"] == "${id}" }.fetch("with").fetch("script")`,
    workflow], {encoding: 'utf8'});
}
const script = stepScript('release');
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

const recoveryScript = stepScript('deploy_recovery');
const executeRecovery = new (Object.getPrototypeOf(async function () {}).constructor)(
  'context', 'core', 'fetch', 'process', 'setTimeout', recoveryScript);
async function recover(releases) {
  const outputs = {}, delays = [], calls = [];
  const queue = [...releases];
  const core = {
    info() {},
    summary: {addRaw() {return this}, async write() {}},
    setOutput(key, value) {outputs[key] = value},
  };
  const fetch = async url => {
    calls.push(url);
    const release = queue.length > 1 ? queue.shift() : queue[0];
    return {ok: true, async json() {return {release}}};
  };
  const setTimeout = (callback, delay) => {delays.push(delay); callback()};
  await executeRecovery(
    {sha: candidate, runId: 7}, core, fetch,
    {env: {GITHUB_RUN_ATTEMPT: '2'}}, setTimeout);
  return {outputs, delays, calls};
}
test('failed Pages response does not redeploy an artifact that is already public', async () => {
  const result = await recover([candidate]);
  assert.deepEqual(result.outputs, {retry: 'false'});
  assert.equal(result.calls.length, 1);
  assert.deepEqual(result.delays, []);
});
test('failed Pages response gets exactly one bounded retry after reconciliation and backoff', async () => {
  const result = await recover([old]);
  assert.deepEqual(result.outputs, {retry: 'true'});
  assert.equal(result.calls.length, 6);
  assert.deepEqual(result.delays, [10000, 10000, 10000, 10000, 10000, 30000]);
});
