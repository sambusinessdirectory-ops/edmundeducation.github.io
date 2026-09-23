(async function () {
  "use strict";
  const $ = (name) => document.querySelector(`[data-farm-${name}]`);
  const form = $("form");
  const config = window.EDMUND_SUPABASE;
  const client = window.supabase?.createClient(config.url, config.anonKey, { auth: { persistSession: true, detectSessionInUrl: false } });
  const adminKey = "eddie-farm-admin-session-v1";
  const i18n = window.EddieFarmI18n;
  let adminToken = "";
  let activeRole = "login";
  let accountName = "";
  let balance = null;
  let messageText = () => "";
  const status = () => { messageText = () => ""; $("status").textContent = ""; };
  const statusKey = (key, values = () => ({})) => { messageText = () => i18n.t(key, values()); $("status").textContent = messageText(); };
  const statusError = (error) => { messageText = () => i18n.errorText(error); $("status").textContent = messageText(); };

  function translateState() {
    $("name").textContent = activeRole === "admin" ? `${accountName} · ${i18n.t("adminBadge")}` : accountName;
    if (balance !== null) $("balance").textContent = Number(balance).toLocaleString(i18n.language === "en" ? "en-HK" : "zh-HK");
    $("status").textContent = messageText();
  }
  document.addEventListener("eddie-farm-language-change", translateState);

  async function rpc(name, args) {
    if (!client) throw new Error("Unable to connect. Please refresh and try again.");
    const { data: auth } = await client.auth.getSession();
    if (!auth.session) { const { error } = await client.auth.signInAnonymously(); if (error) throw error; }
    const { data, error } = await client.rpc(name, args);
    if (error) throw error;
    return data;
  }

  function view(role, name = "") {
    activeRole = role; accountName = name;
    $("login").hidden = role !== "login";
    $("student").hidden = role !== "student";
    $("admin").hidden = role !== "admin";
    $("logout").hidden = role === "login";
    translateState();
  }

  async function showStudent() {
    const data = await window.EddieFarmAPI.snapshot();
    if (!data) { view("login"); return false; }
    window.EdmundSystemNav.rememberStudentSession({ role: "student", id: data.id, name: data.name, token: window.EddieFarmAPI.student().token });
    balance = data.balance;
    view("student", data.name);
    return true;
  }

  function renderRules(rules) {
    $("rules").replaceChildren();
    for (const rule of rules) {
      const row = document.createElement("form"); row.className = "farm-rule";
      const title = document.createElement("h2"); title.textContent = i18n.ruleTitle(rule);
      title.dataset.farmRuleTitle = rule.system_key; title.dataset.farmRuleLabel = rule.label;
      const fields = document.createElement("div"); fields.className = "farm-rule-fields";
      function numberInput(labelKey, value, min, name) {
        const wrapper = document.createElement("label");
        const label = document.createElement("span"); label.dataset.farmI18n = labelKey; label.textContent = i18n.t(labelKey); wrapper.append(label);
        const input = document.createElement("input"); input.type = "number"; input.min = min; input.max = 10000; input.step = 1; input.required = true; input.value = value; input.name = name;
        wrapper.append(input); fields.append(wrapper); return input;
      }
      const count = numberInput(rule.system_key === "daily-return" ? "returnDay" : "exercises", rule.exercise_count, 1, "count");
      count.readOnly = rule.system_key === "daily-return";
      const points = numberInput("points", rule.points, 0, "points");
      const enabledLabel = document.createElement("label"); enabledLabel.className = "farm-enabled";
      const enabled = document.createElement("input"); enabled.type = "checkbox"; enabled.checked = rule.enabled;
      const enabledText = document.createElement("span"); enabledText.dataset.farmI18n = "enabled"; enabledText.textContent = i18n.t("enabled");
      enabledLabel.append(enabled, enabledText);
      const save = document.createElement("button"); save.type = "submit"; save.dataset.farmI18n = "save"; save.textContent = i18n.t("save");
      fields.append(enabledLabel, save); row.append(title, fields); $("rules").append(row);
      row.addEventListener("submit", async (event) => {
        event.preventDefault(); save.disabled = true; status();
        try {
          const updated = await rpc("eddie_farm_admin_update_rule", { p_token: adminToken, p_system: rule.system_key, p_count: Number(count.value), p_points: Number(points.value), p_enabled: enabled.checked, p_revision: rule.revision });
          Object.assign(rule, updated); statusKey("settingsSaved", () => ({ title: i18n.ruleTitle(rule) }));
        } catch (error) { statusError(error); }
        finally { save.disabled = false; }
      });
    }
  }

  async function searchWallets(query) {
    const host = $("wallet-results"); host.replaceChildren();
    const result = await rpc("eddie_farm_admin_search_wallets", { p_token: adminToken, p_query: query });
    for (const student of result.students || []) {
      const row = document.createElement("form"); row.className = "farm-wallet-row";
      const name = document.createElement("strong"); name.textContent = student.name;
      const input = document.createElement("input"); input.type = "number"; input.min = "0"; input.max = "1000000000"; input.step = "1"; input.required = true; input.value = student.balance; input.setAttribute("aria-label", `Coin balance for ${student.name}`);
      const button = document.createElement("button"); button.type = "submit"; button.textContent = "Save balance";
      row.append(name,input,button); host.append(row);
      row.addEventListener("submit", async event => { event.preventDefault(); button.disabled = true; try { const updated = await rpc("eddie_farm_admin_set_wallet", { p_token: adminToken, p_student: student.id, p_balance: Number(input.value) }); input.value = updated.balance; statusKey("walletSaved", () => ({ name: updated.name, balance: Number(updated.balance).toLocaleString() })); } catch (error) { statusError(error); } finally { button.disabled = false; } });
    }
    if (!(result.students || []).length) host.textContent = "No matching student accounts.";
  }
  async function loadCosmeticCatalog() {
    const host = $("cosmetic-catalog"); host.replaceChildren();
    const result = await rpc("eddie_farm_admin_cosmetic_catalog", { p_token: adminToken });
    for (const item of result.items || []) {
      const row = document.createElement("form"); row.className = "farm-cosmetic-row";
      const image = document.createElement("img"); image.src = `assets/speaking-system/cosmetics/${item.image_character}/${encodeURIComponent(item.id)}.webp`; image.alt = item.name; image.loading = "lazy";
      const description = document.createElement("div"); description.className = "farm-cosmetic-description";
      const title = document.createElement("strong"); title.textContent = item.name;
      const meta = document.createElement("small"); meta.textContent = `${item.enabled ? "Available in shop" : "Disabled in shop"} · ${item.id}`;
      description.append(title, meta);
      const label = document.createElement("label"); label.textContent = "Coin price";
      const input = document.createElement("input"); input.type = "number"; input.min = "1"; input.max = "100000"; input.step = "1"; input.required = true; input.value = item.price; input.setAttribute("aria-label", `Coin price for ${item.name}`); label.append(input);
      const save = document.createElement("button"); save.type = "submit"; save.textContent = "Save price";
      row.append(image, description, label, save); host.append(row);
      row.addEventListener("submit", async event => {
        event.preventDefault(); const price = Number(input.value); if (!Number.isInteger(price) || price < 1 || price > 100000) { input.reportValidity(); return; }
        save.disabled = true;
        try { const updated = await rpc("eddie_farm_admin_update_cosmetic_price", { p_token: adminToken, p_item: item.id, p_price: price }); item.price = updated.price; input.value = updated.price; statusKey("cosmeticPriceSaved", () => ({ name: item.name, price: Number(updated.price).toLocaleString() })); }
        catch (error) { statusError(error); }
        finally { save.disabled = false; }
      });
    }
    if (!(result.items || []).length) host.textContent = "No coin-priced clothing items are configured.";
  }
  $("wallet-search").addEventListener("submit", async event => { event.preventDefault(); const query = new FormData(event.currentTarget).get("query"); try { await searchWallets(String(query || "").trim()); } catch (error) { statusError(error); } });

  async function showAdmin() {
    const data = await rpc("eddie_farm_admin_rules", { p_token: adminToken });
    renderRules(data.rules || []); view("admin", data.name); await loadCosmeticCatalog();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); status(); $("login-button").disabled = true;
    const values = new FormData(form);
    try {
      const args = { p_name: String(values.get("username")).trim(), p_password: String(values.get("password")) };
      if (values.get("role") === "admin") {
        const data = await rpc("eddie_farm_admin_login", args);
        if (!data?.token) throw new Error("Incorrect login details, or too many attempts. Please try again later.");
        adminToken = data.token; sessionStorage.setItem(adminKey, adminToken); await showAdmin();
      } else {
        const rows = await rpc("flashcard_student_login", args); const data = rows?.[0];
        if (!data?.session_token) throw new Error("Incorrect student username or password.");
        window.EdmundSystemNav.rememberStudentSession({ role: "student", id: data.id, name: data.name, token: data.session_token });
        adminToken = ""; sessionStorage.removeItem(adminKey); await showStudent();
        if (new URLSearchParams(location.search).get("return") === "farm") location.assign("eddy-carrot-patch/?shop=1");
      }
    } catch (error) { statusError(error); }
    finally { form.elements.password.value = ""; $("login-button").disabled = false; }
  });
  form.elements.role.addEventListener("change", () => { form.elements.password.value = ""; status(); });
  $("refresh").addEventListener("click", async () => { status(); try { await showStudent(); } catch(error) { statusError(error); } });
  $("admin-refresh").addEventListener("click", async () => { status(); try { await showAdmin(); } catch(error) { statusError(error); } });
  $("logout").addEventListener("click", async () => {
    if (adminToken) { try { await rpc("eddie_farm_admin_logout", { p_token: adminToken }); } catch { /* Clear local session regardless. */ } }
    else window.EdmundSystemNav.forgetStudentSession();
    adminToken = ""; balance = null; sessionStorage.removeItem(adminKey); $("rules").replaceChildren(); $("cosmetic-catalog").replaceChildren(); $("balance").textContent = "—"; view("login"); status();
  });
  try {
    adminToken = sessionStorage.getItem(adminKey) || "";
    if (adminToken) await showAdmin(); else await showStudent();
  } catch { adminToken = ""; sessionStorage.removeItem(adminKey); view("login"); statusKey("continueLogin"); }
})();
