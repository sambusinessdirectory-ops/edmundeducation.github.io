import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-469-v2-audio','audio','只聽麻醉後的變化。感覺正往哪個方向走？',['麻木感逐漸消退。','麻木感剛開始。','疼痛突然完全消失。','嘴唇變得更腫。'],'麻木感逐漸消退。','wearing off 表示藥效漸退，所以感覺慢慢回來。'),
  mc('native-469-v2-detail','detail','補牙後起初完全沒感覺，現在嘴唇有一點觸感但仍不完全正常。哪句最準？',["The numbness is wearing off.","The numbness has just started.","The numbness is getting stronger.","The feeling has disappeared again."],"The numbness is wearing off.",'觸感逐漸回來是麻木感正在消退，不等於已完全恢復。'),
  mc('native-469-v2-explain','explain','The numbness is wearing off 不表示哪件事？',['所有感覺已完全恢復。','麻醉效果正在變弱。','嘴部感覺開始回來。','麻木程度比剛才輕。'],'所有感覺已完全恢復。','wearing off 是進行中的漸退，不保證此刻已完全恢復。'),
  open('native-469-v2-speak','speak','牙醫麻醉後你開始感到嘴唇碰到杯沿。先口頭說出變化，再聽示範。',["The numbness is wearing off.","I can feel my lip again; the numbness is wearing off."],'用 is wearing off 表示感覺正在回來的過程。'),
  open('native-469-v2-final','final','新場景：牙醫麻醉後兩小時，你從完全沒感覺變成可以感覺到嘴唇，但仍有點麻。寫兩句英文描述變化，並回答朋友是否完全恢復。',["The numbness is wearing off, and I can feel my lip a little now. It's not completely gone yet.","I can feel my mouth again, so the numbness is wearing off. I'm still a bit numb, though."],'wearing off 說麻木感正在減輕，觸感逐漸回來；仍有點麻就不能說已完全恢復，也不必推斷何時會完全消退。')
];
const steps=[
  {id:'native-469-v2-audio',style:'audio',label:'先聽變化',title:'麻醉後一段時間',intro:'判斷麻木正在加深還是消退。',model:'The numbness is wearing off.',zh:'麻木感正在消退。',audioOnly:true,questions:['native-469-v2-audio']},
  {id:'native-469-v2-detail',style:'detail',label:'感覺回來一點',title:'尚未完全正常',intro:'從時間線判斷。',questions:['native-469-v2-detail']},
  {id:'native-469-v2-explain',style:'explain',label:'理解漸退',title:'不是一下子消失',intro:'分清過程與結果。',questions:['native-469-v2-explain']},
  {id:'native-469-v2-speak',style:'speak',label:'口頭報告',title:'碰到杯沿',intro:'先說再核對示範。',model:'The numbness is wearing off.',zh:'麻木感正在消退。',speakingPrompt:'嘴唇觸感開始回來，先口頭說明變化。',recording:'phrase',questions:['native-469-v2-speak']},
  {id:'native-469-v2-final',style:'final',label:'恢復挑戰',title:'仍有點麻',intro:'寫出漸退但未完全消失。',model:'Can you feel your mouth again?',zh:'你能感覺到嘴巴了嗎？',questions:['native-469-v2-final']}
];
export default {revision:2,summary:'用 wearing off 說麻醉造成的麻木感逐漸消退，尚未必完全恢復。',steps,questions,takeaways:['The numbness is wearing off.','Can you feel your mouth again?'],completionTitle:'你能描述麻木感逐漸消退的過程。'};
