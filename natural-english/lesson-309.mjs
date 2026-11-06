import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-309-v2-audio','audio','只聽薯片的口感。最可能發生過甚麼？',['袋子開封放久，失去酥脆。','包裝未開，口感仍很脆。','薯片受潮但仍帶一點脆。','袋子開了但口感仍正常。'],'袋子開封放久，失去酥脆。','stale 說食物放久不新鮮，薯片常失去原本的脆度。'),
  mc('native-309-v2-scene','scene','薯片袋昨晚忘了封好，今天咬下去不再脆。哪句最貼切？',["The chips are stale.","The chips are rock-hard.","The chips still taste fresh and crisp.","The chips are a little soggy from sauce."],"The chips are stale.",'開封後走味、失脆可用 stale；不是硬得像石頭。'),
  mc('native-309-v2-rewrite','rewrite','室友問你為何換一包薯片。哪句能交代原因？',["The old bag was left open, and the chips went stale.","The bag was sealed tightly last night.","The new bag has a later best-before date.","The old chips are slightly less salty."],"The old bag was left open, and the chips went stale.",'說明袋子沒封好與口感變差的關係，比只說換一包具體。'),
  open('native-309-v2-final','final','最後挑戰：朋友遞給你一包開封幾天的薯片，吃起來不脆。寫兩句英文說明口感並禮貌提議開新的一包。',["These chips have gone stale; they're not crunchy anymore. Could we open a fresh bag?","Thanks, but the chips are a little stale. Do you mind if we open another pack?"],'stale 對準久放失脆，不需要說食物被水浸濕。')
];
const steps=[
  {id:'native-309-v2-audio',style:'audio',label:'先聽口感',title:'薯片不脆了',intro:'只聽一句。',model:'The chips are stale.',zh:'薯片放久變軟、不新鮮了。',audioOnly:true,questions:['native-309-v2-audio']},
  {id:'native-309-v2-scene',style:'scene',label:'袋子沒封好',title:'隔天口感變了',intro:'把原因和形容詞連起來。',questions:['native-309-v2-scene']},
  {id:'native-309-v2-rewrite',style:'rewrite',label:'解釋換一包',title:'說出開封原因',intro:'讓室友明白口感變化。',questions:['native-309-v2-rewrite']},
  {id:'native-309-v2-speak',style:'speak',label:'口頭轉用',title:'餅乾也會放久失脆',intro:'先自己說；錄音或跳過後才聽示範。',model:'The cookies have gone stale.',zh:'餅乾放久不新鮮了。',speakingPrompt:'餅乾盒沒蓋好，餅乾失去新鮮口感。先口頭描述。',recording:'phrase',questions:[]},
  {id:'native-309-v2-final',style:'final',label:'朋友挑戰',title:'禮貌換新一包',intro:'自己說明失脆與建議。',questions:['native-309-v2-final']}
];
export default {revision:2,summary:'用 stale 描述薯片或餅乾開封放久後失去新鮮脆度。',steps,questions,takeaways:['The chips are stale.','The cookies have gone stale.'],completionTitle:'你能說清薯片為何不脆，並禮貌提出換新的。'};
