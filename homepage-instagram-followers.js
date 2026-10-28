(() => {
  const badge=document.querySelector('[data-instagram-followers]');
  if(!badge)return;
  fetch('https://edmund-instagram-followers.edmundeducation.workers.dev/followers',{credentials:'omit',signal:AbortSignal.timeout(6000)})
    .then(response=>{if(!response.ok)throw Error('Unavailable');return response.json();})
    .then(data=>{
      if(data.username!=='edmundeducationedu'||!Number.isSafeInteger(data.count)||data.count<0||!Number.isFinite(Date.parse(data.updatedAt)))return;
      badge.querySelector('strong').textContent=(data.approximate?'約 ':'')+new Intl.NumberFormat('en-HK').format(data.count);
      badge.querySelector('time').dateTime=data.updatedAt;
      badge.querySelector('time').textContent='更新 '+new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'2-digit',timeZone:'Asia/Hong_Kong'}).format(new Date(data.updatedAt));
      badge.title=`Instagram 粉絲 · 最後成功更新：${new Date(data.updatedAt).toLocaleString('zh-HK',{timeZone:'Asia/Hong_Kong'})}${data.stale?'（等待更新）':''}`;
      badge.closest('a').setAttribute('aria-label',`Instagram · ${data.approximate?'約 ':''}${data.count} 位粉絲`);
    }).catch(()=>{/* Keep the dated, verified fallback during an outage. */});
})();
