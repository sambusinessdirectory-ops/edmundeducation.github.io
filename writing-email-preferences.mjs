export function feedbackPublicationMessage(status) {
  if (status === 'accepted') return '評語已儲存並發送至學生帳戶；評改完成通知已寄出。';
  if (['queued', 'processing'].includes(status)) return '評語已儲存並發送至學生帳戶；電郵通知已排程。';
  if (status === 'not_subscribed') return '評語已儲存並發送至學生帳戶；學生未登記電郵通知。';
  return '評語已儲存並發送至學生帳戶；電郵通知暫時未能確認。';
}

export function createWritingEmailPreferences({ host, request, accountKey }) {
  let generation = 0;
  const clear = () => { generation++; if (host) host.replaceChildren(); };
  async function load() {
    if (!host) return;
    clear();
    const run = generation, owner = accountKey();
    const current = () => run === generation && owner && owner === accountKey();
    host.innerHTML = `<details class="writing-email-preference" open>
      <summary><strong>評改完成電郵通知</strong><span>自願登記 · Optional</span></summary>
      <p>自願登記後，老師完成評改便會收到電郵通知，毋須反覆登入查看。電郵會保密處理，只用於評改通知，不會公開予其他學生；你可隨時在此修改或取消通知及刪除通知電郵設定。</p>
      <form><label>通知電郵地址<input type="email" name="email" autocomplete="email" maxlength="254" placeholder="name@example.com" disabled></label>
      <label class="writing-email-consent"><input type="checkbox" name="enabled" disabled> 我願意接收文章評改完成通知</label>
      <div class="writing-email-actions"><button type="submit" class="primary-button" disabled>儲存通知設定</button><button type="button" data-email-remove class="small-button" disabled>取消通知及刪除電郵設定</button></div>
      <p role="status" aria-live="polite">正在載入通知設定……</p></form></details>`;
    const form = host.querySelector('form'), email = form.elements.email, enabled = form.elements.enabled;
    const status = host.querySelector('[role="status"]'), remove = host.querySelector('[data-email-remove]');
    const busy = value => form.querySelectorAll('input,button').forEach(node => { node.disabled = value; });
    const render = preference => { email.value = preference?.email || ''; enabled.checked = preference?.enabled === true; email.required = enabled.checked; remove.hidden = !preference?.enabled; };
    enabled.addEventListener('change', () => { email.required = enabled.checked; });
    async function save(removing = false) {
      if (!current()) return;
      if (!removing && !form.reportValidity()) return;
      busy(true); status.textContent = '正在儲存……';
      try {
        const payload = await request('/v1/email-notifications', { method: 'PUT', body: JSON.stringify({ email: removing ? '' : email.value.trim(), enabled: removing ? false : enabled.checked }) });
        if (!current()) return;
        render(payload.preferences);
        status.textContent = payload.preferences.enabled ? '通知設定已儲存。老師完成評改後，便會收到通知。' : '已取消通知，並刪除通知電郵設定。';
      } catch { if (current()) status.textContent = '暫時未能儲存，請稍後再試。'; }
      finally { if (current()) busy(false); }
    }
    form.addEventListener('submit', event => { event.preventDefault(); void save(); });
    remove.addEventListener('click', () => { void save(true); });
    try {
      const payload = await request('/v1/email-notifications');
      if (!current()) return;
      render(payload.preferences); busy(false);
      host.querySelector('details').open = !payload.preferences.enabled;
      status.textContent = payload.preferences.enabled ? '已登記評改完成通知。' : '未登記；不影響交文或查看老師評語。';
    } catch {
      if (!current()) return;
      status.textContent = '暫時未能載入通知設定。';
      const retry = host.ownerDocument.createElement('button');retry.type = 'button';retry.className = 'small-button';retry.textContent = '重新載入';retry.addEventListener('click',load);status.append(' ',retry);
    }
  }
  return { load, reset: clear };
}
