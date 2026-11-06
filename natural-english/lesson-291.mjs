import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-291-v2-audio','audio','聽完這句帳單描述，哪個問題最可能發生？',['同一筆消費出現了兩次。','有一筆完全不認得的消費。','商店少收了一件貨的錢。','卡片付款被拒絕。'],'同一筆消費出現了兩次。','duplicate charge 指重複列帳；兩筆通常可用日期、商戶與金額核對。'),
  mc('native-291-v2-contrast','contrast','帳單上同一天同一餐廳、同樣 $24 的交易列了兩次。哪句比「I don’t recognize this charge」更精確？',["There's a duplicate charge.","My card has expired.","I was undercharged.","This restaurant is closed."],"There's a duplicate charge.",'你認得這頓飯，只是它被列帳兩次；duplicate 描述真正的問題。'),
  mc('native-291-v2-transfer','transfer','從餐廳轉到網購：同一筆訂單的同額款項在信用卡帳單出現兩次。哪句仍適用？',["There's a duplicate charge for my order.","The package was delivered twice.","I bought two different orders.","The website has no payment page."],"There's a duplicate charge for my order.",'duplicate 修飾的是同一訂單的重複扣款，不代表真的收到兩個包裹。'),
  mc('native-291-v2-tone','tone','你致電銀行，尚未確定是最終扣款還是暫時授權。哪句說法清楚且留有核對空間？',["It looks like there's a duplicate charge on my statement. Could you check it?","Your bank definitely stole from me; admit it now.","I never made any purchase at all.","Please delete every charge on my card."],"It looks like there's a duplicate charge on my statement. Could you check it?",'It looks like 說明目前根據帳單觀察，並請客服核實。'),
  mc('native-291-v2-rewrite','rewrite','給客服的訊息原稿是「My bill is wrong」。哪句提供足夠線索？',["The same $24 restaurant charge appears twice on my statement.","I don't like the color of my card.","My bill arrived on paper instead of email.","I can't remember where I ate last year."],"The same $24 restaurant charge appears twice on my statement.",'寫出同一金額、商戶和出現兩次，客服便能定位重複交易。'),
  open('native-291-v2-rewrite-write','rewrite','新情境：信用卡帳單在同一天列出兩筆相同的 $24 午餐消費，你實際只吃了一次。寫兩句英文向銀行客服描述重複扣款，並請對方查核。',
    ["There are two identical $24 lunch charges on my statement. Could you check whether one is a duplicate?","I think I was charged twice for the same $24 meal. Can you investigate the duplicate charge?","The same restaurant charged my card $24 twice today. Could you review both entries for me?"],
    '自評時看是否包含相同商戶、金額和兩次列帳的關鍵證據，再提出查核請求。')
];
const steps=[
  {id:'native-291-v2-audio',style:'audio',label:'聽出重複',title:'帳單多了哪一筆？',intro:'聽帳單上是否出現同一筆消費兩次。',model:'There’s a duplicate charge.',zh:'有一筆重複扣款。',audioOnly:true,questions:['native-291-v2-audio']},
  {id:'native-291-v2-contrast',style:'contrast',label:'與陌生交易對照',title:'認得交易，卻列了兩次',intro:'從帳單證據選詞。',questions:['native-291-v2-contrast']},
  {id:'native-291-v2-transfer',style:'transfer',label:'換到網購',title:'同一訂單扣兩次',intro:'把重複扣款用於另一種消費。',questions:['native-291-v2-transfer']},
  {id:'native-291-v2-tone',style:'tone',label:'致電核實',title:'先報告所見',intro:'清楚提出問題，也容許銀行查證。',questions:['native-291-v2-tone']},
  {id:'native-291-v2-rewrite',style:'rewrite',label:'具體寫帳單',title:'讓客服找到交易',intro:'把含糊抱怨改成可查的資訊。',questions:['native-291-v2-rewrite','native-291-v2-rewrite-write']},
  {id:'native-291-v2-speak',style:'speak',label:'口頭報告',title:'指出重複扣款',intro:'先自己說；錄音或跳過後才聽示範。',model:'There’s a duplicate charge.',zh:'有一筆重複扣款。',speakingPrompt:'同一商戶同一天同一金額，在信用卡帳單出現兩次。向客服先指出問題。',recording:'phrase',questions:[]}
];
export default {revision:2,summary:'用 duplicate charge 描述同一消費重複列帳，與不認得的交易分開。',steps,questions,takeaways:['There’s a duplicate charge.'],completionTitle:'你能指出重複扣款，並提供客服查核所需線索。'};
