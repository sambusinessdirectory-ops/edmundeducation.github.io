(function () {
  "use strict";
  const pendingPrefix = "eddie-farm-pending-v1:";
  let inFlight = false;

  function student() {
    const shared = window.EdmundSystemNav?.getStudentSession?.();
    if (shared?.role === "student" && !shared.impersonatedByAdmin) return shared;
    try {
      const value = JSON.parse(sessionStorage.getItem("edmund-universal-student-session-v1") || "null");
      return value?.role === "student" && value.token && !value.impersonatedByAdmin ? value : null;
    } catch { return null; }
  }

  async function rpc(name, args) {
    const config = window.EDMUND_SUPABASE;
    if (!config?.url || !config.anonKey) throw new Error("The farm connection is unavailable.");
    let response;
    try {
      response = await fetch(`${config.url}/rest/v1/rpc/${name}`, {
        method: "POST", cache: "no-store", credentials: "omit",
        headers: { apikey: config.anonKey, "Content-Type": "application/json" },
        body: JSON.stringify(args), signal: AbortSignal.timeout(15000)
      });
    } catch {
      throw new Error("Connection interrupted. Please retry; your action will not be charged twice.");
    }
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data?.message || "The farm request failed. Please try again.");
      error.confirmedFailure = response.status >= 400 && response.status < 500;
      error.status = response.status;
      throw error;
    }
    return data;
  }

  async function snapshot() {
    const account = student();
    if (!account?.token) return null;
    const result = await rpc("eddie_farm_snapshot", { p_token: account.token });
    if (student()?.token !== account.token) throw new Error("Account changed. Refresh the farm.");
    return result;
  }

  async function perform(kind, args) {
    if (!["purchase", "plant", "harvest"].includes(kind)) throw new Error("Unsupported farm action.");
    if (inFlight) throw new Error("Please wait for the current farm action.");
    const account = student();
    if (!account?.token || !account.id) throw new Error("Log in to your student account first.");
    const key = pendingPrefix + account.id;
    let pending;
    try { pending = JSON.parse(sessionStorage.getItem(key) || "null"); } catch { /* No pending action. */ }
    inFlight = true;
    try {
      // Recover uncertain responses before issuing another debit. The receipt
      // survives a reload and is owned by the student, not by a browser tab.
      if (pending) {
        const recovered = await rpc(`eddie_farm_${pending.kind}`, { ...pending.args, p_request: pending.id, p_token: account.token });
        sessionStorage.removeItem(key);
        if (student()?.token !== account.token) throw new Error("Account changed. Refresh the farm.");
        if (pending.kind === kind && JSON.stringify(pending.args) === JSON.stringify(args)) return recovered;
      }
      pending = { kind, args, id: crypto.randomUUID() };
      // Fail closed if storage is unavailable: never start an unrecoverable debit.
      sessionStorage.setItem(key, JSON.stringify(pending));
      const result = await rpc(`eddie_farm_${kind}`, { ...args, p_request: pending.id, p_token: account.token });
      sessionStorage.removeItem(key);
      if (student()?.token !== account.token) throw new Error("Account changed. Refresh the farm.");
      return result;
    } catch (error) {
      if (error.confirmedFailure) sessionStorage.removeItem(key);
      throw error;
    } finally { inFlight = false; }
  }

  window.EddieFarmAPI = Object.freeze({ student, snapshot, perform });
})();
