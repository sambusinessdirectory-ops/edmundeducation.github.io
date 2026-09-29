import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-156-v2-audio','audio','只聽昨晚的情況。說話者主要在評價甚麼？',['自己的睡眠質素。','昨晚看的電影。','今天精神很差的原因。','昨晚入睡的具體時間。'],'自己的睡眠質素。','I didn’t sleep well 說睡眠不好，可包括難入睡或睡得斷續。'),
  mc('native-156-v2-repair','repair','你昨晚醒了幾次，早上很累，卻說 My sleep was good。哪句改得自然又準確？',["I didn't sleep well last night.","I didn't go to bed until very late.","I went to bed early and slept soundly.","I stayed up late but slept soundly."],"I didn't sleep well last night.",'醒來多次表示睡眠質素差；I didn’t sleep well 是直接自然的總結。'),
  mc('native-156-v2-transfer','transfer','朋友問你為何上課一直打呵欠。昨晚樓上很吵，你睡得斷斷續續。哪句可先說明？',["I didn't sleep well because it was noisy upstairs.","I went to sleep earlier to avoid the noise.","I slept perfectly despite the noise.","I feel tired because the lesson is difficult."],"I didn't sleep well because it was noisy upstairs.",'同一句可接上原因，讓朋友知道打呵欠與昨晚睡眠有關。'),
  mc('native-156-v2-tone','tone','同事問 You look tired. Are you okay? 你不想說太多私人細節。哪句簡短得體？',["I'm okay, thanks. I just didn't sleep well.","I'm fine; I just stayed up working.","I'm okay; I woke up earlier than usual.","It's a long story, but I can tell you later."],"I'm okay, thanks. I just didn't sleep well.",'先回應關心，再簡短交代睡不好，不必透露原因。'),
  open('native-156-v2-final','final','最後挑戰：你昨晚因鄰居聲音很吵而睡得斷斷續續。今天朋友看你疲倦，問怎麼了。寫兩句英文說明睡眠狀況與原因。',["I didn't sleep well last night. The neighbors were noisy, and I kept waking up.","I'm tired because I didn't sleep well. The noise upstairs woke me several times."],'先說整體睡眠質素，再補充具體原因；不要把 sleep well 誤解為電影或其他事物好。')
];
const steps=[
  {id:'native-156-v2-audio',style:'audio',label:'先聽近況',title:'昨晚睡得怎樣？',intro:'先聽疲倦的人怎樣形容昨晚。',model:'I didn’t sleep well.',zh:'我昨晚睡得不好。',audioOnly:true,questions:['native-156-v2-audio']},
  {id:'native-156-v2-repair',style:'repair',label:'修正評價',title:'醒了幾次',intro:'讓說法符合實際睡眠。',questions:['native-156-v2-repair']},
  {id:'native-156-v2-transfer',style:'transfer',label:'換到課堂',title:'打呵欠有原因',intro:'把睡眠狀況連到白天表現。',questions:['native-156-v2-transfer']},
  {id:'native-156-v2-tone',style:'tone',label:'簡短回答',title:'不必透露太多',intro:'用得體方式回應關心。',questions:['native-156-v2-tone']},
  {id:'native-156-v2-speak',style:'speak',label:'口頭比較',title:'電影好看另有說法',intro:'先自己說；錄音或跳過後才聽示範。',model:'The movie was good.',zh:'電影很好看。',speakingPrompt:'朋友問你昨晚看的電影如何。先口頭回答，不是在說睡眠。',recording:'phrase',questions:[]},
  {id:'native-156-v2-final',style:'final',label:'疲倦挑戰',title:'樓上太吵',intro:'自己說明睡眠及原因。',questions:['native-156-v2-final']}
];
export default {revision:2,summary:'用 I didn’t sleep well 概括睡眠質素差，並可接具體原因或簡短回應關心。',steps,questions,takeaways:['I didn’t sleep well.','The movie was good.'],completionTitle:'你能自然說明昨晚睡不好及今天疲倦的原因。'};
