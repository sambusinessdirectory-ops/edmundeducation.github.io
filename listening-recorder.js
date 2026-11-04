// Listening uses the Speaking system's MediaRecorder -> mono 64 kbps MP3 flow.
// Its private storage, ownership and 100 MB total quota are Listening-only.
export function createListeningRecorder({ api, getStudent, pauseAudio, playModel, escapeHtml: esc, toast }) {
  const dialog = document.querySelector('[data-recorder-dialog]');
  const $ = name => dialog.querySelector(`[data-${name}]`);
  let mode = 'idle', context = null, owner = '', generation = 0, recorder = null, stream = null;
  let chunks = [], blob = null, rawBlob = null, blobUrl = '', savedUrl = '', id = '', timer = 0, elapsed = 0, started = 0, saved = false;
  let quota = null, listGeneration = 0;
  const busy = () => ['requesting','recording','resuming','paused','processing','saving'].includes(mode);
  const dirty = () => busy() || Boolean((blob || rawBlob) && !saved);
  const status = message => { $('recording-status').textContent = message; };
  const activeMs = () => elapsed + (mode === 'recording' ? performance.now() - started : 0);
  const clock = () => {
    const seconds = Math.floor(Math.min(activeMs(), 300000) / 1000);
    $('recording-clock').textContent = `${String(Math.floor(seconds / 60)).padStart(2,'0')}:${String(seconds % 60).padStart(2,'0')} / 05:00`;
    if (mode === 'recording' && activeMs() >= 300000) finish();
  };
  function sync() {
    $('record-start').disabled = busy() || Boolean((blob || rawBlob) && !saved) || !quota || quota.usedBytes >= quota.maxBytes;
    $('record-pause').disabled = !['recording','paused'].includes(mode) || typeof recorder?.pause !== 'function';
    $('record-pause').textContent = mode === 'paused' ? '繼續錄音' : '暫停';
    $('record-finish').disabled = !['recording','paused'].includes(mode);
    $('record-save').disabled = !blob || saved || busy();
    $('record-download').disabled = !(blob || rawBlob) || mode === 'processing';
    $('record-discard').disabled = mode === 'saving' || mode === 'processing' || !dirty();
    $('recording-model').disabled = !context?.start && context?.start !== 0;
    $('recording-model').hidden = !Number.isFinite(context?.start);
    $('recorder-close').disabled = mode === 'saving';
  }
  function stopTracks() { stream?.getTracks().forEach(track => track.stop()); stream = null; }
  function reset() {
    generation++; clearInterval(timer); timer = 0;
    if (recorder) {
      recorder.ondataavailable = recorder.onstop = recorder.onerror = recorder.onpause = recorder.onresume = null;
      if (recorder.state !== 'inactive') { try { recorder.stop(); } catch { /* already stopped */ } }
    }
    stopTracks(); recorder = null; chunks = []; elapsed = 0; started = 0;
    $('recording-preview').pause(); $('recording-preview').removeAttribute('src'); $('recording-preview').hidden = true;
    if (blobUrl) URL.revokeObjectURL(blobUrl); blobUrl = '';
    blob = rawBlob = null; id = ''; saved = false; mode = 'idle'; clock(); sync();
  }
  function close(force = false) {
    if (!force && mode === 'saving') { status('正在儲存，請稍候。'); return false; }
    if (!force && dirty() && !confirm('這次錄音尚未儲存。確定放棄並離開？')) return false;
    reset(); listGeneration++; context = null; owner = ''; quota = null;
    if (savedUrl) URL.revokeObjectURL(savedUrl); savedUrl = '';
    dialog.querySelectorAll('audio').forEach(a => a.pause()); dialog.close(); return true;
  }
  async function refresh() {
    const requestId = ++listGeneration, student = getStudent()?.id;
    try {
      const result = await api('/recordings');
      if (requestId !== listGeneration || student !== getStudent()?.id || !dialog.open) return false;
      quota = result.quota;
      $('recording-quota').textContent = `已用 ${(quota.usedBytes / 1048576).toFixed(1)} / 100 MB · ${result.rows.length} 次錄音`;
      $('recording-list').innerHTML = result.rows.length ? result.rows.map(row => `<article class="saved-recording"><div><strong>${esc(row.title)}</strong><small>${esc(new Date(row.created_at).toLocaleString())} · ${(row.size_bytes / 1048576).toFixed(2)} MB · ${Math.round(row.duration_ms / 1000)} 秒</small>${row.storage_state !== 'ready' ? `<p>尚未完成${row.storage_state === 'deleting' ? '刪除，請重試。' : '上載。保留原頁重試儲存；10 分鐘後可刪除未完成項目。'}</p>` : ''}</div><div class="recorder-controls"><button class="secondary-button" data-rec-play="${esc(row.id)}" ${row.storage_state !== 'ready' ? 'disabled' : ''}>播放</button><button class="secondary-button" data-rec-download="${esc(row.id)}" ${row.storage_state !== 'ready' ? 'disabled' : ''}>下載</button><button class="secondary-button" data-rec-delete="${esc(row.id)}">刪除</button></div></article>`).join('') + '<audio data-saved-preview controls hidden></audio>' : '<p>還沒有聆聽錄音。讀一句，試著錄下第一遍。</p>';
      sync(); return true;
    } catch (error) {
      if (requestId !== listGeneration) return false;
      status(error.message); $('recording-quota').textContent = '未能檢查儲存空間，請按「重新載入」。'; sync(); return false;
    }
  }
  async function open(value) {
    if (!getStudent()) return toast('請先登入學生帳戶。');
    if (dialog.open && !close()) return;
    reset(); context = { ...value }; owner = getStudent().id; quota = null;
    $('recording-context').textContent = context.title;
    $('recording-transcript').textContent = context.transcript || '聽完後，用自己的聲音朗讀練習。';
    $('recording-quota').textContent = '正在檢查儲存空間…'; $('recording-list').replaceChildren();
    status('允許咪高峰後即可開始。可暫停重聽示範，再繼續錄音。'); sync();
    dialog.showModal(); await refresh();
  }
  async function start() {
    if (busy() || ((blob || rawBlob) && !saved)) return;
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder || !isSecureContext) return status('請使用 HTTPS 網頁及支援咪高峰的 Safari、Chrome、Firefox 或 Edge。');
    const requestedContext = context, student = owner;
    if (!await refresh() || context !== requestedContext || !getStudent() || getStudent().id !== student) return;
    if (quota.usedBytes >= quota.maxBytes) return status('100 MB 已滿，請先下載及刪除不需要的錄音。');
    pauseAudio(); reset(); const g = generation;
    mode = 'requesting'; sync(); status('正在請求咪高峰權限…');
    let media;
    try {
      const constraints = { audio: { channelCount: { ideal: 1 }, echoCancellation: { ideal: true }, noiseSuppression: { ideal: true }, autoGainControl: { ideal: true } } };
      try { media = await navigator.mediaDevices.getUserMedia(constraints); }
      catch (error) { if (error.name !== 'OverconstrainedError') throw error; media = await navigator.mediaDevices.getUserMedia({ audio: true }); }
      if (g !== generation || getStudent()?.id !== student || !dialog.open) { media.getTracks().forEach(t => t.stop()); return; }
      stream = media;
      for (const type of ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus', '']) {
        if (type && !MediaRecorder.isTypeSupported(type)) continue;
        try { recorder = new MediaRecorder(media, type ? { mimeType: type } : undefined); break; } catch { /* try native fallback */ }
      }
      if (!recorder) throw new Error('Recorder unavailable');
      recorder.ondataavailable = event => { if (g === generation && event.data.size) chunks.push(event.data); };
      recorder.onstop = () => finalise(g, recorder.mimeType);
      recorder.onerror = () => { if (g === generation) { reset(); status('錄音中斷，請檢查咪高峰後重試。'); } };
      recorder.onpause = () => { if (g !== generation || mode !== 'paused') return; stream?.getAudioTracks().forEach(t => { t.enabled = false; }); sync(); };
      recorder.onresume = () => { if (g !== generation || mode !== 'resuming') return; started = performance.now(); mode = 'recording'; sync(); };
      recorder.start(1000); started = performance.now(); mode = 'recording';
      timer = setInterval(clock, 200); sync(); status('正在錄音。需要重聽示範時，請先暫停。');
    } catch (error) {
      if (g !== generation) return;
      reset();
      status(error.name === 'NotAllowedError' ? '咪高峰未獲允許。請在網址旁的網站設定允許咪高峰，再按開始錄音。' : error.name === 'NotFoundError' ? '未找到咪高峰。請連接咪高峰後重試。' : '未能啟動錄音。請檢查咪高峰是否被其他程式使用。');
    }
  }
  function pause() {
    if (mode !== 'recording') return;
    if (typeof recorder.pause !== 'function') return finish();
    elapsed += performance.now() - started; started = 0;
    recorder.pause(); mode = 'paused'; status('錄音已暫停，可重聽示範或繼續錄音。'); sync();
  }
  function resume() {
    if (mode !== 'paused') return;
    pauseAudio(); stream?.getAudioTracks().forEach(t => { t.enabled = true; });
    recorder.resume(); mode = 'resuming'; status('正在繼續錄音…'); sync();
  }
  function finish() {
    if (!['recording','paused'].includes(mode)) return;
    if (mode === 'recording') elapsed += performance.now() - started;
    mode = 'processing'; clearInterval(timer); timer = 0; recorder.stop(); stopTracks();
    sync(); status('正在製作真正的單聲道 MP3，請保留此頁…');
  }
  async function finalise(g, mime) {
    if (g !== generation) return;
    rawBlob = new Blob(chunks, { type: mime || 'audio/webm' }); chunks = []; recorder = null;
    try {
      const encoded = await encodeMonoMp3(rawBlob);
      if (g !== generation) return;
      blob = encoded;
      rawBlob = null; id = crypto.randomUUID(); blobUrl = URL.createObjectURL(blob);
      $('recording-preview').src = blobUrl; $('recording-preview').hidden = false;
      mode = 'preview'; status('錄音已完成。先聽一遍，再儲存或下載。');
    } catch {
      if (g !== generation) return;
      mode = 'preview'; status('未能轉換 MP3。原錄音仍在此頁，可按下載保留原檔，再重新錄製。');
    }
    sync();
  }
  async function save() {
    if (!blob || saved || busy() || getStudent()?.id !== owner) return;
    mode = 'saving'; sync(); status('正在儲存，請稍候…');
    const form = new FormData();
    for (const [key,value] of Object.entries({ id, practice: context.practice, part: context.part, rowIndex: context.rowIndex ?? '', title: context.title, transcript: context.transcript || '' })) form.append(key,String(value));
    form.append('file',blob,`listening-${id}.mp3`);
    try {
      await api('/recordings', { method: 'POST', body: form });
      saved = true; mode = 'saved'; status('✓ 已儲存至您的聆聽系統，可在其他裝置登入後收聽。'); await refresh();
    } catch (error) { mode = 'preview'; status(`${error.message} 可重試儲存，或先下載備份。`); }
    sync();
  }
  const download = (value, filename) => {
    const url = URL.createObjectURL(value), link = document.createElement('a');
    link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 30000);
  };
  dialog.addEventListener('click', async event => {
    const b = event.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-recorder-close')) close();
    else if (b.hasAttribute('data-record-start')) await start();
    else if (b.hasAttribute('data-record-pause')) mode === 'paused' ? resume() : pause();
    else if (b.hasAttribute('data-record-finish')) finish();
    else if (b.hasAttribute('data-record-save')) await save();
    else if (b.hasAttribute('data-recording-model')) { pause(); await playModel(context); }
    else if (b.hasAttribute('data-record-download') && (blob || rawBlob)) download(blob || rawBlob, blob ? `listening-${id}.mp3` : `listening-original.${rawBlob.type.includes('mp4') ? 'm4a' : rawBlob.type.includes('ogg') ? 'ogg' : 'webm'}`);
    else if (b.hasAttribute('data-record-discard') && confirm('確定放棄這次尚未儲存的錄音？')) { reset(); status('可以重新錄音。'); }
    else if (b.hasAttribute('data-record-refresh')) await refresh();
    else if (b.dataset.recPlay || b.dataset.recDownload || b.dataset.recDelete) {
      const recordId = b.dataset.recPlay || b.dataset.recDownload || b.dataset.recDelete;
      if (b.dataset.recDelete && !confirm('確定刪除這次錄音？需要保留時請先下載。')) return;
      b.disabled = true;
      try {
        if (b.dataset.recDelete) { await api(`/recordings/${recordId}`, { method: 'DELETE' }); await refresh(); }
        else {
          const g = generation, value = await api(`/recordings/${recordId}`, { blob: true });
          if (g !== generation || !dialog.open) return;
          if (b.dataset.recDownload) download(value,`listening-${recordId}.mp3`);
          else {
            pause(); pauseAudio(); if (savedUrl) URL.revokeObjectURL(savedUrl);
            savedUrl = URL.createObjectURL(value); const audio = dialog.querySelector('[data-saved-preview]');
            if (audio) { audio.src = savedUrl; audio.hidden = false; await audio.play(); }
          }
        }
      } catch (error) { status(error.message); } finally { b.disabled = false; }
    }
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  window.addEventListener('beforeunload', event => { if (dirty()) { event.preventDefault(); event.returnValue = ''; } });
  document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'recording') { pause(); status('頁面切到背景，已暫停錄音。返回後可繼續。'); } });
  return { open, close, pause, isRecording: () => mode === 'recording' };
}

export async function encodeMonoMp3(source) {
  if (!window.lamejs?.Mp3Encoder) throw new Error('MP3 encoder unavailable');
  const Context = window.AudioContext || window.webkitAudioContext;
  const context = new Context(); let buffer;
  try { buffer = await new Promise((resolve, reject) => source.arrayBuffer().then(bytes => context.decodeAudioData(bytes, resolve, reject), reject)); }
  finally { await context.close(); }
  if (buffer.duration < 1) throw new Error('Please record at least one second');
  const encoder = new window.lamejs.Mp3Encoder(1,buffer.sampleRate,64);
  const channels = Array.from({ length: buffer.numberOfChannels }, (_,i) => buffer.getChannelData(i));
  const limit = Math.min(buffer.length, buffer.sampleRate * 300), chunks = [];
  for (let offset=0;offset<limit;offset+=1152) {
    const pcm = new Int16Array(Math.min(1152,limit-offset));
    for (let i=0;i<pcm.length;i++) {
      let sample=0; for (const channel of channels) sample += channel[offset+i] / channels.length;
      sample=Math.max(-1,Math.min(1,sample)); pcm[i]=sample<0 ? sample*32768 : sample*32767;
    }
    const bytes=encoder.encodeBuffer(pcm); if (bytes.length) chunks.push(new Uint8Array(bytes));
    if (offset % (1152*200)===0) await new Promise(resolve=>setTimeout(resolve,0));
  }
  const tail=encoder.flush(); if (tail.length) chunks.push(new Uint8Array(tail));
  const mp3=new Blob(chunks,{type:'audio/mpeg'}); if (!mp3.size) throw new Error('Empty MP3'); return mp3;
}
