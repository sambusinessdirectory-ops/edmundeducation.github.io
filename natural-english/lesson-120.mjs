import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-120-v2-audio','audio','只聽診所來電。現在多了甚麼？',['一個可以預約的空檔。','原本的預約被移到較晚時間。','候補名單上多了一位客人。','原本滿了的時段又開放。'],'一個可以預約的空檔。','opening 在預約語境指可用時段；came up 暗示剛出現。'),
  mc('native-120-v2-scene','scene','有人取消下午五點的理髮預約，店員想問候補名單上的你要不要接。哪句最自然？',["An opening came up at five.","Your appointment has been moved from five to six.","We double-booked you at five.","We have an opening tomorrow morning instead."],"An opening came up at five.",'原本已滿的五點因有人取消而突然可預約，所以是 opening came up，不是重複預約。'),
  mc('native-120-v2-detail','detail','診所已說空檔在星期五，但未說幾點。哪個問題最有助於決定要不要接？',['What time is the opening?','Is this the same appointment I already booked?','Could you tell me which day the slot is on?','Is the opening with the same stylist?'],'What time is the opening?','opening 只是說有空檔，未提供時段；先問時間才能知道自己可否赴約。'),
  mc('native-120-v2-tone','tone','你可以赴約，也想禮貌地立即答覆。哪句最合適？',["Great, I'll take the 3:00 opening. Thank you!","Thanks, but could I confirm the time first?","I can come, but could you hold it until I check?","I could probably make three, but I'm not certain."],"Great, I'll take the 3:00 opening. Thank you!",'說出三點並致謝，讓店員知道你確定接受這個新空檔，可以立即完成預約。'),
  mc('native-120-v2-branch','branch','診所說「有三點空檔」，但你要四點才下班。怎樣接話才有助於繼續安排？',["I can't make three. Please let me know if a later opening comes up.","I can't do three; do you have anything at four?","Could you keep me on the list for later times?","Could you move my original booking to next week?"],"I can't make three. Please let me know if a later opening comes up.",'婉拒不合適的時間，同時保留候補較晚時段的可能。'),
  open('native-120-v2-continue','continue',"你是診所櫃檯。候補客人接受剛空出的星期五三點時段。用兩句英文確認預約，並說明接下來何時見。",["Great, you're booked for Friday at three. We'll see you then.", "Perfect, I've put you down for the 3:00 opening on Friday. See you at the clinic."],"客人答應空檔後，櫃檯應重複具體日期和時間，確認它已正式預約。"),
];
const steps=[
  {id:'native-120-v2-audio',style:'audio',label:'聽到機會',title:'突然多了空檔',intro:'只聽一句，不先看英文。',model:'An opening came up.',zh:'突然有個預約空檔。',audioOnly:true,questions:['native-120-v2-audio']},
  {id:'native-120-v2-scene',style:'scene',label:'取消後補上',title:'理髮店的五點',intro:'找出 opening 從何而來。',questions:['native-120-v2-scene']},
  {id:'native-120-v2-detail',style:'detail',label:'先問時間',title:'空檔合不合適？',intro:'決定之前先抓關鍵資料。',questions:['native-120-v2-detail']},
  {id:'native-120-v2-tone',style:'tone',label:'禮貌接受',title:'接下三點時段',intro:'用簡短清楚的口吻回覆。',questions:['native-120-v2-tone']},
  {id:'native-120-v2-branch',style:'branch',label:'不合時段',title:'錯過三點也有下一步',intro:'婉拒這個空檔，保留候補。',questions:['native-120-v2-branch']},
  {id:'native-120-v2-continue',style:'continue',label:'完成預約',title:'櫃檯要確認甚麼？',intro:'把對話帶到明確的預約結果。',model:'We have an opening.',zh:'我們有一個空檔。',questions:['native-120-v2-continue']}
];
export default {revision:2,summary:'理解 opening 是新出現的可預約時段，並能接下、婉拒或確認空檔。',steps,questions,takeaways:['An opening came up.','We have an opening.'],completionTitle:'你能聽懂突如其來的預約空檔，並清楚答覆。'};
