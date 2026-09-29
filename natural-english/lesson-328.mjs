import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-328-v2-audio','audio','只聽這句話。那筆信用卡扣款發生甚麼變化？',
    ['交易被撤銷或沖回。','只是仍待處理。','銀行新加了一筆費用。','卡已永久註銷。'],
    '交易被撤銷或沖回。','The charge was reversed 說原先的扣款被反向處理；不是只說它還在 pending。'),
  mc('native-328-v2-contrast','contrast','The refund is pending 和 The charge was reversed 能否隨意互換？',
    ['不能；前者說退款仍在處理，後者說扣款已被撤銷。','可以；兩句都只表示尚未提出任何要求。','可以；兩句都表示卡被凍結。','不能；reversed 只可形容現金提款。'],
    '不能；前者說退款仍在處理，後者說扣款已被撤銷。','pending 和 was reversed 指不同的處理狀態；避免把「正在等」說成「已沖回」。'),
  mc('native-328-v2-rewrite','rewrite','你昨天在帳戶看到一筆扣款，今天銀行已標示 reversed。哪則訊息沒有把它誤報為普通退款？',
    ["The charge from yesterday was reversed.","The charge is still pending approval.","The bank just froze my whole card.","The merchant charged me again today."],
    "The charge from yesterday was reversed.",'直接報告原扣款被沖回；其他句子說待批、凍卡或再扣款，與所見不同。'),
  open('native-328-v2-final','final','最後挑戰：你昨天看到一筆重複的卡付款項，今天帳戶顯示其中一筆已被撤銷。朋友問你現在情況如何。用兩句英文報告哪筆交易有變化，並說出你仍會查看帳戶確認。',
    ["One of the duplicate charges was reversed. I'll check my account to make sure the other charge is correct.","The extra charge from yesterday was reversed. I'm going to verify my statement later.","It looks like the duplicate charge was reversed. I'll keep an eye on the account to confirm."],
    '用 was reversed 報告已看到的撤銷狀態；再說會核對帳戶，不把撤銷與整張卡失效混為一談。')
];
const steps=[
  {id:'native-328-v2-audio',style:'audio',label:'聽出交易變化',title:'扣款被沖回',intro:'先只聽一句銀行紀錄說法。',model:'The charge was reversed.',zh:'那筆扣款被撤銷了。',audioOnly:true,questions:['native-328-v2-audio']},
  {id:'native-328-v2-contrast',style:'contrast',label:'對照退款',title:'待處理還是已沖回？',intro:'與上一課的 pending 狀態分開。',questions:['native-328-v2-contrast']},
  {id:'native-328-v2-rewrite',style:'rewrite',label:'報告所見',title:'昨天有，今天已撤銷',intro:'把交易狀態說準。',questions:['native-328-v2-rewrite']},
  {id:'native-328-v2-speak',style:'speak',label:'口頭轉述',title:'銀行處理了扣款',intro:'先自己說；錄音或跳過後才聽示範。',model:'The bank reversed the charge.',zh:'銀行撤銷了這筆扣款。',speakingPrompt:'朋友問這筆扣款怎樣處理；你看到銀行已沖回它。',recording:'phrase',questions:[]},
  {id:'native-328-v2-final',style:'final',label:'重複扣款挑戰',title:'多出的一筆不見了',intro:'自行交代變化和下一步。',questions:['native-328-v2-final']}
];
export default {revision:2,summary:'用 charge was reversed 報告一筆扣款被撤銷，並與仍在處理中的退款分開。',steps,questions,takeaways:['The charge was reversed.','The bank reversed the charge.'],completionTitle:'你能準確轉述扣款被沖回，而不把它誤作凍卡或待處理退款。'};
