import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-465-v2-audio','audio','只聽剛吃飯時的痛呼。咬到哪裏？',['臉頰內側。','舌尖。','下唇。','牙齦。'],'臉頰內側。','inside of my cheek 精確指口腔內側的頰肉。'),
  mc('native-465-v2-scene','scene','吃東西時左邊口腔內壁突然被牙齒夾到，舌頭沒事。怎樣說？',["I bit the inside of my cheek.","I bit my tongue.","I cut the outside of my cheek.","My jaw cramped up."],"I bit the inside of my cheek.",'受傷在臉頰內側而非舌頭或臉外，inside of my cheek 才準確。'),
  mc('native-465-v2-transfer','transfer','隔天同一處仍疼，朋友問你是不是咬到舌頭。如何澄清？',["No, I bit the inside of my cheek yesterday.","Yes, I bit my tongue yesterday.","No, I burned my cheek on hot soup.","Yes, my jaw locked yesterday."],"No, I bit the inside of my cheek yesterday.",'用 inside of my cheek 修正部位；yesterday 表示事件已發生。'),
  mc('native-465-v2-continue','continue','朋友說 Ow! I just bit the inside of my cheek。你想先關心而不猜測病情，怎樣接？',["That sounds painful. Do you want to pause for a moment?","Then your tongue must be bleeding.","You should keep eating before it gets cold.","Was the food too spicy for you?"],"That sounds painful. Do you want to pause for a moment?",'回應他剛咬到頰肉的痛感並讓他停一下，避免誤判其他原因。'),
  open('native-465-v2-speak','speak','咬到嘴裏靠近左臉頰的肉。先口頭用英文說明部位，再核對示範。',["I bit the inside of my cheek.","Ow, I just bit the inside of my cheek."],'inside of my cheek 把口腔內側和臉外皮膚區分開。'),
  open('native-465-v2-final','final','新場景：你一邊聊天一邊咀嚼，不小心咬到臉頰內側。同伴以為你咬到舌頭。寫兩句英文澄清部位，並說你要慢一點吃。',["I didn't bite my tongue; I bit the inside of my cheek. I'll eat more slowly for a bit.","It was the inside of my cheek, not my tongue. I need to slow down while chewing."],'清楚更正咬到的部位，再給出符合情境的下一步。')
];
const steps=[
  {id:'native-465-v2-audio',style:'audio',label:'先聽部位',title:'吃飯時一痛',intro:'分辨舌頭與頰肉。',model:'I bit the inside of my cheek.',zh:'我咬到口腔內側了。',audioOnly:true,questions:['native-465-v2-audio']},
  {id:'native-465-v2-scene',style:'scene',label:'定位傷口',title:'左邊口腔內壁',intro:'把症狀說準。',questions:['native-465-v2-scene']},
  {id:'native-465-v2-transfer',style:'transfer',label:'隔天澄清',title:'不是舌頭',intro:'改用過去時間敘述。',questions:['native-465-v2-transfer']},
  {id:'native-465-v2-continue',style:'continue',label:'關心同伴',title:'對方突然喊痛',intro:'接住即時反應。',model:'Ow! I just bit the inside of my cheek.',zh:'痛！我剛咬到口腔內側。',questions:['native-465-v2-continue']},
  {id:'native-465-v2-speak',style:'speak',label:'自己口說',title:'指出哪裏痛',intro:'先說再聽示範。',model:'I bit the inside of my cheek.',zh:'我咬到口腔內側了。',speakingPrompt:'口腔左側頰肉被咬到，先口頭指出部位。',recording:'phrase',questions:['native-465-v2-speak']},
  {id:'native-465-v2-final',style:'final',label:'邊聊邊吃',title:'更正朋友',intro:'寫出澄清和下一步。',questions:['native-465-v2-final']}
];
export default {revision:2,summary:'用 the inside of my cheek 準確說明咬到口腔內側，而非舌頭。',steps,questions,takeaways:['I bit the inside of my cheek.','Ow! I just bit the inside of my cheek.'],completionTitle:'你能區分頰肉與舌頭，說清受傷位置。'};
