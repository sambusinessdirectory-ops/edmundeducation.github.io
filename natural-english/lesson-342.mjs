import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-342-v2-audio','audio','只聽這句話，紙張有甚麼小問題？',['其中一個角被壓彎。','整頁被撕成兩半。','紙張被水浸透。','書脊裂開。'],'其中一個角被壓彎。','corner is bent 限定在邊角變形，沒有說整頁損壞。'),
  mc('native-342-v2-reverse','reverse','你從書包拿出文件，右上角被擠得翹起，但沒有折成整齊的三角形。哪句較準？',["The corner is bent.","The page is torn in half.","The spine is cracked.","The sheet is soaked."],"The corner is bent.",'bent 描述角被壓彎；folded over 則較像有意或明顯折到另一面。'),
  mc('native-342-v2-continue','continue','朋友問：「Is the book okay?」只有一頁的角被壓彎，其餘完好。怎樣回答？',["Yeah, but one of the page corners got bent.","No, every page is missing.","No, the whole cover fell off.","Yes, all the pages are completely flat."],"Yeah, but one of the page corners got bent.",'先交代書整體還好，再指出一個頁角的小損傷，程度合適。'),
  open('native-342-v2-final','final','新情境：你借了朋友一本書，放在背包裏後其中一頁的角被壓彎。寫兩句英文向朋友說明並道歉。',["I'm sorry; one of the page corners got bent in my bag. The rest of the book is fine.","The corner of one page is bent. I'm sorry I didn't protect the book better.","I noticed a bent corner on one page after carrying the book. Sorry about that."],'自評時看是否把問題限定在頁角，並清楚向借書的朋友致歉。')
];
const steps=[
  {id:'native-342-v2-audio',style:'audio',label:'聽出損傷範圍',title:'整頁還是一個角？',intro:'聽紙張受損的是一個角還是整頁。',model:'The corner is bent.',zh:'邊角被壓彎了。',audioOnly:true,questions:['native-342-v2-audio']},
  {id:'native-342-v2-reverse',style:'reverse',label:'由紙角找句子',title:'書包壓到文件',intro:'根據變形方式選英文。',questions:['native-342-v2-reverse']},
  {id:'native-342-v2-continue',style:'continue',label:'回答朋友',title:'書大致還好',intro:'接着朋友的問題交代小損傷。',questions:['native-342-v2-continue']},
  {id:'native-342-v2-speak',style:'speak',label:'口頭說明',title:'提醒朋友紙角彎了',intro:'先自己說；錄音或跳過後才聽示範。',model:'The corner is bent.',zh:'邊角被壓彎了。',speakingPrompt:'一張文件右上角在背包裏被壓歪。用一句英文描述。',recording:'phrase',questions:[]},
  {id:'native-342-v2-final',style:'final',label:'借書挑戰',title:'說明並道歉',intro:'指出書頁哪個角彎了，再向朋友道歉。',questions:['native-342-v2-final']}
];
export default {revision:2,summary:'用 corner is bent 指出紙張或書頁邊角被壓彎，並準確交代損傷範圍。',steps,questions,takeaways:['The corner is bent.'],completionTitle:'你能說清頁角的小損傷，並禮貌向朋友交代。'};
