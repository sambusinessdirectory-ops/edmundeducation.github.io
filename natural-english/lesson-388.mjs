import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-388-v2-audio','audio','聽完後，說話者哪裏受反覆摩擦？',['大腿內側。','腳後跟。','兩隻手掌。','膝蓋骨。'],'大腿內側。','thighs 指大腿；此情境中的 chafed 是走路時皮膚互相摩擦而紅痛。'),
  mc('native-388-v2-contrast','contrast','長時間步行後大腿內側互相磨痛；哪句比「My heel is chafed」準確？',['My thighs are chafed.','My heel is chafed.','My ankles are twisted.','My knees are bruised.'],'My thighs are chafed.','同樣是 chafed，但必須把身體部位由腳後跟換成大腿。'),
  mc('native-388-v2-reverse','reverse','把「我走太久，大腿內側磨到紅痛」自然說成英文，哪句最好？',['My thighs are chafed from walking so much.','My thighs are scratched by a pencil.','My heels are chafed from typing.','My knees are wet from walking.'],'My thighs are chafed from walking so much.','thighs 對應大腿，from walking so much 交代反覆摩擦的來源。'),
  mc('native-388-v2-rewrite','rewrite','原稿「My legs hurt」太籠統；哪句能說出位置與原因？',['My inner thighs are chafed from all the walking.','My legs are missing after the walk.','My knees are cold because the room is cool.','My calves are sore from lifting boxes.'],'My inner thighs are chafed from all the walking.','inner thighs 和 from all the walking 把摩擦位置與情境說得具體。'),
  open('native-388-v2-final','final','新情境：旅行一整天走很多路，大腿內側磨得紅痛，你打算先休息。寫兩句英文告訴同行者身體狀況和你的安排。',["My inner thighs are chafed from walking all day. I need to sit down for a while.","I've walked so much that my thighs are chafed. Let's take a short break before we continue.","My thighs are sore and chafed after today's long walk. I'm going to rest for a bit."],'自評時要指出大腿內側與長時間摩擦，再寫出當下的休息安排。')
];
const steps=[
  {id:'native-388-v2-audio',style:'audio',label:'聽身體部位',title:'哪裏被磨痛？',intro:'先辨認是大腿，不要沿用上一課的腳後跟。',model:'My thighs are chafed.',zh:'我的大腿內側磨紅痛了。',audioOnly:true,questions:['native-388-v2-audio']},
  {id:'native-388-v2-contrast',style:'contrast',label:'後跟與大腿',title:'換對部位',intro:'同一動詞也要配合實際部位。',questions:['native-388-v2-contrast']},
  {id:'native-388-v2-reverse',style:'reverse',label:'由中文說英文',title:'走太久磨痛',intro:'把位置和行走原因一起表達。',questions:['native-388-v2-reverse']},
  {id:'native-388-v2-rewrite',style:'rewrite',label:'改寫籠統句',title:'不只說 legs hurt',intro:'補上大腿內側和反覆摩擦。',questions:['native-388-v2-rewrite']},
  {id:'native-388-v2-speak',style:'speak',label:'口頭說明',title:'大腿磨傷',intro:'先自己說；錄音或跳過後才聽示範。',model:'My thighs are chafed.',zh:'我的大腿內側磨紅痛了。',speakingPrompt:'走太久，大腿內側被磨得紅痛，簡短描述。',recording:'phrase',questions:[]},
  {id:'native-388-v2-final',style:'final',label:'旅行新情境',title:'描述並提出休息',intro:'寫出部位、原因和休息安排。',questions:['native-388-v2-final']}
];
export default {revision:2,summary:'用 My thighs are chafed 描述長時間行走後大腿內側摩擦紅痛。',steps,questions,takeaways:['My thighs are chafed.'],completionTitle:'你能具體描述大腿內側磨傷。'};
