(function initialiseLearningWordBookmarks(global) {
  "use strict";

  const DECK_TITLE = "寫作系統生字";
  const SYSTEM_KEYS = new Set(["writing-submission", "speaking", "reading-comprehension"]);
  const WORDISH = /[\p{L}\p{N}]/u;

  function cleanText(value, limit) {
    return String(value || "")
      .replace(/[’]/gu, "'")
      .replace(/\u00a0/gu, " ")
      .replace(/\s+/gu, " ")
      .trim()
      .slice(0, limit);
  }

  function hashText(value) {
    let hash = 2166136261;
    for (const character of String(value || "")) {
      hash ^= character.codePointAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function safeHref(value) {
    const fallback = `${location.pathname}${location.search}${location.hash}`;
    const href = String(value || fallback).trim().slice(0, 500);
    if (!href || /^(?:[a-z]+:|\/\/)/iu.test(href) || href.includes("..")) return fallback;
    return href;
  }

  function rpcArguments(item, bookmarked) {
    return {
      p_token: String(item.token || ""),
      p_system_key: item.systemKey,
      p_item_key: item.itemKey,
      p_phrase: item.phrase,
      p_exact_translation: item.exactTranslation || "",
      p_context_en: item.contextEn || "",
      p_context_zh: item.contextZh || "",
      p_href: item.href,
      p_bookmarked: Boolean(bookmarked)
    };
  }

  async function setWordBookmark({ rpc, token, systemKey, itemKey, phrase, exactTranslation = "", contextEn = "", contextZh = "", href = "", bookmarked = true }) {
    if (typeof rpc !== "function" || !token || !SYSTEM_KEYS.has(systemKey)) throw new Error("字詞收藏服務尚未連接。");
    const item = {
      token,
      systemKey,
      itemKey: cleanText(itemKey, 180),
      phrase: cleanText(phrase, 300),
      exactTranslation: cleanText(exactTranslation, 1000),
      contextEn: cleanText(contextEn, 3000),
      contextZh: cleanText(contextZh, 3000),
      href: safeHref(href)
    };
    if (!item.itemKey || !item.phrase || !WORDISH.test(item.phrase)) throw new Error("請選取一個或以上的字詞。");
    return rpc("learning_word_set_bookmark", rpcArguments(item, bookmarked));
  }

  async function listWordBookmarks({ rpc, token, systemKey }) {
    if (typeof rpc !== "function" || !token || !SYSTEM_KEYS.has(systemKey)) return [];
    const rows = await rpc("learning_word_list_bookmarks", { p_token: token, p_system_key: systemKey });
    return Array.isArray(rows) ? rows : [];
  }

  function selectionElement(range) {
    const node = range.commonAncestorContainer;
    return node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  }

  function createSelectionBrush(options) {
    const systemKey = String(options?.systemKey || "");
    if (!SYSTEM_KEYS.has(systemKey)) throw new Error("Unsupported word bookmark system.");
    let saved = null;
    let frame = 0;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "learning-word-brush";
    button.dataset.learningWordBrush = systemKey;
    button.hidden = true;
    button.textContent = `🖌 收藏到「${DECK_TITLE}」`;
    button.setAttribute("aria-label", `收藏所選字詞到${DECK_TITLE}`);
    document.body.append(button);

    const hide = () => {
      saved = null;
      button.hidden = true;
      button.disabled = false;
      button.classList.remove("is-saving", "is-saved");
      button.textContent = `🖌 收藏到「${DECK_TITLE}」`;
    };

    const root = () => typeof options.root === "function" ? options.root() : options.root;
    const inspect = () => {
      frame = 0;
      const selection = global.getSelection?.();
      if (!selection?.rangeCount || selection.isCollapsed) return hide();
      const range = selection.getRangeAt(0).cloneRange();
      const container = root();
      const element = selectionElement(range);
      if (!container?.isConnected || !element || !container.contains(element)) return hide();
      if (element.closest("input,textarea,select,[contenteditable='true']")) return hide();
      const phrase = cleanText(selection.toString(), 301);
      if (!phrase || phrase.length > 300 || !WORDISH.test(phrase)) return hide();
      const description = options.describe?.({ range, element, phrase }) || {};
      if (description === false) return hide();
      const scope = cleanText(description.scope || element.closest("[id]")?.id || "selection", 70);
      const href = safeHref(description.href);
      const itemKey = cleanText(
        description.itemKey || `selection:${scope}:${hashText(`${href}|${scope}|${phrase.toLocaleLowerCase()}`)}`,
        180
      );
      saved = {
        range,
        phrase,
        itemKey,
        exactTranslation: cleanText(description.exactTranslation, 1000),
        contextEn: cleanText(description.contextEn, 3000),
        contextZh: cleanText(description.contextZh, 3000),
        href
      };
      const rects = [...range.getClientRects()].filter(rect => rect.width > 0 && rect.height > 0);
      const anchor = rects[rects.length - 1] || range.getBoundingClientRect();
      if (!anchor || anchor.bottom < 0 || anchor.top > innerHeight) return hide();
      button.hidden = false;
      button.style.visibility = "hidden";
      button.style.left = "8px";
      button.style.top = "8px";
      const bounds = button.getBoundingClientRect();
      const left = Math.max(8, Math.min(innerWidth - bounds.width - 8, anchor.left + anchor.width / 2 - bounds.width / 2));
      let top = anchor.top - bounds.height - 10;
      if (top < 8) top = Math.min(innerHeight - bounds.height - 8, anchor.bottom + 10);
      button.style.left = `${Math.round(left)}px`;
      button.style.top = `${Math.round(Math.max(8, top))}px`;
      button.style.visibility = "visible";
    };

    const schedule = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(inspect);
    };

    button.addEventListener("pointerdown", event => event.preventDefault());
    button.addEventListener("click", async () => {
      if (!saved || button.disabled) return;
      const item = saved;
      button.disabled = true;
      button.classList.add("is-saving");
      button.textContent = "正在收藏…";
      try {
        await setWordBookmark({
          rpc: options.rpc,
          token: options.getToken?.(),
          systemKey,
          ...item,
          bookmarked: true
        });
        button.classList.remove("is-saving");
        button.classList.add("is-saved");
        button.textContent = `✓ 已加入「${DECK_TITLE}」`;
        options.onSaved?.(item);
        global.setTimeout(hide, 1300);
      } catch (error) {
        button.disabled = false;
        button.classList.remove("is-saving");
        button.textContent = "收藏失敗，請再試";
        options.onError?.(error);
      }
    });

    document.addEventListener("pointerup", schedule);
    document.addEventListener("keyup", schedule);
    document.addEventListener("selectionchange", schedule);
    global.addEventListener("scroll", hide, { passive: true });
    global.addEventListener("resize", hide, { passive: true });

    return {
      hide,
      destroy() {
        if (frame) cancelAnimationFrame(frame);
        document.removeEventListener("pointerup", schedule);
        document.removeEventListener("keyup", schedule);
        document.removeEventListener("selectionchange", schedule);
        global.removeEventListener("scroll", hide);
        global.removeEventListener("resize", hide);
        button.remove();
      }
    };
  }

  global.EdmundWordBookmarks = Object.freeze({
    DECK_TITLE,
    createSelectionBrush,
    listWordBookmarks,
    setWordBookmark
  });
})(window);
