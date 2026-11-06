import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-261-v2-audio','audio','聽完這句網絡描述，哪個情況最吻合？',['已連上網，但過一會又斷，反覆發生。','從開始就無法連上任何網絡。','網站對所有人暫停服務。','網速一直慢但從未斷線。'],'已連上網，但過一會又斷，反覆發生。','keeps dropping 表示連線多次意外中斷，前提是它曾經成功連上。'),
  mc('native-261-v2-contrast','contrast','你的 Wi-Fi 五分鐘內斷了三次，每次都能重新連上。哪句比「It won’t connect」更準確？',["The connection keeps dropping.","The site is down.","The router is unplugged.","The screen keeps dimming."],"The connection keeps dropping.",'問題是重複掉線；It won’t connect 則表示連線從未成功。'),
  mc('native-261-v2-rewrite','rewrite','同事傳訊息：「你又從會議消失了。」你要解釋自己反覆掉線。哪條英文訊息清楚？',["Sorry, my connection keeps dropping. I'll reconnect.","Sorry, your website has closed permanently.","I turned off the meeting because it ended.","My camera lens is dirty. I'll clean it."],"Sorry, my connection keeps dropping. I'll reconnect.",'訊息交代反覆掉線及下一步；其餘回應沒有解釋會議反覆中斷。'),
  open('native-261-v2-final','final','新情境：你在家參加線上課堂，已成功加入三次，卻每隔幾分鐘被踢出。寫兩句英文向老師解釋問題並說你會嘗試甚麼。',["My connection keeps dropping. I'll try restarting the router.","I'm sorry I keep disappearing; my connection keeps dropping. I'll reconnect from my phone.","The Wi-Fi connects and then drops after a few minutes. I'm going to switch networks."],'自評時看是否明確說出「連上後反覆斷開」，並提出重連、換網絡等下一步。')
];
const steps=[
  {id:'native-261-v2-audio',style:'audio',label:'聽出反覆掉線',title:'連線曾成功嗎？',intro:'先只聽，不看英文句子。',model:'The connection keeps dropping.',zh:'連線一直掉。',audioOnly:true,questions:['native-261-v2-audio']},
  {id:'native-261-v2-contrast',style:'contrast',label:'對照連不上',title:'接得上，但留不住',intro:'分辨從未連上和連上後掉線。',questions:['native-261-v2-contrast']},
  {id:'native-261-v2-rewrite',style:'rewrite',label:'改寫訊息',title:'向同事說明斷線',intro:'寫出問題和接下來會做甚麼。',questions:['native-261-v2-rewrite']},
  {id:'native-261-v2-speak',style:'speak',label:'即時口說',title:'又斷線了',intro:'先自己說；錄音或跳過後才聽示範。',model:'The connection keeps dropping.',zh:'連線一直掉。',speakingPrompt:'會議剛才已斷線兩次，你又重新加入。用一句英文向同事說明。',recording:'phrase',questions:[]},
  {id:'native-261-v2-final',style:'final',label:'課堂挑戰',title:'向老師解釋缺席片刻',intro:'自己寫兩句，再按示例檢查。',questions:['native-261-v2-final']}
];
export default {revision:2,summary:'用 keeps dropping 描述成功連上後反覆斷線，與從未連得上分開。',steps,questions,takeaways:['The connection keeps dropping.'],completionTitle:'你能準確向同事或老師說明反覆掉線。'};
