import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-123-v2-audio','audio','只聽帳單處理。飲料最後怎樣收費？',['餐廳免掉了飲料費。','整餐都改成免費。','飲料被店員換成另一款。','把飲料費改成折扣價。'],'餐廳免掉了飲料費。','comped 表示店家免費招待或從帳單免除該項費用。'),
  mc('native-123-v2-transfer','transfer','酒店房間準備好得太晚，經理因此免了你們的早餐費。哪句沿用同一說法？',["They comped our breakfast.","They gave us a discount on breakfast.","They offered to remake our breakfast.","They charged us extra for breakfast."],"They comped our breakfast.",'comp 可用於店家免收某項服務或餐飲費用，並不限於飲料。'),
  mc('native-123-v2-continue','continue','朋友問 Did they charge us for the drinks? 帳單沒有飲料費，哪句回答最直接？',["No, they comped our drinks.","Yes, they charged each drink twice.","No, they gave us a discount but still charged a little.","Not exactly—they gave us a discount on the drinks."],"No, they comped our drinks.",'回答有沒有收費，comped 正好交代店家免單。'),
  open('native-123-v2-final','final','最後挑戰：餐廳讓你們等了很久，經理道歉並免了兩杯飲料費。朋友問最後怎樣處理。寫兩句英文交代原因和補償。',["We had a long wait, so the manager apologized. They comped our drinks.","The service was slow, but they took the drinks off the bill. That was fair."],'把等待原因和飲料免單的補償連起來；comped 不等於整餐免費。')
];
const steps=[
  {id:'native-123-v2-audio',style:'audio',label:'先聽帳單',title:'飲料誰付錢？',intro:'只聽，不先看句子。',model:'They comped our drinks.',zh:'他們免了我們的飲料費。',audioOnly:true,questions:['native-123-v2-audio']},
  {id:'native-123-v2-continue',style:'continue',label:'回答朋友',title:'飲料有收費嗎？',intro:'接住對方對帳單的問題。',questions:['native-123-v2-continue']},
  {id:'native-123-v2-speak',style:'speak',label:'口頭轉述',title:'告訴同行朋友',intro:'先自己說；錄音或跳過後才聽示範。',model:'The drinks were comped.',zh:'飲料已免單。',speakingPrompt:'店家因上菜慢而免掉飲料費。告訴剛回到座位的朋友。',recording:'phrase',questions:[]},
  {id:'native-123-v2-transfer',style:'transfer',label:'換到酒店',title:'早餐也可免單',intro:'把 comp 用到另一項服務。',questions:['native-123-v2-transfer']},
  {id:'native-123-v2-final',style:'final',label:'用餐挑戰',title:'交代補償',intro:'自己寫清楚等待與免單的關係。',questions:['native-123-v2-final']}
];
export default {revision:2,summary:'理解 comped 是店家免除某項費用，能說明服務失誤後的具體補償。',steps,questions,takeaways:['They comped our drinks.','The drinks were comped.'],completionTitle:'你能準確說明店家免了哪一項費用。'};
