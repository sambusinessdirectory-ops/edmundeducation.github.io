import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-389-v2-audio','audio','說話者喝水後突然咳嗽，這句最可能在解釋甚麼？',['水喝得太急而嗆到。','水太冰，引起喉嚨不適而咳嗽。','水太燙，燙到舌頭而咳嗽。','喉嚨本來乾癢，喝水後仍在咳嗽。'],'水喝得太急而嗆到。','went down the wrong pipe 是喝水或進食時嗆到的口語說法，不是水杯放錯地方。'),
  mc('native-389-v2-detail','detail','剛喝一口水就劇烈咳了幾下，哪個細節支持這句？',['咳嗽緊接吞水發生。','只是覺得水不夠甜。','水杯的吸管不見了。','在喝水前已睡着。'],'咳嗽緊接吞水發生。','吞嚥後立刻咳嗽是「嗆到」的情境線索；口味和杯具無關。'),
  mc('native-389-v2-repair','repair','你已停止咳嗽；原句「The water used the wrong tube」不自然。怎樣改？',['The water went down the wrong pipe.','The water entered the wrong bottle.','The water walked through the wrong tube.','The pipe went down my water.'],'The water went down the wrong pipe.','這是固定口語表達：主語是 water，動詞 went down，wrong pipe 指吞嚥時走錯路。'),
  mc('native-389-v2-tone','tone','朋友緊張問你是否還好；你只是嗆了一口水，哪句最合宜？',["I'm okay; it just went down the wrong pipe.","I can never drink water again.","I wasn't coughing at all.","The glass went down a drainpipe."],"I'm okay; it just went down the wrong pipe.",'先讓朋友知道你沒事，再以慣用語簡短解釋剛才的咳嗽。'),
  mc('native-389-v2-continue','continue','朋友咳完說「It went down the wrong pipe.」下一句怎樣接最自然？',['Are you okay now? Do you need a moment?','Was the cup made of glass or plastic?','Which drainpipe broke in the kitchen?','Did you remember your car keys?'],'Are you okay now? Do you need a moment?','對方剛因吞水嗆到而咳嗽，先問是否已緩過來、需不需要片刻，才是貼合當下的關心。'),
  open('native-389-v2-transfer','transfer','新情境：在餐廳喝水時嗆到，咳完後同桌的人問你是否需要幫忙。寫兩句英文，先回應狀況，再解釋剛才發生甚麼。',["I'm okay now, thanks for checking. The water just went down the wrong pipe.","Thanks, I can breathe normally again. I took a sip too quickly and it went down the wrong pipe.","I'm all right; I just needed a second. My drink went down the wrong pipe and made me cough."],'自評時先回應對方關心，再用慣用語交代喝水嗆到，語氣與已緩和的情境相符。')
];
const steps=[
  {id:'native-389-v2-audio',style:'audio',label:'聽出嗆咳原因',title:'水去了哪裏？',intro:'先從喝水後的咳嗽推斷這句慣用語。',model:'It went down the wrong pipe.',zh:'喝水嗆到了。',audioOnly:true,questions:['native-389-v2-audio']},
  {id:'native-389-v2-detail',style:'detail',label:'抓時間線索',title:'吞水後立刻咳',intro:'辨認最能支持「嗆到」的細節。',questions:['native-389-v2-detail']},
  {id:'native-389-v2-repair',style:'repair',label:'修正直譯',title:'wrong pipe 的說法',intro:'把不自然的逐字句改成慣用語。',questions:['native-389-v2-repair']},
  {id:'native-389-v2-tone',style:'tone',label:'讓朋友放心',title:'先說我沒事',intro:'在解釋前先回應對方擔心。',questions:['native-389-v2-tone']},
  {id:'native-389-v2-continue',style:'continue',label:'關心後續',title:'咳完了嗎？',intro:'接一句能幫對方確認狀況的話。',questions:['native-389-v2-continue']},
  {id:'native-389-v2-transfer',style:'transfer',label:'餐廳新情境',title:'回應並解釋',intro:'用兩句把現在狀況和剛才嗆到分開。',questions:['native-389-v2-transfer']}
];
export default {revision:2,summary:'用 went down the wrong pipe 口語地解釋喝水或吃東西時嗆到。',steps,questions,takeaways:['It went down the wrong pipe.'],completionTitle:'你能自然解釋短暫嗆咳。'};
