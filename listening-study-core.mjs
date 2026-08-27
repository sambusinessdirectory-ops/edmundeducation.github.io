export function bookmarkLocation(item, transcripts, timings, dataPractice = 1) {
  // Resolve old and new bookmark keys against authored data, never guess timings.
  const key = String(item.item_key || '');
  const rowMatch = key.match(/^practice(\d+):transcript:p([1-4]):line:(\d+)$/)
    || key.match(/^practice(\d+):p([1-4]):t(\d+):/);
  let practice, part, index;
  if (rowMatch) [, practice, part, index] = rowMatch.map(Number);
  else {
    const question = key.match(/^practice(\d+):analysis:q(\d+)$/);
    const cue = question && timings.questions?.[question[2]];
    if (cue) { practice = Number(question[1]); part = cue.part; index = cue.line; }
  }
  if (practice !== dataPractice || !Number.isInteger(index)) return null;
  const row = transcripts[part]?.[index];
  const range = timings.parts?.[part]?.lines?.[index];
  if (!row || !range || !Number.isFinite(range.start) || !Number.isFinite(range.end) || range.end <= range.start) return null;
  return { practice, part, rowIndex: index, title: `Practice ${practice} · Part ${part} · 第 ${index + 1} 行`, transcript: `${row.en}\n${row.zh}`, start: range.start, end: range.end };
}

export function safeBookmarkHref(href) {
  const value = String(href || '');
  return /^listening-system\.html\?(?:section=ielts&practice=\d+(?:&part=[1-4])?)(?:#[a-zA-Z0-9:_-]*)?$/.test(value) ? value : 'listening-system.html?section=ielts';
}

export function bookmarksCsv(rows) {
  const cell = value => {
    let text = String(value ?? '');
    // CSV files are often opened in Excel: never execute bookmarked text as a formula.
    if (/^[\s\u0000-\u001f]*[=+@-]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  };
  const data = [['Student', 'Bookmark', 'Transcript / context', 'Difficulty (1–5)', 'Link', 'Updated'],
    ...rows.map(r => [r.flashcard_students?.name || '', r.title, r.detail, r.difficulty || '',
      `https://edmundeducation.com/${safeBookmarkHref(r.href)}`, r.updated_at])];
  return '\uFEFF' + data.map(row => row.map(cell).join(',')).join('\r\n');
}

export class RowReplay {
  constructor(audio, schedule = callback => requestAnimationFrame(callback), cancel = id => cancelAnimationFrame(id)) {
    this.audio = audio; this.schedule = schedule; this.cancel = cancel; this.frame = 0; this.range = null;
    this.tick = () => {
      if (!this.range) return;
      if (audio.currentTime >= this.range.end) {
        audio.pause(); audio.currentTime = this.range.end; this.clearFrame(); return;
      }
      this.clearFrame();
      if (!audio.paused) this.frame = this.schedule(this.tick);
    };
    audio.addEventListener('timeupdate', this.tick);
    audio.addEventListener('play', () => {
      if (this.range && audio.currentTime >= this.range.end) audio.currentTime = this.range.start;
      this.tick();
    });
    audio.addEventListener('pause', () => this.clearFrame());
    audio.addEventListener('seeking', () => {
      if (this.range && audio.currentTime < this.range.start) audio.currentTime = this.range.start;
      this.tick();
    });
    audio.addEventListener('loadedmetadata', () => {
      if (this.range) { audio.currentTime = this.range.start; this.tick(); }
    });
  }
  clearFrame() { if (this.frame) this.cancel(this.frame); this.frame = 0; }
  play(url, start, end, speed = 1) {
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return Promise.reject(new Error('This row has no audio timing.'));
    this.stop(); this.range = { start, end };
    if (this.audio.src !== url) this.audio.src = url;
    this.audio.playbackRate = speed;
    this.audio.currentTime = start;
    return this.audio.play();
  }
  stop() { this.range = null; this.clearFrame(); this.audio.pause(); }
}
