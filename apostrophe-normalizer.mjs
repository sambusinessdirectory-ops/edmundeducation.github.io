const RIGHT_SINGLE_QUOTATION_MARK = String.fromCodePoint(0x2019);
const STRAIGHT_APOSTROPHE = "'";
const NORMALIZED_ATTRIBUTES = ["alt", "aria-description", "aria-label", "placeholder", "title"];
const OBSERVED_ATTRIBUTES = [...NORMALIZED_ATTRIBUTES, "value"];
const NORMALIZED_INPUT_TYPES = new Set(["", "search", "text"]);
const SENSITIVE_AUTOCOMPLETE_TOKENS = new Set([
  "cc-csc",
  "cc-exp",
  "cc-exp-month",
  "cc-exp-year",
  "cc-number",
  "current-password",
  "email",
  "new-password",
  "one-time-code",
  "url",
  "username",
]);
const EXCLUDED_SUBTREE_SELECTOR = [
  "script",
  "style",
  "noscript",
  "template",
  "pre",
  "code",
  "kbd",
  "samp",
  "var",
  "select",
  "option",
  "datalist",
  "iframe",
  "object",
  "embed",
  "[contenteditable]",
  "[data-edmund-apostrophe='preserve']",
  "[data-preserve-apostrophes]",
].join(",");
const SENSITIVE_CONTROL_IDENTIFIER = /(?:username|studentname|accountname|login|email|password|passcode|otp|token|url|uri)/i;
const installedDocuments = new WeakSet();

export function normalizeApostrophes(value) {
  if (typeof value !== "string" || !value.includes(RIGHT_SINGLE_QUOTATION_MARK)) return value;
  return value.split(RIGHT_SINGLE_QUOTATION_MARK).join(STRAIGHT_APOSTROPHE);
}

function mustPreserve(element) {
  return Boolean(element?.closest?.(EXCLUDED_SUBTREE_SELECTOR));
}

function hasSensitiveAutocomplete(control) {
  const autocomplete = String(control?.getAttribute?.("autocomplete") || control?.autocomplete || "")
    .toLowerCase()
    .trim();
  if (!autocomplete) return false;
  return autocomplete.split(/\s+/).some((token) => SENSITIVE_AUTOCOMPLETE_TOKENS.has(token));
}

function hasSensitiveIdentifier(control) {
  const identifier = `${control?.getAttribute?.("name") || control?.name || ""} ${control?.id || ""}`
    .replace(/[\s_:-]+/g, "");
  return SENSITIVE_CONTROL_IDENTIFIER.test(identifier);
}

function isNormalizableControl(control) {
  const tagName = String(control?.tagName || "").toUpperCase();
  if (tagName === "TEXTAREA") return !mustPreserve(control);
  if (tagName !== "INPUT" || mustPreserve(control)) return false;

  const type = String(control.getAttribute?.("type") || control.type || "text").toLowerCase();
  const inputMode = String(control.getAttribute?.("inputmode") || control.inputMode || "").toLowerCase();
  return NORMALIZED_INPUT_TYPES.has(type)
    && inputMode !== "email"
    && inputMode !== "url"
    && !hasSensitiveAutocomplete(control)
    && !hasSensitiveIdentifier(control);
}

export function normalizeControlValue(control) {
  if (!isNormalizableControl(control) || typeof control.value !== "string") return false;

  const normalized = normalizeApostrophes(control.value);
  if (normalized === control.value) return false;

  const selectionStart = control.selectionStart;
  const selectionEnd = control.selectionEnd;
  const selectionDirection = control.selectionDirection;
  control.value = normalized;

  if (
    typeof control.setSelectionRange === "function"
    && Number.isInteger(selectionStart)
    && Number.isInteger(selectionEnd)
  ) {
    try {
      control.setSelectionRange(selectionStart, selectionEnd, selectionDirection || "none");
    } catch (_) {
      // Some input types expose selection properties but reject setting them.
    }
  }

  return true;
}

export function normalizeTextNode(node) {
  if (!node || node.nodeType !== 3 || typeof node.nodeValue !== "string") return false;
  const parent = node.parentElement;
  if (mustPreserve(parent)) return false;

  const normalized = normalizeApostrophes(node.nodeValue);
  if (normalized === node.nodeValue) return false;
  node.nodeValue = normalized;
  return true;
}

export function normalizeElementAttributes(element) {
  if (!element || element.nodeType !== 1 || mustPreserve(element)) return false;
  let changed = false;

  for (const attribute of NORMALIZED_ATTRIBUTES) {
    if (!element.hasAttribute?.(attribute)) continue;
    const current = element.getAttribute(attribute);
    const normalized = normalizeApostrophes(current);
    if (normalized === current) continue;
    element.setAttribute(attribute, normalized);
    changed = true;
  }

  if (isNormalizableControl(element) && element.hasAttribute?.("value")) {
    const current = element.getAttribute("value");
    const normalized = normalizeApostrophes(current);
    if (normalized !== current) {
      element.setAttribute("value", normalized);
      changed = true;
    }
  }

  return normalizeControlValue(element) || changed;
}

function normalizeNode(node) {
  if (node?.nodeType === 3) return normalizeTextNode(node);
  if (node?.nodeType === 1) return normalizeElementAttributes(node);
  return false;
}

export function normalizeTree(root, documentRef = root?.ownerDocument || globalThis.document) {
  if (!root || !documentRef) return 0;
  if (root.nodeType === 1 && mustPreserve(root)) return 0;
  let changes = normalizeNode(root) ? 1 : 0;
  const nodeFilter = documentRef.defaultView?.NodeFilter || globalThis.NodeFilter;

  if (typeof documentRef.createTreeWalker === "function" && nodeFilter) {
    const walker = documentRef.createTreeWalker(
      root,
      nodeFilter.SHOW_ELEMENT | nodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (node.nodeType === 1 && mustPreserve(node)) return nodeFilter.FILTER_REJECT;
          return nodeFilter.FILTER_ACCEPT;
        },
      },
    );
    let node = walker.nextNode();
    while (node) {
      if (normalizeNode(node)) changes += 1;
      node = walker.nextNode();
    }
    return changes;
  }

  for (const child of Array.from(root.childNodes || [])) {
    changes += normalizeTree(child, documentRef);
  }
  return changes;
}

export function installApostropheNormalizer(documentRef = globalThis.document) {
  if (!documentRef || installedDocuments.has(documentRef)) return false;
  installedDocuments.add(documentRef);

  const windowRef = documentRef.defaultView || globalThis;
  const MutationObserverRef = windowRef.MutationObserver || globalThis.MutationObserver;

  const start = () => {
    normalizeTree(documentRef.documentElement || documentRef, documentRef);

    if (MutationObserverRef && documentRef.documentElement) {
      const observer = new MutationObserverRef((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "characterData") {
            normalizeTextNode(mutation.target);
            continue;
          }
          if (mutation.type === "attributes") {
            normalizeElementAttributes(mutation.target);
            continue;
          }
          for (const node of mutation.addedNodes || []) normalizeTree(node, documentRef);
        }
      });
      observer.observe(documentRef.documentElement, {
        attributeFilter: OBSERVED_ATTRIBUTES,
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true,
      });
    }

    const normalizeInputTarget = (event) => {
      if (event.isComposing || event.target?.isComposing) return;
      const target = event.target;
      normalizeControlValue(target);
    };

    documentRef.addEventListener?.("input", normalizeInputTarget, true);
    documentRef.addEventListener?.("change", normalizeInputTarget, true);
    documentRef.addEventListener?.("focusin", normalizeInputTarget, true);
    documentRef.addEventListener?.("compositionend", normalizeInputTarget, true);
    documentRef.addEventListener?.("submit", (event) => {
      for (const control of Array.from(event.target?.elements || [])) normalizeControlValue(control);
    }, true);
  };

  if (documentRef.readyState === "loading") {
    documentRef.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }

  return true;
}

globalThis.EdmundText = Object.freeze({
  apostrophe: normalizeApostrophes,
  normalizeControl: normalizeControlValue,
  normalizeSubtree: normalizeTree,
});
if (!globalThis.EdmundTextReady) {
  globalThis.EdmundTextReady = Promise.resolve(globalThis.EdmundText);
}

if (typeof document !== "undefined") installApostropheNormalizer(document);
