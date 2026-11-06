import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-308-v2-audio','audio','只聽餅乾口感。它硬到甚麼程度？',['硬得幾乎咬不動。','表面酥脆，但裡面仍鬆軟。','邊緣硬脆，但仍容易咬。','烤過頭而略微發硬。'],'硬得幾乎咬不動。','rock-hard 用石頭作比喻，強調異常地硬，超過一般 crispy。'),
  mc('native-308-v2-contrast','contrast','一塊餅乾有正常酥脆感，另一塊硬到難咬。後者最適合哪句？',["This cookie is rock-hard.","This cookie is nicely crisp.","This cookie is stale and soft.","This cookie is crisp at the edges."],"This cookie is rock-hard.",'rock-hard 強調難咬的硬，不是受歡迎的酥脆。'),
  mc('native-308-v2-repair','repair','朋友咬了一口便停下，說 It’s just crispy，但他其實咬得很辛苦。哪句更準確？',["The cookie is rock-hard.","The cookie is soggy.","The cookie is crisp but easy to bite.","The cookie is a little too crisp."],"The cookie is rock-hard.",'crispy 是正常脆；rock-hard 表示硬到影響咀嚼。'),
  mc('native-308-v2-rewrite','rewrite','你買到一盒難咬的餅乾，要向店員簡短反映。哪句最具體？',["These cookies are rock-hard—I can barely bite into them.","These cookies are different somehow.","I don't like the box design.","The cookies have an unusual color."],"These cookies are rock-hard—I can barely bite into them.",'用難咬的可觀察結果解釋 rock-hard，比籠統說不同更有用。'),
  open('native-308-v2-final','final','最後挑戰：你請朋友吃自製餅乾，卻發現烤得太硬，幾乎咬不動。寫兩句英文向朋友說明並提出換另一批。',["Sorry, these cookies are rock-hard. Let me get the softer batch for you.","I think I overbaked these; they're really hard to bite. I'll bring you some from the other tray."],'把異常硬的口感說清楚，再提出換一批；不要把正常酥脆與難咬混為一談。')
];
const steps=[
  {id:'native-308-v2-audio',style:'audio',label:'先聽口感',title:'硬得難咬',intro:'只聽一句。',model:'The cookie is rock-hard.',zh:'餅乾硬得像石頭。',audioOnly:true,questions:['native-308-v2-audio']},
  {id:'native-308-v2-contrast',style:'contrast',label:'比較程度',title:'脆不等於硬得咬不動',intro:'把一般口感和異常程度分開。',questions:['native-308-v2-contrast']},
  {id:'native-308-v2-repair',style:'repair',label:'改準描述',title:'只是 crispy？',intro:'觀察咀嚼困難。',questions:['native-308-v2-repair']},
  {id:'native-308-v2-rewrite',style:'rewrite',label:'向店員反映',title:'說出難咬的證據',intro:'寫出具體口感。',questions:['native-308-v2-rewrite']},
  {id:'native-308-v2-final',style:'final',label:'自製挑戰',title:'換另一批餅乾',intro:'自己說明問題和補救。',questions:['native-308-v2-final']}
];
export default {revision:2,summary:'用 rock-hard 描述硬得難咬的餅乾，與正常酥脆口感區分。',steps,questions,takeaways:['The cookie is rock-hard.','This cookie is rock-hard.'],completionTitle:'你能準確說明餅乾硬到難咬的程度。'};
