import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-270-v2-audio','audio','只聽這句對朋友的提醒。背包最可能怎樣？',['拉鍊沒拉，袋口開着。','肩帶已經斷了。','整個背包落在車上。','背包被雨淋濕。'],'拉鍊沒拉，袋口開着。','unzipped 指拉鍊沒有拉上；未必表示拉鍊壞了。'),
  mc('native-270-v2-scene','scene','朋友背着包走向車站，袋口敞開，錢包露在外面。你最先說甚麼？',["Your backpack is unzipped.","Your backpack strap has snapped.","You left your backpack behind.","Your backpack is soaked."],"Your backpack is unzipped.",'眼前最急切的問題是拉鍊沒拉，直接提醒可讓朋友及時保護物品。'),
  mc('native-270-v2-detail','detail','哪項觀察能證明你說的是 unzipped，而不是背包布料破洞？',['拉鍊滑塊停在一端，兩排齒沒有合上。','拉鍊已合上，但包側有一道裂口。','肩帶脫離背包頂端。','外面的口袋有一點水。'],'拉鍊滑塊停在一端，兩排齒沒有合上。','unzipped 是拉鍊仍開着；布料裂口即使拉鍊合上也會存在。'),
  mc('native-270-v2-transfer','transfer','朋友外套的前拉鍊也沒拉上。哪句把同一概念換到外套？',["Your jacket is unzipped.","Your jacket is stained.","Your jacket has shrunk.","Your jacket is inside out."],"Your jacket is unzipped.",'unzipped 可用於任何有拉鍊、目前沒有拉上的物件。'),
  open('native-270-v2-final','final','新情境：同學要上地鐵，背包拉鍊沒拉，筆記本快滑出來。寫兩句英文提醒他，並說明你看到的風險。',["Your backpack is unzipped. Your notebook might fall out.","Hey, your bag is still unzipped. I can see your notebook slipping out.","You might want to zip up your backpack. Your notebook is almost falling out."],'自評時檢查是否指出拉鍊未合上，並具體說明筆記本可能掉出。')
];
const steps=[
  {id:'native-270-v2-audio',style:'audio',label:'聽出提醒',title:'背包哪裏沒有關好？',intro:'先聽示範，不看英文。',model:'Your backpack is unzipped.',zh:'你的背包拉鍊沒拉。',audioOnly:true,questions:['native-270-v2-audio']},
  {id:'native-270-v2-scene',style:'scene',label:'車站情境',title:'錢包露在外面',intro:'按眼前最急切的問題選回應。',questions:['native-270-v2-scene']},
  {id:'native-270-v2-detail',style:'detail',label:'看拉鍊',title:'開口還是破洞？',intro:'用實際觀察分辨兩種問題。',questions:['native-270-v2-detail']},
  {id:'native-270-v2-transfer',style:'transfer',label:'換到外套',title:'拉鍊仍沒合上',intro:'把同一形容詞用在另一件物品。',questions:['native-270-v2-transfer']},
  {id:'native-270-v2-speak',style:'speak',label:'當面提醒',title:'趕在上車前說',intro:'先自己說；錄音或跳過後才聽示範。',model:'Your backpack is unzipped.',zh:'你的背包拉鍊沒拉。',speakingPrompt:'朋友背包袋口開着，物品露出。簡短提醒。',recording:'phrase',questions:[]},
  {id:'native-270-v2-final',style:'final',label:'地鐵挑戰',title:'提醒筆記本快掉',intro:'寫兩句英文，完成後對照示例。',questions:['native-270-v2-final']}
];
export default {revision:2,summary:'及時提醒朋友背包拉鍊未合上，並與布料破洞或肩帶損壞區分。',steps,questions,takeaways:['Your backpack is unzipped.'],completionTitle:'你能清楚提醒背包拉鍊開着，避免物品掉出。'};
