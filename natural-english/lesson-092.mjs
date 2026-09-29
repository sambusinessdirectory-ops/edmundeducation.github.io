import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-092-v2-audio','audio','只聽這句話。它比 I’m on my way 多交代了甚麼？',
    ['剛剛離開原來的地方。','已經到達目的地。','交通一定暢順。','一定五分鐘內到。'],
    '剛剛離開原來的地方。','I just left 的 just 明確指出才剛離開；它沒有保證到達時間或路況。'),
  mc('native-092-v2-detail','detail','你傳 I just left。朋友問 How long do you think? 這問題在追問哪個尚未提供的資訊？',
    ['預計多久才到。','你剛離開的是哪個月份。','你為何要用手機。','你是不是已經吃完飯。'],
    '預計多久才到。','剛離開不等於快到；對方想知道的是餘下路程約需多久。'),
  mc('native-092-v2-explain','explain','朋友抱怨你說 I just left，卻沒有告訴他幾時到。哪個解釋準確？',
    ['這句只報告剛出發，若知道時間可另外補上預計到達。','這句本來就表示已到門口。','這句保證交通暢順。','這句表示你明天才出發。'],
    '這句只報告剛出發，若知道時間可另外補上預計到達。','I just left 描述出發時間；抵達時間是另一條資訊。'),
  open('native-092-v2-final','final','最後挑戰：你剛從公司離開，正在去見朋友。朋友問 Did you leave yet? 用兩句英文回答：說你剛離開，並按你掌握的情況給一個大約到達時間。',
    ["Yeah, I just left the office. I should be there in about twenty minutes.","I just headed out. It'll probably take me around twenty minutes.","Yes, I just left. I'll text you when I'm closer."],
    '用 just left 或 just headed out 表示剛出發；若不確定分鐘數，可以誠實說接近時再更新。')
];
const steps=[
  {id:'native-092-v2-audio',style:'audio',label:'聽出時間點',title:'離開沒多久',intro:'先只聽一句，再辨認剛發生的動作。',model:'I just left.',zh:'我剛離開。',audioOnly:true,questions:['native-092-v2-audio']},
  {id:'native-092-v2-detail',style:'detail',label:'找缺失資訊',title:'還要多久才到？',intro:'看看出發訊息回答了甚麼，還未回答甚麼。',questions:['native-092-v2-detail']},
  {id:'native-092-v2-explain',style:'explain',label:'向朋友解釋',title:'剛離開 ≠ 快到了',intro:'避免一句話讓對方誤判等待時間。',questions:['native-092-v2-explain']},
  {id:'native-092-v2-speak',style:'speak',label:'口頭更新',title:'從家門出發',intro:'先自己說；錄音或跳過後才聽示範。',model:'I just left.',zh:'我剛離開。',speakingPrompt:'朋友問你是否已出門。你剛剛走出家門。',recording:'phrase',questions:[]},
  {id:'native-092-v2-final',style:'final',label:'下班挑戰',title:'剛走出公司',intro:'自己報告進度，別保證不知道的時間。',questions:['native-092-v2-final']}
];
export default {revision:2,summary:'用 I just left 準確說明剛出發，並另外交代或更新預計抵達時間。',steps,questions,takeaways:['I just left. / I just headed out.','I just left.'],completionTitle:'你能把剛出發與快到達分開說清楚。'};
