import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-376-v2-audio','audio','聽完這句追蹤狀態，快遞做了甚麼？',['之前送過未成功，現在又試送一次。','第一次送達並有人簽收。','包裹被分成兩批寄出。','包裹已被取消寄送。'],'之前送過未成功，現在又試送一次。','another delivery attempt 表示又一次派送嘗試，未必成功交件。'),
  mc('native-376-v2-repair','repair','追蹤頁寫「another delivery attempt」，朋友說「So it arrived?」。哪句糾正過早推斷？',["Not necessarily. They tried again, but I don't know if it was delivered.","Yes, another attempt always means successful delivery.","No, the parcel hasn't been shipped yet.","It means the package was split into two."],"Not necessarily. They tried again, but I don't know if it was delivered.",'attempt 只表示試送，不保證有人收件；要另看最終狀態。'),
  mc('native-376-v2-continue','continue','朋友問：「Did your package arrive?」你剛收到第二次未能派送通知，當時不在家。怎樣回答？',["No. They made another delivery attempt, but I wasn't home.","Yes, I signed for it an hour ago.","No, the order was never placed.","The item was damaged after I used it."],"No. They made another delivery attempt, but I wasn't home.",'先回答沒有收到，再解釋第二次試送因你不在家而失敗。'),
  open('native-376-v2-final','final','新情境：快遞昨天來過一次，今天下午兩點又來，但你當時上班，仍未收到包裹。寫兩句英文向家人報告今天追蹤狀態和目前結果。',["They made another delivery attempt at 2 p.m. I was at work, so I still don't have the package.","The courier tried to deliver it again this afternoon. Nobody was home, so it hasn't arrived yet.","There was a second delivery attempt while I was out. I'll check when they plan to try again."],'自評時看是否明確說又嘗試派送，並區分「試送」與「已交到手」。')
];
const steps=[
  {id:'native-376-v2-audio',style:'audio',label:'聽出次數',title:'又來過一次？',intro:'聽快遞是再次試送，還是已成功交件。',model:'They made another delivery attempt.',zh:'他們又嘗試派送一次。',audioOnly:true,questions:['native-376-v2-audio']},
  {id:'native-376-v2-repair',style:'repair',label:'修正結論',title:'試送不等於收到',intro:'從 attempt 判斷確定與未知的事。',questions:['native-376-v2-repair']},
  {id:'native-376-v2-continue',style:'continue',label:'回答朋友',title:'今天仍未收到',intro:'說清第二次試送的結果。',questions:['native-376-v2-continue']},
  {id:'native-376-v2-speak',style:'speak',label:'口頭報告',title:'快遞又來過',intro:'先自己說；錄音或跳過後才聽示範。',model:'They made another delivery attempt.',zh:'他們又嘗試派送一次。',speakingPrompt:'追蹤頁顯示快遞繼昨天後今天又來試送。簡短告訴家人。',recording:'phrase',questions:[]},
  {id:'native-376-v2-final',style:'final',label:'上班日挑戰',title:'試送了仍未收件',intro:'寫清快遞再次試送但仍未交件。',questions:['native-376-v2-final']}
];
export default {revision:2,summary:'用 another delivery attempt 描述快遞再次試送，並與成功交件分開。',steps,questions,takeaways:['They made another delivery attempt.'],completionTitle:'你能準確說明再次試送及包裹目前結果。'};
