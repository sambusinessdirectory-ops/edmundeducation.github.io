import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-099-v2-audio','audio','只聽這個片語。它要求離開的人怎樣處理東西？',
    ['離開時把東西一起帶走。','把東西永遠留在原地。','在這裡把東西交給另一個人。','立即把東西丟掉。'],
    '離開時把東西一起帶走。','take it with you 讓物件隨著「你」離開；不是只叫人拿起來又放下。'),
  mc('native-099-v2-contrast','contrast','朋友快離開你家，雨傘是他的，仍放在門邊。哪句最能避免他忘記？',
    ['Bring your umbrella with you.','Leave your umbrella here forever.','Your umbrella came off.','I have your umbrella at home.'],
    'Bring your umbrella with you.','在這個對話視角，bring your umbrella with you 表示出門時把傘帶在身邊；重點是別遺留在門邊。'),
  mc('native-099-v2-reverse','reverse','Don’t forget to take your charger with you。怎樣準確轉述？',
    ['別忘了把你的充電器一起帶走。','別忘了把充電器留給我。','別忘了幫充電器充電。','別忘了替我買新的充電器。'],
    '別忘了把你的充電器一起帶走。','with you 指離開時隨身帶著；這句沒有要求購買或充電。'),
  open('native-099-v2-final','final','最後挑戰：朋友準備離開你家，外面下雨，他的傘仍靠在門邊。用兩句英文提醒他帶走傘，並說出外面下雨這個原因。',
    ["Don't forget to take your umbrella with you. It's raining outside.","Bring your umbrella with you—it’s raining.","Your umbrella is by the door. Take it with you because it's raining."],
    '清楚指出 umbrella，並用 with you 強調出門時帶走；再把下雨的原因接上。')
];
const steps=[
  {id:'native-099-v2-audio',style:'audio',label:'聽出方向',title:'東西跟誰一起走？',intro:'先只聽片語。',model:'take it with you',zh:'把它一起帶走。',audioOnly:true,questions:['native-099-v2-audio']},
  {id:'native-099-v2-contrast',style:'contrast',label:'門口提醒',title:'別把傘留在這裡',intro:'辨認能防止遺漏的句子。',questions:['native-099-v2-contrast']},
  {id:'native-099-v2-speak',style:'speak',label:'即時口說',title:'雨傘在門邊',intro:'先自己說；錄音或跳過後才聽示範。',model:'Bring your umbrella with you.',zh:'把你的雨傘帶著。',speakingPrompt:'朋友出門前忘記自己的雨傘。簡短提醒。',recording:'phrase',questions:[]},
  {id:'native-099-v2-reverse',style:'reverse',label:'反向理解',title:'充電器別落下',intro:'把另一樣物品的提醒轉述準確。',questions:['native-099-v2-reverse']},
  {id:'native-099-v2-final',style:'final',label:'雨天挑戰',title:'帶傘才出門',intro:'自己給出提醒和理由。',questions:['native-099-v2-final']}
];
export default {revision:2,summary:'用 take it with you 提醒離開的人把自己的東西帶走。',steps,questions,takeaways:['take it with you','Bring your umbrella with you.'],completionTitle:'你能自然提醒朋友把遺留在門邊的東西帶走。'};
