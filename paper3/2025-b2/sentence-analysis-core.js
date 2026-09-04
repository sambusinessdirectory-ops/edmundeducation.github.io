/* Shared, deterministic sentence boundaries and source matching. */
(function (root) {
  'use strict';
  const normalize = text => String(text).normalize('NFKC').toLowerCase()
    .replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-')
    .replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
  function sentences(text) {
    const results = [];
    const boundary = /[.!?]+["'’”)]*(?:\s+|$)/g;
    let start = 0;
    for (const match of text.matchAll(boundary)) {
      const end = match.index + match[0].length;
      const candidate = text.slice(start, end);
      if (/\b(?:Mr|Mrs|Ms|Dr|Prof|St|e\.g|i\.e)\.\s*$/i.test(candidate)) continue;
      if (/\b[A-Z]\.\s*$/.test(candidate)) continue;
      if (candidate.trim()) results.push({text:candidate, start, end});
      start = end;
    }
    if (text.slice(start).trim()) results.push({text:text.slice(start), start, end:text.length});
    return results;
  }
  function matchRecords(text, section, records, contextText = '') {
    const needle = normalize(text);
    if (!needle) return [];
    const candidates = records.filter(record => record.section === section);
    const exact = candidates.filter(record => [record.quote, ...(record.aliases || [])].some(quote=>normalize(quote) === needle));
    // A source entry may analyse several adjacent sentences together.
    const matches = exact.length ? exact : candidates.filter(record => {
      const quote = normalize(record.quote);
      return (` ${quote} `).includes(` ${needle} `) ||
        (needle.split(' ').length >= 5 && (` ${needle} `).includes(` ${quote} `) && quote.split(' ').length >= 5);
    });
    if (matches.length < 2 || !contextText) return matches;
    const context = normalize(contextText);
    const contextual = matches.filter(record=>{
      const quote = normalize(record.quote);
      return (` ${quote} `).includes(` ${context} `) || (` ${context} `).includes(` ${quote} `);
    });
    return contextual.length ? contextual : matches;
  }
  const api = {normalize, sentences, matchRecords};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EdmundSentenceAnalysis = Object.freeze(api);
})(typeof window !== 'undefined' ? window : globalThis);
