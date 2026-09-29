import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-091-v2-audio','audio','只聽這句話。說話者目前最可能在哪個階段？',
    ['已出發，正在前往約定地點。','尚未決定要不要出門。','已到達並坐下。','今天完全不打算見面。'],
    '已出發，正在前往約定地點。','I’m on my way 表示已在前往的途中；不等於已到達，也別用來掩飾仍未出門。'),
  mc('native-091-v2-tone','tone','朋友問 Are you coming? 你其實還在家穿鞋，正準備出門。哪句最誠實？',
    ["I'm heading out now.","I'm already there.","I've been waiting at the restaurant for an hour.","I'm on my way and almost there."],
    "I'm heading out now.",'heading out now 是現在正要出發；若仍在家，說 on my way and almost there 會誤導對方。'),
  mc('native-091-v2-continue','continue','你已在車上，告訴朋友 I’m on my way。朋友還想知道甚麼，才方便安排等候？',
    ['大概何時到。','你上星期吃過甚麼。','你喜不喜歡這部車的顏色。','你明天早餐想吃甚麼。'],
    '大概何時到。','I’m on my way 交代正在前往；補上預計到達時間，可讓等候的人更容易安排。'),
  mc('native-091-v2-rewrite','rewrite','你已離開家，正在步行去見朋友。原訊息：I’m still thinking about leaving。怎樣改才不錯報進度？',
    ["I'm on my way. I'll be there soon.","I haven't decided whether to come.","I arrived an hour ago.","I'm heading out tomorrow."],
    "I'm on my way. I'll be there soon.",'既然已在路上，on my way 比仍在考慮出門準確；補上 soon 也幫對方掌握時間。'),
  open('native-091-v2-writing','rewrite','你剛上車去餐廳見朋友。朋友傳訊問 Where are you? 用兩句英文回覆：說你已在路上，並提供一個合理的大約到達時間。',
    ["I'm on my way. I'll be there in about ten minutes.","I'm on my way to the restaurant now. I should be there in around ten minutes.","Just got on the bus. I'm on my way and should arrive in about ten minutes."],
    '已出發才用 on my way；再提供大約到達時間。具體時間可按真實情況改，不必照抄十分鐘。')
];
const steps=[
  {id:'native-091-v2-audio',style:'audio',label:'聽懂進度',title:'已在路上',intro:'只聽一句話，判斷人是否已出發。',model:'I’m on my way.',zh:'我在路上了。',audioOnly:true,questions:['native-091-v2-audio']},
  {id:'native-091-v2-tone',style:'tone',label:'誠實報位',title:'還在穿鞋時怎樣說？',intro:'比較已出發與正要出發。',questions:['native-091-v2-tone']},
  {id:'native-091-v2-speak',style:'speak',label:'即時口說',title:'現在才出門',intro:'先自己說；錄音或跳過後才聽示範。',model:'I’m heading out now.',zh:'我現在出門了。',speakingPrompt:'朋友問你是否已出發；你正要離開家門。',recording:'phrase',questions:[]},
  {id:'native-091-v2-continue',style:'continue',label:'補上資訊',title:'別讓朋友盲等',intro:'想想進度訊息還缺甚麼。',questions:['native-091-v2-continue']},
  {id:'native-091-v2-rewrite',style:'rewrite',label:'路上短訊',title:'說準現在的位置',intro:'先選準確說法，再自行寫一則完整回覆。',questions:['native-091-v2-rewrite','native-091-v2-writing']}
];
export default {revision:2,summary:'分清已在路上的 on my way 和正要出門的 heading out，並向等待的人交代時間。',steps,questions,takeaways:['I’m on my way.','I’m heading out now.'],completionTitle:'你能誠實交代出發進度，並補上讓朋友好安排的時間。'};
