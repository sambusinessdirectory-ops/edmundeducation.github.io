import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

import {
  installApostropheNormalizer,
  normalizeApostrophes,
  normalizeControlValue,
  normalizeElementAttributes,
  normalizeTextNode,
} from "../apostrophe-normalizer.mjs";

const root = new URL("../", import.meta.url);
const forbidden = String.fromCodePoint(0x2019);

test("normalizes every right single quotation mark in a string", () => {
  assert.equal(
    normalizeApostrophes(`Students${forbidden} work isn${forbidden}t missing.`),
    "Students' work isn't missing.",
  );
  assert.equal(normalizeApostrophes("Already straight: don't"), "Already straight: don't");
  assert.equal(normalizeApostrophes(null), null);
});

test("normalizes text nodes but never executable script text", () => {
  const visible = {
    nodeType: 3,
    nodeValue: `Edmund${forbidden}s lesson`,
    parentElement: { tagName: "P", closest: () => null },
  };
  assert.equal(normalizeTextNode(visible), true);
  assert.equal(visible.nodeValue, "Edmund's lesson");

  const script = {
    nodeType: 3,
    nodeValue: `const label = "Edmund${forbidden}s";`,
    parentElement: { tagName: "SCRIPT", closest: () => ({ tagName: "SCRIPT" }) },
  };
  assert.equal(normalizeTextNode(script), false);
  assert.ok(script.nodeValue.includes(forbidden));
});

test("normalizes visible attributes and preserves URLs", () => {
  const attributes = new Map([
    ["title", `Student${forbidden}s page`],
    ["aria-label", `Teacher${forbidden}s note`],
    ["href", `/student${forbidden}s-page.html`],
  ]);
  const element = {
    nodeType: 1,
    tagName: "A",
    closest: () => null,
    hasAttribute: (name) => attributes.has(name),
    getAttribute: (name) => attributes.get(name),
    setAttribute: (name, value) => attributes.set(name, value),
  };

  assert.equal(normalizeElementAttributes(element), true);
  assert.equal(attributes.get("title"), "Student's page");
  assert.equal(attributes.get("aria-label"), "Teacher's note");
  assert.equal(attributes.get("href"), `/student${forbidden}s-page.html`);

  const inputAttributes = new Map([
    ["type", "text"],
    ["value", `Student${forbidden}s draft`],
  ]);
  const input = {
    nodeType: 1,
    tagName: "INPUT",
    type: "text",
    value: `Student${forbidden}s draft`,
    closest: () => null,
    hasAttribute: (name) => inputAttributes.has(name),
    getAttribute: (name) => inputAttributes.get(name),
    setAttribute: (name, value) => inputAttributes.set(name, value),
  };
  assert.equal(normalizeElementAttributes(input), true);
  assert.equal(input.value, "Student's draft");
  assert.equal(inputAttributes.get("value"), "Student's draft");
});

test("normalizes writing fields without moving the cursor or changing passwords", () => {
  let restoredSelection = null;
  const textarea = {
    tagName: "TEXTAREA",
    value: `It${forbidden}s useful.`,
    selectionStart: 4,
    selectionEnd: 4,
    selectionDirection: "none",
    closest: () => null,
    setSelectionRange: (...args) => { restoredSelection = args; },
  };
  assert.equal(normalizeControlValue(textarea), true);
  assert.equal(textarea.value, "It's useful.");
  assert.deepEqual(restoredSelection, [4, 4, "none"]);

  const password = {
    tagName: "INPUT",
    type: "password",
    value: `secret${forbidden}value`,
    closest: () => null,
    getAttribute: () => "password",
  };
  assert.equal(normalizeControlValue(password), false);
  assert.ok(password.value.includes(forbidden));

  const username = {
    tagName: "INPUT",
    type: "text",
    name: "student_username",
    value: `student${forbidden}one`,
    closest: () => null,
    getAttribute: (name) => (name === "type" ? "text" : name === "name" ? "student_username" : null),
  };
  assert.equal(normalizeControlValue(username), false);
  assert.ok(username.value.includes(forbidden));

  const disguisedUrl = {
    tagName: "INPUT",
    type: "text",
    inputMode: "url",
    value: `https://example.com/student${forbidden}s-page`,
    closest: () => null,
    getAttribute: (name) => (name === "type" ? "text" : name === "inputmode" ? "url" : null),
  };
  assert.equal(normalizeControlValue(disguisedUrl), false);
  assert.ok(disguisedUrl.value.includes(forbidden));
});

test("the installed detector normalizes initial, dynamic and typed page content", () => {
  let mutationCallback = null;
  let observedOptions = null;
  const listeners = new Map();
  const rootElement = {
    nodeType: 1,
    tagName: "MAIN",
    childNodes: [],
    closest: () => null,
  };
  const initialText = {
    nodeType: 3,
    nodeValue: `Teacher${forbidden}s guide`,
    parentElement: rootElement,
  };
  const documentRef = {
    readyState: "complete",
    documentElement: rootElement,
    defaultView: {
      NodeFilter: { FILTER_ACCEPT: 1, FILTER_REJECT: 2, SHOW_ELEMENT: 1, SHOW_TEXT: 4 },
      MutationObserver: class {
        constructor(callback) { mutationCallback = callback; }
        observe(_target, options) { observedOptions = options; }
      },
    },
    createTreeWalker: () => {
      const nodes = [initialText];
      let index = 0;
      return { nextNode: () => nodes[index++] || null };
    },
    addEventListener: (type, handler) => listeners.set(type, handler),
  };

  assert.equal(installApostropheNormalizer(documentRef), true);
  assert.equal(initialText.nodeValue, "Teacher's guide");
  assert.equal(observedOptions.characterData, true);
  assert.equal(observedOptions.childList, true);
  assert.equal(observedOptions.subtree, true);

  const dynamicText = {
    nodeType: 3,
    nodeValue: `Student${forbidden}s answer`,
    parentElement: rootElement,
    ownerDocument: documentRef,
  };
  mutationCallback([{ type: "childList", addedNodes: [dynamicText] }]);
  assert.equal(dynamicText.nodeValue, "Student's answer");

  const textarea = {
    tagName: "TEXTAREA",
    value: `It${forbidden}s corrected while typing.`,
    closest: () => null,
  };
  listeners.get("input")({ target: textarea });
  assert.equal(textarea.value, "It's corrected while typing.");

  textarea.value = `Student${forbidden}s final answer.`;
  listeners.get("compositionend")({ target: textarea });
  assert.equal(textarea.value, "Student's final answer.");
});

test("the shared page bootstrap and offline page load the normalizer", async () => {
  const [register, worker, workflow, offline] = await Promise.all([
    readFile(new URL("pwa-register.js", root), "utf8"),
    readFile(new URL("service-worker.js", root), "utf8"),
    readFile(new URL(".github/workflows/pages.yml", root), "utf8"),
    readFile(new URL("offline.html", root), "utf8"),
  ]);

  assert.match(register, /import\("\/apostrophe-normalizer\.mjs"\)/);
  assert.match(register, /window\.EdmundTextReady = import/);
  assert.match(worker, /"\/apostrophe-normalizer\.mjs"/);
  assert.match(workflow, /node --test tools\/test-apostrophe-normalizer\.mjs/);
  assert.match(offline, /<script type="module" src="\/apostrophe-normalizer\.mjs"><\/script>/);
});

test("the runtime watches static, dynamic and typed content", async () => {
  const source = await readFile(new URL("apostrophe-normalizer.mjs", root), "utf8");
  assert.match(source, /MutationObserverRef/);
  assert.match(source, /characterData: true/);
  assert.match(source, /childList: true/);
  assert.match(source, /subtree: true/);
  assert.match(source, /addEventListener\?\.\("input", normalizeInputTarget, true\)/);
  assert.match(source, /addEventListener\?\.\("change", normalizeInputTarget, true\)/);
  assert.match(source, /addEventListener\?\.\("compositionend", normalizeInputTarget, true\)/);
  assert.match(source, /addEventListener\?\.\("submit"/);
  assert.match(source, /globalThis\.EdmundText/);
  assert.match(source, /globalThis\.EdmundTextReady/);
});
