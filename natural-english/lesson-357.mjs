import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-357-v2-audio','audio','聽完這句對外賣食物的評語，口感為何變了？',['盒內蒸氣令原本脆的食物變濕軟。','食物被放進水裏浸泡。','食物本來沒有炸熟。','食物在冰箱裏凍硬。'],'盒內蒸氣令原本脆的食物變濕軟。','soggy from the steam 說出變軟的原因是困在盒裏的蒸氣。'),
  mc('native-357-v2-contrast','contrast','薯條剛出鍋很脆，外賣盒蓋着運送後變軟。哪句比「They’re stale」更貼合原因？',["They got soggy from the steam.","They dried out in the sun.","They froze in the box.","They were never cooked."],"They got soggy from the steam.",'stale 常因放久不新鮮；這裏有熱蒸氣困在盒內的直接線索。'),
  mc('native-357-v2-rewrite','rewrite','你想傳訊解釋炸物為何不脆。原稿只寫「The fries got soft」。哪句補上原因？',["The fries got soggy from the steam in the closed box.","The fries turned hard because they were frozen.","The fries were never put in the box.","The fries got saltier during delivery."],"The fries got soggy from the steam in the closed box.",'補上盒內蒸氣，清楚交代原本脆的薯條為何變濕軟。'),
  open('native-357-v2-final','final','新情境：你把剛炸好的雞塊放進有蓋盒子，走到朋友家打開時雞塊不再脆。寫兩句英文向朋友解釋原因並說下次會怎樣做。',["The chicken got soggy from the steam in the box. Next time I'll leave the lid slightly open.","It was crisp before, but the steam made it soggy. I'll open the box sooner next time.","The chicken lost its crunch because steam was trapped inside. We should vent the box next time."],'自評時看是否指出蒸氣造成濕軟，並提出和盒內蒸氣相關的下一次做法。')
];
const steps=[
  {id:'native-357-v2-audio',style:'audio',label:'聽出原因',title:'炸物為何不脆？',intro:'辨認炸物失去酥脆是否因盒內蒸氣。',model:'It got soggy from the steam.',zh:'它被蒸氣弄濕軟了。',audioOnly:true,questions:['native-357-v2-audio']},
  {id:'native-357-v2-contrast',style:'contrast',label:'與 stale 比較',title:'剛炸好卻變軟',intro:'從時間和蒸氣線索判斷。',questions:['native-357-v2-contrast']},
  {id:'native-357-v2-rewrite',style:'rewrite',label:'補上原因',title:'外賣盒的蒸氣',intro:'把單說 soft 改成完整描述。',questions:['native-357-v2-rewrite']},
  {id:'native-357-v2-speak',style:'speak',label:'口頭說明',title:'告訴朋友薯條變軟',intro:'先自己說；錄音或跳過後才聽示範。',model:'It got soggy from the steam.',zh:'它被蒸氣弄濕軟了。',speakingPrompt:'外賣薯條原本酥脆，盒內蒸氣讓它變濕軟。簡短描述。',recording:'phrase',questions:[]},
  {id:'native-357-v2-final',style:'final',label:'雞塊挑戰',title:'解釋並改進包裝',intro:'指出蒸氣使炸物變軟，再提出包裝改法。',questions:['native-357-v2-final']}
];
export default {revision:2,summary:'用 soggy from the steam 解釋熱外賣在有蓋盒內失去酥脆口感。',steps,questions,takeaways:['It got soggy from the steam.'],completionTitle:'你能說清炸物變軟的原因，並提出下次避免的方法。'};
