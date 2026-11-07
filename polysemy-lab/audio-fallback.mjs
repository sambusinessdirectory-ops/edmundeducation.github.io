const normalized = value => String(value || '').trim().toLowerCase();

export function localeForVoice(voiceHint) {
  return normalized(voiceHint).startsWith('british') ? 'en-GB' : 'en-US';
}

export function preferredDeviceVoice(voices, locale) {
  const target = normalized(locale);
  const language = target.split('-')[0];
  return (voices || []).find(voice => normalized(voice.lang) === target)
    || (voices || []).find(voice => normalized(voice.lang).startsWith(target))
    || (voices || []).find(voice => normalized(voice.lang).split('-')[0] === language)
    || null;
}

export function speakWithDevice({
  text,
  voiceHint,
  synthesis = globalThis.speechSynthesis,
  Utterance = globalThis.SpeechSynthesisUtterance,
  onend = () => {},
  onerror = () => {},
} = {}) {
  if (!synthesis || !Utterance || !String(text || '').trim()) return null;
  synthesis.cancel();
  const utterance = new Utterance(String(text).trim());
  utterance.lang = localeForVoice(voiceHint);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  const voice = preferredDeviceVoice(synthesis.getVoices?.(), utterance.lang);
  if (voice) utterance.voice = voice;
  let active = true;
  utterance.onend = () => {
    if (!active) return;
    active = false;
    onend();
  };
  utterance.onerror = event => {
    if (!active) return;
    active = false;
    onerror(event);
  };
  synthesis.speak(utterance);
  return {
    pause() {
      if (!active) return;
      active = false;
      synthesis.cancel();
    },
  };
}
