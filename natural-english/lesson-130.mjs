import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-130-v2-audio','audio','只聽這句付款抱怨。客人發現甚麼？',['付出的金額高於應付。','現金找續不足。','同一筆款項出現兩次。','商品掃描出比標價更低的金額。'],'付出的金額高於應付。','overcharged 是收得太多；短找和重複刷卡有各自更準確的說法。'),
  mc('native-130-v2-detail','detail','收據顯示一盒牛奶 $5，但貨架標價 $3。哪個資料最能支持多收錢？',['同一盒牛奶的標價與收據價。','折扣標籤是否適用於這件商品。','相同商品在另一間店的價格。','這張收據的總額是否包含其他商品。'],'同一盒牛奶的標價與收據價。','比較同一商品兩個價格，才能具體說明 overcharge。'),
  mc('native-130-v2-rewrite','rewrite','你想給客服寫一句有根據的說明。哪句最好？',["I was overcharged for the milk: the shelf says $3, but the receipt says $5.","The milk price on the shelf differs from the receipt.","I paid by card but haven't checked the total.","I expected the milk to be $3, but I can't find the tag."],"I was overcharged for the milk: the shelf says $3, but the receipt says $5.",'訊息列出牛奶、三元標價及五元收據價，客服可直接核對同一商品的兩元差額。'),
  mc('native-130-v2-continue','continue','店員說 Let me check the receipt。你手上也有貨架照片，下一句如何幫助查核？',["I can show you the $3 price tag too.","I can show you the total on my card statement.","Could the discount have failed to apply?","I also bought another item at full price."],"I can show you the $3 price tag too.",'標價照片能與收據金額對照，直接支持多收費的反映。'),
  open('native-130-v2-final','final','最後挑戰：你買的筆記簿標價 $8，結帳卻收 $11。用兩句英文禮貌向店員反映，並請他核對。',["Excuse me, I think I was overcharged. The notebook was marked at $8, but I paid $11—could you check?","I think this notebook rang up too high. The tag says $8, and the receipt says $11."],'說清同一商品的標價與實收，能避免與少找續混淆。')
];
const steps=[
  {id:'native-130-v2-audio',style:'audio',label:'聽出問題',title:'付多了多少？',intro:'先只聽一句。',model:'I was overcharged.',zh:'我被多收錢了。',audioOnly:true,questions:['native-130-v2-audio']},
  {id:'native-130-v2-detail',style:'detail',label:'找出證據',title:'貨架與收據',intro:'核對同一商品的兩個價格。',questions:['native-130-v2-detail']},
  {id:'native-130-v2-rewrite',style:'rewrite',label:'寫給客服',title:'把抱怨寫具體',intro:'選有查核價值的訊息。',questions:['native-130-v2-rewrite']},
  {id:'native-130-v2-speak',style:'speak',label:'口頭分辨',title:'現金少找又不同',intro:'先自己說；錄音或跳過後才聽示範。',model:'I was short-changed.',zh:'我被少找錢了。',speakingPrompt:'你付現金，商品價錢正確，但找續少了。向店員說明。',recording:'phrase',questions:[]},
  {id:'native-130-v2-continue',style:'continue',label:'補上照片',title:'店員正在查',intro:'在對話中提供證據。',questions:['native-130-v2-continue']},
  {id:'native-130-v2-final',style:'final',label:'筆記簿挑戰',title:'標八元收十一元',intro:'自己禮貌提出問題。',questions:['native-130-v2-final']}
];
export default {revision:2,summary:'用 overcharged 反映單項商品收得比應付多，並以標價與收據支持查核。',steps,questions,takeaways:['I was overcharged.','I was short-changed.'],completionTitle:'你能拿出具體價錢，清楚反映多收費。'};
