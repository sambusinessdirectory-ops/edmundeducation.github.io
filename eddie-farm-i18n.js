(function () {
  "use strict";
  const storageKey = "eddie-farm-language-v1";
  const messages = {
    en: {
      pageTitle: "Eddie Farm Points | EdmundEducation", skip: "Skip to content", switchSystem: "Switch learning system",
      library: "EDMUND STUDENT LIBRARY", pointsSystem: "Points system", tagline: "A little progress, a growing farm.",
      back: "← Back to home", welcome: "WELCOME BACK", login: "Log in", loginHelp: "Use your usual EdmundEducation student account.",
      accountType: "Account type", student: "Student", administrator: "Farm administrator", username: "Username", password: "Password",
      loginButton: "Log in →", logout: "Log out", myPoints: "My points", balance: "Current balance", refreshBalance: "Refresh balance",
      visitFarm: "Visit Eddie’s Farm →", administration: "FARM ADMINISTRATION", rewardSettings: "Reward settings",
      ruleHelp: "Changes apply to future completions. Existing points stay unchanged; a changed rule starts a new exercise batch. A return bonus is paid at most once per consecutive Hong Kong calendar day.",
      refreshSettings: "Refresh settings", exercises: "Exercises per batch", returnDay: "Consecutive return day", points: "Points per batch",
      enabled: "Enabled", save: "Save", adminBadge: "Admin", settingsSaved: "{title}: settings saved.",
      continueLogin: "Please log in to continue.", unexpectedError: "Something went wrong. Please refresh and try again."
    },
    "zh-Hant": {
      pageTitle: "Eddie Farm 積分系統｜EdmundEducation", skip: "跳至主要內容", switchSystem: "切換學習系統",
      library: "EDMUND 學生學習平台", pointsSystem: "積分系統", tagline: "每天進步一點，讓農場慢慢成長。",
      back: "← 返回主頁", welcome: "歡迎回來", login: "登入", loginHelp: "請使用您現有的 EdmundEducation 學生帳戶登入。",
      accountType: "帳戶類型", student: "學生", administrator: "農場管理員", username: "用戶名稱", password: "密碼",
      loginButton: "登入 →", logout: "登出", myPoints: "我的積分", balance: "目前積分餘額", refreshBalance: "更新積分",
      visitFarm: "前往 Eddie 農場 →", administration: "農場管理", rewardSettings: "積分獎勵設定",
      ruleHelp: "設定只適用於之後完成的練習，已獲得的積分不受影響。更改規則後，未滿一組的練習進度會重新計算。連續回訪獎勵按香港日期計算，每天最多發放一次。",
      refreshSettings: "更新設定", exercises: "每組練習數量", returnDay: "連續回訪日數", points: "每組獎勵積分",
      enabled: "啟用", save: "儲存", adminBadge: "管理員", settingsSaved: "{title}：設定已儲存。",
      continueLogin: "請先登入以繼續。", unexpectedError: "操作未能完成，請重新整理後再試。"
    }
  };
  // Display labels only. Reward amounts and thresholds remain server-private.
  const ruleLabels = {
    "*": "其他答題系統（預設）", flashcards: "學習卡", "sentence-structure": "句子結構", idioms: "成語", proverbs: "諺語",
    "writing-practice": "寫作練習（填空）", "phrasal-verbs": "短語動詞", "reading-comprehension": "閱讀理解",
    "song-appreciation": "英文歌賞析", listening: "聆聽練習", speaking: "口語練習", "speaking-recordings": "口語錄音",
    "writing-submission": "作文提交", grammar: "文法練習", "false-friends": "易混淆詞語", "daily-return": "連續回訪獎勵（T+1）",
    "common-expression-speaking": "常用表達：口語", "common-expression-written": "常用表達：書面語",
    "common-expression-rhetorical-speaking": "常用表達：口語修辭", "common-expression-rhetorical-writing": "常用表達：寫作修辭",
    "common-expression-professional-message": "常用表達：專業訊息", "common-expression-business-speaking": "常用表達：商務口語"
  };
  const errors = {
    "Unable to connect. Please refresh and try again.": "暫時無法連線，請重新整理後再試。",
    "Incorrect login details, or too many attempts. Please try again later.": "登入資料不正確，或嘗試次數過多，請稍後再試。",
    "Incorrect student username or password.": "學生用戶名稱或密碼不正確。",
    "Login failed. Please try again.": "登入失敗，請再試一次。",
    "Please log in again.": "登入已失效，請重新登入。",
    "Administrator login required.": "請先以農場管理員帳戶登入。",
    "Admin authentication required.": "請先以農場管理員帳戶登入。",
    "Admin session expired.": "管理員登入已失效，請重新登入。",
    "Authentication required.": "請先登入以繼續。",
    "Enter valid whole numbers.": "請輸入有效的整數。",
    "Return bonuses are once per consecutive day.": "連續回訪獎勵每天最多發放一次。",
    "Settings changed. Refresh before saving.": "設定已被更新，請先更新設定再儲存。",
    "Invalid reward settings.": "獎勵設定無效，請檢查練習數量及積分。",
    "Unknown system.": "找不到此系統，請更新設定後再試。",
    "The farm connection is unavailable.": "暫時無法連接農場，請稍後再試。",
    "Connection interrupted. Please retry; your action will not be charged twice.": "連線中斷，請重試；系統不會重複扣分。",
    "The farm request failed. Please try again.": "農場操作失敗，請再試一次。",
    "Account changed. Refresh the farm.": "帳戶已更改，請重新整理農場。",
    "Failed to fetch": "網絡連線失敗，請檢查連線後再試。",
    "Failed to fetch.": "網絡連線失敗，請檢查連線後再試。"
  };
  const normalize = (value) => value === "en" ? "en" : ["zh", "zh-Hant", "zh-HK", "zh-TW"].includes(value) ? "zh-Hant" : null;
  let saved;
  try { saved = localStorage.getItem(storageKey); } catch { /* Language switching works without storage. */ }
  const requestedLanguage = normalize(new URL(location.href).searchParams.get("lang"));
  let language = requestedLanguage || normalize(saved) || "en";
  if (requestedLanguage) { try { localStorage.setItem(storageKey, language); } catch { /* Optional preference only. */ } }
  function t(key, values = {}) {
    return (messages[language][key] || messages.en[key] || key).replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ""));
  }
  function ruleTitle(rule) { return language === "zh-Hant" ? ruleLabels[rule.system_key] || rule.label : rule.label; }
  function errorText(error) {
    const message = error?.message || "";
    return language === "zh-Hant" ? errors[message] || t("unexpectedError") : message || t("unexpectedError");
  }
  function apply(root = document) {
    root.querySelectorAll("[data-farm-i18n]").forEach((element) => { element.textContent = t(element.dataset.farmI18n); });
    root.querySelectorAll("[data-farm-i18n-aria]").forEach((element) => { element.setAttribute("aria-label", t(element.dataset.farmI18nAria)); });
    root.querySelectorAll("[data-farm-rule-title]").forEach((element) => { element.textContent = ruleTitle({ system_key: element.dataset.farmRuleTitle, label: element.dataset.farmRuleLabel }); });
    document.documentElement.lang = language === "en" ? "en-HK" : "zh-Hant";
    document.title = t("pageTitle");
    document.querySelectorAll("[data-farm-language]").forEach((button) => { button.setAttribute("aria-pressed", String(button.dataset.farmLanguage === language)); });
  }
  function setLanguage(value) {
    const next = normalize(value);
    if (!next) return;
    language = next;
    try { localStorage.setItem(storageKey, language); } catch { /* Optional preference only. */ }
    try { const url = new URL(location.href); url.searchParams.set("lang", language); history.replaceState(history.state, "", url); } catch { /* Still switch the visible page. */ }
    apply();
    document.dispatchEvent(new CustomEvent("eddie-farm-language-change"));
  }
  window.EddieFarmI18n = Object.freeze({ t, apply, ruleTitle, errorText, setLanguage, get language() { return language; } });
  document.querySelectorAll("[data-farm-language]").forEach((button) => { button.addEventListener("click", () => setLanguage(button.dataset.farmLanguage)); });
  apply();
  document.addEventListener("DOMContentLoaded", () => apply(), { once: true });
})();
