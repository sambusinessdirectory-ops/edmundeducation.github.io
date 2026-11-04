import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-128-v2-audio','audio','只聽收銀後的問題。少的是哪一筆錢？',['找回給客人的現金。','商品標價。','信用卡重複扣款。','現金付款後的退款。'],'找回給客人的現金。','short-changed 通常指現金交易找錢不足。'),
  mc('native-128-v2-scene','scene','你付 $20 買 $12 的商品，收銀員只找 $5。哪句描述最準確？',["I think I was short-changed by $3.","I was overcharged by $3 on my card.","The item rang up at $15 instead of $12.","I was charged twice for the item."],"I think I was short-changed by $3.",'應找 $8 卻只找 $5，差 $3；問題在找續，不是標價或刷卡。'),
  mc('native-128-v2-tone','tone','發現少找錢，想先讓收銀員核對。哪句語氣合適？',["Excuse me, I think I was short-changed. Could we check the change?","I think the register price was wrong; could you check?","I may have miscounted; let me check the receipt.","Could you check what the item rang up at?"],"Excuse me, I think I was short-changed. Could we check the change?",'用 I think 留有核對空間，並提出具體檢查要求。'),
  open('native-128-v2-final','final','最後挑戰：你付現金 $50，商品共 $34，卻只收到 $10 找續。回到櫃檯寫兩句英文說明應找和實收的數額，請對方核對。',["Excuse me, I think I was short-changed. I should have received $16 in change, but I got $10—could you check?","I paid $50 for a $34 item, so the change should be $16. Could we check why I only got $10?"],'算清應找 $16、實收 $10，讓問題可直接核對；差額是 $6。')
];
const steps=[
  {id:'native-128-v2-audio',style:'audio',label:'聽出差額',title:'少找了錢',intro:'只聽收銀後的一句話。',model:'I was short-changed.',zh:'我被少找錢了。',audioOnly:true,questions:['native-128-v2-audio']},
  {id:'native-128-v2-scene',style:'scene',label:'算出差額',title:'二十減十二',intro:'根據現金與找續作判斷。',questions:['native-128-v2-scene']},
  {id:'native-128-v2-tone',style:'tone',label:'禮貌核對',title:'先查清楚',intro:'選一個有分寸的說法。',questions:['native-128-v2-tone']},
  {id:'native-128-v2-speak',style:'speak',label:'口頭說明',title:'向收銀員反映',intro:'先自己說；錄音或跳過後才聽示範。',model:'I was overcharged.',zh:'我被多收了錢。',speakingPrompt:'這次是商品本身被收高於標價，不是找續錯。向店員說明。',recording:'phrase',questions:[]},
  {id:'native-128-v2-final',style:'final',label:'收據挑戰',title:'說清應找和實收',intro:'自己寫出可核對的數字。',questions:['native-128-v2-final']}
];
export default {revision:2,summary:'用 short-changed 反映現金找續不足，並與商品多收費區分。',steps,questions,takeaways:['I was short-changed.','I was overcharged.'],completionTitle:'你能算清找續差額，禮貌請收銀員核對。'};
