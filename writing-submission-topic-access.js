function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function normalizeWritingTopicAccess(value) {
  if (!isPlainObject(value)) return null;
  const normalized = Object.create(null);
  for (const [rawKey, allowed] of Object.entries(value)) {
    const key = String(rawKey || "");
    // flashcard_students.access also carries this display-only message. It is
    // not an authorization entry and must never reach permission checks.
    if (key === "__adminMessage") continue;
    if (
      !key
      || key.length > 100
      || key.trim() !== key
      || /[\u0000-\u001f\u007f]/u.test(key)
      || typeof allowed !== "boolean"
    ) return null;
    normalized[key] = allowed;
  }
  return normalized;
}

export function writingTopicAccessAllows(resource, access, accessReady) {
  const sectionKey = String(resource?.sectionKey || "");
  return Boolean(
    accessReady
    && sectionKey
    && isPlainObject(access)
    && access[sectionKey] !== false
  );
}

export function canonicalAccessibleWritingTopic(catalog, resourceOrId, access, accessReady) {
  const id = typeof resourceOrId === "string"
    ? resourceOrId
    : String(resourceOrId?.id || "");
  if (!id || !Array.isArray(catalog)) return null;
  const canonical = catalog.find((resource) => resource?.id === id) || null;
  return writingTopicAccessAllows(canonical, access, accessReady) ? canonical : null;
}
