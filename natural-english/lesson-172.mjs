import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-172-v2-audio','audio','只聽這個工作計劃。說話者打算甚麼時候做部分工作？',['在截止前先做一部分。','等落後後才補做。','把今天已逾期的事補回來。','在假期後才開始。'],'在截止前先做一部分。','get ahead 指趁有時間預先做，讓之後的進度更輕鬆。'),
  open('native-172-v2-scene','scene',"你知道下週會議很多，今天較空，想先寫下週報告的一部分。向同事寫兩句英文說明現在做甚麼及原因。",["I'm trying to get ahead on next week's report. The meetings next week will take up most of my time.", "I'm drafting part of next week's report now so I can get ahead before my schedule fills up."],"先做未到期工作是 get ahead；把下週繁忙的原因說出來，讓安排合理。"),
  mc('native-172-v2-contrast','contrast','桌上有兩堆工作：一堆已逾期，一堆下週才到期。處理後者以減輕下週壓力叫甚麼？',["getting ahead","catching up","falling behind","putting it off"],"getting ahead",'先處理未到期工作是 getting ahead；補逾期工作才是 catching up。'),
  mc('native-172-v2-repair','repair','你已提前完成下週兩項工作，卻說 I’m falling behind。哪句改得更準確？',["I'm getting ahead on next week's work.","I'm catching up on missed work.","I'm delaying everything until next week.","I'm behind on all my deadlines."],"I'm getting ahead on next week's work.",'進度超前是 get ahead；falling behind 表示逐漸落後，意思相反。'),
  mc('native-172-v2-reverse','reverse','同事問你為何這麼早做下週的事。你想說「先做一些，免得到時趕」。哪個片語合適？',["get ahead","fall behind","catch up","put it off"],"get ahead",'get ahead 對應提前推進工作，重點是截止前已有進度。')
];
const steps=[
  {id:'native-172-v2-audio',style:'audio',label:'先聽計劃',title:'提前做一點',intro:'只聽一個工作片語。',model:'get ahead',zh:'提前推進進度。',audioOnly:true,questions:['native-172-v2-audio']},
  {id:'native-172-v2-scene',style:'scene',label:'下週很忙',title:'這週先寫草稿',intro:'看是超前還是落後。',questions:['native-172-v2-scene']},
  {id:'native-172-v2-contrast',style:'contrast',label:'兩堆工作',title:'超前與補進度',intro:'區分 ahead 和 catch up。',questions:['native-172-v2-contrast']},
  {id:'native-172-v2-repair',style:'repair',label:'修正方向',title:'並非落後',intro:'把評價改成符合時間線。',questions:['native-172-v2-repair']},
  {id:'native-172-v2-reverse',style:'reverse',label:'由目的想詞',title:'免得到時趕',intro:'找出提前做的英文片語。',questions:['native-172-v2-reverse']},
  {id:'native-172-v2-speak',style:'speak',label:'口頭交代',title:'說明自己的安排',intro:'先自己說；錄音或跳過後才聽示範。',model:'I want to get ahead on my work.',zh:'我想提前做些工作。',speakingPrompt:'同事問你為何已開始做下週的報告。先口頭回答。',recording:'phrase',questions:[]}
];
export default {revision:2,summary:'用 get ahead 說提前推進未到期工作，與落後後補進度區分。',steps,questions,takeaways:['get ahead','I want to get ahead on my work.'],completionTitle:'你能說明自己為何提前完成部分工作。'};
