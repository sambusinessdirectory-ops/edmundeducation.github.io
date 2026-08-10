(function registerListeningCatalogue() {
  "use strict";

  const practices = Array.from({ length: 20 }, (_, practiceIndex) => {
    const practice = practiceIndex + 1;
    return Object.freeze({
      id: `ielts-listening-practice-${practice}`,
      practice,
      title: `IELTS Listening Practice ${practice}`,
      href: `listening-system.html?section=ielts&practice=${practice}`,
      parts: Object.freeze(Array.from({ length: 4 }, (_, partIndex) => {
        const part = partIndex + 1;
        return Object.freeze({
          id: `ielts-listening-practice-${practice}-part-${part}`,
          practice,
          part,
          title: `IELTS Listening Practice ${practice} - Part ${part}`,
          href: `listening-system.html?section=ielts&practice=${practice}&part=${part}`
        });
      }))
    });
  });

  window.EDMUND_LISTENING_CATALOG = Object.freeze({
    version: 1,
    systems: Object.freeze([
      Object.freeze({ id: "dse", title: "DSE Paper 3 Part A 聆聽" }),
      Object.freeze({ id: "ielts", title: "IELTS 聆聽" })
    ]),
    practices: Object.freeze(practices)
  });
})();
