import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-129-v2-audio','audio','只聽帳單問題。銀行紀錄有甚麼異常？',['同一筆消費出現兩次扣款。','商品原價比預期高。','現金找續少了。','標價與掃描價不一致。'],'同一筆消費出現兩次扣款。','charged twice 和 double-charged 都指同一項交易重複收費。'),
  mc('native-129-v2-scene','scene','你只在咖啡店買過一次 $6 咖啡，信用卡帳單同一天出現兩筆相同的 $6 收費。哪句最準確？',["I was charged twice for the same purchase.","The coffee was marked at $12.","I was short-changed by $6.","I received $6 too little in change."],"I was charged twice for the same purchase.",'一杯六元咖啡卻有兩筆六元扣款，問題是同一交易重複收費，不是商品一次收價過高。'),
  mc('native-129-v2-transfer','transfer','演唱會票只買了一張，付款紀錄卻有兩筆相同款項。哪句同樣可用？',["I was double-charged for the ticket.","The ticket was marked at the wrong price.","I was short-changed at the venue.","The ticket cost more than the listed price."],"I was double-charged for the ticket.",'double-charged 不限於餐飲；任何重複收費都適用。'),
  open('native-129-v2-final','final','最後挑戰：你只在網店下了一張訂單，卡片卻出現兩筆相同金額與日期的扣款。寫兩句英文給客服，指出重複扣款並請他們查看。',["I placed only one order, but I was charged twice. Could you check the two identical charges on my card?","It looks like I was double-charged for this order. Please review the two charges dated today."],'強調只有一張訂單卻有兩筆相同扣款，讓客服能查核。')
];
const steps=[
  {id:'native-129-v2-audio',style:'audio',label:'先聽帳單',title:'一筆還是兩筆？',intro:'只聽，不先看英文。',model:'I was charged twice. / I was double-charged.',zh:'我被重複收費了。',audioOnly:true,questions:['native-129-v2-audio']},
  {id:'native-129-v2-scene',style:'scene',label:'咖啡店扣款',title:'兩筆相同的六元',intro:'看交易筆數而非價格高低。',questions:['native-129-v2-scene']},
  {id:'native-129-v2-speak',style:'speak',label:'口頭反映',title:'給客服一句清楚話',intro:'先自己說；錄音或跳過後才聽示範。',model:'I was charged twice.',zh:'我被收了兩次錢。',speakingPrompt:'你只買了一次東西，銀行卻有兩筆扣款。向客服開口。',recording:'phrase',questions:[]},
  {id:'native-129-v2-transfer',style:'transfer',label:'換到門票',title:'票也可能重複扣款',intro:'同一概念應用到另一種消費。',questions:['native-129-v2-transfer']},
  {id:'native-129-v2-final',style:'final',label:'網購挑戰',title:'寫出可查的異常',intro:'自己說明訂單數與扣款數。',questions:['native-129-v2-final']}
];
export default {revision:2,summary:'用 charged twice 或 double-charged 反映同一交易被扣款兩次。',steps,questions,takeaways:['I was charged twice. / I was double-charged.','I was charged twice.'],completionTitle:'你能清楚向客服指出重複扣款。'};
