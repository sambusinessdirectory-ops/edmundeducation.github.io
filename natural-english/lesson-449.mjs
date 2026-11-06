import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-449-v2-audio','audio','只聽冰塊狀況。冰格裡現在最可能是甚麼樣？',['多顆冰塊黏成一整團。','冰塊全部融成水。','每顆冰塊仍完全分開。','製冰格仍是空的。'],'多顆冰塊黏成一整團。','frozen together 說原本分開的冰塊凍黏在一起。'),
  mc('native-449-v2-reverse','reverse','你想拿兩顆冰塊，卻只拿得出一整塊黏住的大冰團。怎樣描述？',["The ice cubes have frozen together.","The ice cubes have melted together.","The ice cubes are still separate.","The ice tray is empty."],"The ice cubes have frozen together.",'多顆冰塊在冷凍中黏成一團，不是融化或仍分開。'),
  mc('native-449-v2-branch','branch','朋友問 Can you just take one cube? 冰塊全黏著，怎樣答最清楚？',["Not yet—they've frozen together. I'll need to separate them.","Sure, they're all loose in the tray.","No, they've melted into water.","I haven't checked the freezer."],"Not yet—they've frozen together. I'll need to separate them.",'說明目前取不出單顆的原因，並交代下一步要分開。'),
  mc('native-449-v2-transfer','transfer','換成冷凍莓果：袋子裡的莓果也結成一大團。哪句自然沿用？',["The berries have frozen together.","The berries have thawed separately.","The berries are fresh and loose.","The berries have been sliced."],"The berries have frozen together.",'frozen together 可描述其他冷凍小物相互黏住，不限冰塊。'),
  open('native-449-v2-final','final','最後挑戰：朋友要你給他兩塊冰，你打開冰格卻發現所有冰塊黏成一大塊。寫兩句英文解釋為何暫時拿不出兩塊，並說明接下來會怎樣做。',["The ice cubes have frozen together, so I can't take out just two yet. I'll separate a couple for you.","They're all stuck together in one block. Give me a moment to break two cubes apart."],'先說明結冰黏住的狀態，再提出如何取出需要的兩塊。')
];
const steps=[
  {id:'native-449-v2-audio',style:'audio',label:'先聽狀態',title:'冰塊黏成團',intro:'判斷是融化還是凍在一起。',model:'The ice cubes have frozen together.',zh:'冰塊凍黏在一起。',audioOnly:true,questions:['native-449-v2-audio']},
  {id:'native-449-v2-reverse',style:'reverse',label:'從畫面想句',title:'拿不出單顆',intro:'根據冰格裡的形狀選說法。',questions:['native-449-v2-reverse']},
  {id:'native-449-v2-branch',style:'branch',label:'回答朋友',title:'不能直接拿一塊',intro:'接續取冰塊的對話。',model:'They’ve frozen together.',zh:'它們凍黏在一起。',questions:['native-449-v2-branch']},
  {id:'native-449-v2-transfer',style:'transfer',label:'換到莓果',title:'袋裡也可能結團',intro:'把 together 用到另一種冷凍食品。',questions:['native-449-v2-transfer']},
  {id:'native-449-v2-final',style:'final',label:'飲料挑戰',title:'朋友要兩塊冰',intro:'自己解釋問題和做法。',questions:['native-449-v2-final']}
];
export default {revision:2,summary:'用 frozen together 描述冰塊凍黏成團，並能套用到冷凍莓果。',steps,questions,takeaways:['The ice cubes have frozen together.','They’ve frozen together.'],completionTitle:'你能說清冰塊為何拿不出單顆，並提出做法。'};
