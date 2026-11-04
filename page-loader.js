(() => {
  function setupPageLoader() {
    const loader = document.querySelector("[data-page-loader]");
    if (!loader) return;

    function showLoader() {
      loader.style.background = "#F4F0E9";
      loader.style.backgroundColor = "#F4F0E9";
      document.body.style.backgroundColor = "#F4F0E9";
      loader.classList.add("is-active");
      loader.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-page-loading");
    }

    function hideLoader() {
      loader.style.removeProperty("background");
      loader.style.removeProperty("background-color");
      document.body.style.removeProperty("background-color");
      loader.classList.remove("is-active");
      loader.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-page-loading");
    }

    document.addEventListener("click", event => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = event.target.closest("a[href]");
      if (!link) return;
      if (link.target && link.target !== "_self") return;
      if (link.hasAttribute("download")) return;

      const href = (link.getAttribute("href") || "").trim();
      if (!href || href.startsWith("#")) return;
      if (/^(mailto|tel|javascript):/i.test(href)) return;

      const destination = new URL(href, window.location.href);
      if (destination.protocol !== window.location.protocol) return;
      if ((destination.protocol === "http:" || destination.protocol === "https:") && destination.origin !== window.location.origin) return;

      const samePage = destination.pathname === window.location.pathname && destination.search === window.location.search;
      if (samePage && destination.hash) return;

      showLoader();
    });

    window.addEventListener("beforeunload", showLoader);
    window.addEventListener("pageshow", hideLoader);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupPageLoader);
  } else {
    setupPageLoader();
  }
})();
