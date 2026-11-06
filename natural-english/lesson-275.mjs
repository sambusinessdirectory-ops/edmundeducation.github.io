import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-275-v2-audio','audio','只聽這句話。說話者現在為何要離開等候區？',['櫃台已叫到他的號碼。','他剛拿到號碼票。','他的號碼票不見了。','櫃台宣布今日關閉。'],'櫃台已叫到他的號碼。','My number was called 表示輪候號碼已被叫出，現在可以上前。'),
  mc('native-275-v2-detail','detail','診所大屏幕顯示 A124，你拿着 A124 的號碼票。哪項判斷有根據？',['你的號碼已被叫到。','你剛排進隊尾。','你必須再取一張號碼票。','所有櫃台都停止服務。'],'你的號碼已被叫到。','屏幕號碼與票面相同是關鍵；這表示輪到你，應留意去哪個窗口。'),
  mc('native-275-v2-scene','scene','銀行叫號機播出你的號碼，同行朋友問你為何站起來。你怎樣回答？',["My number was called.","I lost my number.","I need a new ticket.","The bank is closing."],"My number was called.",'被叫到的是你的輪候號碼；這直接解釋你要去櫃台。'),
  mc('native-275-v2-continue','continue','朋友問：「Was that your number?」你確認是自己的票號。哪句能自然接上？',["Yeah, I think my number was called. I'll go up now.","No, I haven't taken a ticket at all.","They called every number except mine.","The counter is closed, so let's leave."],"Yeah, I think my number was called. I'll go up now.",'先確認號碼，再說會上前，回應朋友當下的問題。'),
  mc('native-275-v2-transfer','transfer','從銀行轉到政府辦事處。你拿着 B07，屏幕跳出 B07。哪句仍適用？',["My number was called.","My appointment was canceled.","I missed the bus.","My card was declined."],"My number was called.",'只要是拿號碼票輪候，號碼被叫到都可用同一句。'),
  open('native-275-v2-transfer-write','transfer','新情境：你和朋友在政府辦事處等候，屏幕剛顯示你票上的 B07。寫兩句英文告訴朋友現在輪到你，並說你要去櫃台。',
    ["My number was called. I'll go to the counter now.","That's my number on the screen. I need to go up to the service desk.","They've just called B07, which is my ticket. I'll head to the counter."],
    '自評時確認你說的是號碼已被叫到，不只是剛取得號碼票，並交代前往櫃台。')
];
const steps=[
  {id:'native-275-v2-audio',style:'audio',label:'聽出輪候狀態',title:'終於到誰了？',intro:'聽輪候號碼是否已輪到說話者。',model:'My number was called.',zh:'叫到我的號碼了。',audioOnly:true,questions:['native-275-v2-audio']},
  {id:'native-275-v2-detail',style:'detail',label:'核對屏幕',title:'A124 對上票面',intro:'從顯示號碼決定下一步。',questions:['native-275-v2-detail']},
  {id:'native-275-v2-scene',style:'scene',label:'銀行等候區',title:'朋友問你去哪裏',intro:'向同行的人解釋你站起來的原因。',questions:['native-275-v2-scene']},
  {id:'native-275-v2-continue',style:'continue',label:'接朋友的話',title:'確認剛才的廣播',intro:'回答問題並交代你要上前。',questions:['native-275-v2-continue']},
  {id:'native-275-v2-transfer',style:'transfer',label:'換到辦事處',title:'另一種叫號場景',intro:'把同一句用於另一個服務櫃台。',questions:['native-275-v2-transfer','native-275-v2-transfer-write']}
];
export default {revision:2,summary:'辨認輪候號碼被叫到的時刻，並告訴同行者自己要前往櫃台。',steps,questions,takeaways:['My number was called.'],completionTitle:'你能在各種服務櫃台清楚說明號碼已被叫到。'};
