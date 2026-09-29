import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-106-v2-audio','audio','只聽這句話。說話者發現了甚麼？',
    ['專注做事時沒留意時間流逝。','遺失了手錶。','今天的時鐘全部壞了。','約會時間被別人改了。'],
    '專注做事時沒留意時間流逝。','lost track of time 是忘記留意時間，不是手錶或時鐘真的消失。'),
  mc('native-106-v2-detail','detail','你沉迷剪輯影片，一抬頭已經半夜。哪個觀察最支持 I lost track of time？',
    ['你以為只過了半小時，實際已過了幾小時。','你故意把時鐘調慢兩小時。','朋友把約定改到明天。','你一直在倒數每一分鐘。'],
    '你以為只過了半小時，實際已過了幾小時。','主觀上沒察覺時間過去，正是 lost track of time；故意改鐘或一直倒數則不同。'),
  mc('native-106-v2-repair','repair','你晚到，原想說 I lost my clock。其實鐘還在，只是工作太投入。怎樣改準？',
    ['Sorry, I lost track of time.','Sorry, someone stole my clock.','Sorry, the meeting disappeared.','Sorry, there was no time today.'],
    'Sorry, I lost track of time.','lost track of time 指注意力離開了時間進度；不是遺失實物。晚到時先說 sorry 也較得體。'),
  mc('native-106-v2-transfer','transfer','I lost track of how many episodes I watched 與 I lost track of time 用法有何共同點？',
    ['都表示沒有繼續留意或計算某項進度。','都表示串流平台故障。','都表示每集片長完全一樣。','都表示說話者清楚記得確切數目。'],
    '都表示沒有繼續留意或計算某項進度。','lost track of 後面可接時間或數量；重點是沒有掌握後續進度。'),
  mc('native-106-v2-scene','scene','你因忙著工作錯過與朋友約定的通話。除了說 I lost track of time，哪句最有責任感？',
    ["I'm sorry I missed our call. Can we reschedule?","You should have guessed I was busy.","It doesn't matter that you waited.","I won't mention the missed call."],
    "I'm sorry I missed our call. Can we reschedule?",'說明忘記時間不等於免責；要承認讓對方等候，並提出補救。'),
  open('native-106-v2-final','final','最後挑戰：你在做簡報時太投入，錯過了答應和朋友通話的時間。用兩句英文承認自己沒留意時間，並提出一個實際補救方法。',
    ["I'm sorry—I lost track of time while working on my presentation. Can we call now?","I lost track of time and missed our call. I'm sorry. Could we reschedule for tonight?","Sorry I missed your call. I lost track of time while working; are you free in half an hour?"],
    'lost track of time 解釋發生了甚麼，卻不取代道歉；再用具體通話時間作補救。')
];
const steps=[
  {id:'native-106-v2-audio',style:'audio',label:'聽出原因',title:'一抬頭已經很晚',intro:'先只聽一句話。',model:'I lost track of time.',zh:'我忙得忘記時間了。',audioOnly:true,questions:['native-106-v2-audio']},
  {id:'native-106-v2-detail',style:'detail',label:'觀察時間差',title:'以為只過了半小時',intro:'找出真正「沒留意時間」的跡象。',questions:['native-106-v2-detail']},
  {id:'native-106-v2-repair',style:'repair',label:'改掉直譯',title:'不是遺失了時鐘',intro:'把意思說準。',questions:['native-106-v2-repair']},
  {id:'native-106-v2-transfer',style:'transfer',label:'換成數量',title:'看到第幾集？',intro:'把 lost track of 用於另一種進度。',questions:['native-106-v2-transfer']},
  {id:'native-106-v2-scene',style:'scene',label:'錯過通話',title:'解釋以外還需補救',intro:'考慮等候者的處境。',questions:['native-106-v2-scene']},
  {id:'native-106-v2-final',style:'final',label:'簡報挑戰',title:'向朋友補回通話',intro:'自己交代原因並提出補救。',questions:['native-106-v2-final']}
];
export default {revision:2,summary:'用 lost track of time 描述忙到沒留意時間，並在影響別人時道歉和補救。',steps,questions,takeaways:['I lost track of time.','I lost track of how many episodes I watched.'],completionTitle:'你能說明忙到忘記時間，也會照顧因此受影響的人。'};
