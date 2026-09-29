import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-325-v2-audio','audio','只聽店員的說法。商品將怎樣來到這間店？',
    ['從另一間分店調過來。','從你家寄到店裡。','當場從倉庫拿出來。','店員會改造現有商品。'],
    '從另一間分店調過來。','transfer it from another location 說貨源在另一分店，會調到這裡；不表示現在這家有現貨。'),
  mc('native-325-v2-repair','repair','你聽到 Another location has it in stock，卻告訴朋友「這間店現在有現貨」。怎樣修正？',
    ['另一間分店有貨；這間店目前沒有。','所有分店都沒有貨。','商品已送到我家。','這間店已把商品賣給我。'],
    '另一間分店有貨；這間店目前沒有。','another location 指另一個分店，不能省掉 another 後誤報為眼前這家。'),
  mc('native-325-v2-continue','continue','店員說 We can transfer it here。你很想買，但下週才出發旅行。哪個追問最有幫助？',
    ['How long will the transfer take?','What color is the store logo?','How many staff work at that branch?','Can I return it before it arrives?'],
    'How long will the transfer take?','先確認調貨時間，才知道是否趕得及旅行前取貨。'),
  mc('native-325-v2-transfer','transfer','不是外套，而是手機殼。另一分店有你要的顏色，這間沒有。哪句同樣適用？',
    ['Another location has it in stock.','Every location is out of stock.','This phone case has already arrived here.','The color was discontinued everywhere.'],
    'Another location has it in stock.','in stock 說另一分店目前有貨；換了商品，分店存貨與調貨的邏輯不變。'),
  open('native-325-v2-final','final','最後挑戰：你想買 M 號外套，眼前分店沒有，店員說另一分店有一件，可以調過來。你週末要用。用兩句英文確認調貨安排，並問大概多久會到。',
    ["Can you transfer the medium from the other location to this store? How long would that take?","I'd like the medium from the other location. Could you transfer it here, and do you know when it would arrive?","Great, could you have it transferred here? I need it by the weekend—how long will it take?"],
    '先確認調貨到哪裡，再問時間是否趕得及；不要把另一分店有貨誤當眼前分店即時有貨。')
];
const steps=[
  {id:'native-325-v2-audio',style:'audio',label:'聽出貨源',title:'這家沒貨，另一家有',intro:'先只聽調貨安排。',model:'They’ll transfer it from another location.',zh:'他們會從另一間分店調貨過來。',audioOnly:true,questions:['native-325-v2-audio']},
  {id:'native-325-v2-repair',style:'repair',label:'修正誤報',title:'another 不能漏',intro:'分清本店與其他分店的庫存。',questions:['native-325-v2-repair']},
  {id:'native-325-v2-continue',style:'continue',label:'追問時間',title:'週末前來得及嗎？',intro:'找出作購買決定所缺資訊。',questions:['native-325-v2-continue']},
  {id:'native-325-v2-speak',style:'speak',label:'口頭轉述',title:'向朋友報貨源',intro:'先自己說；錄音或跳過後才聽示範。',model:'Another location has it in stock.',zh:'另一間分店有現貨。',speakingPrompt:'朋友問你眼前這家有沒有貨；你知道另一間分店有。',recording:'phrase',questions:[]},
  {id:'native-325-v2-transfer',style:'transfer',label:'換一件商品',title:'手機殼也要調貨',intro:'把分店庫存概念換到新商品。',questions:['native-325-v2-transfer']},
  {id:'native-325-v2-final',style:'final',label:'週末挑戰',title:'確認調貨與到貨時間',intro:'自行提出兩個必要問題。',questions:['native-325-v2-final']}
];
export default {revision:2,summary:'分清眼前分店與另一分店的存貨，並追問調貨時間。',steps,questions,takeaways:['They’ll transfer it from another location.','Another location has it in stock.'],completionTitle:'你能說清貨在哪間分店，也會問調貨能否趕上需要。'};
