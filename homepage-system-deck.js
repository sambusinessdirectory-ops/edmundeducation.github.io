(function initialiseHomepageSystemDeck() {
  "use strict";

  const root = document.querySelector("[data-system-card-deck]");
  const start = document.querySelector("[data-system-card-start]");
  if (!root || !start) return;

  const stack = root.querySelector("[data-system-card-deck-stack]");
  const stage = root.querySelector("[data-system-card-deck-stage]");
  const position = root.querySelector("[data-system-card-deck-position]");
  const sources = [];
  let node = start;
  while (node) {
    if (node.matches?.("a.category[href]")) sources.push(node);
    node = node.nextElementSibling;
  }
  if (!sources.length) return;

  const cards = sources.map((source, index) => {
    const card = source.cloneNode(true);
    card.removeAttribute("id");
    card.dataset.cardNumber = String(index + 10).padStart(2, "0");
    card.dataset.deckIndex = String(index);
    card.id = `system-card-deck-option-${index}`;
    card.setAttribute("role", "option");
    card.tabIndex = -1;
    stack.append(card);
    return card;
  });

  let active = 0;
  let dragY = 0;
  let pointer = null;
  let suppressClick = false;
  let wheelLocked = false;

  function render({ focus = false } = {}) {
    cards.forEach((card, index) => {
      const distance = index - active;
      const magnitude = Math.abs(distance);
      const visible = magnitude <= 5;
      const offset = distance * -56 + dragY;
      card.style.setProperty("--deck-offset", `${offset}px`);
      card.style.setProperty("--deck-depth", `${-magnitude * 50}px`);
      card.style.setProperty("--deck-tilt", `${distance * -2.2}deg`);
      card.style.setProperty("--deck-scale", String(Math.max(.72, 1 - magnitude * .055)));
      card.style.setProperty("--deck-opacity", visible ? String(Math.max(.18, 1 - magnitude * .15)) : "0");
      card.style.setProperty("--deck-saturation", String(Math.max(.55, 1 - magnitude * .09)));
      card.style.setProperty("--deck-brightness", String(Math.max(.65, 1 - magnitude * .06)));
      card.style.setProperty("--deck-z", String(cards.length - magnitude));
      card.dataset.deckActive = String(distance === 0);
      card.setAttribute("aria-selected", String(distance === 0));
      card.setAttribute("aria-hidden", String(!visible));
      card.tabIndex = distance === 0 ? 0 : -1;
    });
    const selected = cards[active];
    stage.setAttribute("aria-activedescendant", selected.id);
    const label = selected.getAttribute("aria-label") || selected.textContent.trim();
    position.textContent = `${selected.dataset.cardNumber} / ${cards.at(-1).dataset.cardNumber}`;
    position.setAttribute("aria-label", `${selected.dataset.cardNumber}，${label}`);
    root.querySelector("[data-system-card-deck-previous]").disabled = active === 0;
    root.querySelector("[data-system-card-deck-next]").disabled = active === cards.length - 1;
    if (focus) selected.focus({ preventScroll: true });
  }

  function move(direction, options) {
    active = Math.max(0, Math.min(cards.length - 1, active + direction));
    dragY = 0;
    render(options);
  }

  root.querySelector("[data-system-card-deck-previous]").addEventListener("click", () => move(-1, { focus: true }));
  root.querySelector("[data-system-card-deck-next]").addEventListener("click", () => move(1, { focus: true }));

  stage.addEventListener("keydown", event => {
    if (["ArrowUp", "PageUp"].includes(event.key)) { event.preventDefault(); move(-1, { focus: true }); }
    if (["ArrowDown", "PageDown"].includes(event.key)) { event.preventDefault(); move(1, { focus: true }); }
    if (event.key === "Home") { event.preventDefault(); active = 0; render({ focus: true }); }
    if (event.key === "End") { event.preventDefault(); active = cards.length - 1; render({ focus: true }); }
  });

  stage.addEventListener("wheel", event => {
    if (Math.abs(event.deltaY) < Math.abs(event.deltaX) || Math.abs(event.deltaY) < 5) return;
    event.preventDefault();
    if (wheelLocked) return;
    wheelLocked = true;
    move(event.deltaY > 0 ? 1 : -1);
    window.setTimeout(() => { wheelLocked = false; }, 190);
  }, { passive: false });

  stage.addEventListener("pointerdown", event => {
    if (event.button !== 0) return;
    pointer = { id: event.pointerId, y: event.clientY, moved: false };
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener("pointermove", event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    dragY = Math.max(-90, Math.min(90, event.clientY - pointer.y));
    pointer.moved ||= Math.abs(dragY) > 8;
    render();
  });
  function finishPointer(event) {
    if (!pointer || pointer.id !== event.pointerId) return;
    const delta = dragY;
    suppressClick = pointer.moved;
    pointer = null;
    try { stage.releasePointerCapture(event.pointerId); } catch {}
    if (Math.abs(delta) >= 42) move(delta < 0 ? 1 : -1);
    else { dragY = 0; render(); }
    if (suppressClick) window.setTimeout(() => { suppressClick = false; }, 0);
  }
  stage.addEventListener("pointerup", finishPointer);
  stage.addEventListener("pointercancel", finishPointer);
  stack.addEventListener("click", event => {
    const card = event.target.closest("a.category");
    if (!card) return;
    if (suppressClick || card.dataset.deckActive !== "true") event.preventDefault();
  });

  render();
})();
