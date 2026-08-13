(() => {
  "use strict";

  const API_BASE = "https://edmund-schedule-system.edmundeducation.workers.dev";
  const STORAGE_KEY = "edmund-site-announcement-dismissals-v1";
  let announcements = [];
  let currentIndex = 0;

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
        <img class="site-announcement-image" data-announcement-image alt="公告圖片" hidden>
        <div class="site-announcement-copy">
          <p class="site-announcement-kicker">EDMUNDEDUCATION · 最新公告</p>
          <h2 id="site-announcement-title">重要通知</h2>
          <p class="site-announcement-message" data-announcement-message></p>
          <p class="site-announcement-page" data-announcement-page></p>
          <div class="site-announcement-actions">
            <button class="site-announcement-contact" type="button" data-announcement-dismiss>聯絡 Edmund 以知道更多</button>
            <button class="site-announcement-dismiss" type="button" data-announcement-dismiss>知道了</button>
          </div>
        </div>
      </article>`;
    dialog.addEventListener("cancel", (event) => event.preventDefault());
    dialog.addEventListener("click", (event) => {
      if (!event.target.closest("[data-announcement-dismiss]")) return;
      const current = announcements[currentIndex];
      if (current) saveDismissal(current);
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
    dialog.querySelector("[data-announcement-message]").textContent = item.message;
    dialog.querySelector("[data-announcement-page]").textContent = announcements.length > 1
      ? `公告 ${currentIndex + 1} / ${announcements.length}`
      : "";
    const image = dialog.querySelector("[data-announcement-image]");
    if (item.hasImage && /^\/v1\/announcements\/[0-9a-f-]{36}\/image\?v=\d+$/i.test(item.imageUrl || "")) {
      image.src = `${API_BASE}${item.imageUrl}`;
      image.hidden = false;
    } else {
      image.removeAttribute("src");
      image.hidden = true;
    }
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
