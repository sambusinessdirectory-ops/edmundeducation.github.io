import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-271-v2-audio','audio','先聽兩個常用提醒。兩句共同表示甚麼？',['接下來輪到你。','你已錯過機會。','請回到隊尾。','你現在必須離開。'],'接下來輪到你。','You’re next 和 It’s your turn 都可提醒對方接下來該行動；使用場景略有不同。'),
  mc('native-271-v2-repair','repair','桌遊中你完成回合，想提醒正在看手機的朋友。原句「You are the next one of the line」既冗長又把遊戲說成排隊。怎樣改？',["It's your turn.","Go to the back of the line.","You missed your turn forever.","The game has ended."],"It's your turn.",'輪流遊戲時 It’s your turn 直接說現在到他，不需要 line。'),
  mc('native-271-v2-continue','continue','收銀員問：「Who’s next?」你後面的人拿着商品，自己已付款。怎樣接話？',["You're next.","It's your turn to play.","Nobody is allowed to pay.","The shop is closed now."],"You're next.",'排隊時 You’re next 自然指出下一位顧客；遊戲用語不切合收銀台。'),
  mc('native-271-v2-branch','branch','你在輪流答題的活動中說「It’s your turn.」朋友答：「Oh, okay.」下一句怎樣幫他開始？',["You can take the next question.","Please return to the end of the queue.","You've already lost your turn.","I won't let anyone answer."],"You can take the next question.",'對方已知道輪到自己，接着指出可回答下一題，讓互動繼續。'),
  open('native-271-v2-final','final','新情境：你跟朋友輪流在白板畫畫，剛完成自己的畫，朋友卻仍在聊天。寫兩句英文提醒他輪到他，並邀請他拿筆。',["It's your turn now. Here, take the marker.","I'm done with my drawing, so you're next. Would you like the pen?","Your turn! You can start whenever you're ready."],'自評時檢查是否提醒對方輪次，並用第二部分自然推動他開始。')
];
const steps=[
  {id:'native-271-v2-audio',style:'audio',label:'聽出輪次',title:'兩句話的共同意思',intro:'先聽錄音，不看英文。',model:'You’re next. / It’s your turn.',zh:'下一個輪到你。',audioOnly:true,questions:['native-271-v2-audio']},
  {id:'native-271-v2-repair',style:'repair',label:'遊戲用語',title:'輪到朋友畫了',intro:'把冗長說法改成自然提醒。',questions:['native-271-v2-repair']},
  {id:'native-271-v2-continue',style:'continue',label:'收銀台接話',title:'指給店員下一位',intro:'在排隊場景選合適一句。',questions:['native-271-v2-continue']},
  {id:'native-271-v2-branch',style:'branch',label:'問答活動',title:'朋友準備答題',intro:'讓輪流進行下去。',questions:['native-271-v2-branch']},
  {id:'native-271-v2-speak',style:'speak',label:'即時提醒',title:'排隊到朋友了',intro:'先自己說；錄音或跳過後才聽示範。',model:'You’re next.',zh:'下一個到你。',speakingPrompt:'你剛買完咖啡，排在後面的朋友還在看手機。提醒他現在輪到他。',recording:'phrase',questions:[]},
  {id:'native-271-v2-final',style:'final',label:'畫畫挑戰',title:'把輪次交給朋友',intro:'提醒朋友現在輪到他畫，並邀請他拿筆。',questions:['native-271-v2-final']}
];
export default {revision:2,summary:'用 You’re next 和 It’s your turn 提醒輪次，並按排隊或輪流活動選自然說法。',steps,questions,takeaways:['You’re next. / It’s your turn.','You’re next.'],completionTitle:'你能在排隊和輪流活動中清楚提醒下一位。'};
