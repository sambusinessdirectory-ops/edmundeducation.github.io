// Public course content is fetched only when a signed-in view needs it.
// A failed download is retryable; it never invalidates a student's session.
export function createLessonLibrary(manifestUrl, { fetcher = fetch, timeoutMs = 30000 } = {}) {
  const content = { version: 'loading', lessons: [] };
  let catalogPromise, searchPromise, searchUrl;
  const pending = new Map();
  async function json(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetcher(url, { signal: controller.signal, credentials: 'omit' });
      if (!response.ok) throw new Error(`Lesson download failed (${response.status})`);
      return await response.json();
    } finally { clearTimeout(timer); }
  }
  function catalog() {
    return catalogPromise ||= (async () => {
      const data = await json(manifestUrl);
      if (!Array.isArray(data.lessons) || !data.lessons.length) throw new Error('Lesson directory unavailable');
      content.version = data.version;
      content.lessons = data.lessons.map(({ questionRefs, ...lesson }) => ({
        ...lesson,
        questions: questionRefs.map(([id, number]) => ({ id, number }))
      }));
      searchUrl = new URL(data.search, manifestUrl);
      return content;
    })().catch(error => { catalogPromise = null; throw error; });
  }
  function loaded(id) { return Boolean(content.lessons.find(lesson => lesson.id === id && !lesson.detail)); }
  async function lesson(id) {
    await catalog();
    const item = content.lessons.find(row => row.id === id);
    if (!item) throw new Error('Unknown lesson');
    if (!item.detail) return item;
    if (!pending.has(id)) pending.set(id, (async () => {
      const data = await json(new URL(item.detail, manifestUrl));
      if (data.id !== id || !Array.isArray(data.questions)
        || data.questions.length !== item.questions.length
        || data.questions.some((q, i) => q.id !== item.questions[i].id)) throw new Error('Invalid lesson download');
      Object.assign(item, data);
      delete item.detail;
      return item;
    })().finally(() => pending.delete(id)));
    return pending.get(id);
  }
  async function many(ids) {
    const queue = [...new Set(ids)];
    // Bookmarks can span many units. Avoid flooding a slow connection.
    await Promise.all(Array.from({ length: Math.min(4, queue.length) }, async () => {
      while (queue.length) await lesson(queue.shift());
    }));
  }
  function search() {
    return searchPromise ||= (async () => {
      await catalog();
      const rows = await json(searchUrl);
      if (!Array.isArray(rows)) throw new Error('Search unavailable');
      const byId = new Map(content.lessons.map(row => [row.id, row]));
      return rows.map(([lessonId, page, kind, questionId, questionNumber, texts]) => {
        const row = byId.get(lessonId);
        return { lessonId, page, kind, questionId, questionNumber, texts, title: row.title, titleEn: row.titleEn };
      });
    })().catch(error => { searchPromise = null; throw error; });
  }
  return { content, catalog, lesson, loaded, many, search };
}
