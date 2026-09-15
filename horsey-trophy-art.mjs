const BASE='assets/sentence-structure/rewards/';
export const TROPHY_ART={
 eddy:{front:BASE+'golden-eddie-v1.webp',map:BASE+'golden-eddie-map-v2.webp'},
 phoebe:{front:BASE+'golden-phoebe-map-v1.webp',map:BASE+'golden-phoebe-map-v1.webp'},
 noir:{front:BASE+'golden-noir-map-v1.webp',map:BASE+'golden-noir-map-v1.webp'},
 celeste:{front:BASE+'golden-celeste-map-v1.webp',map:BASE+'golden-celeste-map-v1.webp'},
 elsie:{front:BASE+'golden-elsie-map-v1.webp',map:BASE+'golden-elsie-map-v1.webp'}
};
for(const name of ['phoebe','elsie','noir','celeste'])TROPHY_ART[name].metals={silver:BASE+'silver-'+name+'-map-v1.webp',bronze:BASE+'bronze-'+name+'-map-v1.webp'};
let selected='eddy';
export const trophyCharacter=()=>selected;
export function syncCompanionTrophies(scope,character=selected){
 if(!TROPHY_ART[character]||!scope)return;
 for(const img of scope.querySelectorAll('img[data-trophy-art-view],img[src*="/rewards/golden-"]')){
  const view=img.dataset.trophyArtView || (img.getAttribute('src').includes('-map-')?'map':'front');
  img.dataset.trophyArtView=view;
  const tier=img.closest('[data-trophy-tier]')?.dataset.trophyTier || 'gold';
  const art=TROPHY_ART[character].metals?.[tier] || TROPHY_ART[character][view];
  if(character!=='eddy')img.dataset.trophyMaterial=tier;else delete img.dataset.trophyMaterial;
  if(img.getAttribute('src')!==art)img.setAttribute('src',art);
  img.closest('.ss-trophy-sculpture')?.style.setProperty('--trophy-art',"url('"+art+"')");
  const button=img.closest('[data-trophy-interact]');
  if(button){button.dataset.trophyCharacter=character;const label=button.getAttribute('aria-label');if(label)button.setAttribute('aria-label',label.replace(/Eddie|Phoebe|Elsie|Noir|Celeste/g,{eddy:'Eddie',phoebe:'Phoebe',elsie:'Elsie',noir:'Noir',celeste:'Celeste'}[character]));}
 }
}
if(typeof window!=='undefined')window.addEventListener('horsey-companion-change',event=>{
 const character=event.detail?.character;if(!TROPHY_ART[character])return;
 selected=character;syncCompanionTrophies(document,character);
});
