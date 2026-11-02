(() => {
  'use strict';

  const SESSION_KEY = 'edmund-essay-memory-student-v1';
  const CONTENT_VERSION = '20261102-all288-review2';
  const gate = document.querySelector('[data-memory-login]');
  const form = gate?.querySelector('[data-memory-login-form]');
  const status = gate?.querySelector('[data-memory-login-status]');
  const submit = gate?.querySelector('[data-memory-login-submit]');
  const appScript = document.body.dataset.memoryAppScript;
  let client;
  let active = false;

  function setStatus(message, error = false) {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-error', error);
  }

  function readLocalSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); }
    catch { return null; }
  }

  function rememberLocalSession(user) {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(user)); } catch { /* The shared session remains available. */ }
  }

  function getClient() {
    const config = window.EDMUND_SUPABASE;
    if (!window.supabase?.createClient || !config?.url || !config?.anonKey) {
      throw new Error('登入服務暫時未能載入，請重新整理頁面。');
    }
    if (!client) {
      let storage;
      try { storage = sessionStorage; } catch { storage = undefined; }
      client = window.supabase.createClient(config.url, config.anonKey, {
        auth: { persistSession: Boolean(storage), ...(storage ? {storage} : {}), autoRefreshToken: true, detectSessionInUrl: false }
      });
    }
    return client;
  }

  async function rpc(name, args) {
    const api = getClient();
    const current = await api.auth.getSession();
    if (current.error) throw current.error;
    if (!current.data?.session?.user?.id) {
      const created = await api.auth.signInAnonymously();
      if (created.error || !created.data?.session?.user?.id) throw created.error || new Error('未能建立安全登入連線。');
    }
    const result = await api.rpc(name, args);
    if (result.error) throw result.error;
    return result.data;
  }

  async function validateStudent(token) {
    if (!/^[0-9a-f-]{36}$/i.test(String(token || ''))) return null;
    const rows = await rpc('flashcard_student_session_profile', {p_token: token});
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row?.id || !row?.name || !row?.session_token || row.role !== 'student') return null;
    return {id: String(row.id), name: String(row.name), token: String(row.session_token), role: 'student'};
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error('未能載入範文背書系統。請重新整理頁面。'));
      document.head.append(script);
    });
  }

  async function enter(user) {
    if (active) return;
    active = true;
    window.EssayMemoryAuth = Object.freeze({user, rpc});
    rememberLocalSession(user);
    window.EdmundSystemNav?.rememberStudentSession?.(user);
    try {
      const requestedKey = new URLSearchParams(location.search).get('essay');
      if (requestedKey && window.ESSAY_MEMORY_APPROVED?.[requestedKey] && requestedKey !== 'opinion:80' && !window.ESSAY_MEMORY_LESSONS?.[requestedKey]) {
        const meta = window.ESSAY_MEMORY_CATALOG?.find(item => item.key === requestedKey);
        if (!meta) throw new Error('找不到這篇範文。');
        await loadScript(`essay-memory-lessons/${meta.id}.js?v=${CONTENT_VERSION}`);
        await loadScript(`essay-memory-support/${meta.id}.js?v=${CONTENT_VERSION}`);
        if (!window.ESSAY_MEMORY_LESSONS?.[requestedKey]?.support) throw new Error('這篇範文的教材未能載入。');
      }
      if (appScript) await loadScript(appScript);
      document.body.classList.add('memory-authorized');
      gate.hidden = true;
      const student = document.querySelector('[data-memory-student-name]');
      if (student) student.textContent = `${user.name} · 學生`;
      document.querySelector('[data-memory-app]')?.removeAttribute('aria-hidden');
    } catch (error) {
      active = false;
      setStatus(error.message || '未能載入範文背書系統。', true);
    }
  }

  async function restore() {
    setStatus('正在檢查學生登入…');
    const shared = window.EdmundSystemNav?.getStudentSession?.();
    const saved = readLocalSession();
    const candidates = [shared, saved].filter(candidate => candidate?.role === 'student' && candidate.impersonatedByAdmin !== true && candidate.token);
    if (!candidates.length) {
      setStatus('請使用您的學生帳戶登入。');
      return;
    }
    try {
      for (const candidate of candidates) {
        const user = await validateStudent(candidate.token);
        if (user) { await enter(user); return; }
      }
      try { sessionStorage.removeItem(SESSION_KEY); } catch {}
      setStatus('登入已過期，請重新登入。');
    } catch {
      setStatus('暫時無法核對學生帳戶。請檢查網絡後重新整理或登入。', true);
    }
  }

  form?.addEventListener('submit', async event => {
    event.preventDefault();
    const data = new FormData(form);
    const username = String(data.get('username') || '').trim();
    const password = String(data.get('password') || '');
    if (!username || !password) { setStatus('請輸入用戶名稱及密碼。', true); return; }
    submit.disabled = true;
    setStatus('正在核對學生帳戶…');
    try {
      const rows = await rpc('flashcard_student_login', {p_name: username, p_password: password});
      const row = Array.isArray(rows) ? rows[0] : null;
      const user = row?.session_token ? await validateStudent(String(row.session_token)) : null;
      if (!user) { setStatus('用戶名稱或密碼不正確，或此帳戶並非學生帳戶。', true); return; }
      form.reset();
      await enter(user);
    } catch {
      setStatus('登入服務暫時無法連接。請稍後重試。', true);
    } finally { submit.disabled = false; }
  });

  gate?.querySelector('[data-memory-password-toggle]')?.addEventListener('click', event => {
    const input = form.querySelector('input[name="password"]');
    const reveal = input.type === 'password';
    input.type = reveal ? 'text' : 'password';
    event.currentTarget.textContent = reveal ? '隱藏' : '顯示';
    event.currentTarget.setAttribute('aria-pressed', String(reveal));
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('[data-memory-logout]')) return;
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    window.EdmundSystemNav?.forgetStudentSession?.();
    location.reload();
  });

  restore();
})();
