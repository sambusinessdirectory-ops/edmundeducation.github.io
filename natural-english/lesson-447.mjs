import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-447-v2-audio','audio','只聽販賣機問題。付款後發生了甚麼？',['機器收了錢，商品卻沒掉下來。','機器退回了全部錢。','商品掉了兩件。','付款卡被拒絕。'],'機器收了錢，商品卻沒掉下來。','ate my money 是口語比喻：錢被機器收走，卻沒得到商品或退款。'),
  mc('native-447-v2-contrast','contrast','你付款成功，但零食卡在機器裡。與「卡片被拒」相比，哪句更貼合？',["The vending machine ate my money.","My card was declined before payment.","I changed my mind before paying.","The machine returned my coins."],"The vending machine ate my money.",'已付款但沒拿到零食是關鍵；卡片被拒則錢沒有被收。'),
  mc('native-447-v2-repair','repair','朋友以為你只是沒找到零錢，但你已付錢。哪句能修正？',["No, the machine took my money, but nothing came out.","No, I haven't paid yet.","Yes, I forgot to bring any money.","The snack fell, but I left it there."],"No, the machine took my money, but nothing came out.",'兩個事實都說出來，朋友才明白是機器收錢後不出貨。'),
  mc('native-447-v2-rewrite','rewrite','你要向管理處報告 $2 的零食卡住、錢已扣。哪條訊息最有助查核？',["The vending machine took my $2, but the snack didn't drop. Could you check it?","I think the snacks in this machine look old.","I couldn't decide which snack to buy.","The machine gave me change but no receipt."],"The vending machine took my $2, but the snack didn't drop. Could you check it?",'列出已付金額和沒出貨的結果，管理員才能核對交易。'),
  open('native-447-v2-final','final','最後挑戰：你在車站販賣機投了三元硬幣買水，螢幕顯示付款成功，瓶水卻沒掉出來。寫兩句英文向站務員說明及請求處理。',["The vending machine ate my money. I paid $3 for water, but nothing came out—could you help?","I put $3 in the machine and it accepted the payment, but the water didn't drop. Could someone check it?"],'說明付款已被收和商品未出來，再提出求助；不要只說「機器壞了」。')
];
const steps=[
  {id:'native-447-v2-audio',style:'audio',label:'先聽比喻',title:'錢被機器吃了',intro:'聽出付款與出貨的落差。',model:'The vending machine ate my money.',zh:'販賣機收了錢卻沒出貨。',audioOnly:true,questions:['native-447-v2-audio']},
  {id:'native-447-v2-contrast',style:'contrast',label:'有沒有扣款',title:'不是刷卡被拒',intro:'區分錢已收和未收。',questions:['native-447-v2-contrast']},
  {id:'native-447-v2-repair',style:'repair',label:'澄清朋友',title:'我已付了錢',intro:'把誤會修正到交易結果。',questions:['native-447-v2-repair']},
  {id:'native-447-v2-rewrite',style:'rewrite',label:'報告管理處',title:'兩元零食沒掉',intro:'寫出可核對的金額與結果。',questions:['native-447-v2-rewrite']},
  {id:'native-447-v2-speak',style:'speak',label:'口頭回應',title:'機器收了錢',intro:'先自己說；錄音或跳過後才聽示範。',model:'No. The machine ate my money.',zh:'沒有。機器把我的錢吞了。',speakingPrompt:'朋友問你是不是拿到零食；你沒有，錢卻已收。先口頭回答。',recording:'phrase',questions:[]},
  {id:'native-447-v2-final',style:'final',label:'車站挑戰',title:'三元買水卻沒出貨',intro:'自己向站務員求助。',questions:['native-447-v2-final']}
];
export default {revision:2,summary:'理解 vending machine ate my money 是收款後沒出貨的口語說法，並能具體報告交易。',steps,questions,takeaways:['The vending machine ate my money.','No. The machine ate my money.'],completionTitle:'你能向站務員說清機器收錢卻沒出貨。'};
