const test = require('node:test');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const deployPagesLongPoll = require('./deploy-pages-long-poll.cjs');

const workflow = '.github/workflows/publish-pages-artifact.yml';
function stepScript(id) {
  return execFileSync('ruby', ['-ryaml', '-e',
    `print YAML.load_file(ARGV.first).fetch("jobs").fetch("publish").fetch("steps").find { |s| s["id"] == "${id}" }.fetch("with").fetch("script")`,
    workflow], {encoding: 'utf8'});
}
const script = stepScript('release');
const execute = new (Object.getPrototypeOf(async function () {}).constructor)('github', 'context', 'core', 'fetch', script);
const old = 'a'.repeat(40), candidate = 'b'.repeat(40), latest = 'c'.repeat(40);
async function decide({live = old, snapshot = old, main = latest, forward = 'ahead', ancestry = 'ahead', compareFailures = 0} = {}) {
  const outputs = {};
  let compareCalls = 0;
  const github = {rest: {
    git: {getRef: async () => ({data: {object: {sha: main}}})},
    repos: {
      getContent: async () => ({data: {type: 'file', content: Buffer.from(snapshot).toString('base64')}}),
      compareCommitsWithBasehead: async ({basehead}) => {
        compareCalls += 1;
        if (compareCalls <= compareFailures) {
          const error = new Error('temporarily unavailable');
          error.status = 500;
          error.response = {data: {errors: [{code: 'not_available'}]}};
          throw error;
        }
        return {data: {status: basehead === candidate + '...' + main ? ancestry : forward}};
      }
    }
  }};
  const core = {summary: {addRaw() {return this}, async write() {}}, warning() {}, setOutput(k,v) {outputs[k] = v}};
  await execute(github, {repo: {}, sha: candidate, runId: 1}, core, async () => ({ok: true, json: async () => ({release: live})}));
  return {outputs, compareCalls};
}
test('forward candidate publishes despite a newer main commit', async () => assert.deepEqual((await decide()).outputs, {deploy:'true',current:'true'}));
test('duplicate and old releases cannot roll production back', async () => {
  for (const state of [{live:candidate,snapshot:candidate},{forward:'behind'},{ancestry:'diverged'}])
    assert.deepEqual((await decide(state)).outputs, {deploy:'false',current:'false'});
});
test('lost deployment response reconciles snapshot using the prepared artifact', async () =>
  assert.deepEqual((await decide({live:candidate})).outputs, {deploy:'false',current:'true'}));
test('inconsistent public baseline blocks a fresh deployment', async () => assert.rejects(decide({live:latest}), /snapshot differ/));
test('transient GitHub compare errors are retried without duplicating a release', async () => {
  const result = await decide({compareFailures: 2});
  assert.deepEqual(result.outputs, {deploy:'true',current:'true'});
  assert.equal(result.compareCalls, 4);
});

const recoveryScript = stepScript('deploy_recovery');
const executeRecovery = new (Object.getPrototypeOf(async function () {}).constructor)(
  'context', 'core', 'fetch', 'process', 'setTimeout', recoveryScript);
async function recover(releases, primaryPending = '') {
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
    {env: {GITHUB_RUN_ATTEMPT: '2', PRIMARY_PENDING: primaryPending}}, setTimeout);
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

test('long Pages synchronization reaches success without cancelling at ten minutes', async () => {
  const outputs = {}, requests = [], delays = [];
  const statuses = [...Array(65).fill('syncing_files'), 'succeed'];
  const github = {
    rest: {actions: {listWorkflowRunArtifacts: async () => ({data: {artifacts: [{id: 41, name: 'pages', expired: false}]}})}},
    request: async (route, payload) => {
      requests.push([route, payload]);
      if (route.startsWith('POST ')) return {data: {id: 'deployment-1'}};
      return {data: {status: statuses.shift(), page_url: 'https://example.test/'}};
    },
  };
  const core = {async getIDToken() {return 'oidc'}, info() {}, warning() {}, setOutput(k,v) {outputs[k] = v}};
  await deployPagesLongPoll({
    github, context: {repo: {owner: 'o', repo: 'r'}, runId: 7, sha: candidate}, core,
    artifactName: 'pages', maxAttempts: 70, intervalMs: 10000,
    sleep: async delay => delays.push(delay),
  });
  assert.equal(requests.filter(([route]) => route.startsWith('POST ')).length, 1);
  assert.equal(requests.filter(([route]) => route.startsWith('GET ')).length, 66);
  assert.equal(delays.reduce((sum, delay) => sum + delay, 0), 660000);
  assert.deepEqual(outputs, {pending: 'false', page_url: 'https://example.test/'});
});

test('long Pages synchronization times out without cancelling the active deployment', async () => {
  const routes = [], outputs = {};
  const github = {
    rest: {actions: {listWorkflowRunArtifacts: async () => ({data: {artifacts: [{id: 41, name: 'pages'}]}})}},
    request: async route => {
      routes.push(route);
      return route.startsWith('POST ') ? {data: {id: 'deployment-2'}} : {data: {status: 'syncing_files'}};
    },
  };
  const core = {async getIDToken() {return 'oidc'}, info() {}, warning() {}, setOutput(k,v) {outputs[k] = v}};
  await assert.rejects(
    deployPagesLongPoll({
      github, context: {repo: {}, runId: 7, sha: candidate}, core,
      artifactName: 'pages', maxAttempts: 2, intervalMs: 1, sleep: async () => {},
    }),
    /deliberately left running/,
  );
  assert.equal(routes.some(route => route.includes('/cancel')), false);
  assert.deepEqual(outputs, {pending: 'true'});
});

test('pending Pages deployment is never duplicated during reconciliation', async () => {
  const result = await recover([old], 'true');
  assert.deepEqual(result.outputs, {retry: 'false'});
  assert.equal(result.calls.length, 6);
  assert.deepEqual(result.delays, [10000, 10000, 10000, 10000, 10000]);
});
