import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-390-v2-audio','audio','聽完後，說話者吃辣後哪裏有灼熱感？',['整個口腔。','只有舌尖。','只有喉嚨。','只有嘴唇外側。'],'整個口腔。','my mouth is burning 指嘴巴有灼熱感；不一定只限舌頭一處。'),
  mc('native-390-v2-contrast','contrast','辣椒令嘴唇、舌頭和口腔裏都火辣辣。哪句比只說 tongue 更全面？',['My mouth is burning.','My tongue is burning.','My throat feels scratchy.','My lips are chafed.'],'My mouth is burning.','mouth 涵蓋整體口腔；tongue 只指出舌頭，縮小了不適範圍。'),
  mc('native-390-v2-detail','detail','你向朋友說「My mouth is burning」。哪個背景最能解釋這句？',['剛咬了一口很辣的辣椒。','走路太久，大腿磨痛。','耳朵裏有水一直出不來。','木桌上留下白色圓印。'],'剛咬了一口很辣的辣椒。','辣椒帶來的灼熱感與 mouth is burning 相符；其他背景涉及不同部位。'),
  mc('native-390-v2-rewrite','rewrite','原稿「The food burned my mouth」可能令人以為食物太燙；要說辣味灼熱，哪句更清楚？',['This chili is so spicy that my mouth is burning.','The soup was too hot and burned my lip.','My mouth was burned by boiling tea.','My mouth has no taste today.'],'This chili is so spicy that my mouth is burning.','加上 spicy 明確指辣味造成的火辣感，避免與高溫燙傷混淆。'),
  open('native-390-v2-final','final','新情境：朋友讓你試一口辣醬，你沒想到那麼辣，整個口腔火辣辣。寫兩句英文告訴朋友你的感覺，並請對方遞一杯水。',["That sauce is much spicier than I expected, and my mouth is burning. Could you pass me some water?","Wow, my mouth is burning after that bite of hot sauce. Can you hand me a glass of water?","I didn't expect the sauce to be this spicy. My mouth is burning; could I have some water?"],'自評時要把灼熱感連到辣醬，並用禮貌句提出拿水的請求。')
];
const steps=[
  {id:'native-390-v2-audio',style:'audio',label:'聽灼熱範圍',title:'整個嘴巴還是舌頭？',intro:'先辨認說話者指的是整個口腔。',model:'My mouth is burning.',zh:'我的嘴巴火辣辣的。',audioOnly:true,questions:['native-390-v2-audio']},
  {id:'native-390-v2-contrast',style:'contrast',label:'口腔與舌頭',title:'範圍有多大？',intro:'按灼熱的位置選 mouth 或 tongue。',questions:['native-390-v2-contrast']},
  {id:'native-390-v2-detail',style:'detail',label:'找辣味線索',title:'甚麼引起灼熱？',intro:'把口腔感覺連到可能背景。',questions:['native-390-v2-detail']},
  {id:'native-390-v2-rewrite',style:'rewrite',label:'避免燙傷歧義',title:'說明是辣而非燙',intro:'補上 spicy 讓原因清楚。',questions:['native-390-v2-rewrite']},
  {id:'native-390-v2-final',style:'final',label:'試辣醬新情境',title:'描述並請拿水',intro:'寫出辣度出乎意料及你的請求。',questions:['native-390-v2-final']}
];
export default {revision:2,summary:'用 My mouth is burning 描述辣味造成的口腔灼熱，並與高溫燙傷區分。',steps,questions,takeaways:['My mouth is burning.'],completionTitle:'你能清楚說明辣味造成的灼熱感。'};
