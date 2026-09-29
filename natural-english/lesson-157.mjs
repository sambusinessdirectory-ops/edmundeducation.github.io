import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-157-v2-audio','audio','只聽這句關心。說話者希望對方現在做甚麼？',['去睡一會或上床休息。','繼續把工作做完。','喝一杯咖啡熬夜。','先離開桌面，稍微休息。'],'去睡一會或上床休息。','get some sleep 是去睡覺；對疲憊的人是一種關心提醒。'),
  mc('native-157-v2-scene','scene','朋友已經凌晨兩點，眼睛睜不開，還說報告可以明天完成。你怎樣回應？',["You should get some sleep. The report can wait.","Finish one more section, then go to bed.","Take a short break and return to the report.","Have a coffee and work a bit longer."],"You should get some sleep. The report can wait.",'疲倦又不急的工作可留到明天，提醒先睡與情境吻合。'),
  mc('native-157-v2-rewrite','rewrite','給仍在熬夜的室友留一條訊息。哪句既指出他看起來疲倦，又自然勸休息？',["You look exhausted. Get some rest when you can.","You could leave the last section until morning.","Try to finish the report before you sleep.","Maybe take a short break before working again."],"You look exhausted. Get some rest when you can.",'先關心疲倦狀態，並給對方彈性休息；沒有把提醒變成責備。'),
  open('native-157-v2-final','final','最後挑戰：同事已連續忙了一天，現在很晚，還想整理明天才需要的文件。寫兩句英文關心他並建議先睡。',["You've worked hard all day. You should get some sleep and finish the files tomorrow.","You look exhausted. Get some rest tonight; the paperwork can wait until morning."],'點出疲勞及工作不急的背景，讓睡覺建議顯得貼心、可行。')
];
const steps=[
  {id:'native-157-v2-audio',style:'audio',label:'聽出關心',title:'該睡一會了',intro:'聽聽朋友給疲倦的人甚麼建議。',model:'You should get some sleep.',zh:'你該睡一會了。',audioOnly:true,questions:['native-157-v2-audio']},
  {id:'native-157-v2-scene',style:'scene',label:'凌晨兩點',title:'報告可以明天再做',intro:'按優先次序回應朋友。',questions:['native-157-v2-scene']},
  {id:'native-157-v2-rewrite',style:'rewrite',label:'關心訊息',title:'室友仍未睡',intro:'把提醒寫得自然。',questions:['native-157-v2-rewrite']},
  {id:'native-157-v2-speak',style:'speak',label:'口頭提醒',title:'讓對方休息',intro:'先自己說；錄音或跳過後才聽示範。',model:'Get some rest.',zh:'休息一下吧。',speakingPrompt:'朋友很疲倦，仍坐在電腦前。先簡短提醒他休息。',recording:'phrase',questions:[]},
  {id:'native-157-v2-final',style:'final',label:'同事挑戰',title:'文件明天才需要',intro:'自己寫兩句關心話。',questions:['native-157-v2-final']}
];
export default {revision:2,summary:'用 You should get some sleep 關心晚睡且疲倦的人，並讓建議貼合手頭事情。',steps,questions,takeaways:['You should get some sleep.','Get some rest.'],completionTitle:'你能得體地提醒疲倦的人先休息。'};
