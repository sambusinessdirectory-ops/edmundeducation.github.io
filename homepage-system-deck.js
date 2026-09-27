(function initialiseHomepageSystemDeck() {
  "use strict";
  const root = document.querySelector("[data-system-card-deck]");
  const start = document.querySelector("[data-system-card-start]");
  if (!root || !start) return;
  const strip = root.closest(".category-strip");
  const stack = root.querySelector("[data-system-card-deck-stack]");
  const stage = root.querySelector("[data-system-card-deck-stage]");
  const position = root.querySelector("[data-system-card-deck-position]");
  const previous = root.querySelector("[data-system-card-deck-previous]");
  const next = root.querySelector("[data-system-card-deck-next]");
  const sources = [...strip.querySelectorAll("a.category[href]")];
  if (!sources.length) return;
  const allCards = sources.map((source, index) => {
    const card = source.cloneNode(true);
    card.dataset.cardNumber = String(index + 1).padStart(2, "0");
    card.id = `system-card-deck-option-${index}`;
    card.setAttribute("role", "option");
    card.tabIndex = -1;
    card.setAttribute("aria-hidden", "true");
    card.style.setProperty("--deck-opacity", "0");
    stack.append(card);
    return card;
  });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const spacing = 56;
  let cards = allCards, value = 0, target = 0, active = -1;
  let pointer = null, velocity = 0, animation = 0, paintFrame = 0;
  let lastFrame = 0, suppressUntil = 0, focusAtRest = false;
  let painted = new Set();
  const bound = number => Math.max(0, Math.min(cards.length - 1, number));

  function render() {
    const selectedIndex = Math.round(bound(value));
    const visible = new Set();
    const first = Math.max(0, Math.floor(value) - 5);
    const last = Math.min(cards.length - 1, Math.ceil(value) + 5);
    for (let index = first; index <= last; index++) {
      const card = cards[index], distance = index - value, magnitude = Math.abs(distance);
      visible.add(card);
      card.style.setProperty("--deck-offset", `${distance * spacing}px`);
      card.style.setProperty("--deck-depth", `${-magnitude * 50}px`);
      card.style.setProperty("--deck-tilt", `${distance * -2.2}deg`);
      card.style.setProperty("--deck-scale", String(Math.max(.72, 1 - magnitude * .055)));
      card.style.setProperty("--deck-opacity", String(Math.max(.12, 1 - magnitude * .15)));
      card.style.setProperty("--deck-z", String(100 - Math.round(magnitude * 10)));
      card.style.willChange = "transform, opacity";
      card.setAttribute("aria-hidden", "false");
      card.dataset.deckActive = String(index === selectedIndex);
      card.setAttribute("aria-selected", String(index === selectedIndex));
      card.tabIndex = index === selectedIndex ? 0 : -1;
    }
    for (const card of painted) {
      if (visible.has(card)) continue;
      card.style.setProperty("--deck-opacity", "0");
      card.style.willChange = "auto";
      card.dataset.deckActive = "false";
      card.setAttribute("aria-selected", "false");
      card.setAttribute("aria-hidden", "true");
      card.tabIndex = -1;
    }
    painted = visible;
    if (selectedIndex === active) return;
    active = selectedIndex;
    const selected = cards[active];
    if (!selected) return;
    stage.setAttribute("aria-activedescendant", selected.id);
    position.textContent = cards.length === allCards.length
      ? `${selected.dataset.cardNumber} / ${allCards.length}`
      : `${active + 1} / ${cards.length} · #${selected.dataset.cardNumber}`;
    position.setAttribute("aria-label", `${selected.dataset.cardNumber}，${selected.getAttribute("aria-label") || selected.textContent.trim()}`);
    previous.disabled = active === 0;
    next.disabled = active === cards.length - 1;
  }
  function paint() {
    if (paintFrame) return;
    paintFrame = requestAnimationFrame(() => { paintFrame = 0; render(); });
  }
  function stopAnimation() {
    cancelAnimationFrame(animation);
    animation = 0;
  }
  function rest() {
    value = target;
    velocity = 0;
    animation = 0;
    render();
    root.classList.remove("is-deck-moving");
    if (focusAtRest) cards[Math.round(value)]?.focus({ preventScroll: true });
    focusAtRest = false;
  }
  function animate(now) {
    const dt = Math.min(.032, Math.max(.001, (now - lastFrame) / 1000));
    lastFrame = now;
    // A damped spring retains the release velocity without a separate jump.
    velocity += ((target - value) * 240 - velocity * 30) * dt;
    value = bound(value + velocity * dt);
    render();
    if (Math.abs(target - value) < .002 && Math.abs(velocity) < .025) { rest(); return; }
    animation = requestAnimationFrame(animate);
  }
  function settle(destination, { focus = false, releaseVelocity = 0 } = {}) {
    stopAnimation();
    target = Math.round(bound(destination));
    focusAtRest = focus;
    velocity = releaseVelocity;
    if (reducedMotion.matches || Math.abs(target - value) < .001) { rest(); return; }
    root.classList.add("is-deck-moving");
    lastFrame = performance.now();
    animation = requestAnimationFrame(animate);
  }
  function move(direction, options) { settle(target + direction, options); }
  root.querySelector("[data-system-card-deck-first]").onclick = () => settle(0, { focus: true });
  previous.onclick = () => move(-1, { focus: true });
  next.onclick = () => move(1, { focus: true });
  const lastButton = root.querySelector("[data-system-card-deck-last]");
  lastButton.textContent = String(allCards.length);
  lastButton.onclick = () => settle(cards.length - 1, { focus: true });
  stage.addEventListener("keydown", event => {
    if (["ArrowUp", "PageUp", "ArrowDown", "PageDown", "Home", "End"].includes(event.key)) event.preventDefault();
    if (["ArrowUp", "PageUp"].includes(event.key)) move(-1, { focus: true });
    if (["ArrowDown", "PageDown"].includes(event.key)) move(1, { focus: true });
    if (event.key === "Home") settle(0, { focus: true });
    if (event.key === "End") settle(cards.length - 1, { focus: true });
  });
  let wheelDelta = 0, wheelFrame = 0;
  stage.addEventListener("wheel", event => {
    if (event.ctrlKey || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
    if ((event.deltaY < 0 && target === 0) || (event.deltaY > 0 && target === cards.length - 1)) return;
    event.preventDefault();
    wheelDelta += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1);
    if (wheelFrame) return;
    wheelFrame = requestAnimationFrame(() => {
      if (Math.abs(wheelDelta) >= 32) {
        const step = Math.sign(wheelDelta) * Math.min(3, Math.max(1, Math.floor(Math.abs(wheelDelta) / 64)));
        move(step);
        wheelDelta = 0;
      }
      wheelFrame = 0;
    });
  }, { passive: false });
  stage.addEventListener("dragstart", event => event.preventDefault());
  stage.addEventListener("pointerdown", event => {
    if (event.button !== 0 || event.isPrimary === false || pointer) return;
    stopAnimation();
    target = Math.round(value);
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, start: value, last: value, at: performance.now(), velocity: 0, moved: false, axis: null };
    root.classList.add("is-deck-moving");
  });
  stage.addEventListener("pointermove", event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    if (!pointer.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 6) pointer.axis = Math.abs(dx) > Math.abs(dy) * 1.15 ? "horizontal" : "vertical";
    if (!pointer.axis) return;
    const delta = pointer.axis === "horizontal" ? dx : dy;
    if (!pointer.moved) {
      pointer.moved = true;
      try { stage.setPointerCapture(event.pointerId); } catch {}
    }
    const now = performance.now();
    value = bound(pointer.start - delta / spacing);
    const dt = Math.max(.008, (now - pointer.at) / 1000);
    const speed = Math.max(-18, Math.min(18, (value - pointer.last) / dt));
    pointer.velocity = pointer.velocity * .35 + speed * .65;
    pointer.last = value;
    pointer.at = now;
    paint();
  });
  function finishPointer(event, cancelled = false) {
    if (!pointer || pointer.id !== event.pointerId) return;
    const gesture = pointer;
    pointer = null;
    if (gesture.moved) {
      suppressUntil = performance.now() + 400;
      try { stage.releasePointerCapture(event.pointerId); } catch {}
    }
    const speed = !cancelled && performance.now() - gesture.at < 90 ? gesture.velocity : 0;
    settle(value + speed * .12, { releaseVelocity: speed });
  }
  stage.addEventListener("pointerup", event => finishPointer(event));
  stage.addEventListener("pointercancel", event => finishPointer(event, true));
  stack.addEventListener("click", event => {
    const card = event.target.closest("a.category");
    if (card && (performance.now() < suppressUntil || card.dataset.deckActive !== "true")) event.preventDefault();
  });
  root.querySelector("[data-system-card-deck-search]")?.addEventListener("input", event => {
    stopAnimation();
    pointer = null;
    const query = event.currentTarget.value.trim().toLocaleLowerCase();
    cards = allCards.filter(card => {
      const match = !query || `${card.dataset.cardNumber} ${card.getAttribute("aria-label") || ""} ${card.textContent || ""}`.toLocaleLowerCase().includes(query);
      card.hidden = !match;
      return match;
    });
    stack.dataset.empty = String(!cards.length);
    event.currentTarget.setCustomValidity(cards.length ? "" : "找不到相符系統");
    value = target = 0;
    active = -1;
    root.classList.remove("is-deck-moving");
    render();
  });
  render();
})();
