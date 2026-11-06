import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-331-v2-audio','audio','只聽店員的回應：客人現在還能點那道三文魚嗎？',
    ['不能；今天準備的三文魚已賣完。','可以；只是要多等一會兒。','可以；店員正在確認價錢。','不能；那道菜已永久從菜單刪除。'],
    '不能；今天準備的三文魚已賣完。','sold out 指今天可賣的份量已售罄；不表示這道菜永久停賣。'),
  mc('native-331-v2-contrast','contrast','同事說 We’re sold out of the salmon。哪個回覆反映你聽懂了原因？',
    ['明白，今天的三文魚已經賣光；我改點雞肉。','明白，三文魚還未開始售賣；我等到明年。','明白，三文魚仍有，但要加價。','明白，廚房已完成我的三文魚。'],
    '明白，今天的三文魚已經賣光；我改點雞肉。','sold out 的重點是現有份量已被其他客人買走，所以改點別的菜自然。'),
  mc('native-331-v2-branch','branch','你是店員，三文魚剛賣完；客人還未決定點甚麼。哪句最能清楚告知並協助他？',
    ["I’m sorry, we’re sold out of the salmon. Would you like to try the chicken instead?","The salmon is sold out forever, so don’t ask again.","You can order the salmon, but we don’t have any.","The salmon is expensive today. Please order the chicken."],
    "I’m sorry, we’re sold out of the salmon. Would you like to try the chicken instead?",'先交代今天已賣完，再提供可選的替代菜；不需要把缺貨說成永久停賣。'),
  mc('native-331-v2-detail','detail','收市前還剩兩份三文魚，剛被另一桌買走。哪個說法最準？',
    ["We’ve just sold out of the salmon.","The salmon is unavailable because the oven broke.","The salmon has been removed from the menu.","The salmon is still available in large portions."],
    "We’ve just sold out of the salmon.",'剛好賣掉最後兩份，可以用 just sold out；其他句子替餐廳編造了不同原因。'),
  open('native-331-v2-final','final','最後挑戰：你在餐廳工作。客人想點三文魚，但最後一份剛賣出。用兩句英文禮貌告知現況，並提供另一個可點的選擇。',
    ["I’m sorry, we’ve just sold out of the salmon. The chicken is still available if you’d like that instead.","I’m afraid we’re sold out of the salmon today. Would you like to try the pasta?","Sorry, the last salmon has just been ordered. We still have the chicken dish."],
    '交代最後一份已售出，並自然地提出仍可供應的菜；別暗示三文魚永遠不再供應。')
];
const steps=[
  {id:'native-331-v2-audio',style:'audio',label:'先聽店員',title:'今天最後一份賣掉了',intro:'先聽一句，不看逐字稿。',model:'We’re sold out of the salmon.',zh:'三文魚今天賣完了。',audioOnly:true,questions:['native-331-v2-audio']},
  {id:'native-331-v2-contrast',style:'contrast',label:'分清意思',title:'售罄不等於永久停賣',intro:'判斷 sold out 對點餐有甚麼影響。',questions:['native-331-v2-contrast']},
  {id:'native-331-v2-branch',style:'branch',label:'接待客人',title:'告知之後給選擇',intro:'把消息說清楚，也讓客人知道下一步。',questions:['native-331-v2-branch']},
  {id:'native-331-v2-detail',style:'detail',label:'抓時間線',title:'剛剛才賣完',intro:'最後兩份售出後，選最貼近現況的一句。',questions:['native-331-v2-detail']},
  {id:'native-331-v2-speak',style:'speak',label:'櫃台口說',title:'當面告知客人',intro:'先自己說；錄音或跳過後才聽示範。',model:'We’re sold out of the salmon.',zh:'三文魚今天賣完了。',speakingPrompt:'客人正在點三文魚；你知道廚房已賣完。',recording:'phrase',questions:[]},
  {id:'native-331-v2-final',style:'final',label:'新情境挑戰',title:'賣完後如何接話',intro:'不看選項，自行寫兩句。',questions:['native-331-v2-final']}
];
export default {revision:2,summary:'用 sold out 告知客人今天份量已售罄，並自然提出可點的替代菜。',steps,questions,takeaways:['We’re sold out of it.','We’re sold out of the salmon.'],completionTitle:'你能說明菜品剛售罄，並幫客人繼續點餐。'};
