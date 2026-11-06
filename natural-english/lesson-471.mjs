import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-471-v2-audio','audio','只聽相機出了甚麼狀況。鏡頭變得怎樣？',['表面起霧，畫面模糊。','鏡片碎裂。','對焦環卡住。','電池耗盡。'],'表面起霧，畫面模糊。','fogged up 指鏡頭表面因溫差蒙上一層霧，不是機械或電池故障。'),
  mc('native-471-v2-scene','scene','從寒冷戶外走進暖室內，相機鏡片一片白濛濛，稍等可能消退。哪句最準？',["The lens fogged up.","The lens cracked in the cold.","The camera lost focus permanently.","The lens is covered in fingerprints."],"The lens fogged up.",'溫差引起短暫霧氣是 fogged up；裂痕與指紋不會隨溫度自然消退。'),
  mc('native-471-v2-contrast','contrast','照片突然朦朧，但你看到鏡片外面有霧珠，沒有刮痕。要先描述哪個問題？',["The lens fogged up.","The lens is scratched.","The sensor is dirty.","The focus setting is wrong."],"The lens fogged up.",'鏡片表面的霧可見，先描述觀察到的成因，而非猜測感光元件或設定。'),
  mc('native-471-v2-rewrite','rewrite','把 The camera is broken 改成實際可觀察的短暫問題。',["The lens fogged up when I came inside.","The camera is permanently damaged.","The lens has shattered near the edge.","The battery won't charge anymore."],"The lens fogged up when I came inside.",'交代鏡頭起霧及走進室內的溫差，比籠統說相機壞了準確。'),
  mc('native-471-v2-reverse','reverse','同伴說 Give it a minute to clear up。對方預期鏡頭上的甚麼會改變？',['霧氣慢慢散去。','裂痕自行修復。','電池自己充滿。','指紋變成刮痕。'],'霧氣慢慢散去。','clear up 在起霧情境指白濛濛的霧層消散，畫面重新清晰。'),
  open('native-471-v2-final','final','新場景：你從冷氣很強的房間帶相機到潮濕室外，鏡頭立刻起霧。寫兩句英文描述問題，並請同伴等一會兒再拍照。',["The lens fogged up when we came outside. Give it a minute to clear up before we take the picture.","There's fog on the lens from the temperature change. Let's wait for it to clear up."],'說明鏡頭起霧及溫差情境，再提出等霧散的下一步。')
];
const steps=[
  {id:'native-471-v2-audio',style:'audio',label:'先聽影像',title:'鏡頭白濛濛',intro:'判斷相機哪裏有問題。',model:'The lens fogged up.',zh:'鏡頭起霧了。',audioOnly:true,questions:['native-471-v2-audio']},
  {id:'native-471-v2-scene',style:'scene',label:'跨過溫差',title:'從冷到暖',intro:'看短暫霧氣的原因。',questions:['native-471-v2-scene']},
  {id:'native-471-v2-contrast',style:'contrast',label:'可見的霧',title:'先說觀察',intro:'不要猜成別種故障。',questions:['native-471-v2-contrast']},
  {id:'native-471-v2-rewrite',style:'rewrite',label:'改掉 broken',title:'短暫而非損壞',intro:'說清楚鏡片表面。',questions:['native-471-v2-rewrite']},
  {id:'native-471-v2-reverse',style:'reverse',label:'等它散去',title:'clear up',intro:'由建議回推霧氣變化。',model:'Give it a minute to clear up.',zh:'等一會兒讓霧散掉。',questions:['native-471-v2-reverse']},
  {id:'native-471-v2-final',style:'final',label:'外拍挑戰',title:'先等一分鐘',intro:'寫出問題與拍攝決定。',questions:['native-471-v2-final']}
];
export default {revision:2,summary:'用 fogged up 描述鏡頭因溫差起霧，並提出等它消散再拍。',steps,questions,takeaways:['The lens fogged up.','Give it a minute to clear up.'],completionTitle:'你能說明鏡頭起霧並建議稍等。'};
