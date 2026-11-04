import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-146-v2-audio','audio','只聽提醒。對方最需要避免甚麼？',['把某件事做得過量。','先從較輕的工作量開始。','做完後需要休息一下。','把原本的計劃分成兩天。'],'把某件事做得過量。','Don’t overdo it 針對正在做或打算做的事，提醒程度不要過頭。'),
  mc('native-146-v2-detail','detail','朋友剛恢復運動，今天想一口氣練兩小時。哪個細節讓這句提醒特別貼切？',['他剛恢復，卻把時長大幅拉高。','他原本只打算練半小時。','他昨天做相同訓練後沒有不適。','他準備先做熱身再決定時長。'],'他剛恢復，卻把時長大幅拉高。','overdo it 強調做過量；剛恢復卻突然拉長時數正是風險所在。'),
  mc('native-146-v2-continue','continue','你說 Don’t overdo it。朋友問 What do you mean? 哪句補充最清楚？',["Start with half an hour and see how you feel.","Stop for today and never try that workout again.","Keep the full two-hour plan if you feel fine.","Try the full two hours, then rest tomorrow."],"Start with half an hour and see how you feel.",'用較短時間具體說明「量力而為」，比完全禁止運動更符合原意。'),
  open('native-146-v2-final','final','最後挑戰：朋友手腕剛好，週末想把整間屋一次打掃完。寫兩句英文提醒他量力而為，並建議分段處理。',["Don't overdo it while your wrist is still recovering. You could clean one room today and do the rest later.","Take it easy and don't overdo it. Maybe split the cleaning over two days."],'overdo it 針對打掃工作量；提出分段安排讓提醒更實用。')
];
const steps=[
  {id:'native-146-v2-audio',style:'audio',label:'聽出提醒',title:'別做過頭',intro:'只聽提醒，再看對方的活動量是否過頭。',model:'Don’t overdo it.',zh:'不要做過頭。',audioOnly:true,questions:['native-146-v2-audio']},
  {id:'native-146-v2-detail',style:'detail',label:'看工作量',title:'剛恢復就練兩小時？',intro:'找出「過量」的線索。',questions:['native-146-v2-detail']},
  {id:'native-146-v2-continue',style:'continue',label:'說明程度',title:'What do you mean?',intro:'把提醒化成具體做法。',questions:['native-146-v2-continue']},
  {id:'native-146-v2-speak',style:'speak',label:'口頭關心',title:'同伴正在硬撐',intro:'先自己說；錄音或跳過後才聽示範。',model:'Don’t push yourself.',zh:'別勉強自己。',speakingPrompt:'同伴已很疲倦，還想接著做家務。先口頭關心。',recording:'phrase',questions:[]},
  {id:'native-146-v2-final',style:'final',label:'家務挑戰',title:'分開兩天做好',intro:'自己寫提醒和較輕安排。',questions:['native-146-v2-final']}
];
export default {revision:2,summary:'用 Don’t overdo it 提醒他人別把工作或運動做過量，並提出合理調整。',steps,questions,takeaways:['Don’t overdo it.','Don’t push yourself.'],completionTitle:'你能提醒朋友量力而為，也能提出具體做法。'};
