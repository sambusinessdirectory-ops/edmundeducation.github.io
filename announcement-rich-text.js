(() => {
  "use strict";
  const DEFAULT_COLOR = "#20283d";
  const defaultStyle = () => ({ bold: false, italic: false, underline: false, color: DEFAULT_COLOR, size: "normal" });

  function render(container, runs, fallback = "") {
    container.replaceChildren();
    const values = Array.isArray(runs) && runs.length ? runs : [{ text: fallback, ...defaultStyle() }];
    for (const run of values) {
      if (!run || typeof run.text !== "string") continue;
      const span = document.createElement("span");
      span.textContent = run.text;
      span.style.color = /^#[0-9a-f]{6}$/i.test(run.color || "") ? run.color : DEFAULT_COLOR;
      span.style.fontWeight = run.bold ? "800" : "400";
      span.style.fontStyle = run.italic ? "italic" : "normal";
      span.style.textDecoration = run.underline ? "underline" : "none";
      if (run.size === "large") span.classList.add("announcement-rich-large");
      container.append(span);
    }
  }

  function serialize(editor) {
    const runs = [];
    const push = (text, style) => {
      if (!text) return;
      const last = runs[runs.length - 1];
      if (last && Object.keys(style).every((key) => last[key] === style[key])) last.text += text;
      else runs.push({ text, ...style });
    };
    function walk(node, inherited) {
      if (node.nodeType === Node.TEXT_NODE) { push(node.textContent || "", inherited); return; }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const tag = node.tagName.toLowerCase();
      if (tag === "br") { push("\n", inherited); return; }
      const style = { ...inherited };
      const css = node.style;
      if (tag === "b" || tag === "strong" || /^(bold|[6-9]00)$/.test(css.fontWeight)) style.bold = true;
      if (tag === "i" || tag === "em" || css.fontStyle === "italic") style.italic = true;
      if (tag === "u" || css.textDecoration.includes("underline")) style.underline = true;
      const color = (tag === "font" ? node.getAttribute("color") : "") || css.color;
      if (color) {
        const probe = document.createElement("span");
        probe.style.color = color;
        const match = probe.style.color.match(/^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/i);
        if (/^#[0-9a-f]{6}$/i.test(color)) style.color = color.toLowerCase();
        else if (match) style.color = `#${match.slice(1).map((part) => Number(part).toString(16).padStart(2, "0")).join("")}`;
      }
      if (tag === "font" && Number(node.getAttribute("size")) > 0 && Number(node.getAttribute("size")) <= 3) style.size = "normal";
      if ((tag === "font" && Number(node.getAttribute("size")) >= 5)
        || node.classList.contains("announcement-rich-large")
        || /(?:large|x-large|xx-large|2[2-9]px|[3-9]\dpx)/i.test(css.fontSize)) style.size = "large";
      const block = tag === "div" || tag === "p";
      if (block && runs.length && !runs[runs.length - 1].text.endsWith("\n")) push("\n", inherited);
      for (const child of node.childNodes) walk(child, style);
    }
    for (const child of editor.childNodes) walk(child, defaultStyle());
    while (runs.length && !runs[0].text) runs.shift();
    while (runs.length && !runs[runs.length - 1].text) runs.pop();
    if (runs.length) runs[0].text = runs[0].text.replace(/^\s+/, "");
    if (runs.length) runs[runs.length - 1].text = runs[runs.length - 1].text.replace(/\s+$/, "");
    return runs.filter((run) => run.text);
  }

  function applyColor(editor, savedRange, color) {
    if (!/^#[0-9a-f]{6}$/i.test(color) || !savedRange || savedRange.collapsed || !editor.contains(savedRange.commonAncestorContainer)) return false;
    const range = savedRange.cloneRange();
    const fragment = range.extractContents();
    const selection = window.getSelection();
    const wrapText = (node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent) {
        const span = document.createElement("span");
        span.style.color = color;
        node.replaceWith(span);
        span.append(node);
        return;
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        node.style.color = "";
        if (node.tagName.toLowerCase() === "font") node.removeAttribute("color");
        Array.from(node.childNodes).forEach(wrapText);
      }
    };
    Array.from(fragment.childNodes).forEach(wrapText);
    const marker = document.createElement("span");
    marker.append(fragment);
    range.insertNode(marker);
    range.selectNodeContents(marker);
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  }

  function mountCarousel(container, images) {
    container.replaceChildren();
    const urls = images.filter((image) => image?.src);
    if (!urls.length) { container.hidden = true; return () => {}; }
    container.hidden = false;
    let index = 0;
    const image = document.createElement("img");
    image.className = "site-announcement-image";
    image.loading = "eager";
    const count = document.createElement("span");
    count.className = "site-announcement-image-count";
    count.setAttribute("aria-live", "polite");
    const show = (next) => {
      index = (next + urls.length) % urls.length;
      image.src = urls[index].src;
      image.alt = urls[index].alt || `公告圖片 ${index + 1}`;
      count.textContent = `圖片 ${index + 1} / ${urls.length}`;
    };
    if (urls.length > 1) {
      const arrow = (direction, label) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `site-announcement-carousel-arrow is-${direction}`;
        button.setAttribute("aria-label", label);
        const icon = document.createElement("img");
        icon.src = "/announcement-carousel-arrow.png";
        icon.alt = "";
        button.append(icon);
        button.addEventListener("click", () => { show(index + (direction === "next" ? 1 : -1)); restart(); });
        return button;
      };
      container.append(arrow("previous", "上一張圖片"), image, arrow("next", "下一張圖片"), count);
    } else container.append(image);
    show(0);
    let timer;
    function restart() {
      window.clearInterval(timer);
      if (urls.length > 1) timer = window.setInterval(() => show(index + 1), 2000);
    }
    restart();
    return () => window.clearInterval(timer);
  }

  window.EdmundAnnouncementRich = { render, serialize, defaultStyle, applyColor, mountCarousel };
})();
