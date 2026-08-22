const SESSION_KEY = "edmund-schedule-session-v1";
const settings = window.EDMUND_SUPABASE || {};
const workerBaseUrl = String(window.EDMUND_SCHEDULE_CONFIG?.workerBaseUrl || "").replace(/\/+$/, "");
const client = window.supabase?.createClient?.(settings.url, settings.anonKey);

let token = "";
let snapshot = null;
const gate = document.querySelector("[data-gate]");
const app = document.querySelector("[data-app]");
const directory = document.querySelector("[data-directory]");
const templates = document.querySelector("[data-templates]");
const status = document.querySelector("[data-status]");
const transport = document.querySelector("[data-transport]");
const senderEmail = document.querySelector("[data-sender-email]");
const connectionDetail = document.querySelector("[data-connection-detail]");

function session() {
  try {
    const value = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    return value?.role === "admin" ? value : null;
  } catch { return null; }
}

async function auth() {
  const current = await client.auth.getSession();
  if (current.data?.session) return;
  const result = await client.auth.signInAnonymously();
  if (result.error) throw result.error;
}

async function rpc(name, args) {
  await auth();
  const result = await client.rpc(name, args);
  if (result.error) throw result.error;
  return result.data;
}

async function api(path, options = {}) {
  if (!workerBaseUrl) throw new Error("Gmail 服務網址尚未設定。");
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const response = await fetch(`${workerBaseUrl}${path}`, { ...options, headers });
  if (response.status === 204) return null;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "服務暫時未能完成要求。");
  return payload;
}

function setStatus(text, error = false) {
  status.textContent = text;
  status.dataset.state = error ? "error" : "";
}

function formatBytes(bytes) {
  const value = Number(bytes || 0);
  return value >= 1024 * 1024 ? `${(value / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(value / 1024))} KB`;
}

function recipientList(template) {
  const wrap = document.createElement("div");
  wrap.className = "recipient-list";
  const selected = new Set(template.recipientIds || []);
  for (const student of snapshot.students) {
    if (!student.email) continue;
    const label = document.createElement("label");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.value = student.studentId;
    box.checked = selected.has(student.studentId);
    label.append(box, document.createTextNode(`${student.studentName} · ${student.email}`));
    wrap.append(label);
  }
  if (!wrap.children.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "暫時沒有已登記電郵的帳戶。";
    wrap.append(empty);
  }
  return wrap;
}

function timeSelect(labelText, values) {
  const label = document.createElement("label");
  label.append(document.createTextNode(labelText));
  const select = document.createElement("select");
  select.setAttribute("aria-label", labelText);
  values.forEach((value) => {
    const padded = String(value).padStart(2, "0");
    select.add(new Option(padded, padded));
  });
  label.append(select);
  return { label, select };
}

function dailyTimeControls(savedValue) {
  const group = document.createElement("fieldset");
  group.className = "daily-time-controls";
  const legend = document.createElement("legend");
  legend.textContent = "指定時間（香港時間・24 小時制）";
  const hours = timeSelect("小時", Array.from({ length: 24 }, (_, index) => index));
  const minutes = timeSelect("分鐘", Array.from({ length: 60 }, (_, index) => index));
  const [savedHour = "09", savedMinute = "00"] = String(savedValue || "09:00").slice(0, 5).split(":");
  hours.select.value = savedHour.padStart(2, "0");
  minutes.select.value = savedMinute.padStart(2, "0");
  group.append(legend, hours.label, minutes.label);
  return { group, value: () => `${hours.select.value}:${minutes.select.value}`, setDisabled(disabled) { group.disabled = disabled; group.dataset.disabled = String(disabled); } };
}

function attachmentList(data) {
  const wrap = document.createElement("div");
  wrap.className = "saved-files";
  const removals = new Set();
  for (const attachment of data.attachments || []) {
    const row = document.createElement("div");
    const name = document.createElement("span");
    name.textContent = `${attachment.filename} · ${formatBytes(attachment.sizeBytes)}`;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "danger-text small";
    button.textContent = "移除";
    button.addEventListener("click", () => {
      const removed = removals.has(attachment.id);
      if (removed) removals.delete(attachment.id); else removals.add(attachment.id);
      row.dataset.removed = String(!removed);
      button.textContent = removed ? "移除" : "取消移除";
    });
    row.append(name, button);
    wrap.append(row);
  }
  return { wrap, removals };
}

function renderTemplate(data, displayIndex) {
  const card = document.createElement("article");
  card.className = "template-card";
  card.innerHTML = `
    <div class="card-heading"><h2>訊息 ${displayIndex + 1}</h2><button class="danger-text" type="button" data-delete>刪除這個訊息</button></div>
    <label class="enabled"><input type="checkbox" data-enabled> 啟用定期傳送</label>
    <label class="field">內容（系統會在前方加入 Hi 帳戶名稱）<textarea maxlength="8000"></textarea></label>
    <div class="template-controls"><label>傳送頻率
      <select data-cadence>
        <option value="once">一次性發送</option><option value="15m">每 15 分鐘</option><option value="30m">每 30 分鐘</option>
        <option value="45m">每 45 分鐘</option><option value="1h">每 1 小時</option>
        <option value="24h">每 24 小時</option><option value="daily">每日指定時間</option>
      </select></label></div>
    <fieldset class="asset-box"><legend>簽名圖片</legend><label class="field">上載圖片（PNG、JPEG、GIF 或 WebP；最多 2 MB）<input type="file" accept="image/png,image/jpeg,image/gif,image/webp" data-signature></label><label class="field">圖片連結（收件人按圖片後前往）<input type="url" maxlength="2048" placeholder="https://edmundeducation.com" data-signature-link></label><label class="remove-signature" hidden><input type="checkbox" data-remove-signature> 移除已儲存的簽名圖片</label><p class="file-note" data-signature-note></p></fieldset>
    <fieldset class="asset-box"><legend>PDF 附件</legend><label class="field">新增 PDF（最多 3 個；每個 5 MB，合共 10 MB）<input type="file" accept="application/pdf,.pdf" multiple data-attachments></label><div data-saved-files></div></fieldset>
    <div class="recipient-tools"><button class="secondary" type="button" data-all>全選</button><button class="secondary" type="button" data-none>取消全選</button></div>
    <strong>接收帳戶</strong>
    <div class="card-actions"><button class="primary" type="button" data-save>儲存</button><button class="send-once" type="button" data-send>儲存並一次性發送</button></div>`;
  const enabled = card.querySelector("[data-enabled]");
  const textarea = card.querySelector("textarea");
  const cadence = card.querySelector("[data-cadence]");
  const signature = card.querySelector("[data-signature]");
  const signatureLink = card.querySelector("[data-signature-link]");
  const removeSignatureLabel = card.querySelector(".remove-signature");
  const removeSignature = card.querySelector("[data-remove-signature]");
  const attachmentInput = card.querySelector("[data-attachments]");
  const time = dailyTimeControls(data.dailyTime);
  const recipients = recipientList(data);
  const savedAttachments = attachmentList(data);
  enabled.checked = data.enabled;
  textarea.value = data.content || "";
  cadence.value = data.cadence || "once";
  signatureLink.value = data.signatureLink || "";
  if (data.hasSignatureImage) {
    removeSignatureLabel.hidden = false;
    card.querySelector("[data-signature-note]").textContent = `已儲存：${data.signatureFilename || "簽名圖片"}`;
  }
  card.querySelector("[data-saved-files]").replaceWith(savedAttachments.wrap);
  card.querySelector(".template-controls").append(time.group);
  card.insertBefore(recipients, card.querySelector(".card-actions"));
  const syncControls = () => {
    time.setDisabled(cadence.value !== "daily");
    enabled.disabled = cadence.value === "once";
    if (cadence.value === "once") enabled.checked = false;
    card.querySelector("[data-send]").hidden = cadence.value !== "once";
  };
  cadence.addEventListener("change", syncControls);
  syncControls();
  card.querySelector("[data-all]").addEventListener("click", () => recipients.querySelectorAll("input[type=checkbox]").forEach((box) => { box.checked = true; }));
  card.querySelector("[data-none]").addEventListener("click", () => recipients.querySelectorAll("input[type=checkbox]").forEach((box) => { box.checked = false; }));

  async function save() {
    const form = new FormData();
    form.set("content", textarea.value);
    form.set("enabled", String(enabled.checked));
    form.set("cadence", cadence.value);
    if (cadence.value === "daily") form.set("dailyTime", time.value());
    form.set("recipientIds", JSON.stringify([...recipients.querySelectorAll("input:checked")].map((box) => box.value)));
    form.set("signatureLink", signatureLink.value.trim());
    const signatureFile = signature.files?.[0];
    form.set("signatureAction", signatureFile ? "replace" : removeSignature.checked ? "remove" : "keep");
    if (signatureFile) form.set("signature", signatureFile);
    form.set("removeAttachmentIds", JSON.stringify([...savedAttachments.removals]));
    [...(attachmentInput.files || [])].forEach((file) => form.append("attachments", file));
    await api(`/v1/admin/email/templates/${data.slot}`, { method: "PATCH", body: form });
  }

  card.querySelector("[data-save]").addEventListener("click", async (event) => {
    event.currentTarget.disabled = true;
    try { setStatus(`正在儲存訊息 ${displayIndex + 1}…`); await save(); await reloadSnapshot(); setStatus(`訊息 ${displayIndex + 1} 已儲存。`); }
    catch (error) { setStatus(error.message || "未能儲存。", true); }
    finally { event.currentTarget.disabled = false; }
  });
  card.querySelector("[data-send]").addEventListener("click", async (event) => {
    if (!snapshot.transportConnected) return setStatus("請先連接 Gmail，才可傳送。", true);
    if (!confirm("確認儲存並把這個訊息加入一次性發送隊列？")) return;
    event.currentTarget.disabled = true;
    try {
      setStatus(`正在儲存及排程訊息 ${displayIndex + 1}…`);
      await save();
      const result = await api(`/v1/admin/email/templates/${data.slot}/send-once`, { method: "POST", body: JSON.stringify({ requestId: crypto.randomUUID() }) });
      await reloadSnapshot();
      setStatus(`已加入 ${result.queued} 封電郵；系統會按每日 ${result.dailyLimit} 封上限逐步寄出。`);
    } catch (error) { setStatus(error.message || "未能排程發送。", true); }
    finally { event.currentTarget.disabled = false; }
  });
  card.querySelector("[data-delete]").addEventListener("click", async () => {
    if (!confirm(`確認刪除訊息 ${displayIndex + 1}、其簽名及附件？`)) return;
    try { await api(`/v1/admin/email/templates/${data.slot}`, { method: "DELETE", body: JSON.stringify({ confirmation: "DELETE" }) }); await reloadSnapshot(); setStatus(`訊息 ${displayIndex + 1} 已刪除。`); }
    catch (error) { setStatus(error.message || "未能刪除。", true); }
  });
  return card;
}

function renderConnection() {
  senderEmail.value = snapshot.sender?.email || "edmundeducationedu@gmail.com";
  const connected = snapshot.transportConnected === true;
  transport.dataset.connected = String(connected);
  transport.textContent = connected
    ? `✅ Gmail 已連接：${snapshot.sender.connectedEmail}。已啟用安全發送隊列（每 24 小時最多 ${snapshot.gmailDailyLimit} 封）。`
    : "🔌 Gmail 尚未連接。請先儲存寄件地址，再完成 Google 授權；未連接前不會寄出電郵。";
  connectionDetail.textContent = connected
    ? `已授權 ${snapshot.sender.connectedEmail}${snapshot.sender.connectedAt ? ` · ${new Date(snapshot.sender.connectedAt).toLocaleString("zh-HK")}` : ""}`
    : "尚未授權";
  document.querySelector("[data-disconnect-gmail]").hidden = !connected;
}

function render() {
  renderConnection();
  directory.replaceChildren(...snapshot.students.map((student) => {
    const row = document.createElement("tr");
    row.innerHTML = "<td></td><td></td>";
    row.children[0].textContent = student.studentName;
    row.children[1].textContent = student.email || "尚未提供";
    return row;
  }));
  templates.replaceChildren(...snapshot.templates.map(renderTemplate));
}

async function reloadSnapshot() {
  snapshot = await rpc("schedule_admin_email_designer_snapshot", { p_admin_token: token });
  render();
}

document.querySelector("[data-save-sender]").addEventListener("click", async () => {
  try { setStatus("正在儲存寄件地址…"); await api("/v1/admin/email/sender", { method: "PATCH", body: JSON.stringify({ senderEmail: senderEmail.value.trim() }) }); await reloadSnapshot(); setStatus("寄件地址已儲存。若地址有更改，請重新連接 Gmail。"); }
  catch (error) { setStatus(error.message || "未能儲存寄件地址。", true); }
});

document.querySelector("[data-connect-gmail]").addEventListener("click", async () => {
  try {
    setStatus("正在開啟 Google 授權頁…");
    await api("/v1/admin/email/sender", { method: "PATCH", body: JSON.stringify({ senderEmail: senderEmail.value.trim() }) });
    const result = await api("/v1/admin/gmail/oauth/start", { method: "POST", body: JSON.stringify({ senderEmail: senderEmail.value.trim() }) });
    window.location.assign(result.authorizationUrl);
  } catch (error) { setStatus(error.message || "未能開始 Gmail 授權。", true); }
});

document.querySelector("[data-disconnect-gmail]").addEventListener("click", async () => {
  if (!confirm("確認中斷 Gmail？已排隊的電郵會保留，但在重新連接前不會寄出。")) return;
  try { await api("/v1/admin/email/sender", { method: "DELETE" }); await reloadSnapshot(); setStatus("Gmail 已中斷。密碼權杖已從資料庫移除。"); }
  catch (error) { setStatus(error.message || "未能中斷 Gmail。", true); }
});

document.querySelector("[data-add-template]").addEventListener("click", async () => {
  try {
    const result = await api("/v1/admin/email/templates", { method: "POST", body: JSON.stringify({}) });
    await reloadSnapshot();
    setStatus(`已新增訊息 ${snapshot.templates.findIndex((item) => item.slot === result.slot) + 1}。`);
  } catch (error) { setStatus(error.message || "未能新增訊息。", true); }
});

async function init() {
  try {
    const saved = session();
    if (!saved) throw new Error("請先在功課系統以管理員身分登入。");
    token = saved.adminToken;
    await reloadSnapshot();
    gate.hidden = true;
    app.hidden = false;
    const parameters = new URLSearchParams(location.search);
    const gmail = parameters.get("gmail");
    const reason = parameters.get("reason");
    if (gmail === "connected") setStatus("Gmail 授權完成，可以開始傳送。");
    if (gmail === "error") {
      const errorMessages = {
        account_mismatch: "授權的 Google 帳戶與寄件地址不相同，請用正確帳戶重試。",
        missing_gmail_send: "Google 未授予傳送電郵權限。請重新連接，並勾選「代您傳送電郵」權限。"
      };
      setStatus(errorMessages[reason] || "Gmail 授權未完成，請重試。", true);
    }
    if (gmail) history.replaceState(null, "", location.pathname);
  } catch (error) { gate.textContent = error.message || "未能載入。"; }
}

init();
