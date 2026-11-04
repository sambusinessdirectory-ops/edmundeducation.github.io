import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-101-v2-audio','audio','只聽這句話。它通常是對誰說的？',
    ['正在捱過困難、需要鼓勵的人。','剛問路的人。','在商店結帳的店員。','正在說自己有多開心的人。'],
    '正在捱過困難、需要鼓勵的人。','Hang in there 是鼓勵對方繼續撐住；不是報告自己的近況。'),
  mc('native-101-v2-explain','explain','Hang in there 和 I’m hanging in there 的角色有甚麼不同？',
    ['前者鼓勵對方；後者說自己正在撐。','兩句都只能用來問時間。','前者說自己，後者命令對方。','兩句都表示完全沒有困難。'],
    '前者鼓勵對方；後者說自己正在撐。','少了主語的 Hang in there 是對別人的鼓勵；加 I’m 就變成描述自己的處境。'),
  mc('native-101-v2-tone','tone','朋友說這星期工作很累，還剩最後一天。你想鼓勵他，又不想否定他的辛苦。哪句最合適？',
    ["That sounds exhausting. Hang in there—you're almost through it.","It's not hard at all. Stop complaining.","You must be enjoying every minute.","I don't want to hear about it."],
    "That sounds exhausting. Hang in there—you're almost through it.",'先承認對方累，再鼓勵他撐過最後一段，比直接否定感受體貼。'),
  mc('native-101-v2-branch','branch','朋友說 I don’t know how I’m going to get through this week。你說 Hang in there。若他接著說 Thanks, I needed that，你怎樣自然回應？',
    ["Of course. Let me know if I can help.","I take that back. You're on your own.","I only said it to end the conversation.","You should stop feeling tired."],
    "Of course. Let me know if I can help.",'鼓勵後可提供具體支持；不把一句口號當成已完全解決問題。'),
  mc('native-101-v2-rewrite','rewrite','原訊息：Be strong。朋友已很努力，你想寫得更溫和、具體。哪句改寫較好？',
    ["I know this week is rough. Hang in there; I'm here if you need me.","Everyone else can cope, so you should too.","Don't tell me you're tired again.","I'll assume everything is easy for you."],
    "I know this week is rough. Hang in there; I'm here if you need me.",'先肯定現況，再說 Hang in there 和可提供的支持，比抽象命令「堅強」更照顧對方。'),
  open('native-101-v2-writing','rewrite','最後情境：同事要完成一個壓力很大的星期，明天就能休息。用兩句英文承認他的辛苦，再鼓勵他撐過最後一天；不要保證一切一定順利。',
    ["That sounds like a tough week. Hang in there—you're almost at the weekend.","I know you've had a lot on your plate. Hang in there; tomorrow is the last day.","This week sounds exhausting. Hang in there, and let me know if I can help."],
    'Hang in there 前後加上你聽到的處境或實際支持，避免空泛地叫人「想開一點」。')
];
const steps=[
  {id:'native-101-v2-audio',style:'audio',label:'聽出對象',title:'這句是對誰說？',intro:'先只聽鼓勵短句。',model:'Hang in there.',zh:'撐住。',audioOnly:true,questions:['native-101-v2-audio']},
  {id:'native-101-v2-explain',style:'explain',label:'說話角色',title:'鼓勵你，還是描述我？',intro:'比較兩個相似句的主語與作用。',questions:['native-101-v2-explain']},
  {id:'native-101-v2-tone',style:'tone',label:'承認辛苦',title:'別叫對方別抱怨',intro:'挑一個帶理解的鼓勵方式。',questions:['native-101-v2-tone']},
  {id:'native-101-v2-branch',style:'branch',label:'鼓勵之後',title:'朋友說謝謝',intro:'學會自然延續支持。',questions:['native-101-v2-branch']},
  {id:'native-101-v2-speak',style:'speak',label:'即時口說',title:'朋友快捱過忙碌一週',intro:'先自己說；錄音或跳過後才聽示範。',model:'Hang in there.',zh:'撐住。',speakingPrompt:'朋友說他很累，你想簡短鼓勵他撐過這個星期。',recording:'phrase',questions:[]},
  {id:'native-101-v2-rewrite',style:'rewrite',label:'把鼓勵寫實',title:'具體說出你聽到了甚麼',intro:'先辨認有同理心的寫法，再自己寫兩句。',questions:['native-101-v2-rewrite','native-101-v2-writing']}
];
export default {revision:2,summary:'用 Hang in there 鼓勵正在捱難關的人，同時承認其辛苦、提供實際支持。',steps,questions,takeaways:['Hang in there.','I’m hanging in there.'],completionTitle:'你能分清鼓勵別人與描述自己，也能把支持說得有分寸。'};
