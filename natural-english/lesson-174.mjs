import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-174-v2-audio','audio','只聽今天早上的工作。說話者正在處理哪類 email？',['之前積下、尚未回覆或處理的。','下週才會收到的。','已回覆、只待歸檔的。','下週才要準備寄出的。'],'之前積下、尚未回覆或處理的。','catch up on emails 指補處理累積未完成的郵件。'),
  mc('native-174-v2-scene','scene','你放假回來，收件箱有八十封未處理郵件，今天上午逐一回覆。哪句最貼切？',["I'm catching up on my emails.","I'm getting ahead on next month's emails.","I'm sorting this week's incoming messages.","I'm reviewing the emails I've already answered."],"I'm catching up on my emails.",'放假後補處理積下的郵件，是 catch up on；不是預先處理未來郵件。'),
  mc('native-174-v2-continue','continue','同事說 I’m catching up on my emails。你想知道他是否還有很多未處理，又不預設他今天必須全部回完，怎樣接？',["A lot to go through?","Have you cleared the urgent ones yet?","Are you starting with the newest messages?","Are you planning to reply to all of them today?"],"A lot to go through?",'catching up 暗示有積壓；問剩下多少要處理，順著對方工作進度接話。'),
  mc('native-174-v2-transfer','transfer','不只 email：你因生病缺席兩天，現在補做積下的工作。哪句自然？',["I need to catch up on some work.","I need to get ahead on completed work.","I need to finish tomorrow's tasks early.","I need to postpone some new work."],"I need to catch up on some work.",'catch up on 可接 work，表示補回先前未做完的工作。'),
  open('native-174-v2-final','final','最後挑戰：你休假回來，收件箱有很多未回覆郵件。主管問你上午會做甚麼。寫兩句英文說明要補處理郵件，並交代下午才開始新項目。',["I'm going to catch up on my emails this morning. I'll start the new project this afternoon.","I have a backlog of emails to work through first. I'll move on to the new project after lunch."],'catch up on 指補處理積壓，不是提前做還沒到的工作；安排好上午和下午順序。')
];
const steps=[
  {id:'native-174-v2-audio',style:'audio',label:'先聽工作',title:'補處理郵件',intro:'只聽一句早上的安排。',model:'catch up on my emails',zh:'補處理積下的電郵。',audioOnly:true,questions:['native-174-v2-audio']},
  {id:'native-174-v2-scene',style:'scene',label:'放假回來',title:'八十封未處理',intro:'把片語放進具體工作日。',questions:['native-174-v2-scene']},
  {id:'native-174-v2-continue',style:'continue',label:'同事接話',title:'還有多少要處理？',intro:'問一個順著進度的問題。',questions:['native-174-v2-continue']},
  {id:'native-174-v2-transfer',style:'transfer',label:'不只郵件',title:'積下的工作',intro:'把 catch up on 用於更廣的工作。',model:'I need to catch up on some work.',zh:'我得補做一些工作。',questions:['native-174-v2-transfer']},
  {id:'native-174-v2-final',style:'final',label:'回來上班',title:'上午郵件、下午新項目',intro:'自己說明優先次序。',questions:['native-174-v2-final']}
];
export default {revision:2,summary:'用 catch up on my emails 說補處理積壓郵件，也可擴展到其他未完成工作。',steps,questions,takeaways:['catch up on my emails','I need to catch up on some work.'],completionTitle:'你能說清正在補處理甚麼，以及接下來的工作安排。'};
