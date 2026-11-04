(function initialiseHomepageSystemDirectory() {
  "use strict";

  const openButton = document.querySelector("[data-open-system-directory]");
  const dialog = document.querySelector("[data-system-directory-dialog]");
  const list = dialog?.querySelector("[data-system-directory-list]");
  const search = dialog?.querySelector("[data-system-directory-search]");
  if (!openButton || !dialog || !list || !search) return;

  const systems = Array.from(window.EdmundSystemNav?.systems || []);

  function render(query = "") {
    const key = String(query).trim().toLocaleLowerCase("zh-Hant-HK");
    const matched = systems.filter((system) => !key
      || `${system.zh} ${system.en} ${system.id}`.toLocaleLowerCase("zh-Hant-HK").includes(key));
    list.replaceChildren();
    matched.forEach((system) => {
      const link = document.createElement("a");
      link.className = "system-directory-dialog__link";
      link.href = system.href;
      const zh = document.createElement("strong");
      zh.textContent = system.zh;
      const en = document.createElement("small");
      en.textContent = system.en;
      link.append(zh, en);
      list.append(link);
    });
    if (!matched.length) {
      const empty = document.createElement("p");
      empty.className = "system-directory-dialog__empty";
      empty.textContent = "找不到相符的學習系統。";
      list.append(empty);
    }
  }

  openButton.addEventListener("click", () => {
    search.value = "";
    render();
    dialog.showModal();
    window.setTimeout(() => search.focus(), 0);
  });
  dialog.querySelectorAll("[data-close-system-directory]").forEach((button) => {
    button.addEventListener("click", () => dialog.close());
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  search.addEventListener("input", () => render(search.value));
  render();
})();
