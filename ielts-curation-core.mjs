export function checkpointStartIndex(part,index){while(index>0&&part.cues[index-1].end===part.cues[index].end)index--;return index;}
export function checkpointEndIndex(part,index){while(index+1<part.cues.length&&part.cues[index+1].end===part.cues[index].end)index++;return index;}
// Pure progress rules shared by the player, import validation and regression tests.
export function initialProgress() { return { completed: 0, index: 0, phase: 'intro', time: 0 }; }
export function rewindTo(part, progress, requestedTime) {
  const ceiling = part.cues[Math.min(progress.completed, part.cues.length - 1)].end;
  const requested = Math.max(0, Number(requestedTime) || 0);
  const time = requested >= ceiling ? part.cues[Math.min(progress.completed, part.cues.length - 1)].start : requested;
  // Seeking never awards a checkpoint. At an endpoint, that cue must be heard again.
  const index = Math.max(0, part.cues.findIndex(cue => cue.end >= time));
  return { completed: Math.min(progress.completed, index), index, phase: 'intro', time };
}
export function replayCue(part, index) {
  index = checkpointStartIndex(part,Math.max(0, Math.min(part.cues.length - 1, index)));
  return { completed: index, index, phase: 'intro', time: Math.max(0, part.cues[index].start - 1.2) };
}
export function nextProgress(part, progress) {
  if (progress.phase !== 'paused') return progress;
  if (progress.completed === part.cues.length) return { ...progress, phase: 'done' };
  return { ...progress, index: progress.completed, phase: 'listening' };
}
export function checkpointDue(part, progress, time, playing) {
  return playing && progress.phase === 'listening' && time >= part.cues[progress.index].end;
}
export function sanitizeSession(raw, ledger) {
  if (!raw || raw.version !== ledger.version || (ledger.id ? raw.id !== ledger.id : raw.practice !== ledger.practice)) throw new Error(`此存檔不屬於這個版本的 ${ledger.id ? ledger.presentation.title : 'Practice '+ledger.practice}。`);
  const result = { version: ledger.version, ...(ledger.id?{id:ledger.id}:{practice:ledger.practice}), part: [1,2,3,4].includes(raw.part) ? raw.part : 1, revealMode: raw.revealMode === 'manual' ? 'manual' : 'auto', parts: {} };
  for (const part of ledger.parts) {
    const saved = raw.parts?.[part.part] || {}, ids = Array.isArray(saved.completedIds) ? saved.completedIds : [];
    let completed = 0;
    while (completed < part.cues.length && ids.includes(part.cues[completed].id)) completed++;
    if(completed>0&&completed<part.cues.length&&part.cues[completed-1].end===part.cues[completed].end)completed=checkpointStartIndex(part,completed);
    const drafts = {};
    for (const cue of part.cues) if (typeof saved.drafts?.[cue.question] === 'string') drafts[cue.question] = saved.drafts[cue.question].slice(0, 5000);
    const completedIds = part.cues.slice(0, completed).map(c => c.id);
    const revealedIds = completedIds.filter(id => Array.isArray(saved.revealedIds) && saved.revealedIds.includes(id));
    result.parts[part.part] = { completedIds, revealedIds, drafts };
  }
  return result;
}
export function progressFromSaved(part, saved) {
  const completed = saved?.completedIds?.length || 0;
  return completed ? { completed, index: checkpointStartIndex(part,completed - 1), phase: 'paused', time: part.cues[completed - 1].end } : initialProgress();
}
export function annotationSegments(text, marks) {
  // Exact span offsets: unmatched source edits fail safely, never mark a neighbour.
  const valid = marks.map(mark => ({ ...mark, start: text.indexOf(mark.quote) })).filter(mark => mark.start >= 0);
  const bounds = [...new Set([0, text.length, ...valid.flatMap(mark => [mark.start, mark.start + mark.quote.length])])].sort((a,b) => a-b);
  return bounds.slice(0,-1).map((start,i) => ({ text: text.slice(start,bounds[i+1]), marks: valid.filter(mark => start >= mark.start && bounds[i+1] <= mark.start+mark.quote.length) }));
}
