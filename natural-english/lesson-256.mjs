import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-256-v2-audio','audio','先聽一句關於通話的話。說話者最可能遇到甚麼？',['聲音一截一截，字句不連續。','畫面顏色整體失真。','對方一直很小聲，但每個字清楚。','麥克風完全靜音。'],'聲音一截一截，字句不連續。','choppy audio 是斷續的聲音；音量小和完全靜音是另外兩種情況。'),
  mc('native-256-v2-contrast','contrast','視訊通話中，你聽到對方聲音「可、以、聽……我……嗎」，中間的字不斷消失。哪句描述最準確？',['The audio is choppy.','The volume is low.','The picture is blurry.','The speaker is too loud.'],'The audio is choppy.','中間的字因斷續而聽不見，重點是連貫性；單純調高音量未必能解決。'),
  mc('native-256-v2-rewrite','rewrite','你要在會議聊天欄提醒發言者：大家仍聽得到一些字，但聲音斷斷續續。哪句訊息最清楚？',["Your audio is choppy. Could you reconnect?","You are completely muted. Please unmute.","Your camera is off. Please turn it on.","The meeting ended. Please leave."],"Your audio is choppy. Could you reconnect?",'訊息先說明斷續的聲音問題，再提出可行的重連動作。'),
  open('native-256-v2-final','final','新情境：你在遠端面試聽不清面試官；聲音一段一段斷掉。寫兩句禮貌英文，說明問題並請對方重複剛才的問題。',["I'm sorry, your audio is a little choppy. Could you repeat the question?","Your audio keeps cutting out on my end. Would you mind saying that again?","I missed part of your question because the audio was choppy. Could you please repeat it?"],'自評時檢查是否交代「聲音斷續」而非音量小，並禮貌請對方重說。')
];
const steps=[
  {id:'native-256-v2-audio',style:'audio',label:'聽出斷續',title:'通話出了甚麼問題？',intro:'先聽示範，不看英文。',model:'The audio is choppy.',zh:'聲音斷斷續續。',audioOnly:true,questions:['native-256-v2-audio']},
  {id:'native-256-v2-contrast',style:'contrast',label:'對照音量',title:'小聲和斷續不同',intro:'用通話中的具體聲音判斷。',questions:['native-256-v2-contrast']},
  {id:'native-256-v2-rewrite',style:'rewrite',label:'改寫訊息',title:'會議聊天欄提醒',intro:'寫得讓對方知道該處理甚麼。',questions:['native-256-v2-rewrite']},
  {id:'native-256-v2-speak',style:'speak',label:'即時提醒',title:'告訴對方聲音斷續',intro:'先自己說；錄音或跳過後才聽示範。',model:'The audio is choppy.',zh:'聲音斷斷續續。',speakingPrompt:'同事說話時有幾個字不斷被截掉。用一句英文指出通話聲音問題。',recording:'phrase',questions:[]},
  {id:'native-256-v2-final',style:'final',label:'面試挑戰',title:'禮貌請對方重說',intro:'自行寫兩句，再對照示例檢查。',questions:['native-256-v2-final']}
];
export default {revision:2,summary:'分清通話聲音斷續與單純音量小，並禮貌請對方重複沒聽清的內容。',steps,questions,takeaways:['The audio is choppy.'],completionTitle:'你能在通話中指出斷續聲音，並清楚請對方重說。'};
