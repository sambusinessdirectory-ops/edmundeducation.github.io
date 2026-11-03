// If Firefox refuses a read or write, keep this lesson usable in the current tab.
// Only changed keys are held in memory. Existing device data stays untouched.
function createReaderStore(name) {
  const changes = new Map();
  let device;
  if (!new URLSearchParams(location.search).has('readerRecovery')) {
    try { device = window[name]; } catch {}
  }
  let writable = !!device;
  return {
    get persistent() { return writable; },
    getItem(key) {
      if (changes.has(key)) return changes.get(key);
      try { return device?.getItem(key) ?? null; } catch { writable = false; return null; }
    },
    setItem(key, value) {
      const text = String(value);
      if (writable) {
        try { device.setItem(key, text); return; } catch { writable = false; }
      }
      changes.set(key, text);
    },
    removeItem(key) {
      if (writable) {
        try { device.removeItem(key); return; } catch { writable = false; }
      }
      changes.set(key, null);
    },
    keys() {
      const keys = new Set();
      try { for (let i=0; device && i<device.length; i++) keys.add(device.key(i)); } catch { writable=false; }
      for (const [key,value] of changes) { if (value===null) keys.delete(key); else keys.add(key); }
      return [...keys];
    }
  };
}
const readerStore23 = createReaderStore('localStorage');
const readerSession23 = createReaderStore('sessionStorage');
