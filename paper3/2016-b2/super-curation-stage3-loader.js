(() => {
  'use strict';
  const runtimeUrl = '/paper3/2016-b2/stage3-runtime.js.gz?v=20261128-stage3-v5';
  const fail = error => {
    console.error('2016 Stage 3 runtime could not be loaded.', error);
    const stage = document.querySelector('.curation-stage-item[data-stage="podcast"]');
    if (stage) {
      stage.disabled = true;
      stage.title = '聽聽錄音模組未能載入，請重新整理頁面。';
      stage.querySelector('.curation-stage-count').textContent = '載入失敗';
    }
  };
  (async () => {
    if (typeof DecompressionStream !== 'function') throw new Error('This browser does not support gzip runtime decompression.');
    const response = await fetch(runtimeUrl, {cache: 'force-cache'});
    if (!response.ok || !response.body) throw new Error(`Runtime request failed (${response.status}).`);
    const code = await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).text();
    await new Promise((resolve, reject) => {
      const source = URL.createObjectURL(new Blob([code], {type: 'text/javascript'}));
      const script = document.createElement('script');
      script.src = source;
      script.onload = () => { URL.revokeObjectURL(source); script.remove(); resolve(); };
      script.onerror = () => { URL.revokeObjectURL(source); script.remove(); reject(new Error('Runtime execution failed.')); };
      document.head.append(script);
    });
    if (!window.EDMUND_2016_B2_CURATION_STAGE3_DEBUG) throw new Error('Runtime handshake failed.');
  })().catch(fail);
})();
