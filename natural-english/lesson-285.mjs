import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-285-v2-audio','audio','聽完這句廚房提醒，正在飛濺的是甚麼？',['鍋裏的熱油小滴。','水槽裏的大水花。','餐盤上的鹽粒。','冷凍庫裏的冰塊。'],'鍋裏的熱油小滴。','splattering 描述熱油一點點往四周飛濺的狀況。'),
  mc('native-285-v2-reverse','reverse','你煎魚時油滴不斷飛到爐邊。哪句對應眼前現象？',["The oil is splattering.","Water splashed on my shirt.","The oil has frozen.","The pan is empty."],"The oil is splattering.",'主語是油，動作是連續飛濺小滴；不是水潑到衣服。'),
  mc('native-285-v2-branch','branch','朋友問：「Why are you standing so far back?」你看見油不停向外噴。怎樣回答？',["The oil keeps splattering. Maybe lower the heat.","The pan is completely cold.","I forgot to buy any oil.","The water has stopped running."],"The oil keeps splattering. Maybe lower the heat.",'先解釋退後的原因，再提出調低火力的實際做法。'),
  open('native-285-v2-final','final','新情境：你在廚房煎雞蛋，熱油一直噴向旁邊；室友正靠近爐子。寫兩句英文提醒他並提出一個減少飛濺的做法。',["Careful, the oil is splattering. Let's turn the heat down a little.","The oil keeps splattering from the pan. Please stand back while I lower the heat.","Watch out for the hot oil; it's splattering. I'll move the pan off the heat for a moment."],'自評時應指出熱油正在飛濺，並有具體而合理的下一步。')
];
const steps=[
  {id:'native-285-v2-audio',style:'audio',label:'聽出飛濺',title:'廚房裏甚麼在噴？',intro:'辨認熱油是往外飛濺還是安靜加熱。',model:'The oil is splattering.',zh:'熱油正在飛濺。',audioOnly:true,questions:['native-285-v2-audio']},
  {id:'native-285-v2-reverse',style:'reverse',label:'油還是水',title:'鍋邊的小油滴',intro:'從物質和動作找英文。',questions:['native-285-v2-reverse']},
  {id:'native-285-v2-branch',style:'branch',label:'回答朋友',title:'為何站這麼遠？',intro:'說明原因並提出一個做法。',questions:['native-285-v2-branch']},
  {id:'native-285-v2-speak',style:'speak',label:'即時提醒',title:'叫室友退後一點',intro:'先自己說；錄音或跳過後才聽示範。',model:'The oil is splattering.',zh:'熱油正在飛濺。',speakingPrompt:'室友走近煎魚的爐子，熱油正一滴滴向外飛。簡短指出問題。',recording:'phrase',questions:[]},
  {id:'native-285-v2-final',style:'final',label:'煎蛋挑戰',title:'提醒並減少飛濺',intro:'先提醒室友避開熱油，再說你會怎樣減少飛濺。',questions:['native-285-v2-final']}
];
export default {revision:2,summary:'用 splattering 描述煎炸時熱油往外飛濺，並及時提醒旁人。',steps,questions,takeaways:['The oil is splattering.'],completionTitle:'你能清楚指出熱油飛濺，並讓旁人知道要避開。'};
