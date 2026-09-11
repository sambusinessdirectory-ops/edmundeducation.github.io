(() => {
  "use strict";
  const WORDS = /[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*(?:-[\p{L}\p{N}]+)*/gu;
  const words = value => String(value || "").match(WORDS) || [];

  function segmentsFor(set) {
    const key = String(Number(set?.year || 0)) + ":" + String(set?.set || "");
    const layout = window.EDMUND_DSE_SPEAKING_SOURCE_LAYOUTS?.[key];
    if (layout) return layout.segments;
    // Future sets can supply their own paragraphs without sentence-word guesses.
    return String(set?.sourceText || "").split(/\n\s*\n/)
      .map(text => text.trim()).filter(Boolean).map(text => ({ type: "paragraph", text }));
  }

  function textParts(segments) {
    return segments.flatMap(segment => {
      if (segment.type === "table") return [segment.caption, ...segment.columns, ...segment.rows.flat()];
      return segment.items || [segment.text];
    });
  }

  function bookmarkKeys(oldSegments, segments, setKey) {
    const oldWords = [];
    oldSegments.forEach((segment, index) => {
      const scope = index ? "source-" + index : "source";
      (segment.items || [segment.text]).forEach((part, item) => {
        const partScope = segment.items ? scope + "-item-" + item : scope;
        words(part).forEach((word, position) => oldWords.push({
          word: word.toLocaleLowerCase(),
          key: ("dse-paper:" + setKey + ":" + partScope + ":" + position + ":" + word.toLocaleLowerCase()).slice(0, 180)
        }));
      });
    });
    const current = textParts(segments).flatMap(words).map(word => word.toLocaleLowerCase());
    // Align words, independently of paragraph/list boundaries. Existing saved
    // keys remain usable when paragraphs move or a missing source block returns.
    const rows = Array.from({ length: oldWords.length + 1 }, () => new Uint16Array(current.length + 1));
    for (let i = oldWords.length - 1; i >= 0; i--) {
      for (let j = current.length - 1; j >= 0; j--) {
        rows[i][j] = oldWords[i].word === current[j]
          ? rows[i + 1][j + 1] + 1 : Math.max(rows[i + 1][j], rows[i][j + 1]);
      }
    }
    const keys = current.map((word, index) => ("dse-paper:" + setKey + ":source-layout-v1:" + index + ":" + word).slice(0, 180));
    let i = 0, j = 0;
    while (i < oldWords.length && j < current.length) {
      if (oldWords[i].word === current[j]) { keys[j++] = oldWords[i++].key; }
      else if (rows[i + 1][j] > rows[i][j + 1]) i++;
      else j++;
    }
    return keys;
  }

  const escapeAttribute = value => String(value || "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[character]));

  function illustrationsFor(set) {
    const entry = window.EDMUND_DSE_SPEAKING_ILLUSTRATIONS?.[String(Number(set?.year || 0)) + ":" + String(set?.set || "")];
    return entry?.figures || (entry?.src ? [{ ...entry, beforeSegment: 0, alt: set.title + " illustration" }] : []);
  }

  function renderFigures(figures) {
    return figures.map(figure => {
      const position = ["left", "right", "center"].includes(figure.position) ? figure.position : "center";
      const size = ["icon", "photo", "wide", "tall"].includes(figure.size) ? figure.size : "photo";
      return '<figure class="dse-source-illustration is-' + position + ' size-' + size + '"><img src="' +
        escapeAttribute(figure.src) + '" alt="' + escapeAttribute(figure.alt) + '" loading="lazy" decoding="async"' +
        (figure.width && figure.height ? ' width="' + Number(figure.width) + '" height="' + Number(figure.height) + '"' : '') + '></figure>';
    }).join("");
  }

  function render(segments, text, native = false, figures = []) {
    const paragraphClass = native ? "dse-native-source-paragraph" : "dse-source-paragraph";
    function renderSegment(segment, index) {
      const scope = index ? "source-" + index : "source";
      if (segment.type === "numbered" || segment.type === "bulleted") {
        const tag = segment.type === "numbered" ? "ol" : "ul";
        const className = native ? "dse-native-source-list" : "dse-source-numbered";
        return "<" + tag + ' class="' + className + '">' + segment.items.map((item, n) =>
          "<li>" + text(item, scope + "-item-" + n) + "</li>").join("") + "</" + tag + ">";
      }
      if (segment.type === "heading") return '<h5 class="dse-source-heading">' + text(segment.text, scope) + "</h5>";
      if (segment.type === "table") {
        const caption = text(segment.caption, scope + "-caption");
        const headings = segment.columns.map((cell, n) => '<th scope="col">' + text(cell, scope + "-column-" + n) + "</th>").join("");
        const body = segment.rows.map((row, r) => "<tr>" + row.map((cell, c) =>
          (c ? "<td>" : '<th scope="row">') + text(cell, scope + "-row-" + r + "-" + c) + (c ? "</td>" : "</th>")).join("") + "</tr>").join("");
        return '<div class="dse-source-table-wrap"><table class="dse-source-table"><caption>' + caption +
          "</caption><thead><tr>" + headings + "</tr></thead><tbody>" + body + "</tbody></table></div>";
      }
      return '<p class="' + paragraphClass + (segment.type === "task" ? " is-task" : "") + '" lang="en">' + text(segment.text, scope) + "</p>";
    }
    return segments.map((segment, index) => renderFigures(figures.filter(figure => Number(figure.beforeSegment || 0) === index)) + renderSegment(segment, index)).join("");
  }
  window.EDMUND_DSE_SPEAKING_SOURCE = Object.freeze({ segmentsFor, textParts, bookmarkKeys, illustrationsFor, render });
})();
