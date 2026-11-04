import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-169-v2-audio','audio','只聽這句朋友之間的話。它屬於哪種邀約？',['輕鬆表示想找天見面，時間未定。','確認今晚七點的地點。','取消已定好的餐廳。','已經提出具體的下週四晚上。'],'輕鬆表示想找天見面，時間未定。','sometime 留下未定時間，常作久別重逢時的輕鬆邀約。'),
  mc('native-169-v2-detail','detail','這句裡哪個字讓邀約保持開放，而非已經約好某一天？',['sometime','together','should','we'], 'sometime','sometime 指「某個時候」，沒有具體日期，仍需再安排。'),
  mc('native-169-v2-continue','continue','久未見的朋友說 We should get together sometime。彼此還沒查日程，你也想見，怎樣提出下一步找共同有空的日子？',["Definitely! Let's find a day that works for both of us.","Great, how about choosing a day now?","That sounds nice; I'll check my schedule.","Sure, maybe after the holidays."],"Definitely! Let's find a day that works for both of us.",'先回應邀約，再提出日後找日期，符合目前尚未定時的狀態。'),
  mc('native-169-v2-transfer','transfer','你想把籠統的見面提議稍微具體化成吃晚餐，但仍不定日子。哪句合適？',["We should get together for dinner sometime.","We had dinner at exactly seven yesterday.","Let's meet for coffee tomorrow at eight.","Meet me for dinner in five minutes."],"We should get together for dinner sometime.",'加入 for dinner 交代活動，但 sometime 仍保留日期彈性。'),
  open('native-169-v2-final','final','最後挑戰：你在街上碰到很久沒見的朋友，今天趕時間，想表示以後找天吃晚餐。寫兩句英文表達高興見到他及輕鬆邀約。',["It's so good to see you again. We should get together for dinner sometime.","I'm glad we ran into each other. Let's catch up over dinner sometime soon."],'把寒暄與未定日期的邀約連起來；sometime 不是具體預約。')
];
const steps=[
  {id:'native-169-v2-audio',style:'audio',label:'聽出邀約',title:'改天見一面',intro:'聽完後判斷見面日期是否已定。',model:'We should get together sometime.',zh:'我們找天見見吧。',audioOnly:true,questions:['native-169-v2-audio']},
  {id:'native-169-v2-detail',style:'detail',label:'注意時間',title:'日期還未定',intro:'找出保留彈性的字。',questions:['native-169-v2-detail']},
  {id:'native-169-v2-continue',style:'continue',label:'熱情接話',title:'下一步是找日子',intro:'同意邀約，讓對話往前。',questions:['native-169-v2-continue']},
  {id:'native-169-v2-transfer',style:'transfer',label:'加上活動',title:'約吃晚餐',intro:'保持輕鬆但多說一點。',questions:['native-169-v2-transfer']},
  {id:'native-169-v2-speak',style:'speak',label:'口頭邀請',title:'很久沒一起吃飯',intro:'先自己說；錄音或跳過後才聽示範。',model:'We should get together for dinner sometime.',zh:'我們找天一起吃晚餐吧。',speakingPrompt:'你和舊同學很久沒見，想輕鬆提出某天吃飯。',recording:'phrase',questions:[]},
  {id:'native-169-v2-final',style:'final',label:'街頭巧遇',title:'時間未定的晚餐',intro:'自己寫寒暄和邀約。',questions:['native-169-v2-final']}
];
export default {revision:2,summary:'用 get together sometime 輕鬆表示想找天見面，知道這還不是已確定的約會。',steps,questions,takeaways:['We should get together sometime.','We should get together for dinner sometime.'],completionTitle:'你能在久別重逢時自然提出改天再見。'};
