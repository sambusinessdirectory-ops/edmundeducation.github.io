(() => {
  "use strict";

  if (window.self === window.top) {
    document.documentElement.classList.remove("frame-guard");
    return;
  }

  // GitHub Pages cannot emit X-Frame-Options. Keep the document permanently
  // hidden when framed so a third-party page cannot overlay the login/admin UI.
  window.stop();
  document.documentElement.setAttribute("aria-hidden", "true");
})();
