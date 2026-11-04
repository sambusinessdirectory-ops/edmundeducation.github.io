import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-341-v2-audio','audio','先聽這句關於紙袋的話。甚麼事突然發生？',['袋底承受不住重量而破開。','袋身有一條小裂縫但仍完整。','提手剛被剪斷。','袋口被封得太緊。'],'袋底承受不住重量而破開。','gave out 表示承托部分突然失效；這裏是袋底撐不住。'),
  mc('native-341-v2-rewrite','rewrite','你原本只寫「The bag broke」。購物品從底部全部掉出來。哪句更精確？',["The bottom of the bag gave out.","There's a tiny tear near the handle.","The bag won't close at the top.","The bag is wrinkled on one side."],"The bottom of the bag gave out.",'說出底部突然失去承托，比泛稱袋子壞了更能解釋東西為何掉出。'),
  mc('native-341-v2-tone','tone','超市職員問你為何貨品掉在地上。哪句平實描述，不指責職員？',["I think the bottom of the bag gave out. It may have been too heavy.","You personally ruined every item I bought.","The groceries jumped out of the bag themselves.","Nothing happened; everything is still inside."],"I think the bottom of the bag gave out. It may have been too heavy.",'I think 和 may 表示你對原因的推測，先交代可見的袋底破裂。'),
  mc('native-341-v2-transfer','transfer','換到舊紙箱：搬起來時箱底突然破開，書掉到地上。哪句沿用 gave out？',["The bottom of the box gave out.","The box lid is missing.","The books were already unpacked.","The box was painted green."],"The bottom of the box gave out.",'gave out 也能形容箱底等承重部分突然失效，不限紙袋。'),
  open('native-341-v2-final','final','新情境：你提着裝滿罐頭的紙袋回家，袋底突然破開，罐頭掉到地上。寫兩句英文向家人解釋發生甚麼事及你會怎樣處理。',["The bottom of the bag gave out, and the cans fell out. I'll pick them up and use a stronger bag.","The paper bag was too heavy and its bottom gave out. Let me gather the cans from the floor.","All the cans dropped when the bottom of the bag gave out. I'll repack them in two bags."],'自評時看是否指出袋底失去承托，以及物品掉出後的下一步。')
];
const steps=[
  {id:'native-341-v2-audio',style:'audio',label:'聽出破裂位置',title:'袋底突然怎樣了？',intro:'留意紙袋底部突然失去承托的瞬間。',model:'The bottom gave out.',zh:'底部突然撐不住了。',audioOnly:true,questions:['native-341-v2-audio']},
  {id:'native-341-v2-rewrite',style:'rewrite',label:'精確報告',title:'購物品從底部掉出',intro:'把籠統的 broke 改成可見故障。',questions:['native-341-v2-rewrite']},
  {id:'native-341-v2-tone',style:'tone',label:'告訴職員',title:'描述而不指責',intro:'分開已見到的事與猜測的原因。',questions:['native-341-v2-tone']},
  {id:'native-341-v2-transfer',style:'transfer',label:'換到紙箱',title:'承重底部也可能失效',intro:'把 gave out 用到另一種容器。',questions:['native-341-v2-transfer']},
  {id:'native-341-v2-speak',style:'speak',label:'即時口說',title:'罐頭掉出來了',intro:'先自己說；錄音或跳過後才聽示範。',model:'The bottom gave out.',zh:'底部撐不住了。',speakingPrompt:'紙袋底突然破開，裏面的東西掉在地上。向同行的人指出原因。',recording:'phrase',questions:[]},
  {id:'native-341-v2-final',style:'final',label:'搬貨挑戰',title:'說明破袋和處理方法',intro:'說明紙袋底破後物品怎樣處理。',questions:['native-341-v2-final']}
];
export default {revision:2,summary:'用 gave out 描述紙袋底部突然失去承托，並說明物品掉出的結果。',steps,questions,takeaways:['The bottom gave out.'],completionTitle:'你能說清紙袋底部破裂，也能提出收拾方法。'};
