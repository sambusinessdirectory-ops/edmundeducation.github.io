import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-164-v2-audio','audio','只聽這句離開時的話。說話者現在要去哪裡？',['回自己家。','從外地回家鄉。','現在打算搬回故鄉長住。','明天才從外地返家。'],'回自己家。','I’m going home 是現在離開這裡回家，home 前通常不用 to。'),
  mc('native-164-v2-tone','tone','聚會快結束，你很累，想禮貌告辭。哪句自然？',["I think I'm going home now. Thanks for having me.","I think I'll head back to the hotel now.","I'm heading back to my place tomorrow.","I might stay for one more drink."],"I think I'm going home now. Thanks for having me.",'自然交代要回家並感謝主人；home 前不用 the。'),
  mc('native-164-v2-rewrite','rewrite','給仍在辦公室的同事發訊息：你現在下班回家，明天再見。哪條最清楚？',["I'm going home now. See you tomorrow.","I'm going back home tomorrow from overseas.","I'll be leaving the office soon.","I'll go back home next week."],"I'm going home now. See you tomorrow.",'now 對準眼前離開辦公室；tomorrow 只修飾再見，不是回家的時間。'),
  open('native-164-v2-final','final','最後挑戰：朋友聚會仍在進行，你準備離開回自己家。寫兩句英文禮貌告辭並感謝主人。',["I'm going home now, but I had a great time. Thanks for inviting me.","I think I'll head home. Thank you for having me tonight."],'說明眼前回家並感謝主人；不必把 home 說成特定建築物。')
];
const steps=[
  {id:'native-164-v2-audio',style:'audio',label:'先聽去向',title:'現在回家',intro:'只聽一句告別話。',model:'I’m going home.',zh:'我要回家了。',audioOnly:true,questions:['native-164-v2-audio']},
  {id:'native-164-v2-tone',style:'tone',label:'聚會告辭',title:'先謝謝主人',intro:'把去向說得有禮。',questions:['native-164-v2-tone']},
  {id:'native-164-v2-rewrite',style:'rewrite',label:'下班訊息',title:'now 與 tomorrow',intro:'讓同事知道你此刻離開。',questions:['native-164-v2-rewrite']},
  {id:'native-164-v2-speak',style:'speak',label:'口頭對照',title:'明天從外地回去',intro:'先自己說；錄音或跳過後才聽示範。',model:'I’m going back home tomorrow.',zh:'我明天會回家。',speakingPrompt:'你現在仍在外地，明天才回家。口頭向朋友交代。',recording:'phrase',questions:[]},
  {id:'native-164-v2-final',style:'final',label:'告別挑戰',title:'聚會中禮貌離開',intro:'自己說出要走和謝意。',questions:['native-164-v2-final']}
];
export default {revision:2,summary:'用 I’m going home 表示此刻要回家，並在告別時自然交代。',steps,questions,takeaways:['I’m going home.','I’m going back home tomorrow.'],completionTitle:'你能自然說「我要回家了」，並禮貌告辭。'};
