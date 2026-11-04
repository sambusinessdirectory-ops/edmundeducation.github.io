// The naming step has no running anchor, so its time never becomes a split.
export function mapperElapsed(draft, now = Date.now()) {
  return draft.current ? Math.floor(draft.current.elapsed_ms + (draft.current.anchor == null ? 0 : Math.max(0, now - draft.current.anchor))) : 0;
}
export function mapperStop(draft, now = Date.now()) {
  if (!draft.current) return draft;
  const next = structuredClone(draft);
  const part = {...next.current, anchor:null, elapsed_ms:mapperElapsed(draft,now), ended_at:new Date(now).toISOString()};
  if (Number.isInteger(next.currentIndex)) next.parts[next.currentIndex] = part;
  else if (Number.isInteger(next.insertIndex)) next.parts.splice(next.insertIndex,0,part);
  else next.parts.push(part);
  delete next.currentIndex; delete next.insertIndex;
  next.current = null;
  return next;
}
export function mapperSections(parts) {
  const groups = [];
  for (const part of parts) {
    let group = groups.at(-1);
    if (group?.id !== part.section_id) groups.push(group = {id:part.section_id,title:part.section_title,parts:[]});
    group.parts.push(part);
  }
  return groups.map(group => {
    const expected = part => Math.max(1000,Math.ceil(part.elapsed_ms/1000)*1000);
    if (group.parts.length === 1 && !group.parts[0].title) return {id:group.id,title:group.title,items:[],expected_ms:expected(group.parts[0])};
    return {id:group.id,title:group.title,items:group.parts.map(part => ({id:part.id,title:part.title || part.section_title,expected_ms:expected(part)}))};
  });
}

export function mapperContinue(draft,index,now=Date.now()) {
  if (draft.current || draft.finished || !draft.parts[index]) throw new Error('Cannot continue this part');
  const next=structuredClone(draft);
  next.currentIndex=index;
  next.current={...next.parts[index],anchor:now};
  return next;
}
