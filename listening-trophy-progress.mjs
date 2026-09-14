// Checked answers only, scoped to the signed-in student. The server merges
// monotonic per-question progress; pending local work can retry after reconnect.
export function createListeningTrophyProgress({rpc, getOwner, getToken, onChange}) {
  let records = {}, owner = '';
  const key = id => `edmund-ielts-checked-v1:${id}`;
  const clean = values => [...new Set((Array.isArray(values) ? values : []).filter(n=>Number.isInteger(n)&&n>=1&&n<=40))];
  function reset() { records = {}; owner = ''; }
  function save() { try { if(owner) localStorage.setItem(key(owner),JSON.stringify(records)); } catch {} }
  function answersFor(id) { return Object.fromEntries(clean(records[id]).map(n=>[String(n),{correct:true}])); }
  async function sync(practice, ids = []) {
    const requestOwner = getOwner(), token = getToken();
    if (!requestOwner || !token) return;
    const rows = await rpc('ielts_trophy_progress', {p_token:token,p_practice:practice || null,p_correct_ids:clean(ids)});
    if (getOwner() !== requestOwner || getToken() !== token) return;
    for (const row of rows || []) {
      const id = `ielts-listening-practice-${row.practice}`;
      records[id] = clean([...(records[id] || []),...row.correct_ids]);
    }
    save(); onChange();
  }
  async function restore() {
    reset(); owner = getOwner(); if(!owner) return;
    try { const saved=JSON.parse(localStorage.getItem(key(owner)) || '{}'); for(const [id,ids] of Object.entries(saved)) if(/^ielts-listening-practice-\d+$/.test(id)) records[id]=clean(ids); } catch {}
    onChange();
    const requestOwner=owner;
    await sync();
    for (const [id,ids] of Object.entries(records)) {
      if(getOwner()!==requestOwner) return;
      if(ids.length) await sync(Number(id.split('-').at(-1)),ids);
    }
  }
  async function record(practice, ids) {
    if(!getOwner() || getOwner()!==owner) return;
    const id=`ielts-listening-practice-${practice}`;
    records[id]=clean([...(records[id] || []),...ids]);save();onChange();
    await sync(practice,records[id]);
  }
  return {restore,record,reset,answersFor};
}
