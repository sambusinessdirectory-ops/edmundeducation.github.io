import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-173-v2-audio','audio','只聽同事的說法。他們確認了甚麼？',['對目標或安排有相同理解。','同時打開同一頁網站。','已同意見面時間，但分工仍不清楚。','只有一人知道最後期限。'],'對目標或安排有相同理解。','on the same page 是理解一致的比喻，不必真的看同一頁。'),
  mc('native-173-v2-explain','explain','會議結束前，團隊對週四交稿、週五審閱都點頭。為何這句適合？',['各人對下一步和時間線已有共同理解。','兩位同事都看過週四的草稿。','每人都同意週五要審閱。','雙方仍以為不同的人負責簡報。'],'各人對下一步和時間線已有共同理解。','同意具體分工和期限，正是確認大家 on the same page 的依據。'),
  mc('native-173-v2-tone','tone','你還不確定同事是否也以為週四交初稿。哪句問法自然？',["Are we on the same page about Thursday's draft?","I thought the deadline was Friday; did you?","I'll send my understanding in writing after the call.","Do you mean the first draft or the final one?"],"Are we on the same page about Thursday's draft?",'把理解一致的範圍說成 Thursday’s draft，讓同事有機會確認或修正。'),
  open('native-173-v2-rewrite','rewrite',"會議後你負責簡報，同事負責數字，兩人都同意週四交初稿。寫兩句英文給同事確認分工和共同理解。",["I'll handle the slides, and you'll prepare the figures by Thursday. Are we on the same page?", "Just to confirm, I'll make the slides and you'll gather the numbers for Thursday. Let me know if I've understood correctly."],"把各自責任與期限寫清楚，再確認是否理解一致，避免只說空泛的共識。"),
];
const steps=[
  {id:'native-173-v2-audio',style:'audio',label:'先聽比喻',title:'理解一致',intro:'只聽一句工作對話。',model:'We’re on the same page.',zh:'我們理解一致。',audioOnly:true,questions:['native-173-v2-audio']},
  {id:'native-173-v2-explain',style:'explain',label:'找出共識',title:'週四交稿',intro:'看具體安排是否一致。',questions:['native-173-v2-explain']},
  {id:'native-173-v2-tone',style:'tone',label:'禮貌核對',title:'先問而不假定',intro:'讓同事確認理解。',questions:['native-173-v2-tone']},
  {id:'native-173-v2-rewrite',style:'rewrite',label:'會議紀錄',title:'分工寫清楚',intro:'把共識寫成可追查的內容。',questions:['native-173-v2-rewrite']},
  {id:'native-173-v2-speak',style:'speak',label:'口頭確認',title:'問大家是否同意',intro:'先自己說；錄音或跳過後才聽示範。',model:'Are we on the same page?',zh:'我們理解一致嗎？',speakingPrompt:'會議快結束，你想確認大家對下一步有相同理解。先口頭問。',recording:'phrase',questions:[]}
];
export default {revision:2,summary:'用 on the same page 表示團隊對安排有共同理解，並在不確定時主動核對。',steps,questions,takeaways:['We’re on the same page.','Are we on the same page?'],completionTitle:'你能在討論後確認大家對分工和時間線理解一致。'};
