import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-086-v2-audio','audio','只聽這個詞組。它最像怎樣的休息安排？',
    ['短短睡一會，希望恢復精神。','安排整個下午睡覺。','約朋友外出散步。','通宵不睡做工作。'],
    '短短睡一會，希望恢復精神。','power nap 是短暫補眠，重點在短時間休息後恢復精神；不是一般長時間睡眠。'),
  mc('native-086-v2-detail','detail','你跟同事說要 take a power nap。哪個補充最能保持原意？',
    ["I'll rest for a short while before the meeting.","I'll sleep until tomorrow afternoon.","I'll skip sleep for the whole week.","I'll go running for an hour."],
    "I'll rest for a short while before the meeting.",'短時間休息呼應 power nap；其餘安排把時間或活動大幅改變。'),
  mc('native-086-v2-transfer','transfer','午飯後你有十五分鐘空檔，想補一小覺。哪句比 I’m going to take a nap 更明確說出「短而提神」？',
    ["I'm going to take a quick power nap.","I'm going to sleep all day.","I'm going to stay up late.","I'm going to run a marathon."],
    "I'm going to take a quick power nap.",'power nap 已帶短暫補眠的意思，quick 再把時間短說清楚；一般 nap 不一定特別強調這點。'),
  open('native-086-v2-final','final','最後挑戰：你午休只剩十五分鐘，下午還有會議。朋友問要不要喝咖啡。用兩句英文說明你想先短暫補眠，再決定要不要咖啡。',
    ["I'm going to take a quick power nap first. I'll decide about coffee afterward.","Maybe later. I'll take a power nap, then see if I still need coffee.","I have fifteen minutes, so I'll take a power nap first. I might get coffee later."],
    '說出 power nap，並交代先後次序；這樣是在新情境下作選擇，而不是只填入一個詞。')
];
const steps=[
  {id:'native-086-v2-audio',style:'audio',label:'聽出時間感',title:'只有一小段空檔',intro:'先只聽詞組，再判斷休息長短。',model:'power nap',zh:'短暫補眠。',audioOnly:true,questions:['native-086-v2-audio']},
  {id:'native-086-v2-detail',style:'detail',label:'保留原意',title:'短，才是關鍵',intro:'看補充細節是否吻合。',questions:['native-086-v2-detail']},
  {id:'native-086-v2-speak',style:'speak',label:'口頭安排',title:'先休息一下',intro:'先自己說；錄音或跳過後才聽示範。',model:'I’m going to take a nap.',zh:'我要小睡一下。',speakingPrompt:'你有點累，想跟朋友說你會先小睡一會。',recording:'phrase',questions:[]},
  {id:'native-086-v2-transfer',style:'transfer',label:'換個場合',title:'會議前的十五分鐘',intro:'看看短暫補眠何時比一般小睡更貼切。',questions:['native-086-v2-transfer']},
  {id:'native-086-v2-final',style:'final',label:'午休挑戰',title:'補眠還是咖啡？',intro:'自己安排先後，沒有選項或示範。',questions:['native-086-v2-final']}
];
export default {revision:2,summary:'理解 power nap 是短暫補眠，並在時間有限的安排中自然使用。',steps,questions,takeaways:['power nap','I’m going to take a nap.'],completionTitle:'你能說清楚短暫補眠，也能在對話裡安排先後。'};
