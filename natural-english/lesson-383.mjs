import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-383-v2-audio','audio','聽完後，哪個零件沒電？',['車鑰匙遙控器裏的電池。','整輛車的主電池。','車庫門遙控器裏的電池。','車門鎖裏的電池。'],'車鑰匙遙控器裏的電池。','key fob 是車鑰匙遙控器；句子沒有說整輛車的電池沒電。'),
  mc('native-383-v2-detail','detail','車門不回應遙控按鈕，但車仍可發動。哪個細節最支持這句？',['遙控器按鈕失效，備用鑰匙可以開門。','車燈全暗，引擎也完全無法發動。','輪胎壓力偏低，但遙控器正常。','車門有刮痕，遙控器正常。'],'遙控器按鈕失效，備用鑰匙可以開門。','備用鑰匙可用、車可發動，把問題縮小到 key fob 而非主電池。'),
  mc('native-383-v2-scene','scene','同伴問「Is the car battery dead?」但你發現只有遙控器不工作。怎樣澄清？',["No, the car starts. My key fob battery is dead.","Yes, both the car and the fob are dead.","No, the tires have no air.","Yes, the car battery must be dead because the radio is on."],"No, the car starts. My key fob battery is dead.",'先用車可發動排除主電池，再指出遙控器電池，避免對方修錯部位。'),
  open('native-383-v2-final','final','新情境：停車場裏按遙控器解鎖沒有反應，但車可用備用鑰匙開門。寫兩句英文告訴同行的人你觀察到甚麼，以及你懷疑甚麼問題。',["The car won't unlock when I press the remote, but the spare key works. I think my key fob battery is dead.","The key fob isn't responding to the unlock button. The car itself is fine, so its battery may be dead.","I can open the car with the spare key, but the remote does nothing. My key fob battery is probably dead."],'自評時要交代遙控器沒有反應與備用鑰匙可用，並把沒電的對象說成 key fob。')
];
const steps=[
  {id:'native-383-v2-audio',style:'audio',label:'聽故障部位',title:'哪一顆電池？',intro:'先辨認沒電的是遙控器還是整輛車。',model:'My key fob battery is dead.',zh:'我的車鑰匙遙控器電池沒電了。',audioOnly:true,questions:['native-383-v2-audio']},
  {id:'native-383-v2-detail',style:'detail',label:'看故障線索',title:'車還能發動',intro:'用備用鑰匙和引擎狀態縮小問題。',questions:['native-383-v2-detail']},
  {id:'native-383-v2-scene',style:'scene',label:'回應同伴',title:'澄清不是主電池',intro:'在對話中直接指出是哪個裝置失效。',questions:['native-383-v2-scene']},
  {id:'native-383-v2-speak',style:'speak',label:'口頭說故障',title:'遙控器沒電',intro:'先自己說；錄音或跳過後才聽示範。',model:'My key fob battery is dead.',zh:'我的車鑰匙遙控器電池沒電了。',speakingPrompt:'按解鎖鈕沒有反應，說明哪個電池沒電。',recording:'phrase',questions:[]},
  {id:'native-383-v2-final',style:'final',label:'停車場挑戰',title:'觀察與推測',intro:'寫清遙控器反應和備用鑰匙線索。',questions:['native-383-v2-final']}
];
export default {revision:2,summary:'用 key fob battery 指車鑰匙遙控器電池，避免誤說整輛車的電池沒電。',steps,questions,takeaways:['My key fob battery is dead.'],completionTitle:'你能準確指出遙控器電池故障。'};
