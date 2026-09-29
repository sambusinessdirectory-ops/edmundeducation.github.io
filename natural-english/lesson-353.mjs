import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-353-v2-audio','audio','聽完這句對不沾鍋的描述，表面正在怎樣？',['塗層一小片一小片剝落。','鍋裏的食物結成厚塊。','鍋柄正在鬆開。','鍋底有水煮乾。'],'塗層一小片一小片剝落。','flaking off 指表面塗層以小碎片形式脫落。'),
  mc('native-353-v2-detail','detail','哪項觀察最支持 nonstick coating is flaking off？',['鍋面出現小片脫落，露出下面不同顏色的材料。','整個鍋面仍平滑，但食物黏住。','只有鍋底外側被火燻黑。','鍋柄的螺絲會轉動。'],'鍋面出現小片脫落，露出下面不同顏色的材料。','塗層從鍋面脫離是關鍵；食物黏鍋本身未必證明塗層剝落。'),
  mc('native-353-v2-tone','tone','朋友問這個舊鍋是否還好用。你看見塗層碎片，但不想假裝知道所有風險。哪句穩妥？',["I'm not sure. The coating is flaking off, so I may replace it.","It's certainly safe forever; ignore the missing coating.","The whole kitchen has become unusable.","The food is definitely poisoned already."],"I'm not sure. The coating is flaking off, so I may replace it.",'如實報告可見剝落並表達更換意向，不對未知風險下絕對結論。'),
  open('native-353-v2-final','final','新情境：你洗一隻用了多年的不沾鍋，看到鍋面一小片片黑色塗層掉下來。寫兩句英文向室友描述，並提出換鍋。',["The nonstick coating is flaking off in small pieces. I think we should replace the pan.","I found little black flakes coming off the pan's coating. Let's use another pan from now on.","The coating on this old pan has started flaking off. Maybe it's time for a new one."],'自評時看是否指出脫落的是塗層，而不是鍋內食物殘渣，並提出下一步。')
];
const steps=[
  {id:'native-353-v2-audio',style:'audio',label:'聽出剝落',title:'哪一層在掉？',intro:'先聽不沾鍋表面是否一片片剝落。',model:'The coating is flaking off.',zh:'塗層一片片剝落。',audioOnly:true,questions:['native-353-v2-audio']},
  {id:'native-353-v2-detail',style:'detail',label:'看鍋面',title:'小片塗層脫離',intro:'找出真正來自鍋面的碎片。',questions:['native-353-v2-detail']},
  {id:'native-353-v2-tone',style:'tone',label:'回答朋友',title:'不妄下安全結論',intro:'只根據看見的狀況回應。',questions:['native-353-v2-tone']},
  {id:'native-353-v2-speak',style:'speak',label:'口頭描述',title:'告訴室友鍋面剝落',intro:'先自己說；錄音或跳過後才聽示範。',model:'The coating is flaking off.',zh:'塗層一片片剝落。',speakingPrompt:'舊不沾鍋表面有小碎片脫離。簡短告訴室友。',recording:'phrase',questions:[]},
  {id:'native-353-v2-final',style:'final',label:'換鍋挑戰',title:'描述並提出更換',intro:'描述塗層剝落，並提出是否該換鍋。',questions:['native-353-v2-final']}
];
export default {revision:2,summary:'用 flaking off 描述不沾鍋塗層以小片形式剝落，並與食物黏鍋分開。',steps,questions,takeaways:['The coating is flaking off.'],completionTitle:'你能指出鍋面塗層剝落，並向室友提出換鍋。'};
