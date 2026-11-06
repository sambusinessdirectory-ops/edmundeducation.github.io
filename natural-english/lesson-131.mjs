import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-131-v2-audio','audio','只聽購物者指出的價錢。十元寫在哪裡？',['商品標籤上。','銀行帳單上。','折扣後的收據上。','商品旁的促銷海報上。'],'商品標籤上。','marked at 指商品所標示的價格，未必是收銀機掃出的價格。'),
  mc('native-131-v2-explain','explain','收銀機顯示 $15，商品上印著 $10。為何購物者說「marked at」而不是「I paid」？',['他在指出標示價，還未確認最終支付價。','他已經付款並要求找續。','他在說收銀機顯示的價錢。','他在說上週曾見過的價錢。'],'他在指出標示價，還未確認最終支付價。','marked at 只交代標籤上的價錢，是核對差異的依據。'),
  mc('native-131-v2-repair','repair','你拿著標價 $10 的帽子，收銀員說 $15。哪句最清楚指出差異來源？',["The price tag says $10.","The shelf sign says hats start at $10.","The receipt says I paid $15.","The register shows $15, not $10."],"The price tag says $10.",'直接指向價錢牌，讓收銀員檢查而非誤以為你已付款。'),
  open('native-131-v2-final','final','最後挑戰：鞋架上某雙鞋的標籤寫 $40，收銀員報 $50。你尚未付款。寫兩句英文指出標示價，並請他查看標籤。',["I thought these were $40; they're marked at $40. Could you check the tag?","The price tag says $40, but the register says $50. Could you take a look?"],'用標示價作為核對依據；尚未付款時不要說自己已被扣款。')
];
const steps=[
  {id:'native-131-v2-audio',style:'audio',label:'聽出標示',title:'十元寫在哪？',intro:'只聽英文，再判斷價格來源。',model:'It’s marked at $10.',zh:'它標價十元。',audioOnly:true,questions:['native-131-v2-audio']},
  {id:'native-131-v2-explain',style:'explain',label:'分清價格',title:'標價與付款價',intro:'理解 marked at 的時間點。',questions:['native-131-v2-explain']},
  {id:'native-131-v2-repair',style:'repair',label:'指出標籤',title:'清楚說價錢從何而來',intro:'讓收銀員知道要查哪裡。',questions:['native-131-v2-repair']},
  {id:'native-131-v2-speak',style:'speak',label:'口頭核對',title:'帽子的十元標籤',intro:'先自己說；錄音或跳過後才聽示範。',model:'price tag says...',zh:'價錢牌寫著……',speakingPrompt:'帽子標籤寫 $10，收銀員說 $15。指出標籤價。',recording:'phrase',questions:[]},
  {id:'native-131-v2-final',style:'final',label:'鞋架挑戰',title:'四十與五十',intro:'自己寫出標價與收銀價的差異。',questions:['native-131-v2-final']}
];
export default {revision:2,summary:'用 marked at 指商品標籤價，與收銀機顯示或實付金額區分。',steps,questions,takeaways:['It’s marked at $10.','price tag says...'],completionTitle:'你能明確指出標籤價，請店員核對差額。'};
