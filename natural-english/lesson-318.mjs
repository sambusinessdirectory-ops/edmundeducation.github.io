import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-318-v2-audio','audio','只聽線上會議的問題。別人為甚麼難聽清楚你？',['麥克風輸入音量太低。','對方喇叭播放太大聲。','自己的喇叭輸出音量太低。','麥克風接通了，但人聲有失真。'],'麥克風輸入音量太低。','mic level 是麥克風輸入強度；對方聽你太小聲時可先檢查。'),
  mc('native-318-v2-reverse','reverse','會議同事都說你的聲音比其他人小很多，但你聽他們正常。最直接描述自己的設備是？',["My mic level is too low.","My speaker volume is too low.","My microphone is muted.","The meeting audio is distorted for everyone."],"My mic level is too low.",'你聽別人正常，問題更可能在自己麥克風輸入而非喇叭輸出。'),
  mc('native-318-v2-repair','repair','你被反映說話太小聲，卻回應 I will turn my speakers up。應調哪個音量控制才對準問題？',["I'll turn my mic level up.","I'll make my own speakers louder.","I'll reconnect my headphones.","I'll move closer to the laptop mic."],"I'll turn my mic level up.",'要改善傳到別人耳中的聲音，應調麥克風輸入；自己的喇叭音量只改變自己聽到的聲音。'),
  mc('native-318-v2-tone','tone','主持人說 We can barely hear you。哪句回覆清楚又讓會議能繼續？',["I think my mic level is too low. Give me a moment to turn it up.","Can you check whether everyone hears me quietly?","I'll switch to my headset mic and try again.","I can hear you, so maybe the problem is on your side."],"I think my mic level is too low. Give me a moment to turn it up.",'承認可調整的輸入問題，並讓大家知道你會馬上處理。'),
  mc('native-318-v2-rewrite','rewrite','寫給 IT：同事聽你聲音很小，但你自己聽會議正常。哪條訊息最好？',["Others can barely hear me, although I hear them fine. My mic level may be too low.","The whole meeting has no sound for anyone.","My speaker volume is low, so I can barely hear you.","My headset sounds clear when I play music."],"Others can barely hear me, although I hear them fine. My mic level may be too low.",'同時說明輸入與輸出兩邊的情況，有助 IT 縮小排查範圍。'),
  open('native-318-v2-final','final','最後挑戰：視訊通話時三位同事都說你太小聲，但你聽他們清楚。寫兩句英文向大家說明可能原因，並表示會調整。',["My mic level seems too low. I'll turn it up and try speaking again.","I can hear you, but you can barely hear me. Let me raise my mic input level."],'把自己的輸入問題和調整動作說明確；別只調高自己耳機音量。')
];
const steps=[
  {id:'native-318-v2-audio',style:'audio',label:'先聽方向',title:'別人聽你太小聲',intro:'分清輸入和輸出音量。',model:'My mic level is too low.',zh:'我的麥克風音量太低。',audioOnly:true,questions:['native-318-v2-audio']},
  {id:'native-318-v2-reverse',style:'reverse',label:'根據症狀',title:'你聽他們正常',intro:'定位問題在誰的聲音。',questions:['native-318-v2-reverse']},
  {id:'native-318-v2-repair',style:'repair',label:'修正調整',title:'別調錯喇叭',intro:'選真正能讓別人聽清你的操作。',model:'Turn the volume up.',zh:'把音量調高。',questions:['native-318-v2-repair']},
  {id:'native-318-v2-tone',style:'tone',label:'回覆主持人',title:'先說明會處理',intro:'在會議中自然接話。',questions:['native-318-v2-tone']},
  {id:'native-318-v2-rewrite',style:'rewrite',label:'給 IT 訊息',title:'兩邊聽感不同',intro:'寫出有診斷價值的資訊。',questions:['native-318-v2-rewrite']},
  {id:'native-318-v2-final',style:'final',label:'視訊挑戰',title:'調高麥克風',intro:'自己說明原因和下一步。',questions:['native-318-v2-final']}
];
export default {revision:2,summary:'用 mic level is too low 描述自己的麥克風輸入太小，與自己喇叭音量區分。',steps,questions,takeaways:['My mic level is too low.','Turn the volume up.'],completionTitle:'你能在通話中調整正確的音量方向。'};
