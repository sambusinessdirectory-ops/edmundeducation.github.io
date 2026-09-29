import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-093-v2-audio','audio','只聽這句話。對方應預期甚麼？',
    ['說話者預計比約定時間晚約五分鐘。','說話者五分鐘前已到。','約會要改到五天後。','說話者完全不會出現。'],
    '說話者預計比約定時間晚約五分鐘。','running five minutes late 說的是預計遲到五分鐘，不是行程取消。'),
  mc('native-093-v2-tone','tone','朋友已在餐廳等你。你估計會晚五分鐘，哪則訊息既直接又顧及對方？',
    ["Sorry, I'm running five minutes late. I'll be there soon.","I'm late, so stop asking.","I might arrive sometime this evening.","I'm definitely there already."],
    "Sorry, I'm running five minutes late. I'll be there soon.",'先道歉並提供可用的延誤幅度，比含糊或錯報進度有幫助。'),
  mc('native-093-v2-rewrite','rewrite','原訊息：I am late five minutes running。意思是「我會晚五分鐘」。怎樣改成自然英文？',
    ["I'm running five minutes late.","I'm leaving in five minutes.","I'm five minutes away.","I'll be there five minutes early."],
    "I'm running five minutes late.",'它以約定時間為參照；其他三句分別說何時出發、離目的地多久，以及提早到。'),
  mc('native-093-v2-continue','continue','你通知朋友 I’m running five minutes late。車流突然變慢，你現在可能還要多等。下一步應怎樣做？',
    ['盡快更新估計時間，不讓朋友繼續按舊消息等。','假裝先前已經到了。','不再回任何訊息。','要求朋友猜你的所在位置。'],
    '盡快更新估計時間，不讓朋友繼續按舊消息等。','延誤預估變了，更新資訊才讓對方可以重新安排；不應繼續讓五分鐘的舊估計生效。'),
  open('native-093-v2-final','final','最後挑戰：你與朋友約下午六點，現在估計六點零五分才到。朋友傳 Are you close? 用兩句英文回覆，禮貌說明延誤和新的到達時間。',
    ["Sorry, I'm running about five minutes late. I should be there around 6:05.","I'm close, but I'm running five minutes late. Sorry—I should arrive at about 6:05.","Sorry, it looks like I'll be five minutes late. I'll be there around 6:05."],
    'running five minutes late 是相對約定時間的延誤；說出約六點零五分，讓對方直接知道何時等到你。')
];
const steps=[
  {id:'native-093-v2-audio',style:'audio',label:'聽懂延誤',title:'比約定時間晚',intro:'先只聽一句話。',model:'I’m running five minutes late.',zh:'我會晚五分鐘。',audioOnly:true,questions:['native-093-v2-audio']},
  {id:'native-093-v2-tone',style:'tone',label:'通知等候者',title:'先說對方需要知道的',intro:'比較幾種通知遲到的語氣。',questions:['native-093-v2-tone']},
  {id:'native-093-v2-rewrite',style:'rewrite',label:'自然語序',title:'不是逐字翻譯',intro:'把延誤時間說得自然。',questions:['native-093-v2-rewrite']},
  {id:'native-093-v2-speak',style:'speak',label:'即時口說',title:'遲到約十分鐘',intro:'先自己說；錄音或跳過後才聽示範。',model:'I’m running about ten minutes late.',zh:'我大約會晚十分鐘。',speakingPrompt:'交通慢了，你預計比約定時間晚十分鐘。怎樣向朋友說？',recording:'phrase',questions:[]},
  {id:'native-093-v2-continue',style:'continue',label:'再更新',title:'估計時間變了',intro:'想想如何照顧正在等你的人。',questions:['native-093-v2-continue']},
  {id:'native-093-v2-final',style:'final',label:'六點挑戰',title:'報上新的到達時間',intro:'新情境，自行回覆朋友。',questions:['native-093-v2-final']}
];
export default {revision:2,summary:'用 running five minutes late 告知延誤，並提供、更新預計到達時間。',steps,questions,takeaways:['I’m running five minutes late.','I’m running about ten minutes late.'],completionTitle:'你能清楚、體貼地通知對方自己會晚到多久。'};
