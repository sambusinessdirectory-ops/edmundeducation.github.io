import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-344-v2-audio','audio','只聽這句關於袋子的話。問題有多局部？',['袋身有一道裂口。','袋底整個突然破開。','提手完全不見。','袋口打了死結。'],'袋身有一道裂口。','tear 指裂口；這句沒有說整個底部失去承托。'),
  mc('native-344-v2-reverse','reverse','你看到塑膠袋側面有一道小口，袋底仍完好。哪句最準？',["There's a tear in the bag.","The bottom gave out.","The handle fell off.","The bag is sealed shut."],"There's a tear in the bag.",'tear 可說袋身局部裂開；bottom gave out 是底部整個撐不住。'),
  mc('native-344-v2-explain','explain','為何要提醒朋友不要把這個袋子提起來？',['裂口可能在受重時擴大，物品可能掉出。','袋子上的價錢標籤可能脫落。','袋子顏色可能變深。','提起袋子會令物品變重。'],'裂口可能在受重時擴大，物品可能掉出。','已知袋身有裂口，承重時擴大是直接相關的風險。'),
  mc('native-344-v2-transfer','transfer','換成衣袖：袖子也有一道裂口。哪句沿用 tear？',["There's a tear in my sleeve.","My sleeve is too short.","My shirt is inside out.","My cuff has stretched out."],"There's a tear in my sleeve.",'tear 指材料上裂開的一道口；它可用於衣袖布料，也可用於塑膠袋。'),
  open('native-344-v2-final','final','新情境：你要幫朋友搬書，發現塑膠袋底部附近有一道小裂口，底部尚未整個破開。寫兩句英文提醒他並提出換袋。',["There's a tear near the bottom of the bag. Let's use a different bag for these books.","Be careful; the bag has a small tear underneath. We should move the books to a stronger one.","I can see a tear in the bag, though the bottom is still intact. Let's repack the books."],'自評時看是否說清只是局部裂口，並提出換袋以免裂口擴大。')
];
const steps=[
  {id:'native-344-v2-audio',style:'audio',label:'聽出破損',title:'袋子裂在哪種程度？',intro:'留意袋身局部裂口，別誤認整個袋底破掉。',model:'There’s a tear in the bag.',zh:'袋子有一道裂口。',audioOnly:true,questions:['native-344-v2-audio']},
  {id:'native-344-v2-reverse',style:'reverse',label:'看塑膠袋',title:'側面的小口',intro:'分清局部裂口與底部整個破開。',questions:['native-344-v2-reverse']},
  {id:'native-344-v2-explain',style:'explain',label:'判斷風險',title:'為何先別提起？',intro:'把裂口和承重後果連起來。',questions:['native-344-v2-explain']},
  {id:'native-344-v2-transfer',style:'transfer',label:'換到衣袖',title:'布料也會裂',intro:'把 tear 用在另一種材質。',questions:['native-344-v2-transfer']},
  {id:'native-344-v2-speak',style:'speak',label:'即時提醒',title:'袋子有裂口',intro:'先自己說；錄音或跳過後才聽示範。',model:'There’s a tear in the bag.',zh:'袋子有一道裂口。',speakingPrompt:'朋友準備提起一個側面有裂口的塑膠袋。簡短提醒。',recording:'phrase',questions:[]},
  {id:'native-344-v2-final',style:'final',label:'搬書挑戰',title:'提醒朋友換袋',intro:'提醒朋友袋身裂口，並建議換袋。',questions:['native-344-v2-final']}
];
export default {revision:2,summary:'用 tear 描述袋身局部裂口，並與底部整個撐破的 gave out 分開。',steps,questions,takeaways:['There’s a tear in the bag.'],completionTitle:'你能指出袋子的裂口，並及時提醒別人換袋。'};
