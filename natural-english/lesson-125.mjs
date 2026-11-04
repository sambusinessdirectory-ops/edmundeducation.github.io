import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-125-v2-audio','audio','只聽餐廳的情況。兩桌之間出了甚麼錯？',['彼此的餐點被弄反了。','兩桌都沒有訂餐。','兩桌各被多收一次錢。','兩桌訂的餐點都遲了。'],'彼此的餐點被弄反了。','mixed up our orders 指將訂單或餐點搞混，不等於漏單或重複收費。'),
  mc('native-125-v2-repair','repair','服務生端來別桌的意粉，你說 They forgot our order。怎樣改得更準確？',["They mixed up our orders.","They comped our order.","They forgot part of our order.","They brought us the wrong dish."],"They mixed up our orders.",'送來別桌食物表示訂單弄混；forgot our order 則是沒有處理你的單。'),
  mc('native-125-v2-branch','branch','你看到別桌拿著你點的咖喱。店員問 Is everything okay? 哪句同時指出兩桌訂單可能弄反，及你的餐點去了哪裡？',["I think our orders got mixed up—that table has our curry.","We ordered curry, but this looks like pasta.","Could you bring our curry when it's ready?","This dish isn't ours; could you check?"],"I think our orders got mixed up—that table has our curry.",'明說咖喱到了另一桌，店員就能核對兩張訂單；單說「這不是我們的」較難追查。'),
  open('native-125-v2-final','final','最後挑戰：你們桌點了兩份魚，卻收到兩份雞；隔壁桌正拿到你們的魚。店員問餐點是否正確。寫兩句英文禮貌指出問題和請求。',["I think our orders got mixed up. We ordered the fish, but we got chicken—could you check with the other table?","Sorry, these aren't ours. We ordered fish, and it looks like the other table got it."],'說明哪兩桌、哪兩種餐點被弄反，比只說「錯了」更容易處理。')
];
const steps=[
  {id:'native-125-v2-audio',style:'audio',label:'聽出混淆',title:'餐點去了另一桌',intro:'只聽一句，判斷錯誤類型。',model:'They mixed up our orders.',zh:'他們把我們的訂單弄反了。',audioOnly:true,questions:['native-125-v2-audio']},
  {id:'native-125-v2-repair',style:'repair',label:'修正說法',title:'不是忘記下單',intro:'分清漏單與兩桌餐點互換。',questions:['native-125-v2-repair']},
  {id:'native-125-v2-speak',style:'speak',label:'向店員說',title:'禮貌指出問題',intro:'先自己說；錄音或跳過後才聽示範。',model:'I mixed up the dates.',zh:'我把日期弄混了。',speakingPrompt:'你把朋友生日聚會的日期記錯了。向朋友承認。',recording:'phrase',questions:[]},
  {id:'native-125-v2-branch',style:'branch',label:'接住店員',title:'給出可查線索',intro:'選擇最能讓店員處理的下一句。',questions:['native-125-v2-branch']},
  {id:'native-125-v2-final',style:'final',label:'兩桌挑戰',title:'魚與雞送反了',intro:'自己寫清楚落差及請求。',questions:['native-125-v2-final']}
];
export default {revision:2,summary:'用 mixed up our orders 說兩桌餐點弄反，並提供清楚線索協助店員修正。',steps,questions,takeaways:['They mixed up our orders.','I mixed up the dates.'],completionTitle:'你能指出兩桌餐點如何弄混，並讓店員容易跟進。'};
