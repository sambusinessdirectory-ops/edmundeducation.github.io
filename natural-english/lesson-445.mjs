import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-445-v2-audio','audio','只聽停車計時器狀態。最關鍵的是甚麼？',['已付的停車時間過了。','停車位剛開始計時。','計時器完全沒有顯示時間。','車子已開走。'],'已付的停車時間過了。','meter expired 表示允許停車的付費時限已過。'),
  mc('native-445-v2-scene','scene','你買了一小時停車，回來時螢幕顯示時間已在五分鐘前歸零。哪句準確？',["The meter expired five minutes ago.","The meter still has fifty-five minutes left.","The ticket dispenser is jammed.","I just started the meter."],"The meter expired five minutes ago.",'付費時間已結束五分鐘，正是 expired；不是機器不出票。'),
  mc('native-445-v2-detail','detail','朋友問 How long ago did it expire? 你看見時間在十分鐘前歸零。哪個回答直接？',["About ten minutes ago.","For another ten minutes.","It has ten minutes left.","I paid for ten hours."],"About ten minutes ago.",'how long ago 問已過多久；left 則是還剩多久。'),
  mc('native-445-v2-transfer','transfer','換到路邊的另一個停車位，計時器也剛過期。哪句自然？',["This meter has just expired.","The meter still has time left.","This meter never started.","The ticket machine is empty."],"This meter has just expired.",'expired 可用於另一個停車計時器，just 指剛剛超時。'),
  open('native-445-v2-final','final','最後挑戰：你回到路邊車位，發現計時器八分鐘前就到期。朋友問是否仍有時間。寫兩句英文說明狀態與時間差。',["No, the meter expired about eight minutes ago. We need to move the car now.","There's no time left on the meter. It expired eight minutes ago."],'expired 指付費時限已過，並用 ago 說明已過多久。')
];
const steps=[
  {id:'native-445-v2-audio',style:'audio',label:'先聽時間',title:'計時器已過期',intro:'判斷剩餘時間是否仍有。',model:'The meter expired.',zh:'停車計時器到期了。',audioOnly:true,questions:['native-445-v2-audio']},
  {id:'native-445-v2-scene',style:'scene',label:'晚了五分鐘',title:'付費時限已過',intro:'根據時間線選說法。',questions:['native-445-v2-scene']},
  {id:'native-445-v2-detail',style:'detail',label:'回答追問',title:'過了多久？',intro:'分清 ago 與 left。',questions:['native-445-v2-detail']},
  {id:'native-445-v2-transfer',style:'transfer',label:'另一個車位',title:'剛過期',intro:'把 expired 用到新計時器。',questions:['native-445-v2-transfer']},
  {id:'native-445-v2-speak',style:'speak',label:'口頭追問',title:'問過期時間',intro:'先自己說；錄音或跳過後才聽示範。',model:'How long ago did it expire?',zh:'它多久前過期？',speakingPrompt:'朋友說計時器已過期，你想問過了多久。先口頭問。',recording:'phrase',questions:[]},
  {id:'native-445-v2-final',style:'final',label:'路邊挑戰',title:'已過八分鐘',intro:'自己回答朋友。',questions:['native-445-v2-final']}
];
export default {revision:2,summary:'用 meter expired 說停車付費時間已過，並用 ago 表示過期多久。',steps,questions,takeaways:['The meter expired.','How long ago did it expire?'],completionTitle:'你能清楚說出停車計時器已過期及時間差。'};
