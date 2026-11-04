import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-277-v2-audio','audio','先聽這句對麵包的描述。說話者看到了甚麼？',['麵包上已長出黴點。','麵包放久了但沒有黴。','麵包剛被烤焦。','麵包被壓扁。'],'麵包上已長出黴點。','moldy 指麵包表面真正長出黴菌；如果只是放久變硬，應描述為 stale。'),
  mc('native-277-v2-detail','detail','哪個具體觀察足以支持說 bread is moldy？',['表面有綠白色毛狀斑點。','邊緣比昨天硬一點。','多士表面有均勻焦色。','麵包袋裏只剩一片。'],'表面有綠白色毛狀斑點。','看到黴菌斑點才是 moldy 的關鍵；變硬可以只是 stale。'),
  mc('native-277-v2-repair','repair','你看到麵包有明顯黴點，同伴只說「It’s stale」。哪句能修正問題的程度？',["The bread is moldy.","The bread is freshly baked.","The bread is slightly dry but fine.","The bread is still frozen."],"The bread is moldy.",'stale 說不新鮮，不能充分指出眼前已長黴的狀況。'),
  open('native-277-v2-final','final','新情境：你準備做三文治，發現麵包邊有綠色黴點。寫兩句英文提醒同伴，並提出如何處理。',["The bread is moldy. Let's use a fresh loaf instead.","Don't use this bread; there's mold on it. I'll get another packet.","I can see mold on the bread. We should throw it out and find something else."],'自評時確認你有明確說麵包長黴，並提出不用這塊麵包的下一步。')
];
const steps=[
  {id:'native-277-v2-audio',style:'audio',label:'聽出狀態',title:'麵包只是舊了嗎？',intro:'聽麵包的變化：是長黴還是只變乾？',model:'The bread is moldy.',zh:'麵包長黴了。',audioOnly:true,questions:['native-277-v2-audio']},
  {id:'native-277-v2-detail',style:'detail',label:'看表面',title:'綠白色斑點',intro:'找出足以判斷長黴的線索。',questions:['native-277-v2-detail']},
  {id:'native-277-v2-repair',style:'repair',label:'修正程度',title:'stale 不夠準確',intro:'把「不新鮮」說成真正觀察到的情況。',questions:['native-277-v2-repair']},
  {id:'native-277-v2-speak',style:'speak',label:'即時提醒',title:'請同伴別用這片',intro:'先自己說；錄音或跳過後才聽示範。',model:'The bread is moldy.',zh:'麵包長黴了。',speakingPrompt:'同伴準備用你剛看到有黴點的麵包做三文治。簡短提醒。',recording:'phrase',questions:[]},
  {id:'native-277-v2-final',style:'final',label:'午餐挑戰',title:'說明並換麵包',intro:'寫兩句，完成後對照示例。',questions:['native-277-v2-final']}
];
export default {revision:2,summary:'在看見黴點時用 moldy 準確描述麵包，並與單純變乾或變舊區分。',steps,questions,takeaways:['The bread is moldy.'],completionTitle:'你能看出麵包長黴，並清楚提醒同伴換用新麵包。'};
