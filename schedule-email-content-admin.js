import {previewEmail,validateEmailDraft,checkEmailSpelling} from './email-preview.mjs';
import {submitWithRecovery,resolveSubmission,submissionMessage} from './email-submit.mjs';
const SESSION_KEY = "edmund-schedule-session-v1";
const settings = window.EDMUND_SUPABASE || {};
const workerBaseUrl = String(window.EDMUND_SCHEDULE_CONFIG?.workerBaseUrl || "").replace(/\/+$/, "");
const client = window.supabase?.createClient?.(settings.url, settings.anonKey);

let token = "";
let snapshot = null;
let activeSubmission=false,pendingSubmission=null,pendingKey='';
const recovery=document.querySelector('[data-submission-recovery]');
function updateRecovery() {
  recovery.hidden=!pendingSubmission;
  recovery.querySelector('p').textContent=pendingSubmission?`上次要求尚未核對：${pendingSubmission.requestId}。請先確認結果，避免重複寄送。`:'';
}
function storePending(value) {
  if(value) sessionStorage.setItem(pendingKey,JSON.stringify(value)); else sessionStorage.removeItem(pendingKey);
  pendingSubmission=value;updateRecovery();
}
window.addEventListener('beforeunload',event=>{if(activeSubmission){event.preventDefault();event.returnValue='';}});
document.addEventListener('click',event=>{
  if(activeSubmission && event.target.closest('button') && !event.target.closest('dialog')) {event.preventDefault();event.stopImmediatePropagation();return;}
  if(activeSubmission && event.target.closest('a[href]') && !confirm('訊息仍在上傳／確認中。離開可能中斷上傳，確定離開？')) event.preventDefault();
},true);
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
  const {timeoutMs=35000,...fetchOptions}=options;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
  try {
  const response = await fetch(`${workerBaseUrl}${path}`, { ...fetchOptions, headers,signal:controller.signal });
  if (response.status === 204) return null;
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload) {const error=new Error(`${payload?.error || `服務回應異常（HTTP ${response.status}）`}${payload?.requestId ? `（要求 ID：${payload.requestId}）` : ''}`);error.status=response.status;throw error;}
  return payload;
  } catch(error) {
    if(controller.signal.aborted) throw new Error('連線逾時，正在確認要求結果。');
    throw error;
  } finally {clearTimeout(timer);}
}

function setStatus(text, error = false) {
  status.textContent = text;
  status.dataset.state = error ? "error" : "";
  status.scrollIntoView({block:'nearest',behavior:'smooth'});
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
    <label class="field">內容（系統會在前方加入 Hi 帳戶名稱）<textarea maxlength="8000" spellcheck="true" lang="en"></textarea></label>
    <button class="secondary" type="button" data-spelling>檢查英文拼字</button><p data-spelling-result role="status"></p>
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
    <div class="card-actions"><button class="primary" type="button" data-save>儲存</button><button class="send-once" type="button" data-send>預覽並一次性發送</button></div><p data-card-status role="status"></p>`;
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

  function makeSubmission(approval,sendNow) {
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
    if(approval) {form.set('previewApproved','true');form.set('spellcheck',approval.spellcheck);}
    form.set('sendNow',String(sendNow));
    form.set('expectedRevision',data.revision||'');
    return form;
  }
  const localStatus=card.querySelector('[data-card-status]');
  const report=(message,error=false)=>{localStatus.textContent=message;localStatus.dataset.state=error?'error':'';setStatus(message,error);};
  card.querySelector('[data-spelling]').addEventListener('click',async event=>{
    const button=event.currentTarget;button.disabled=true;const result=card.querySelector('[data-spelling-result]');result.textContent='正在檢查…';
    try {const issues=await checkEmailSpelling(textarea.value);result.textContent=issues.length?issues.map(i=>`${i.word}: ${i.message}`).join('\n'):'未發現明顯英文問題。';}
    catch {result.textContent='拼字檢查暫時無法使用。發送時仍可選擇略過。';} finally {button.disabled=false;}
  });
  let busy=false;
  async function submit(sendNow) {
    if(busy || activeSubmission) return;
    if(pendingSubmission) {setStatus('請先使用上方「確認結果／安全解鎖」核對上次要求，避免重複寄送。',true);return;}
    activeSubmission=true;
    busy=true;const controls=[...card.querySelectorAll('button,input,select,textarea')].map(node=>({node,disabled:node.disabled}));controls.forEach(({node})=>node.disabled=true);
    const requestId=crypto.randomUUID();let objectUrl='',savedSuccessfully=false;
    try {
      const recipientIds=[...recipients.querySelectorAll('input:checked')].map(b=>b.value);
      const selected=snapshot.students.filter(s=>recipientIds.includes(s.studentId));
      const files=[...(attachmentInput.files||[])],existing=(data.attachments||[]).filter(f=>!savedAttachments.removals.has(f.id));
      let approval=null;
      if(sendNow || enabled.checked) {
        if(!snapshot.transportConnected) throw new Error('請先連接 Gmail，才可傳送。');
        validateEmailDraft({content:textarea.value,signatureFile:signature.files?.[0],attachments:files,existingAttachments:existing,signatureLink:signatureLink.value,recipientCount:selected.length});
        let imageSource='';
        if(signature.files?.[0]) {objectUrl=URL.createObjectURL(signature.files[0]);imageSource=objectUrl;}
        else if(data.hasSignatureImage && !removeSignature.checked) {
          const assets=await api(`/v1/admin/email/templates/${data.slot}/assets`);
          if(assets.revision!==data.revision) throw new Error('草稿已在其他頁面更新。請重新整理後再次預覽。');
          if(assets.signatureContent) imageSource=`data:${assets.signatureContentType};base64,${assets.signatureContent.replace(/\s/g,'')}`;
        }
        approval=await previewEmail({content:textarea.value,recipients:selected,imageSource,signatureLink:signatureLink.value,attachments:[...existing,...files],sender:snapshot.sender.connectedEmail,action:sendNow?'確認發送':'確認儲存並啟用定期發送'});
        if(!approval) return;
      }
      const form=makeSubmission(approval,sendNow);
      storePending({requestId,slot:data.slot,sendNow});
      report(`正在上傳並${sendNow?'儲存及排隊':'儲存'}訊息 ${displayIndex+1}… 請先不要重新整理或離開本頁。`);
      const result=await submitWithRecovery({api,slot:data.slot,form,requestId,onProgress:report});
      storePending(null);
      savedSuccessfully=result.state!=='cancelled';
      report(submissionMessage(result),result.state==='cancelled');
    } catch(error) {report(`${error.message||'未能完成。'} 要求 ID：${requestId}。若已排隊，請先檢查 Email Log，避免重寄。`,true);}
    finally {busy=false;activeSubmission=false;controls.forEach(({node,disabled})=>node.disabled=disabled);if(objectUrl) URL.revokeObjectURL(objectUrl);if(savedSuccessfully) await reloadSnapshot().catch(()=>{});}
  }
  card.querySelector('[data-save]').addEventListener('click',()=>submit(false));
  card.querySelector('[data-send]').addEventListener('click',()=>submit(true));
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
    const ownerHash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
    pendingKey='edmund-email-pending-v3:'+Array.from(new Uint8Array(ownerHash)).map(x=>x.toString(16).padStart(2,'0')).join('');
    try {pendingSubmission=JSON.parse(sessionStorage.getItem(pendingKey)||'null');} catch {pendingSubmission=null;}
    updateRecovery();
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

document.querySelector('[data-public-sender]').addEventListener('click',async()=>{
  try {await api('/v1/admin/email/public-sender',{method:'POST',body:'{}'});setStatus('訪客通知寄件人已設定。');}
  catch(error){setStatus(error.message,true);}
});
recovery.querySelector('button').addEventListener('click',async event=>{
  if(activeSubmission || !pendingSubmission) return;
  const button=event.currentTarget;button.disabled=true;activeSubmission=true;
  try {
    const result=await resolveSubmission(api,pendingSubmission.requestId);
    storePending(null);await reloadSnapshot();setStatus(submissionMessage(result),result.state==='cancelled');
  } catch(error) {setStatus(`${error.message} 請稍後再次核對；不要重新建立發送要求。`,true);}
  finally {button.disabled=false;activeSubmission=false;}
});
init();
