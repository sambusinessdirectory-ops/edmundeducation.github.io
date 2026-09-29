import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-359-v2-audio','audio','聽完這句對食物溫度的提醒，問題有多局部？',['其中一處比其餘地方燙得多。','整盤食物同樣燙。','所有地方都還是冰冷。','盒子外側很熱，食物正常。'],'其中一處比其餘地方燙得多。','a hot spot 指局部高溫點，常見於微波加熱不均。'),
  mc('native-359-v2-scene','scene','你吃微波飯，大部分溫度剛好，中間一口卻燙嘴。哪句提醒朋友最準？',["There's a hot spot in the middle.","The entire meal is equally hot.","The meal is frozen solid.","The plate is cracked."],"There's a hot spot in the middle.",'只有中間局部特別燙，因此用單數 a hot spot 並說明位置。'),
  mc('native-359-v2-reverse','reverse','朋友說「There’s a hot spot」。你應理解為甚麼？',['要留意某一處突然較燙。','所有地方都有相同溫度。','食物裏有辣椒。','碗底有燒焦污漬。'],'要留意某一處突然較燙。','spot 在這裏指局部位置，hot 指實際溫度；不是辣度。'),
  mc('native-359-v2-continue','continue','朋友問：「Is it too hot?」你已試過，只有中央一口特別燙。怎樣回答？',["Most of it is fine, but there's a hot spot in the middle.","Every bite is cold, so it needs reheating.","It's spicy, so the bowl must be hot.","I haven't tasted it and can't see it."],"Most of it is fine, but there's a hot spot in the middle.",'先說大部分正常，再指出中央局部高溫，完整回答溫度問題。'),
  open('native-359-v2-transfer-write','transfer','新情境：你微波一碗燕麥，大部分溫度適中，但靠近碗邊的一口突然很燙。寫兩句英文提醒同伴並指出位置。',["Be careful; there's a hot spot near the edge of the bowl. Most of the oats are only warm.","The oatmeal isn't hot everywhere, but one spot near the rim is very hot. Take a smaller bite first.","Most of it is fine. There's a hot spot on this side of the bowl, though."],'自評時看是否指出只有局部特別燙，以及同伴應留意的位置。')
];
const steps=[
  {id:'native-359-v2-audio',style:'audio',label:'聽出局部高溫',title:'只有一口特別燙？',intro:'留意是某一小口特別燙，還是整盤都燙。',model:'There’s a hot spot.',zh:'有一處特別燙。',audioOnly:true,questions:['native-359-v2-audio']},
  {id:'native-359-v2-scene',style:'scene',label:'微波飯',title:'中間那口燙嘴',intro:'按局部位置選提醒。',questions:['native-359-v2-scene']},
  {id:'native-359-v2-reverse',style:'reverse',label:'由詞找溫度',title:'spot 指哪裏？',intro:'分清局部高溫與整盤溫度。',questions:['native-359-v2-reverse']},
  {id:'native-359-v2-continue',style:'continue',label:'回答朋友',title:'大部分其實可以吃',intro:'接着問題說明例外位置。',questions:['native-359-v2-continue']},
  {id:'native-359-v2-transfer',style:'transfer',label:'換到燕麥',title:'碗邊有一口特別燙',intro:'獨立寫兩句，提醒同伴局部高溫。',questions:['native-359-v2-transfer-write']}
];
export default {revision:2,summary:'用 a hot spot 指微波食物某一小處特別燙，而非整盤都燙。',steps,questions,takeaways:['There’s a hot spot.'],completionTitle:'你能指出食物局部高溫並提醒他人小心。'};
