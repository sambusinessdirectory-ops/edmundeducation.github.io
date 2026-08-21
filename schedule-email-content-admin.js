const SESSION_KEY = "edmund-schedule-session-v1";
const settings = window.EDMUND_SUPABASE || {};
const client = window.supabase?.createClient?.(settings.url, settings.anonKey);

let token = "";
let snapshot = null;
const gate = document.querySelector("[data-gate]");
const app = document.querySelector("[data-app]");
const directory = document.querySelector("[data-directory]");
const templates = document.querySelector("[data-templates]");
const status = document.querySelector("[data-status]");

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

function setStatus(text, error = false) {
  status.textContent = text;
  status.dataset.state = error ? "error" : "";
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
    box.checked = template.configured ? selected.has(student.studentId) : true;
    label.append(box, document.createTextNode(`${student.studentName} · ${student.email}`));
    wrap.append(label);
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
  legend.textContent = "指定時間（24 小時制）";
  const hours = timeSelect("小時", Array.from({ length: 24 }, (_, index) => index));
  const minutes = timeSelect("分鐘", Array.from({ length: 60 }, (_, index) => index));
  const [savedHour = "09", savedMinute = "00"] = String(savedValue || "09:00").slice(0, 5).split(":");
  hours.select.value = savedHour.padStart(2, "0");
  minutes.select.value = savedMinute.padStart(2, "0");
  group.append(legend, hours.label, minutes.label);
  return {
    group,
    value: () => `${hours.select.value}:${minutes.select.value}`,
    setDisabled(disabled) {
      group.disabled = disabled;
      group.dataset.disabled = String(disabled);
    }
  };
}

function renderTemplate(data) {
  const card = document.createElement("article");
  card.className = "template-card";
  card.innerHTML = `
    <h2>訊息 ${data.slot}</h2>
    <label><input type="checkbox" data-enabled> 啟用此訊息</label>
    <p>內容（系統會在前方加入 Hi 帳戶名稱）</p>
    <textarea maxlength="8000"></textarea>
    <div class="template-controls"><label>傳送頻率
      <select data-cadence>
        <option value="15m">每 15 分鐘</option><option value="30m">每 30 分鐘</option>
        <option value="45m">每 45 分鐘</option><option value="1h">每 1 小時</option>
        <option value="24h">每 24 小時</option><option value="daily">每日指定時間</option>
      </select></label></div>
    <div class="recipient-tools"><button class="secondary" type="button" data-all>全選</button><button class="secondary" type="button" data-none>取消全選</button></div>
    <strong>接收帳戶</strong><button class="primary" type="button" data-save>儲存訊息 ${data.slot}</button>`;
  const enabled = card.querySelector("[data-enabled]");
  const textarea = card.querySelector("textarea");
  const cadence = card.querySelector("[data-cadence]");
  const time = dailyTimeControls(data.dailyTime);
  const recipients = recipientList(data);
  enabled.checked = data.enabled;
  textarea.value = data.content || "";
  cadence.value = data.cadence || "24h";
  card.querySelector(".template-controls").append(time.group);
  card.insertBefore(recipients, card.querySelector("[data-save]"));
  const syncTime = () => time.setDisabled(cadence.value !== "daily");
  cadence.addEventListener("change", syncTime);
  syncTime();
  card.querySelector("[data-all]").addEventListener("click", () => recipients.querySelectorAll("input").forEach((box) => { box.checked = true; }));
  card.querySelector("[data-none]").addEventListener("click", () => recipients.querySelectorAll("input").forEach((box) => { box.checked = false; }));
  card.querySelector("[data-save]").addEventListener("click", async () => {
    try {
      setStatus(`正在儲存訊息 ${data.slot}…`);
      await rpc("schedule_admin_save_email_template", {
        p_admin_token: token, p_slot: data.slot, p_content: textarea.value,
        p_enabled: enabled.checked, p_cadence: cadence.value,
        p_daily_time: cadence.value === "daily" ? time.value() : null,
        p_recipient_ids: [...recipients.querySelectorAll("input:checked")].map((box) => box.value)
      });
      setStatus(`訊息 ${data.slot} 已安全儲存；傳送服務仍未連接。`);
    } catch (error) { setStatus(error.message || "未能儲存。", true); }
  });
  return card;
}

function render() {
  directory.replaceChildren(...snapshot.students.map((student) => {
    const row = document.createElement("tr");
    row.innerHTML = "<td></td><td></td>";
    row.children[0].textContent = student.studentName;
    row.children[1].textContent = student.email || "尚未提供";
    return row;
  }));
  templates.replaceChildren(...snapshot.templates.map(renderTemplate));
}

async function init() {
  try {
    const saved = session();
    if (!saved) throw new Error("請先在功課系統以管理員身分登入。");
    token = saved.adminToken;
    snapshot = await rpc("schedule_admin_email_designer_snapshot", { p_admin_token: token });
    gate.hidden = true;
    app.hidden = false;
    render();
  } catch (error) { gate.textContent = error.message || "未能載入。"; }
}

init();
