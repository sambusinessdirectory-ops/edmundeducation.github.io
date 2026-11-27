import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const registrySource = fs.readFileSync(new URL("../eddy-dialogue-registry.js", import.meta.url), "utf8");
const indexSource = fs.readFileSync(new URL("../eddy-dialogue-box-index.js", import.meta.url), "utf8");
const navigationSource = fs.readFileSync(new URL("../shared-system-nav.js", import.meta.url), "utf8");
const grammarSource = fs.readFileSync(new URL("../grammar-new-curations.js", import.meta.url), "utf8");
const context = { window: {} };
vm.runInNewContext(registrySource, context);
const registry = context.window.EDMUND_EDDY_DIALOGUE_REGISTRY;

assert.equal(registry.length, 104);
assert.equal(registry.filter(entry => entry.group === "front-page").length, 23);
assert.equal(registry.filter(entry => entry.group === "user-system").length, 48);
assert.equal(registry.filter(entry => entry.group === "grammar-curation").length, 33);
assert.match(registry.find(entry => entry.id === "eddy-after-lunch-dialogue").trigger, /星期一至五.*下午 1:00–1:59/);
assert.match(registry.find(entry => entry.id === "eddy-saturday-grocery-dialogue").trigger, /星期六.*下午 1:00–2:59/);
assert.ok(registry.filter(entry => entry.group === "grammar-curation").every(entry => /^https:\/\/edmund-public-media\.edmundeducation\.workers\.dev\/grammar-eddy-dialogues\/unless\/eddy-\d{2}\.webp\?v=20261106-live-assets2$/.test(entry.file)));

assert.match(indexSource, /adminValidated \|\| entry\.group === "front-page"/);
assert.match(indexSource, /"front-page", "user-system", "grammar-curation"/);
assert.match(indexSource, /context\.rect\(958,drawY\+8,218,rowHeight-24\);context\.clip\(\)/);
assert.match(indexSource, /String\(text\)\.trim\(\)\.split\(\/\(\\s\+\|/);
assert.match(navigationSource, /Promise\.allSettled\(\[\.\.\.merged\]/);
assert.match(navigationSource, /persistDialogueDiscovery\(student, id\)/);
assert.match(grammarSource, /eddy-grammar-curation-blackboard-/);

console.log("PASS: Eddy index visibility, precise triggers, PDF wrapping, Grammar blackboards and account sync are covered.");
