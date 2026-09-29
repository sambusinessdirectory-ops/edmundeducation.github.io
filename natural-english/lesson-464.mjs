import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-464-v2-audio','audio','只聽一句突發情況。說話的人受傷在哪裏？',['舌頭。','口腔內側。','嘴唇外面。','牙齒。'],'舌頭。','bit my tongue 直指吃東西時咬到自己的舌頭。'),
  mc('native-464-v2-detail','detail','吃東西時突然刺痛，說話有點不便，舌尖有咬痕。哪句最具體？',["I bit my tongue.","I bit the inside of my cheek.","I burned my tongue.","I chipped a tooth."],"I bit my tongue.",'舌尖咬痕支持 bit my tongue；燙傷或牙齒破損是別的原因。'),
  mc('native-464-v2-explain','explain','在這個吃飯場景，I bit my tongue 表示甚麼？',['不小心咬到自己的舌頭。','刻意不回應對方。','咬到臉頰內側。','咬壞了食物。'],'不小心咬到自己的舌頭。','雖然 bite my tongue 可有比喻用法，這裏的吃飯與痛感指實際咬傷。'),
  mc('native-464-v2-branch','branch','朋友吃飯時突然喊痛，說 I bit my tongue。你首先怎樣回應較合適？',["Are you okay? Do you need a moment?","Did you bite your cheek instead?","Then you should keep chewing quickly.","Can you finish the meal before stopping?"],"Are you okay? Do you need a moment?",'先關心對方並讓他停一停，避免在疼痛時催促繼續吃。'),
  open('native-464-v2-speak','speak','你吃飯時咬到舌尖，先用英文口頭告訴同桌的人，再聽示範。',["Ow, I bit my tongue.","I just bit my tongue while eating."],'說 bit my tongue 即可表明是自己的舌頭被咬到。'),
  open('native-464-v2-final','final','新場景：吃午飯時你突然咬到舌頭，朋友問你為甚麼停下。寫兩句英文指出發生甚麼事，並表示需要停一會兒。',["I bit my tongue. Give me a moment before I keep eating.","Ow, I just bit my tongue. I need to pause for a minute."],'把疼痛原因定位在舌頭，再自然說明短暫停下來。')
];
const steps=[
  {id:'native-464-v2-audio',style:'audio',label:'先聽疼痛',title:'吃飯時一咬',intro:'辨認受傷部位。',model:'I bit my tongue.',zh:'我咬到舌頭了。',audioOnly:true,questions:['native-464-v2-audio']},
  {id:'native-464-v2-detail',style:'detail',label:'看舌尖',title:'是哪裏痛',intro:'用部位與原因選句子。',questions:['native-464-v2-detail']},
  {id:'native-464-v2-explain',style:'explain',label:'理解語境',title:'字面還是比喻',intro:'在吃飯場景解讀。',questions:['native-464-v2-explain']},
  {id:'native-464-v2-branch',style:'branch',label:'關心朋友',title:'對方突然喊痛',intro:'選合適的即時回應。',model:'Are you okay?',zh:'你還好嗎？',questions:['native-464-v2-branch']},
  {id:'native-464-v2-speak',style:'speak',label:'自己說出來',title:'餐桌上',intro:'先口說，再聽示範。',model:'I bit my tongue.',zh:'我咬到舌頭了。',speakingPrompt:'吃飯時咬到舌尖，先口頭說出發生甚麼事。',recording:'phrase',questions:['native-464-v2-speak']},
  {id:'native-464-v2-final',style:'final',label:'午餐挑戰',title:'暫停一下',intro:'寫原因與下一步。',questions:['native-464-v2-final']}
];
export default {revision:2,summary:'在吃飯語境用 I bit my tongue 描述不小心咬到舌頭。',steps,questions,takeaways:['I bit my tongue.','Are you okay?'],completionTitle:'你能說明咬到舌頭並自然回應關心。'};
