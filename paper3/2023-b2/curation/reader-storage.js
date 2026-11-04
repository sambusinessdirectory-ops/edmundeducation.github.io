// Keep an already-open reader on the same JavaScript release as the public
// site. A Pages deployment does not replace code already loaded in a tab.
(function startReaderReleaseHandshake23(){
  if(!/^https?:$/.test(location.protocol))return;
  let checking=false;
  async function check(){
    if(checking||document.visibilityState==='hidden')return;
    checking=true;
    try{
      const response=await fetch('/release.json?reader=2023-b2&ts='+Date.now(),{cache:'no-store'});
      const live=String((await response.json()).release||'');
      if(!/^[a-f0-9]{40}$/i.test(live))return;
      const url=new URL(location.href),loaded=url.searchParams.get('release')||'';
      if(loaded===live){try{sessionStorage.removeItem('cur23-release-reload')}catch{}return}
      const guard=loaded+'>'+live;
      try{if(sessionStorage.getItem('cur23-release-reload')===guard)return;sessionStorage.setItem('cur23-release-reload',guard)}catch{}
      url.searchParams.set('release',live);location.replace(url.href);
    }catch{}finally{checking=false}
  }
  addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check()});
  setInterval(check,60000);check();
})();

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
