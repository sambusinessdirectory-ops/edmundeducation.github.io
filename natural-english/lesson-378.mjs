import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-378-v2-audio','audio','聽到這句後，說話者的喉嚨最接近哪種感覺？',['乾癢而有點刺，未必很痛。','吞嚥時疼痛明顯，但沒有乾癢。','嗓音粗啞，卻沒有喉嚨不適。','喉嚨已不痛，只剩下輕微咳嗽。'],'乾癢而有點刺，未必很痛。','scratchy throat 指喉嚨乾癢、微刺；它沒有直接說痛得嚴重或失聲。'),
  mc('native-378-v2-contrast','contrast','朋友只覺得喉嚨乾乾癢癢，還能正常說話。哪句比 sore throat 更貼近？',['I have a scratchy throat.','I have a severe sore throat.','I have lost my voice completely.','My throat is bleeding.'],'I have a scratchy throat.','scratchy 保留了初起的乾癢不適；severe sore throat 把程度說重了。'),
  mc('native-378-v2-reverse','reverse','把「喉嚨開始有點乾癢刺刺的」自然說成英文，哪句最好？',['My throat feels scratchy.','My throat is scratching someone.','My voice is completely gone.','My mouth is burning.'],'My throat feels scratchy.','用 feels scratchy 說自己的感覺，避免把 scratch 當成喉嚨主動抓東西。'),
  mc('native-378-v2-rewrite','rewrite','原稿「My throat is bad」太模糊；症狀剛開始，怎樣改得準確？',['My throat feels a little scratchy today.','My throat has stopped working forever.','My throat is very large today.','My throat tastes sweet today.'],'My throat feels a little scratchy today.','a little 和 scratchy 都保留輕微、乾癢的症狀，沒有誇大成嚴重疼痛。'),
  mc('native-378-v2-tone','tone','同事問你是否需要請假，你只是有點喉嚨不適，哪句說法最不誇張？',["I'm mostly okay; I just have a scratchy throat.","I can't speak at all; my throat is ruined.","There is nothing unusual about my throat.","My throat must have a serious infection."],"I'm mostly okay; I just have a scratchy throat.",'mostly okay 和 just 交代目前仍可工作，只把乾癢作為觀察，不自行下診斷。'),
  open('native-378-v2-transfer','transfer','新情境：早上醒來喉嚨乾癢，但沒有明顯痛楚；你想告訴朋友今天先少說話。寫兩句英文，描述感覺和你的安排。',["I woke up with a scratchy throat, but it doesn't really hurt. I'll try to rest my voice today.","My throat feels a little scratchy this morning. I'm going to talk less and see how it feels later.","I have a scratchy throat, though I can still speak normally. I'll keep my conversations short today."],'自評時要同時寫出輕微乾癢與今天的具體安排，不把症狀誇大成失聲。')
];
const steps=[
  {id:'native-378-v2-audio',style:'audio',label:'辨認乾癢',title:'喉嚨是痛還是刺癢？',intro:'先聽症狀的程度：留意它有沒有說劇痛。',model:'I have a scratchy throat.',zh:'我的喉嚨有點乾癢刺刺的。',audioOnly:true,questions:['native-378-v2-audio']},
  {id:'native-378-v2-contrast',style:'contrast',label:'分辨痛與癢',title:'scratchy 或 sore？',intro:'把輕微乾癢和明顯疼痛分開。',questions:['native-378-v2-contrast']},
  {id:'native-378-v2-reverse',style:'reverse',label:'由感覺選句',title:'喉嚨開始不舒服',intro:'從中文症狀選自然英文。',questions:['native-378-v2-reverse']},
  {id:'native-378-v2-rewrite',style:'rewrite',label:'說具體一點',title:'別只說 bad',intro:'補上感覺和輕微程度。',questions:['native-378-v2-rewrite']},
  {id:'native-378-v2-tone',style:'tone',label:'向同事說明',title:'不誇大，也不隱瞞',intro:'根據真實程度選合適語氣。',questions:['native-378-v2-tone']},
  {id:'native-378-v2-transfer',style:'transfer',label:'早上新情境',title:'描述並安排少說話',intro:'寫清症狀和今天打算怎樣做。',questions:['native-378-v2-transfer']}
];
export default {revision:2,summary:'用 scratchy throat 表達初起的乾癢刺感，與明顯疼痛的 sore throat 區分。',steps,questions,takeaways:['I have a scratchy throat.'],completionTitle:'你能準確描述輕微喉嚨乾癢。'};
