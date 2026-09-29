import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-119-v2-audio','audio','只聽預約問題。同一時段發生了甚麼事？',['被安排給兩位客人。','被取消而無人使用。','兩人分別被安排在相鄰時段。','原本時段被取消後再釋出。'],'被安排給兩位客人。','double-booked 指同一時段或資源重複預約，造成衝突。'),
  mc('native-119-v2-scene','scene','髮型師的下午三點只可接一位客人，系統卻讓兩人都收到三點確認。怎樣說明？',["They double-booked the 3:00 slot.","They opened a new 3:00 slot.","They found an opening at three after a cancellation.","They booked one client at three and the other at four."],"They double-booked the 3:00 slot.",'這裡的「雙」是兩位客人佔同一預約時段，不是收費兩次。'),
  mc('native-119-v2-transfer','transfer','你同時答應兩個朋友星期六晚餐，兩邊都已訂位。你怎樣承認自己排程撞期？',["I accidentally double-booked myself.","I booked two friends for the same table.","I found a new opening.","I changed one of my two dinner plans to Sunday."],"I accidentally double-booked myself.",'double-booked myself 把責任放在自己：同一時間承諾了兩個安排。'),
  open('native-119-v2-final','final','最後挑戰：診所致電說，你的下午兩點時段也給了另一位病人；對方問可否改到四點。寫兩句英文確認你明白問題，並回覆新時間是否可行。',["Oh, the 2:00 slot was double-booked. Four o'clock works for me.","I see—you double-booked the slot. Yes, I can come at four."],'指出是同時段的兩個預約，再清楚答覆新的時間。')
];
const steps=[
  {id:'native-119-v2-audio',style:'audio',label:'聽出衝突',title:'一個時段，兩位客人',intro:'先聽同一時段發生甚麼。',model:'They double-booked the slot.',zh:'他們把同一時段重複預約了。',audioOnly:true,questions:['native-119-v2-audio']},
  {id:'native-119-v2-scene',style:'scene',label:'髮型屋撞期',title:'兩個三點確認',intro:'用詞對準排程問題。',questions:['native-119-v2-scene']},
  {id:'native-119-v2-speak',style:'speak',label:'口頭承認',title:'自己也可能撞期',intro:'先自己說；錄音或跳過後才聽示範。',model:'I accidentally double-booked myself.',zh:'我不小心把自己約撞期了。',speakingPrompt:'你同時答應了兩個星期六晚上的邀約。向朋友承認錯誤。',recording:'phrase',questions:[]},
  {id:'native-119-v2-transfer',style:'transfer',label:'換到自己',title:'不是只有診所會重複預約',intro:'把 double-booked 用到私人安排。',questions:['native-119-v2-transfer']},
  {id:'native-119-v2-final',style:'final',label:'診所挑戰',title:'回覆改期提議',intro:'自己寫清楚衝突及新時間。',questions:['native-119-v2-final']}
];
export default {revision:2,summary:'用 double-booked 說同一預約時段安排了兩人，也能描述自己答應了兩個同時活動。',steps,questions,takeaways:['They double-booked the slot.','I accidentally double-booked myself.'],completionTitle:'你能說清楚預約撞期，並回應改期安排。'};
