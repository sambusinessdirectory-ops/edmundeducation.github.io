(() => {
  const loader = document.querySelector('[data-homepage-loader]');
  const scene = loader?.querySelector('[data-homepage-loading-scene]');
  if (!loader || !scene) return;

  const minimumPlaybackMs = 1500;
  let pageReady = document.readyState !== 'loading';
  let animationReady = false;
  let playbackStart = 0;
  let hideTimer;

  function hide() {
    loader.classList.add('is-hidden');
    loader.setAttribute('aria-busy', 'false');
    window.setTimeout(() => {
      loader.remove();
      document.body.classList.remove('is-homepage-loading');
    }, 200);
  }

  function scheduleHide() {
    if (!pageReady || !animationReady) return;
    window.clearTimeout(hideTimer);
    const remaining = Math.max(0, playbackStart + minimumPlaybackMs - performance.now());
    hideTimer = window.setTimeout(hide, remaining);
  }

  function startPlayback() {
    loader.classList.add('has-animation');
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      animationReady = true;
      playbackStart = performance.now();
      scheduleHide();
    }));
  }

  function useGifFallback() {
    const gif = new Image();
    gif.alt = '';
    gif.width = 400;
    gif.height = 400;
    gif.onload = () => {
      scene.replaceChildren(gif);
      startPlayback();
    };
    gif.onerror = () => {
      // The SVG poster still gives visitors a visible loading state.
      animationReady = true;
      playbackStart = performance.now();
      scheduleHide();
    };
    gif.src = 'homepage-eddy-loading.gif';
  }

  fetch('homepage-eddy-loading-animated.svg', { cache: 'force-cache' })
    .then(response => {
      if (!response.ok) throw new Error('Animated loader unavailable');
      return response.text();
    })
    .then(source => {
      const parsed = new DOMParser().parseFromString(source, 'image/svg+xml');
      if (parsed.querySelector('parsererror') || parsed.documentElement.localName !== 'svg') {
        throw new Error('Animated loader invalid');
      }
      scene.replaceChildren(document.importNode(parsed.documentElement, true));
      startPlayback();
    })
    .catch(useGifFallback);

  if (!pageReady) {
    document.addEventListener('DOMContentLoaded', () => {
      pageReady = true;
      scheduleHide();
    }, { once: true });
  }
})();
