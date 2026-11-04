import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-317-v2-audio','audio','只聽身體動作。它最像哪種情況？',['一塊肌肉不由自主地抽動一下。','一塊肌肉持續抽筋幾分鐘。','眼皮反覆輕微跳動。','手臂肌肉因用力而有點酸。'],'一塊肌肉不由自主地抽動一下。','twitch 是短暫、非自願的小抽動；不同於刻意動作。'),
  mc('native-317-v2-scene','scene','你坐著看書，小腿一處肌肉突然輕輕抽了一下，隨即停了。哪句貼切？',["My muscle twitched.","I stretched because my leg felt tight.","My leg cramped for several minutes.","My leg felt sore after sitting."],"My muscle twitched.",'單次輕微抽動是 twitched；持續抽筋或麻痺不同。'),
  mc('native-317-v2-explain','explain','朋友問 Did it hurt? 你沒有痛，只感到一下小動作。哪個回答最清楚？',["No, it just twitched once.","Yes, it has been cramping for an hour.","No, it cramped for a second.","No, it has been sore since yesterday."],"No, it just twitched once.",'once 和 just 說清程度與時間，避免被誤會成持續疼痛或無法活動。'),
  mc('native-317-v2-transfer','transfer','換到眼皮：今天下午眼皮每隔一會就自行跳一下。哪句可沿用？',["My eyelid keeps twitching.","My eyelid is sore from rubbing.","My eye feels sore when I blink.","My eye is itchy, so I keep rubbing it."],"My eyelid keeps twitching.",'twitch 也可說眼皮不自主跳動；keeps 加上反覆發生。'),
  open('native-317-v2-final','final','最後挑戰：你在電腦前坐著，手臂肌肉突然抽了一下，沒有痛。朋友看見後問 What happened? 寫兩句英文描述發生甚麼與是否疼痛。',["My arm muscle just twitched. It didn't hurt; it was only a quick movement.","I felt a little twitch in my arm. I'm fine—it stopped right away."],'說清是短暫不自主抽動及沒有疼痛，別誇大成持續抽筋。')
];
const steps=[
  {id:'native-317-v2-audio',style:'audio',label:'先聽動作',title:'肌肉跳了一下',intro:'判斷是自願動作還是短暫抽動。',model:'My muscle twitched.',zh:'我的肌肉抽動了一下。',audioOnly:true,questions:['native-317-v2-audio']},
  {id:'native-317-v2-scene',style:'scene',label:'看書時小腿',title:'一下就停',intro:'用時間長短分清情況。',questions:['native-317-v2-scene']},
  {id:'native-317-v2-explain',style:'explain',label:'有沒有痛？',title:'回答朋友的追問',intro:'把感覺和動作分開。',questions:['native-317-v2-explain']},
  {id:'native-317-v2-transfer',style:'transfer',label:'換到眼皮',title:'隔一會又跳',intro:'同一動詞套到另一個部位。',questions:['native-317-v2-transfer']},
  {id:'native-317-v2-speak',style:'speak',label:'口頭描述',title:'眼皮反覆跳',intro:'先自己說；錄音或跳過後才聽示範。',model:'My eyelid keeps twitching.',zh:'我的眼皮一直在跳。',speakingPrompt:'眼皮今天反覆跳動。先口頭告訴朋友。',recording:'phrase',questions:[]},
  {id:'native-317-v2-final',style:'final',label:'手臂挑戰',title:'突然抽動但不痛',intro:'自己回答朋友看見的事。',questions:['native-317-v2-final']}
];
export default {revision:2,summary:'用 twitched 描述短暫不自主的肌肉抽動，也能用 keeps twitching 說反覆跳動。',steps,questions,takeaways:['My muscle twitched.','My eyelid keeps twitching.'],completionTitle:'你能準確說出肌肉或眼皮不自主跳動。'};
