import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-117-v2-audio','audio','只聽門的問題。哪項狀況最符合？',['門推到門框後仍會彈開。','鑰匙插不進鎖孔。','門被家具擋住，推不到門框。','門鎖好後無法用鑰匙打開。'],'門推到門框後仍會彈開。','won’t latch 是門舌扣不住；門可以關到位置，卻無法保持關閉。'),
  mc('native-117-v2-detail','detail','你推門時能聽到門碰到門框，但鬆手就開了。向維修員補充哪個細節最有幫助？',['門舌沒有卡進扣板。','鑰匙仍可以轉動。','門把按下去有一點鬆。','門框邊緣有一道小縫。'],'門舌沒有卡進扣板。','latch 指讓門扣住的機件；這個細節指出故障位置。'),
  mc('native-117-v2-repair','repair','住客說 The door won’t lock，但其實連沒有上鎖時門也扣不住。改哪句更準確？',["The door won't latch.","The door won't open.","The door is locked.","The door is too loud."],"The door won't latch.",'lock 指上鎖；latch 指日常關門時扣住，兩者故障點不同。'),
  mc('native-117-v2-explain','explain','哪個測試可以先區分「扣不上」和「鎖不上」？',['先不用鑰匙關門，看門能否自己保持關閉。','先試試鑰匙能否在關門後轉動。','先看門是否被地毯擋住。','先檢查門把是否鬆動。'],'先不用鑰匙關門，看門能否自己保持關閉。','未上鎖就關不穩，是 latch 的問題；關得穩但鑰匙鎖不上，才偏向 lock。'),
  mc('native-117-v2-continue','continue','房東聽你說門扣不上，問 Can you still close it? 怎樣回應最清楚？',["I can push it shut, but it swings open again.","No, I lost the key yesterday.","Yes, the lock works perfectly.","I can close it, but the key won't turn in the lock."],"I can push it shut, but it swings open again.",'這句區分「推得到門框」與「門舌扣不住」兩件事，房東才知道要檢查門扣。'),
  open('native-117-v2-branch','branch',"維修員帶來新鎖芯，但你的門其實能推到門框、鬆手後又彈開。寫兩句英文澄清故障位置。",["The door closes, but it won't latch. The latch doesn't catch when I let go.", "I can push the door shut, but it swings open again. Could you check the latch before changing the lock?"],"向維修員說明關得到門框卻扣不住，能避免把門舌問題誤當鎖芯故障。"),
];
const steps=[
  {id:'native-117-v2-audio',style:'audio',label:'聽出故障',title:'門關了又開',intro:'先聽一句報修描述。',model:'The door won’t latch.',zh:'門扣不上。',audioOnly:true,questions:['native-117-v2-audio']},
  {id:'native-117-v2-detail',style:'detail',label:'觀察門舌',title:'甚麼沒有卡住？',intro:'找出真正相關的機件。',questions:['native-117-v2-detail']},
  {id:'native-117-v2-repair',style:'repair',label:'修正說法',title:'扣門不等於上鎖',intro:'把含糊的報修句改準。',questions:['native-117-v2-repair']},
  {id:'native-117-v2-explain',style:'explain',label:'先做判斷',title:'不用鑰匙試一次',intro:'從操作看故障在哪裡。',questions:['native-117-v2-explain']},
  {id:'native-117-v2-continue',style:'continue',label:'回應房東',title:'能關卻關不穩',intro:'用可觀察的結果回答追問。',questions:['native-117-v2-continue']},
  {id:'native-117-v2-branch',style:'branch',label:'導向維修',title:'別修錯位置',intro:'維修員正在判斷要換甚麼。',questions:['native-117-v2-branch']}
];
export default {revision:2,summary:'分辨門舌扣不上與門鎖鎖不上，並用具體現象向維修員說明。',steps,questions,takeaways:['The door won’t latch.','The door won’t lock.'],completionTitle:'你能準確說明門為何關不穩。'};
