import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-104-v2-audio','audio','只聽這句話。說話者說的是哪一種「五分鐘」？',
    ['大約再過五分鐘會到。','已經遲到五分鐘。','五分鐘前才出發。','打算在目的地停五分鐘。'],
    '大約再過五分鐘會到。','five minutes away 是離目的地約五分鐘路程，不等於 running five minutes late。'),
  mc('native-104-v2-explain','explain','I’m five minutes away 與 I’m running five minutes late 在約六點的情境中可否當成同一句？',
    ['不能；前者說離抵達還有多久，後者說比約定時間晚多少。','可以；兩句都保證六點準時到。','可以；兩句都表示剛離開家。','不能；前者只能用於飛機。'],
    '不能；前者說離抵達還有多久，後者說比約定時間晚多少。','五分鐘的參照點不同：目的地或約定時間。要按對方問的是甚麼選用。'),
  mc('native-104-v2-tone','tone','朋友在樓下等你。你只是估計還要五分鐘，路況可能有變。哪句表達最準確？',
    ["I'm about five minutes away.","I'm exactly five minutes away, guaranteed.","I'm already at your door.","I'm running five minutes late."],
    "I'm about five minutes away.",'about 留下合理估計空間；沒有證據時別保證精確分鐘，也別把距離和遲到混為一談。'),
  mc('native-104-v2-continue','continue','你傳 I’m five minutes away。朋友回 I’ll wait by the front door。哪句自然接下去？',
    ["Great, see you in a few minutes.","Then I must have arrived yesterday.","I haven't left home yet.","Please wait at another city."],
    "Great, see you in a few minutes.",'對方已告訴你等候位置，你可以簡短確認即將會合。'),
  mc('native-104-v2-rewrite','rewrite','原訊息：I’m running five minutes late。其實你仍會準時，只是離朋友所在位置還有約五分鐘。怎樣改？',
    ["I'm about five minutes away.","I'm already five minutes late.","I just left five minutes ago.","I'll only stay for five minutes."],
    "I'm about five minutes away.",'這裡要說剩餘路程時間，不是遲到幅度；away 才準確。'),
  open('native-104-v2-final','final','最後挑戰：你走到朋友家附近，估計還有約五分鐘。朋友訊息問 Where are you? 用兩句英文回覆：給出大約剩餘時間，並表示很快見面。',
    ["I'm about five minutes away. See you soon!","I'm around five minutes from your place. I'll see you shortly.","I'm close—about five minutes away. See you in a bit."],
    'about five minutes away 給出大約到達時間；第二句自然回應正在等候的人。')
];
const steps=[
  {id:'native-104-v2-audio',style:'audio',label:'聽出距離',title:'再走五分鐘',intro:'先只聽一句話。',model:'I’m five minutes away.',zh:'我離你那邊還有五分鐘。',audioOnly:true,questions:['native-104-v2-audio']},
  {id:'native-104-v2-explain',style:'explain',label:'兩種五分鐘',title:'距離與遲到',intro:'與上一課的遲到訊息作比較。',questions:['native-104-v2-explain']},
  {id:'native-104-v2-tone',style:'tone',label:'留點估計空間',title:'about 讓訊息更誠實',intro:'不把估計說成保證。',questions:['native-104-v2-tone']},
  {id:'native-104-v2-rewrite',style:'rewrite',label:'改準訊息',title:'你其實沒有遲到',intro:'按真實進度選句。',questions:['native-104-v2-rewrite']},
  {id:'native-104-v2-continue',style:'continue',label:'朋友在門口',title:'簡短確認會合',intro:'選一句自然的接話。',questions:['native-104-v2-continue']},
  {id:'native-104-v2-final',style:'final',label:'附近挑戰',title:'很快就到朋友家',intro:'自己回覆，不給選項。',questions:['native-104-v2-final']}
];
export default {revision:2,summary:'用 five minutes away 交代到達尚需多久，分清它與遲到五分鐘。',steps,questions,takeaways:['I’m five minutes away.','I’m about five minutes away.'],completionTitle:'你能把離目的地的時間與遲到幅度分清楚。'};
