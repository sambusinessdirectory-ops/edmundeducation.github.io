(() => {
  "use strict";

  const API_BASE = "https://edmund-schedule-system.edmundeducation.workers.dev";
  const STORAGE_KEY = "edmund-site-announcement-dismissals-v1";
  const eddyLines = [
    'Eddy 有個天大的好消息要宣布啦！嘿嘿，準備好大吃一驚了嗎？',
    '各位！久等啦！接下來，就讓 Eddy 為大家揭曉這個令人期待的好消息吧！',
    '咳咳！請大家注意！Eddy 有一件非常、非常重要的事情要宣布！……嘿嘿，先猜猜是什麼吧！',
    '噹噹！讓大家期待已久的神祕驚喜，終於要登場啦！掌聲鼓勵鼓勵！',
    '嘿嘿，大家的目光都集中過來了吧？那麼……Eddy 的重大發表，現在正式開始！',
    '女士們、先生們！請睜大眼睛看仔細囉！接下來登場的，可是今天的重頭戲！',
    '鏘鏘！Eddy 的最新消息，正式公開啦！'
  ];
  let announcements = [];
  let currentIndex = 0;
  let stopCarousel = () => {};

  function readDismissals() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch {
      return {};
    }
  }

  function saveDismissal(announcement) {
    try {
      const dismissals = readDismissals();
      dismissals[announcement.id] = Number(announcement.version || 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissals));
    } catch {
      // Private browsing can block storage; dismissing still works for this page.
    }
  }

  function visibleAnnouncements(values) {
    const dismissals = readDismissals();
    return values.filter((item) => (
      item?.id
      && typeof item.message === "string"
      && item.message.trim()
      && Number(dismissals[item.id] || 0) < Number(item.version || 1)
    ));
  }

  function createDialog() {
    const dialog = document.createElement("dialog");
    dialog.className = "site-announcement-dialog";
    dialog.setAttribute("aria-labelledby", "site-announcement-title");
    dialog.innerHTML = `
      <article class="site-announcement-card">
        <div class="site-announcement-gallery" data-announcement-gallery hidden></div>
        <div class="site-announcement-copy">
          <p class="site-announcement-kicker">EDMUNDEDUCATION · 最新公告</p>
          <h2 id="site-announcement-title">重要通知</h2>
          <div class="site-announcement-message" data-announcement-message></div>
          <button class="site-announcement-eddy" type="button" data-announcement-eddy aria-label="Eddy 的公告提示，點擊關閉"><img src="/eddy-new-announcement-dialogue.png" alt="" aria-hidden="true"><span class="site-announcement-eddy-copy" lang="zh-Hant"></span></button>
          <p class="site-announcement-page" data-announcement-page></p>
          <div class="site-announcement-actions">
            <button class="site-announcement-contact" type="button" data-announcement-dismiss>聯絡 Edmund 以知道更多</button>
            <button class="site-announcement-dismiss" type="button" data-announcement-dismiss>知道了</button>
          </div>
        </div>
      </article>`;
    dialog.addEventListener("cancel", (event) => event.preventDefault());
    dialog.addEventListener("click", (event) => {
      if (event.target.closest("[data-announcement-eddy]")) {
        event.target.closest("[data-announcement-eddy]").hidden = true;
        return;
      }
      if (!event.target.closest("[data-announcement-dismiss]")) return;
      const current = announcements[currentIndex];
      if (current) saveDismissal(current);
      stopCarousel();
      currentIndex += 1;
      if (currentIndex < announcements.length) render(dialog);
      else dialog.close();
    });
    document.body.append(dialog);
    return dialog;
  }

  function render(dialog) {
    const item = announcements[currentIndex];
    if (!item) return;
    window.EdmundAnnouncementRich.render(dialog.querySelector("[data-announcement-message]"), item.contentRuns, item.message);
    const eddy = dialog.querySelector("[data-announcement-eddy]");
    const eddyCopy = eddyLines[Math.floor(Math.random() * eddyLines.length)];
    eddy.hidden = false;
    eddy.querySelector(".site-announcement-eddy-copy").textContent = eddyCopy;
    eddy.setAttribute("aria-label", `${eddyCopy} 點擊關閉 Eddy 的提示`);
    dialog.querySelector("[data-announcement-page]").textContent = announcements.length > 1
      ? `公告 ${currentIndex + 1} / ${announcements.length}`
      : "";
    const gallery = dialog.querySelector("[data-announcement-gallery]");
    stopCarousel();
    const images = Array.isArray(item.images) && item.images.length
      ? item.images : item.imageUrl ? [{ url: item.imageUrl }] : [];
    const slides = [];
    for (const [index, entry] of images.entries()) {
      const url = String(entry?.url || "");
      if (!/^\/v1\/announcements\/[0-9a-f-]{36}\/(?:image|images\/[0-9a-f-]{36})\?v=\d+$/i.test(url)) continue;
      slides.push({ src: `${API_BASE}${url}`, alt: `公告圖片 ${index + 1}` });
    }
    stopCarousel = window.EdmundAnnouncementRich.mountCarousel(gallery, slides);
    if (!dialog.open) dialog.showModal();
  }

  async function initialize() {
    try {
      const response = await fetch(`${API_BASE}/v1/announcements`, {
        headers: { Accept: "application/json" },
        cache: "no-store"
      });
      if (!response.ok) return;
      const payload = await response.json();
      announcements = visibleAnnouncements(Array.isArray(payload?.announcements) ? payload.announcements : []);
      if (announcements.length) render(createDialog());
    } catch {
      // Announcements are helpful but must never block the public homepage.
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
