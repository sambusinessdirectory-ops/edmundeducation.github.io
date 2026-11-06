export const publicMediaOrigin='https://edmund-public-media.edmundeducation.workers.dev';

const productionHosts=new Set(['edmundeducation.com','www.edmundeducation.com']);

export function publishedAudioUrl(value,locationLike=globalThis.location){
 if(!value||!locationLike||/^(?:blob:|data:|https?:)/i.test(value))return value;
 if(!productionHosts.has(locationLike.hostname))return value;
 const parsed=new URL(value,locationLike.href);
 if(!parsed.pathname.startsWith('/natural-english/audio/'))return value;
 return publicMediaOrigin+parsed.pathname+parsed.search+parsed.hash;
}
