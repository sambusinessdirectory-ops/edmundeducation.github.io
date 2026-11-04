import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-124-v2-audio','audio','只聽店員說的話。這杯飲料如何計費？',['店家招待，不收錢。','由你們一行人當中另一位結帳。','加入套餐但仍需付款。','算進服務費。'],'店家招待，不收錢。','on the house 表示店家請客，常用於餐廳或酒吧。'),
  mc('native-124-v2-detail','detail','經理說這杯 on the house。帳單上還有主菜和甜品。哪種理解最準確？',['這杯免費，其他項目仍可能收費。','整張帳單全部免費。','飲料以折扣價出售。','飲料免費，但主菜收正常價。'],'這杯免費，其他項目仍可能收費。','this one 指明被招待的是這杯；不要擴大成整餐免單。'),
  mc('native-124-v2-tone','tone','等餐太久後，店員送來免費飲料。哪句回覆自然又有禮？',["Thank you, that's very kind of you.","Thank you, but could we still discuss the delay?","Thanks. Could you also comp our appetizers?","That's kind; is the dessert included too?"],"Thank you, that's very kind of you.",'店員已表示這杯免費，簡短致謝就能接受好意；這不代表整餐都獲免單。'),
  open('native-124-v2-final','final','最後挑戰：酒吧調錯了你的飲料，調酒師重做一杯並說這杯免費。朋友問你需不需要付這杯錢。寫兩句英文回答和解釋原因。',["No, this one's on the house. They made the first drink wrong, so they offered a replacement for free.","I don't have to pay for this drink. The bartender said it's on the house after the mix-up."],'on the house 指店家招待，並清楚限定是哪一杯及原因。')
];
const steps=[
  {id:'native-124-v2-audio',style:'audio',label:'聽出招待',title:'誰請這杯？',intro:'只聽店員一句話。',model:'It’s on the house.',zh:'這杯由店家招待。',audioOnly:true,questions:['native-124-v2-audio']},
  {id:'native-124-v2-detail',style:'detail',label:'只免哪項',title:'別把整餐都算免費',intro:'注意指代範圍。',questions:['native-124-v2-detail']},
  {id:'native-124-v2-tone',style:'tone',label:'得體回覆',title:'接受店家的好意',intro:'選擇自然的應答。',questions:['native-124-v2-tone']},
  {id:'native-124-v2-speak',style:'speak',label:'口頭轉述',title:'告訴朋友飲料免費',intro:'先自己說；錄音或跳過後才聽示範。',model:'They comped our drinks.',zh:'他們免了飲料費。',speakingPrompt:'店員說飲料由店家招待。向剛回座位的朋友轉述。',recording:'phrase',questions:[]},
  {id:'native-124-v2-final',style:'final',label:'酒吧挑戰',title:'調錯後的招待',intro:'自己解釋這杯為何免費。',questions:['native-124-v2-final']}
];
export default {revision:2,summary:'理解 on the house 是店家招待指定品項，能禮貌回應並說明免單原因。',steps,questions,takeaways:['It’s on the house.','They comped our drinks.'],completionTitle:'你能聽懂店家的招待，並說清楚免的是哪一項。'};
