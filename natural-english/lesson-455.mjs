import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-455-v2-audio','audio','先只聽一句口語描述。杯子正在發生甚麼事？',['冰杯外壁開始起水珠。','杯子漏出飲料。','杯裏的冰已全融。','杯子剛洗完還沒擦乾。'],'冰杯外壁開始起水珠。','The cup is sweating 是把冷杯外面的凝結水珠說成「出汗」，不是真的漏水。'),
  mc('native-455-v2-transfer','transfer','冷藏汽水罐取出後外壁起水珠。想用同樣口語說法，哪句最自然？',["The can is sweating.","The can is leaking.","The can is melting.","The can is overflowing."],"The can is sweating.",'sweating 可比喻冷容器外側凝結水珠；罐沒破、飲料也沒滿溢。'),
  mc('native-455-v2-tone','tone','在咖啡店看見杯外的水弄濕文件，你想友善提醒朋友移杯。哪句得體？',["Your cup is sweating; could you move it off the papers?","Your cup is leaking; you should complain to the shop.","Your cup is wet, so those papers are ruined now.","You should have dried the cup before sitting down."],"Your cup is sweating; could you move it off the papers?",'先描述杯外凝結，再提出具體請求；不用誤判漏水或責怪對方。'),
  mc('native-455-v2-continue','continue','朋友說 The cup is sweating，桌面也濕了。你想提供即時解決方法，怎樣接？',["Let's put a coaster under it.","Let's tighten the lid before it leaks.","Let's pour out some drink.","Let's warm the drink in the microwave."],"Let's put a coaster under it.",'杯外水珠滴到桌面，杯墊能接住；杯蓋與飲料份量不是這個問題。'),
  open('native-455-v2-speak','speak','看着手上的冰飲杯，先口說一個完整英文句子指出杯外起水珠，再聽示範核對。',["The cup is sweating.","My iced drink is making the cup sweat."],'保留 cup 作主語，sweating 在此是冷杯凝水的自然口語比喻。'),
  open('native-455-v2-final','final','新場景：野餐時冰飲杯外壁濕了，朋友以為杯子裂開。寫兩句英文描述水珠，並說明飲料沒有漏出。',["The cup is sweating because the drink is cold. It isn't leaking.","There are droplets on the outside—the cup is sweating. The drink is still inside."],'明確說杯外凝結而不是杯身破裂；可用 sweating 或 droplets 說明。')
];
const steps=[
  {id:'native-455-v2-audio',style:'audio',label:'先聽比喻',title:'杯子出汗？',intro:'猜猜口語句子描述甚麼。',model:'The cup is sweating.',zh:'冰杯外面冒水珠。',audioOnly:true,questions:['native-455-v2-audio']},
  {id:'native-455-v2-transfer',style:'transfer',label:'換成汽水罐',title:'外面也起水珠',intro:'把說法轉到另一種容器。',questions:['native-455-v2-transfer']},
  {id:'native-455-v2-tone',style:'tone',label:'友善提醒',title:'文件快被弄濕',intro:'描述情況後提出請求。',questions:['native-455-v2-tone']},
  {id:'native-455-v2-continue',style:'continue',label:'接住對話',title:'桌面濕了',intro:'提供對症的下一步。',model:'The cup is wet.',zh:'杯子濕了。',questions:['native-455-v2-continue']},
  {id:'native-455-v2-speak',style:'speak',label:'自己說出來',title:'看着冰杯',intro:'先開口，再對照示範。',model:'The cup is sweating.',zh:'杯外冒水珠。',speakingPrompt:'看着冰飲杯外面新冒出的水珠，先口頭描述。',recording:'phrase',questions:['native-455-v2-speak']},
  {id:'native-455-v2-final',style:'final',label:'野餐挑戰',title:'裂了嗎？',intro:'寫兩句消除誤會。',questions:['native-455-v2-final']}
];
export default {revision:2,summary:'用 The cup is sweating 口語描述冷飲杯外凝結的水珠。',steps,questions,takeaways:['The cup is sweating.','The cup is wet.'],completionTitle:'你能用自然口語說明冰杯外壁的水珠。'};
