import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html = readFileSync(new URL('../flashcards.html', import.meta.url), 'utf8');
const start = html.indexOf('// Guard the form before lesson downloads');
assert.ok(start > 0);
const script = html.slice(start, html.indexOf('</script>', start));
const resourceSources = JSON.parse(script.match(/const resourceSources = (\[.*\]);/)[1]);
const dependencyBlock = html.slice(html.indexOf('<script src="https://cdn.jsdelivr.net/npm/@supabase'), html.indexOf('    const ADMIN_NAME'));
const actualResources = [...dependencyBlock.matchAll(/<script src="([^"]+)"/g)].map(match => match[1]);
assert.deepEqual(resourceSources, actualResources, 'Progress must follow the actual dependency list without changing script tags');
const markedResources = actualResources.length;
assert.equal(Number(script.match(/45 \* resources \/ (\d+)/)[1]), markedResources, 'Resource progress must match the actual downloads');
assert.ok(html.indexOf('onsubmit="return false"') < start);
assert.ok(start < html.indexOf('<script src="https://cdn.jsdelivr.net/npm/@supabase'));

const nodes = new Map();
function node(selector) {
  if (!nodes.has(selector)) nodes.set(selector, {textContent: '', hidden: false, disabled: false, style: {}, dataset: {}, attrs: {}, listeners: {},
    querySelector: node,
    addEventListener(name, fn) { this.listeners[name] = fn; },
    setAttribute(name, value) { this.attrs[name] = value; },
    removeAttribute(name) { delete this.attrs[name]; }
  });
  return nodes.get(selector);
}
let now = 0, nextTimer = 0;
const intervals = new Map(), timeouts = new Map(), documentListeners = {};
const scope = {Date: {now: () => now}, document: {querySelector: node, addEventListener(name, fn) { documentListeners[name] = fn; }},
  setInterval(fn) { const id = ++nextTimer; intervals.set(id, fn); return id; },
  clearInterval(id) { intervals.delete(id); },
  setTimeout(fn) { const id = ++nextTimer; timeouts.set(id, fn); return id; },
  clearTimeout(id) { timeouts.delete(id); }
};
scope.window = scope;
vm.runInNewContext(script, scope);
const ui = scope.EdmundFlashcardLoginStartup;
const form = node('[data-login-form]'), bar = node('[data-login-progress-bar]'), panel = node('[data-login-progress]');
function submit() {
  const event = {prevented: false, stopped: false, preventDefault() { this.prevented = true; }, stopImmediatePropagation() { this.stopped = true; }};
  form.listeners.submit(event);
  return event;
}
assert.equal(submit().prevented, true);
assert.equal(submit().stopped, true);
documentListeners.load({target: {getAttribute: () => resourceSources[0]}});
assert.ok(Number(bar.attrs['aria-valuenow']) > 5);
ui.step(55, 'Protecting records');
const loaded = bar.attrs['aria-valuenow'];
documentListeners.load({target: {getAttribute: () => resourceSources[0]}});
assert.equal(bar.attrs['aria-valuenow'], loaded, 'Late assets cannot overwrite startup status');
now = 15000;
for (const tick of intervals.values()) tick();
assert.match(node('[data-login-progress-detail]').textContent, /Still working/);
assert.equal(bar.attrs['aria-valuenow'], loaded, 'Elapsed time must not invent completion');
ui.ready();
assert.equal(bar.attrs['aria-valuenow'], '100');
assert.equal(submit().stopped, false);
assert.equal(submit().prevented, true, 'Even ready forms must never natively submit credentials');
assert.equal(intervals.size, 0);
ui.begin();
assert.equal(panel.hidden, false);
assert.equal(bar.attrs['aria-valuenow'], '5');
assert.equal(timeouts.size, 0, 'New login must cancel the previous completion hide timer');
ui.loginStep(65, 'Loading records');
ui.loginStep(35, 'Retrying');
assert.equal(bar.attrs['aria-valuenow'], '65');
ui.notice('Records unavailable', true);
assert.equal(panel.dataset.state, 'warning');
assert.equal(bar.attrs['aria-valuenow'], '65');
assert.equal(intervals.size, 0);
ui.loginStep(90, 'Late response');
assert.equal(bar.attrs['aria-valuenow'], '65');
ui.begin();
ui.loginStep(96, 'Opening learning page');
ui.finish();
assert.equal(bar.attrs['aria-valuenow'], '100');
assert.equal(panel.dataset.state, 'complete');
for (const hide of [...timeouts.values()]) hide();
assert.equal(panel.hidden, true);
ui.begin();
ui.fail('Storage unavailable');
assert.equal(submit().stopped, true);
assert.equal(node('button[type="submit"]').disabled, true);
assert.equal(intervals.size, 0);
console.log('Flashcard progress: resource counts, guarded submit, real milestones, slow waits, retries, completion, and failure passed.');
