(function initialiseEddyDialogueIndex() {
  "use strict";

  const registry = Array.isArray(window.EDMUND_EDDY_DIALOGUE_REGISTRY) ? window.EDMUND_EDDY_DIALOGUE_REGISTRY : [];
  const groupLabels = Object.freeze({ "front-page": "首頁對話框", "user-system": "用戶系統對話框" });
  let host = null;
  let activeIndex = 0;
  let adminValidated = false;
  let exporting = false;

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  }

  function discoveredIds() {
    return new Set(window.EdmundDialogueDiscovery?.ids || []);
  }

  function cardMarkup(entry, discovered) {
    const art = discovered
      ? `<img src="${encodeURI(entry.file)}" alt="${escapeHtml(entry.title)}" draggable="false">`
      : '<span class="eddy-index-card__lock" aria-label="尚未解鎖">?</span>';
    return `<button class="eddy-index-card${discovered ? " is-discovered" : ""}" type="button" data-dialogue-entry="${escapeHtml(entry.id)}" aria-label="${escapeHtml(entry.title)}，${discovered ? "已發現" : "尚未發現"}">
      <span class="eddy-index-card__art">${art}</span><span class="eddy-index-card__copy"><strong>${escapeHtml(entry.title)}</strong><small>${discovered ? "已發現 · 查看出現條件" : "尚未發現 · 查看提示"}</small></span>
    </button>`;
  }

  function sectionMarkup(group, entries, discoveries) {
    const completed = entries.filter(entry => discoveries.has(entry.id)).length;
    return `<section class="eddy-index__section" aria-labelledby="eddy-${group}-heading"><div class="eddy-index__section-heading"><div><p class="eddy-index__eyebrow">${group === "front-page" ? "FRONT PAGE" : "LEARNING SYSTEMS"}</p><h3 id="eddy-${group}-heading">${groupLabels[group]}</h3></div><span>${completed} / ${entries.length} 已發現</span></div><div class="eddy-index__grid">${entries.map(entry => cardMarkup(entry, discoveries.has(entry.id))).join("")}</div></section>`;
  }

  function pageMarkup() {
    const discoveries = discoveredIds();
    const found = registry.filter(entry => discoveries.has(entry.id)).length;
    const percent = registry.length ? Math.round(found / registry.length * 100) : 0;
    return `<section class="eddy-index" data-eddy-index-content>
      <section class="eddy-index__hero"><p class="eddy-index__eyebrow">DISCOVER · COLLECT · REMEMBER</p><h2>Eddy 對話框圖鑑</h2><p>在 EdmundEducation 學習時遇見 Eddy，對應圖鑑便會自動解鎖。未發現的圖像保持神秘；您仍可查看線索，找出 Eddy 會在甚麼時候出現。</p>
        <div class="eddy-index__progress"><strong>Discovered ${found} / ${registry.length}</strong><span>${percent}% 完成</span><div class="eddy-index__track" style="--eddy-progress:${percent}%"><i></i></div></div>
        <div class="eddy-index__tools"><button class="eddy-index__admin-toggle" type="button" data-admin-toggle aria-expanded="false">管理員 PDF 匯出</button><form class="eddy-index__admin" data-admin-form hidden><label>管理員名稱<input name="name" autocomplete="username" required></label><label>管理員密碼<input name="password" type="password" autocomplete="current-password" required></label><button type="submit">安全驗證</button><p data-admin-status role="status" aria-live="polite">驗證後可匯出完整、未遮罩的圖鑑。</p></form>${adminValidated ? '<button class="eddy-index__export" type="button" data-export-pdf>匯出完整 PDF</button>' : ""}</div>
      </section>
      ${["front-page", "user-system"].map(group => sectionMarkup(group, registry.filter(entry => entry.group === group), discoveries)).join("")}
      <dialog class="eddy-index-dialog" data-dialogue-modal aria-labelledby="eddy-dialogue-modal-title"><div class="eddy-index-dialog__inner" data-dialogue-modal-content></div></dialog>
    </section>`;
  }

  function ensureMounted() {
    const session = window.EDMUND_LEARNING_PORTAL_CONTEXT?.getSession?.();
    const dashboard = document.querySelector('[data-view="dashboard"]');
    if (!session?.user || !dashboard || dashboard.hidden) return;
    host = dashboard;
    const old = dashboard.querySelector("[data-eddy-index-content]");
    old?.remove();
    dashboard.insertAdjacentHTML("beforeend", pageMarkup());
  }

  function renderModal(index) {
    const entry = registry[index];
    const dialog = host?.querySelector("[data-dialogue-modal]");
    const content = dialog?.querySelector("[data-dialogue-modal-content]");
    if (!entry || !dialog || !content) return;
    activeIndex = index;
    const discovered = discoveredIds().has(entry.id);
    content.innerHTML = `<button class="eddy-index-dialog__close" type="button" data-dialogue-close aria-label="關閉">×</button><div class="eddy-index-dialog__art">${discovered ? `<img src="${encodeURI(entry.file)}" alt="${escapeHtml(entry.title)}" draggable="false">` : '<span class="eddy-index-card__lock">?</span>'}</div><p class="eddy-index__eyebrow">${escapeHtml(groupLabels[entry.group])} · ${discovered ? "已發現" : "尚未發現"}</p><h3 id="eddy-dialogue-modal-title">${escapeHtml(entry.title)}</h3><p>${escapeHtml(entry.trigger)}</p><div class="eddy-index-dialog__nav"><button type="button" data-dialogue-step="-1">← 上一個</button><button type="button" data-dialogue-step="1">下一個 →</button></div>`;
  }

  function openModal(id) {
    const index = registry.findIndex(entry => entry.id === id);
    const dialog = host?.querySelector("[data-dialogue-modal]");
    if (index < 0 || !dialog) return;
    renderModal(index);
    if (!dialog.open) dialog.showModal();
  }

  async function validateAdmin(form) {
    const status = form.querySelector("[data-admin-status]");
    const button = form.querySelector('button[type="submit"]');
    const fields = new FormData(form);
    button.disabled = true;
    status.textContent = "正在安全驗證…";
    try {
      const rows = await window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc("flashcard_admin_login", { p_name: String(fields.get("name") || "").trim(), p_password: String(fields.get("password") || "") });
      if (!Array.isArray(rows) || !rows.length) throw new Error("管理員名稱或密碼不正確。");
      adminValidated = true;
      form.reset();
      ensureMounted();
    } catch (error) {
      status.textContent = error?.message || "驗證失敗，請稍後再試。";
    } finally { button.disabled = false; }
  }

  function loadImage(source) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = `${source}${source.includes("?") ? "&" : "?"}pdf=${Date.now()}`;
    });
  }

  function fitText(context, text, x, y, width, lineHeight, maxLines) {
    const words = String(text).split(/\s+/); let line = ""; const lines = [];
    words.forEach(word => { const next = line ? `${line} ${word}` : word; if (context.measureText(next).width > width && line) { lines.push(line); line = word; } else line = next; });
    if (line) lines.push(line);
    lines.slice(0, maxLines).forEach((value, index) => context.fillText(value, x, y + index * lineHeight));
  }

  async function exportPdf(button) {
    if (!adminValidated || exporting) return;
    const jsPDF = window.jspdf?.jsPDF;
    if (!jsPDF) return alert("PDF 工具尚未載入，請重新整理後再試。");
    exporting = true; button.disabled = true; button.textContent = "正在產生 PDF…";
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const width = 1240, height = 1754, margin = 54, header = 128, rowHeight = 202;
      const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
      const context = canvas.getContext("2d");
      const images = await Promise.all(registry.map(entry => loadImage(entry.file)));
      let row = 0, page = 0;
      const paintHeader = () => { context.fillStyle = "#fffaf0"; context.fillRect(0,0,width,height); context.fillStyle = "#356d59"; context.fillRect(0,0,width,104); context.fillStyle = "white"; context.font = "900 31px Arial, 'Noto Sans TC', sans-serif"; context.fillText("Eddy Dialogue Box Index · Eddy 對話框圖鑑", margin, 62); context.fillStyle = "#594a3d"; context.font = "800 18px Arial, 'Noto Sans TC', sans-serif"; context.fillText("IMAGE 圖像",margin,header); context.fillText("OCCASION 出現場合",330,header); context.fillText("REMARKS 備註",845,header); context.strokeStyle="#d8c8ad"; context.beginPath(); context.moveTo(margin,header+16); context.lineTo(width-margin,header+16); context.stroke(); };
      paintHeader();
      for (let index = 0; index < registry.length; index += 1) {
        const entry = registry[index]; const y = header + 34 + row * rowHeight;
        if (y + rowHeight > height - margin) { pdf.addImage(canvas.toDataURL("image/jpeg",.9),"JPEG",0,0,210,297); pdf.addPage(); page += 1; row = 0; paintHeader(); }
        const drawY = header + 34 + row * rowHeight;
        context.fillStyle = row % 2 ? "#f8f6f1" : "#ffffff"; context.fillRect(margin,drawY,width-margin*2,rowHeight-8);
        const image = images[index]; if (image) { const scale = Math.min(240/image.width,172/image.height); const w=image.width*scale,h=image.height*scale; context.drawImage(image,margin+(240-w)/2,drawY+(172-h)/2,w,h); } else { context.fillStyle="#eee7da";context.fillRect(margin,drawY,240,172);context.fillStyle="#786957";context.font="700 18px Arial";context.fillText("Image unavailable",82,drawY+90); }
        context.fillStyle="#2d2822";context.font="900 22px Arial, 'Noto Sans TC', sans-serif";fitText(context,entry.title,330,drawY+34,470,28,2);
        context.fillStyle="#356d59";context.font="800 17px Arial, 'Noto Sans TC', sans-serif";context.fillText(groupLabels[entry.group],330,drawY+96);
        context.fillStyle="#5e5246";context.font="700 17px Arial, 'Noto Sans TC', sans-serif";fitText(context,entry.trigger,330,drawY+130,470,24,3);
        context.fillStyle="#756858";context.font="700 17px Arial, 'Noto Sans TC', sans-serif";fitText(context,entry.remarks.join("；") || "—",845,drawY+44,300,24,5);
        row += 1;
      }
      pdf.addImage(canvas.toDataURL("image/jpeg",.9),"JPEG",0,0,210,297);
      const stamp = new Date().toISOString().replace(/[:.]/g,"-"); pdf.save(`eddy-dialogue-box-index-${stamp}.pdf`);
      button.textContent = "PDF 已下載";
    } catch (error) { console.error(error); button.textContent = "匯出失敗，請重試"; }
    finally { exporting = false; window.setTimeout(() => { button.disabled = false; button.textContent = "匯出完整 PDF"; }, 2200); }
  }

  document.addEventListener("click", event => {
    const root = event.target.closest("[data-eddy-index-content]"); if (!root) return;
    const entry = event.target.closest("[data-dialogue-entry]"); if (entry) return openModal(entry.dataset.dialogueEntry);
    const dialog = root.querySelector("[data-dialogue-modal]");
    if (event.target.closest("[data-dialogue-close]")) dialog?.close();
    const step = event.target.closest("[data-dialogue-step]"); if (step) renderModal((activeIndex + Number(step.dataset.dialogueStep) + registry.length) % registry.length);
    const toggle = event.target.closest("[data-admin-toggle]"); if (toggle) { const form=root.querySelector("[data-admin-form]"); form.hidden=!form.hidden; toggle.setAttribute("aria-expanded",String(!form.hidden)); if(!form.hidden) form.querySelector("input")?.focus(); }
    const exportButton = event.target.closest("[data-export-pdf]"); if (exportButton) exportPdf(exportButton);
  });
  document.addEventListener("submit", event => { if (event.target.matches("[data-admin-form]")) { event.preventDefault(); validateAdmin(event.target); } });
  document.addEventListener("contextmenu", event => { if (event.target.closest(".eddy-index-card__art,.eddy-index-dialog__art")) event.preventDefault(); });
  document.addEventListener("dragstart", event => { if (event.target.closest(".eddy-index-card__art,.eddy-index-dialog__art")) event.preventDefault(); });
  document.addEventListener("click", event => { const dialog=event.target.closest("[data-dialogue-modal]"); if(dialog && event.target===dialog) dialog.close(); });
  document.addEventListener("edmund:eddy-dialogue-discovered", ensureMounted);
  document.addEventListener("edmund:eddy-dialogue-discovery-sync", ensureMounted);
  window.addEventListener("edmund:learning-portal-session", ensureMounted);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => queueMicrotask(ensureMounted), { once: true }); else queueMicrotask(ensureMounted);
})();
