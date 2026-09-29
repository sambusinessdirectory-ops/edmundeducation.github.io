import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-293-v2-audio','audio','先聽這句關於聲音的話。說話者現在最可能怎樣？',['幾乎發不出聲音。','仍能說話，只是聲音沙啞。','聽力突然變差。','說話聲量正常但語速太快。'],'幾乎發不出聲音。','lost my voice 指失聲或幾乎說不出話，比 hoarse 更嚴重。'),
  mc('native-293-v2-contrast','contrast','你感冒後只能用手機打字回答，張口也幾乎沒有聲。哪句比「My voice is hoarse」更合適？',["I've lost my voice.","My ears are ringing.","My mic level is too low.","My eyes are bloodshot."],"I've lost my voice.",'hoarse 表示聲音沙啞但仍能說；這裏幾乎完全不能發聲。'),
  mc('native-293-v2-scene','scene','同事要你主持早會；你早上完全說不出話。哪句先交代限制？',["I've lost my voice.","I have a mild accent.","I don't know the agenda.","The meeting room is unavailable."],"I've lost my voice.",'這句直接說明不能主持口頭會議的原因；不是內容或場地問題。'),
  mc('native-293-v2-rewrite','rewrite','你要傳訊請同事代讀報告，原稿只寫「I sound strange」。哪句更準確？',["I've lost my voice, so could you present for me today?","I can speak loudly; please listen carefully.","My webcam is broken; can you replace it?","I forgot the report at home."],"I've lost my voice, so could you present for me today?",'把失聲和代讀請求連在一起，讓同事知道實際需要。'),
  open('native-293-v2-final','final','新情境：你昨天喊得太多，今早幾乎發不出聲；今天有一場團隊簡報。寫兩句英文向同事說明並請他代你開場。',["I've lost my voice after yesterday's event. Could you open the presentation for me?","I can barely speak today; I've lost my voice. Would you mind introducing the first slide?","I've lost my voice and can't lead the opening. Could you start the presentation instead?"],'自評時確認你表達的是幾乎失聲，而非單純聲音沙啞，並提出明確協助請求。')
];
const steps=[
  {id:'native-293-v2-audio',style:'audio',label:'聽出嚴重程度',title:'還能說話嗎？',intro:'辨認說話者是聲音沙啞還是幾乎失聲。',model:'I’ve lost my voice.',zh:'我失聲了。',audioOnly:true,questions:['native-293-v2-audio']},
  {id:'native-293-v2-contrast',style:'contrast',label:'與沙啞對照',title:'不只是嗓音粗',intro:'比較 hoarse 和失聲的程度。',questions:['native-293-v2-contrast']},
  {id:'native-293-v2-scene',style:'scene',label:'早會情境',title:'沒法主持發言',intro:'先交代目前的限制。',questions:['native-293-v2-scene']},
  {id:'native-293-v2-rewrite',style:'rewrite',label:'請同事幫忙',title:'把訊息寫清楚',intro:'用具體原因支持代讀請求。',questions:['native-293-v2-rewrite']},
  {id:'native-293-v2-speak',style:'speak',label:'即時口說',title:'向朋友說失聲',intro:'先自己說；錄音或跳過後才聽示範。',model:'I’ve lost my voice.',zh:'我失聲了。',speakingPrompt:'朋友問你為何只能小聲擠出幾個字。用一句英文說明。',recording:'phrase',questions:[]},
  {id:'native-293-v2-final',style:'final',label:'簡報挑戰',title:'請同事代開場',intro:'寫清楚自己失聲，並請同事代為開場。',questions:['native-293-v2-final']}
];
export default {revision:2,summary:'用 lost my voice 說明幾乎無法發聲，與仍能說話但聲音沙啞分開。',steps,questions,takeaways:['I’ve lost my voice.'],completionTitle:'你能說明失聲造成的限制，並提出具體協助請求。'};
