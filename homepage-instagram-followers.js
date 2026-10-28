(() => {
  const badge=document.querySelector('[data-instagram-followers]');
  if(!badge)return;
  fetch('https://edmund-instagram-followers.edmundeducation.workers.dev/followers',{credentials:'omit',signal:AbortSignal.timeout(6000)})
    .then(response=>{if(!response.ok)throw Error('Unavailable');return response.json();})
    .then(data=>{
      if(data.username!=='edmundeducationedu'||!Number.isSafeInteger(data.count)||data.count<0||!Number.isFinite(Date.parse(data.updatedAt)))return;
      badge.querySelector('strong').textContent=(data.approximate?'約 ':'')+new Intl.NumberFormat('en-HK').format(data.count);
      badge.closest('a').setAttribute('aria-label',`Instagram · ${data.approximate?'約 ':''}${data.count} 位粉絲`);
    }).catch(()=>{/* Keep the owner-provided fallback during an outage. */});
})();
