import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-467-v2-audio','audio','只聽上台前的身體反應。哪裏出汗？',['手心。','額頭。','後背。','腳底。'],'手心。','palms 是手掌內側；sweaty 表示手心濕。'),
  mc('native-467-v2-repair','repair','朋友以為你是淋雨手濕，但你是演講前緊張出汗。怎樣改得準確？',["My palms are sweaty because I'm nervous.","My hands got wet in the rain.","My fingers are cold from the weather.","My palms are dirty from the marker."],"My palms are sweaty because I'm nervous.",'指出手心出汗與演講前緊張的關係，排除淋雨造成手濕、天氣寒冷或墨水弄髒。'),
  mc('native-467-v2-tone','tone','同伴見你不停擦手，想關心而不嘲笑，哪句最合適？',["Are you nervous about the presentation?","Why can't you stop sweating?","Everyone can see your hands; that's embarrassing.","Your hands are wet, so you must be ill."],"Are you nervous about the presentation?",'溫和詢問可能原因，讓對方選擇是否回答；避免嘲笑或擅自判斷病情。'),
  open('native-467-v2-speak','speak','上台前手心濕得握不住講稿。先口頭說明身體反應，再聽示範。',["My palms are sweaty.","My palms are getting sweaty before the presentation."],'palms 指手掌內側，也就是握講稿時碰到紙的部分，不是整條手臂或手背。'),
  open('native-467-v2-final','final','新場景：面試前你因緊張而手心出汗，朋友問你怎樣了。寫兩句英文說明身體反應和原因。',["My palms are sweaty. I think I'm nervous about the interview.","My hands are fine, but my palms are sweaty because I'm anxious about the interview."],'交代出汗位置與緊張情境，避免把手濕誤說成淋雨。')
];
const steps=[
  {id:'native-467-v2-audio',style:'audio',label:'先聽反應',title:'上台之前',intro:'辨認出汗的位置。',model:'My palms are sweaty.',zh:'我的手心在出汗。',audioOnly:true,questions:['native-467-v2-audio']},
  {id:'native-467-v2-repair',style:'repair',label:'不是淋雨',title:'緊張的汗',intro:'改成準確原因。',questions:['native-467-v2-repair']},
  {id:'native-467-v2-tone',style:'tone',label:'關心同伴',title:'對方不停擦手',intro:'選不帶責備的問法。',model:'Are you nervous?',zh:'你緊張嗎？',questions:['native-467-v2-tone']},
  {id:'native-467-v2-speak',style:'speak',label:'自己口說',title:'握講稿前',intro:'先說再聽示範。',model:'My palms are sweaty.',zh:'我的手心出汗了。',speakingPrompt:'面對演講感到緊張，先口頭說手心的反應。',recording:'phrase',questions:['native-467-v2-speak']},
  {id:'native-467-v2-final',style:'final',label:'面試挑戰',title:'向朋友解釋',intro:'寫兩句說感覺與原因。',questions:['native-467-v2-final']}
];
export default {revision:2,summary:'用 My palms are sweaty 說緊張時手心出汗，並自然回應關心。',steps,questions,takeaways:['My palms are sweaty.','Are you nervous?'],completionTitle:'你能描述緊張時手心出汗。'};
