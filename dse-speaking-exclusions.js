(function(){
  const blocked=topic=>Number(topic?.year)===2014&&/hong kong police force summer internship programme/i.test(String(topic?.title||''));
  for(const key of ['EDMUND_DSE_SPEAKING_DATA','EDMUND_DSE_SPEAKING_SUPPLEMENT']){
    const data=window[key];if(!data)continue;
    if(Array.isArray(data.sets))data.sets=data.sets.filter(topic=>!blocked(topic));
    if(data.catalog&&typeof data.catalog==='object')for(const year of Object.keys(data.catalog))if(Array.isArray(data.catalog[year]))data.catalog[year]=data.catalog[year].filter(topic=>!blocked(topic));
  }
})();
