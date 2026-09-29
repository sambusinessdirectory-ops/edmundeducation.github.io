import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-461-v2-audio','audio','只聽眼鏡的問題。戴上後會怎樣？',['兩側鏡腿鬆，眼鏡容易滑。','鏡片有刮痕。','鼻托掉了一個。','鏡框夾得太緊。'],'兩側鏡腿鬆，眼鏡容易滑。','arms on my glasses 是兩邊鏡腿；loose 指它們鬆動。'),
  mc('native-461-v2-contrast','contrast','眼鏡往下滑，兩邊鏡腿輕輕晃；鼻托仍在。向眼鏡店說哪句最準？',["The arms on my glasses are loose.","One of the nose pads fell off.","The lenses are loose in the frame.","The bridge is too narrow."],"The arms on my glasses are loose.",'症狀集中在鏡腿；nose pads、lenses 和 bridge 指其他部位。'),
  mc('native-461-v2-rewrite','rewrite','把 My glasses are broken 改得更具體：眼鏡完整，但鏡腿變鬆。哪句好？',["The temples are a little loose.","The frames snapped near the temples.","The lenses need replacing.","The glasses are too strong for me."],"The temples are a little loose.",'temples 也是鏡腿的名稱；a little loose 比籠統說 broken 更準。'),
  open('native-461-v2-speak','speak','眼鏡戴着會往下滑。先口頭向店員指出哪個部位鬆了，再聽示範。',["The arms on my glasses are loose.","The temples on my glasses feel loose."],'用 arms 或 temples 明確指出兩側鏡腿，而不是鏡片度數。'),
  open('native-461-v2-final','final','新場景：你到眼鏡店，眼鏡沒壞卻總從鼻樑滑下來。寫兩句英文說明兩側鏡腿的問題並請店員調整。',["The arms on my glasses are loose, so they keep sliding down. Could you adjust them for me?","The temples feel a little loose and the glasses won't stay in place. Could you tighten them?"],'指出鬆的是兩邊鏡腿，並提出調整請求；不要誤說鏡片或鼻托脫落。')
];
const steps=[
  {id:'native-461-v2-audio',style:'audio',label:'先聽部位',title:'眼鏡往下滑',intro:'聽出哪個部分鬆了。',model:'The arms on my glasses are loose.',zh:'眼鏡兩邊鏡腿鬆了。',audioOnly:true,questions:['native-461-v2-audio']},
  {id:'native-461-v2-contrast',style:'contrast',label:'找出部位',title:'鏡腿還是鼻托',intro:'比對眼前症狀。',questions:['native-461-v2-contrast']},
  {id:'native-461-v2-rewrite',style:'rewrite',label:'說得更具體',title:'眼鏡並沒斷',intro:'把籠統抱怨改準。',model:'The temples are a little loose.',zh:'鏡腿有點鬆。',questions:['native-461-v2-rewrite']},
  {id:'native-461-v2-speak',style:'speak',label:'先口說',title:'向店員描述',intro:'說完再聽示範。',model:'The arms on my glasses are loose.',zh:'眼鏡兩邊鏡腿鬆了。',speakingPrompt:'眼鏡容易下滑，先向店員口頭說明鏡腿鬆了。',recording:'phrase',questions:['native-461-v2-speak']},
  {id:'native-461-v2-final',style:'final',label:'眼鏡店挑戰',title:'請店員調整',intro:'寫出症狀與請求。',questions:['native-461-v2-final']}
];
export default {revision:2,summary:'用 arms 或 temples 具體說眼鏡兩側鏡腿變鬆。',steps,questions,takeaways:['The arms on my glasses are loose.','The temples are a little loose.'],completionTitle:'你能指出鏡腿鬆動並請人調整。'};
