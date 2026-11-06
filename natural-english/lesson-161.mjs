import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-161-v2-audio','audio','只聽這句提醒。手機目前最可能怎樣？',['在桌上震動，但沒有明顯鈴聲。','正在發出響亮鈴聲。','收到通知但沒有震動。','剛才響過，現在安靜了。'],'在桌上震動，但沒有明顯鈴聲。','vibrating 描述震動；是否有來電或訊息尚未能只憑震動確定。'),
  mc('native-161-v2-repair','repair','你只看見朋友手機在桌上抖動，沒聽到鈴聲，卻說 Your phone’s ringing。哪句更準確？',["Your phone's vibrating.","Your phone just made a sound.","Your phone rang yesterday.","Your phone keeps ringing."],"Your phone's vibrating.",'眼前證據是震動，不是鈴聲；用 vibrating 避免推斷通知種類。'),
  mc('native-161-v2-tone','tone','朋友正在看書，手機一直靜音震動。哪句明確指出你觀察到的反覆震動，又不替他決定要接？',["Hey, your phone keeps vibrating.","It might be a message, but I can't tell.","I think it rang a moment ago.","You might want to check your phone later."],"Hey, your phone keeps vibrating.",'只是提醒可觀察到的反覆震動，讓朋友自己決定如何處理通知。'),
  open('native-161-v2-final','final','最後挑戰：會議桌上朋友的手機連續震了幾次，他沒留意。你不知道是訊息還是電話。寫兩句英文輕聲提醒，並保持對通知來源的不確定。',["Your phone keeps vibrating. You might have a few messages.","Hey, I think your phone is vibrating again. Maybe you should check it when you can."],'說出可觀察的震動，對通知來源用 might 或 maybe，不要無證據說正在響鈴。')
];
const steps=[
  {id:'native-161-v2-audio',style:'audio',label:'先聽提醒',title:'手機靜靜地震',intro:'聽完後判斷手機是有聲還是靜音震動。',model:'Your phone’s vibrating.',zh:'你的手機在震動。',audioOnly:true,questions:['native-161-v2-audio']},
  {id:'native-161-v2-repair',style:'repair',label:'修正聽覺',title:'沒鈴聲就別說響',intro:'按你真正觀察到的情況改說法。',questions:['native-161-v2-repair']},
  {id:'native-161-v2-tone',style:'tone',label:'輕聲提醒',title:'不替朋友作決定',intro:'只說手機正在做甚麼。',questions:['native-161-v2-tone']},
  {id:'native-161-v2-speak',style:'speak',label:'口頭對照',title:'真的有鈴聲時',intro:'先自己說；錄音或跳過後才聽示範。',model:'Your phone’s ringing.',zh:'你的手機響了。',speakingPrompt:'你確實聽到朋友手機的來電鈴聲。先口頭提醒。',recording:'phrase',questions:[]},
  {id:'native-161-v2-final',style:'final',label:'會議桌挑戰',title:'震了好幾次',intro:'自己說明觀察，保留不確定。',questions:['native-161-v2-final']}
];
export default {revision:2,summary:'用 vibrating 描述手機震動，與 ringing 的鈴聲區分，避免猜測通知來源。',steps,questions,takeaways:['Your phone’s vibrating.','Your phone’s ringing.'],completionTitle:'你能準確提醒朋友手機在震動，而不亂猜通知來源。'};
