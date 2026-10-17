import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync('dse-argument-bank/app.mjs', 'utf8');
const storageCode = source.slice(source.indexOf('const authMemory ='), source.indexOf('const client ='));
const disk = new Map([['auth-token', 'expired-session']]);
const storage = {
  getItem(key) { return disk.get(key) ?? null; },
  setItem() { throw new Error('QuotaExceededError'); },
  removeItem(key) { disk.delete(key); },
};
const context = { Map, sessionStorage: storage };
runInNewContext(`${storageCode}\nglobalThis.resilientStorage = resilientStorage`, context);
context.resilientStorage.setItem('auth-token', 'refreshed-session');
assert.equal(context.resilientStorage.getItem('auth-token'), 'refreshed-session');
assert.equal(disk.has('auth-token'), false, 'a stale persisted token must be removed');
context.resilientStorage.removeItem('auth-token');
assert.equal(context.resilientStorage.getItem('auth-token'), null);

const rpcCode = source.slice(source.indexOf('async function rpc('), source.indexOf('\nfunction toast('));
let signedIn = 0;
let rpcCalled = 0;
const authContext = {
  client: {
    auth: {
      async getSession() { return { data: { session: null }, error: new Error('Invalid Refresh Token') }; },
      async signInAnonymously() { signedIn++; return { error: null }; },
    },
    async rpc() { rpcCalled++; return { data: { saved: true }, error: null }; },
  },
  Error,
};
runInNewContext(`${rpcCode}\nglobalThis.rpc = rpc`, authContext);
assert.equal((await authContext.rpc('dse_argument_save_state')).saved, true);
assert.equal(signedIn, 1, 'a broken stored auth session should be replaced');
assert.equal(rpcCalled, 1, 'the save should reach Supabase after auth recovery');

console.log('DSE auth storage fallback and save recovery verified.');
