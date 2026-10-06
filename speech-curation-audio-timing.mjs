export function validateSpeechTiming(map, lines, audioFile, duration = null) {
  if (map?.version !== 'churchill-1949-v2' || map.audio !== audioFile || !Array.isArray(map.lines) || map.lines.length !== lines.length) return false;
  if (!Number.isFinite(map.duration) || map.duration <= 0 || (Number.isFinite(duration) && Math.abs(duration - map.duration) > 0.3)) return false;
  let previous = 0;
  return map.lines.every((cue, index) => {
    if (cue.line !== index + 1 || !Number.isFinite(cue.start) || !Number.isFinite(cue.end) || cue.start < previous || cue.end <= cue.start || cue.end > map.duration + 0.1) return false;
    if (!Array.isArray(cue.words) || !cue.words.length || cue.words.reduce((sum, word) => sum + word.length, 0) !== lines[index].english.trim().length) return false;
    let wordStart = cue.start;
    for (const word of cue.words) {
      if (!Number.isInteger(word.length) || word.length < 1 || !Number.isFinite(word.start) || !Number.isFinite(word.end) || word.start < wordStart - 0.04 || word.end < word.start || word.end > cue.end + 0.2) return false;
      wordStart = word.start;
    }
    previous = cue.start;
    return true;
  });
}

export async function lessonTextHash(lines) {
  const text = lines.map(line => line.english.trim()).join('\n');
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

export function cueIndexAtTime(cues, time) {
  if (!Number.isFinite(time) || !cues.length || time < cues[0].start || time >= cues[cues.length - 1].end) return -1;
  let low = 0, high = cues.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (cues[middle].start <= time) low = middle + 1;
    else high = middle;
  }
  return low - 1;
}

export function wordIndexAtTime(words, time) {
  if (!Number.isFinite(time) || !words.length || time < words[0].start) return -1;
  let low = 0, high = words.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (words[middle].start <= time) low = middle + 1;
    else high = middle;
  }
  return low - 1;
}

export function sentenceClipEnd(cue) {
  return Math.max(cue.start + 0.2, Math.min(cue.end - 0.02, cue.spoken_end + 0.28));
}
