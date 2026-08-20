(function () {
  "use strict";

  var ready = false;

  function markReady() {
    if (ready) return;
    ready = true;
    document.documentElement.classList.add("eddy-game-ready");
    if (document.body) document.body.classList.add("game-ready");
    window.dispatchEvent(new CustomEvent("eddy:game-ready"));
  }

  window.__EDDY_PUBLIC_LOADER__ = Object.freeze({
    get ready() { return ready; },
    markReady: markReady
  });
})();
